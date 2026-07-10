import { app, BrowserWindow, Menu, Tray, dialog, ipcMain, nativeImage, screen, shell } from 'electron';
import type { NativeImage } from 'electron';
import path from 'node:path';
import fs from 'node:fs';
import { pathToFileURL } from 'node:url';
import type { ArtifactId, ReminderPayload } from '../src/shared/contracts';
import type { AuthStatus, GoogleOAuthConfig, OAuthImportResult, RuntimeStatus } from '../src/shared/contracts';
import { beginGoogleOAuth, clearGoogleTokens, getAuthStatus } from './services/googleAuth';
import {
  clearReminderHistory,
  clearSnoozedReminder,
  listEventTimeline,
  listRecentReminders,
  listSnoozedReminders,
  recordReminderDelivery,
  saveSnoozedReminder,
  upsertSeenEvents,
} from './services/historyDb';
import { CalendarPoller, EVENT_REMINDER_LEAD_TIMES } from './services/poller';
import {
  getArtifactId,
  getGoogleOAuthConfig,
  getGoogleOAuthConfigForUi,
  parseGoogleOAuthDesktopClient,
  saveArtifactId,
  saveGoogleOAuthConfig,
  saveSelectedCalendarIds,
} from './services/settingsStore';
import { ensureStartupEnabledByDefault, getStartupEnabled, isStartupSupported, setStartupEnabled } from './services/startup';
import { WellnessScheduler } from './services/wellnessScheduler';

const isDev = Boolean(process.env.VITE_DEV_SERVER_URL);
const isSmokeTest = process.argv.includes('--smoke-test') || process.env.PIKA_BOO_SMOKE_TEST === '1';
let mainWindow: BrowserWindow | null = null;
let overlayWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
let overlayHideTimer: NodeJS.Timeout | null = null;
let currentReminder: ReminderPayload | null = null;
const snoozeTimers = new Map<string, NodeJS.Timeout>();
const poller = new CalendarPoller(
  (payload) => {
    showOverlay(payload);
  },
  (events) => {
    upsertSeenEvents(events);
  },
  () => {
    refreshTrayMenu();
    mainWindow?.webContents.send('runtime:updated');
  },
);
const wellnessScheduler = new WellnessScheduler((payload) => {
  showOverlay(payload);
});

function getBundledAssetPath(...segments: string[]): string {
  return path.join(__dirname, '..', '..', 'electron', 'assets', ...segments);
}

function getRendererUrl(hash = ''): string {
  const devUrl = process.env.VITE_DEV_SERVER_URL;

  if (devUrl) {
    return `${devUrl}/${hash}`;
  }

  const fileUrl = pathToFileURL(path.join(__dirname, '..', '..', 'dist', 'index.html')).toString();
  return hash ? `${fileUrl}${hash}` : fileUrl;
}

function createMainWindow(startHidden = false): BrowserWindow {
  const { width: screenWidth, height: screenHeight } = screen.getPrimaryDisplay().workAreaSize;
  const width = Math.min(screenWidth, Math.max(1280, Math.floor(screenWidth * 0.84)));
  const height = Math.min(screenHeight, Math.max(840, Math.floor(screenHeight * 0.86)));
  const minWidth = Math.min(screenWidth, 1180);
  const minHeight = Math.min(screenHeight, 760);
  const window = new BrowserWindow({
    width,
    height,
    minWidth,
    minHeight,
    title: 'Pika-Boo Control Panel',
    icon: getBundledAssetPath('pika-boo-logo.png'),
    autoHideMenuBar: true,
    backgroundColor: '#12141a',
    show: !startHidden,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  window.loadURL(getRendererUrl());

  window.on('close', (event) => {
    if (!app.isQuiting && !isSmokeTest) {
      event.preventDefault();
      window.hide();
    }
  });

  return window;
}

function createOverlayWindow(): BrowserWindow {
  const { width } = screen.getPrimaryDisplay().workAreaSize;
  const window = new BrowserWindow({
    x: 0,
    y: 0,
    width,
    height: 156,
    frame: false,
    transparent: true,
    resizable: false,
    movable: false,
    show: false,
    focusable: false,
    skipTaskbar: true,
    hasShadow: false,
    fullscreenable: false,
    alwaysOnTop: true,
    backgroundColor: '#00000000',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  window.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  window.setAlwaysOnTop(true, 'screen-saver');
  window.loadURL(getRendererUrl('#overlay'));

  return window;
}

function createTrayIcon(): NativeImage {
  return nativeImage.createFromPath(getBundledAssetPath('pika-boo-logo.png'));
}

function showOverlay(payload: ReminderPayload): void {
  if (!overlayWindow) {
    return;
  }

  currentReminder = payload;
  recordReminderDelivery(payload);
  overlayWindow.showInactive();
  overlayWindow.webContents.send('overlay:show', payload);

  if (overlayHideTimer) {
    clearTimeout(overlayHideTimer);
  }

  overlayHideTimer = setTimeout(() => {
    overlayWindow?.hide();
  }, 8000);
}

function hideOverlay(): void {
  overlayWindow?.hide();
}

function scheduleSnoozedReminder(payload: ReminderPayload, wakeAt: number): void {
  const existingTimer = snoozeTimers.get(payload.reminderId);
  if (existingTimer) {
    clearTimeout(existingTimer);
  }

  const delayMs = Math.max(0, wakeAt - Date.now());
  const timer = setTimeout(() => {
    snoozeTimers.delete(payload.reminderId);
    clearSnoozedReminder(payload.reminderId);
    showOverlay(payload);
  }, delayMs);

  snoozeTimers.set(payload.reminderId, timer);
}

function restoreSnoozedReminders(): void {
  for (const reminder of listSnoozedReminders()) {
    scheduleSnoozedReminder(reminder, reminder.wakeAt);
  }
}

function buildRuntimeStatus(): RuntimeStatus {
  return {
    ...poller.getStatus(getStartupEnabled(), isStartupSupported()),
    startupSupported: isStartupSupported(),
    currentReminder,
    recentReminders: listRecentReminders(50),
    eventTimeline: listEventTimeline(250),
  };
}

function snoozeReminder(reminderId: string, minutes: number): void {
  if (!currentReminder || currentReminder.reminderId !== reminderId) {
    return;
  }

  hideOverlay();
  const payload = currentReminder;
  const wakeAt = Date.now() + minutes * 60_000;
  saveSnoozedReminder(payload, wakeAt);
  scheduleSnoozedReminder(payload, wakeAt);
}

function dismissReminder(reminderId: string): void {
  const existingTimer = snoozeTimers.get(reminderId);
  if (existingTimer) {
    clearTimeout(existingTimer);
    snoozeTimers.delete(reminderId);
  }

  clearSnoozedReminder(reminderId);

  if (currentReminder?.reminderId === reminderId) {
    hideOverlay();
  }
}

function refreshTrayMenu(): void {
  if (!tray) {
    return;
  }

  const runtime = poller.getStatus(getStartupEnabled(), isStartupSupported());
  tray.setContextMenu(
    Menu.buildFromTemplate([
      {
        label: 'Open control panel',
        click: () => {
          mainWindow?.show();
          mainWindow?.focus();
        },
      },
      {
        label: 'Show reminder demo',
        click: () => {
          showOverlay({
            reminderId: 'demo-reminder',
            title: 'Continue building Pika-Boo',
            subtitle: 'Scaffold is live. Overlay is moving.',
            artifactId: getArtifactId(),
          });
        },
      },
      {
        label: 'Sync now',
        enabled: !runtime.paused,
        click: () => {
          void poller.poll().finally(() => {
            refreshTrayMenu();
            mainWindow?.webContents.send('runtime:updated');
          });
        },
      },
      {
        label: 'Pause reminders',
        type: 'checkbox',
        checked: runtime.paused,
        click: () => {
          poller.setPaused(!runtime.paused);
          refreshTrayMenu();
          mainWindow?.webContents.send('runtime:updated');
        },
      },
      { label: `Reminder cadence: ${EVENT_REMINDER_LEAD_TIMES.join('m • ')}m` },
      { label: 'Morning briefing: 8:00 AM' },
      { label: 'Wellness: eyes 50m | water 90m' },
      {
        label: 'Launch on Windows login',
        type: 'checkbox',
        checked: runtime.startupEnabled,
        enabled: runtime.startupSupported,
        click: () => {
          setStartupEnabled(!runtime.startupEnabled);
          refreshTrayMenu();
          mainWindow?.webContents.send('runtime:updated');
        },
      },
      { type: 'separator' },
      {
        label: 'Quit',
        click: () => {
          app.isQuiting = true;
          tray?.destroy();
          app.quit();
        },
      },
    ]),
  );
}

function wireTray(): void {
  tray = new Tray(createTrayIcon());
  tray.setToolTip('Pika-Boo');
  refreshTrayMenu();

  tray.on('double-click', () => {
    mainWindow?.show();
    mainWindow?.focus();
  });
}

function wireIpc(): void {
  ipcMain.handle('app:show-overlay-demo', () => {
    showOverlay({
      reminderId: 'demo-reminder',
      title: 'Meeting with Albert',
      subtitle: `Reminder cadence ${EVENT_REMINDER_LEAD_TIMES.join('m / ')}m`,
      artifactId: getArtifactId(),
    });
  });

  ipcMain.handle('app:open-settings', () => {
    mainWindow?.show();
    mainWindow?.focus();
  });

  ipcMain.handle('app:open-external', (_event, url: string) => {
    if (!/^https?:\/\//i.test(url)) {
      throw new Error('Only http and https links are supported.');
    }

    return shell.openExternal(url);
  });

  ipcMain.handle('app:snooze-reminder', (_event, reminderId: string, minutes: number) => {
    snoozeReminder(reminderId, minutes);
  });

  ipcMain.handle('app:dismiss-reminder', (_event, reminderId: string) => {
    dismissReminder(reminderId);
  });

  ipcMain.handle('auth:get-status', (): AuthStatus => {
    return getAuthStatus(getGoogleOAuthConfig());
  });

  ipcMain.handle('auth:get-config', (): GoogleOAuthConfig => {
    return getGoogleOAuthConfigForUi();
  });

  ipcMain.handle('auth:save-config', (_event, config: GoogleOAuthConfig): AuthStatus => {
    saveGoogleOAuthConfig(config);
    return getAuthStatus(getGoogleOAuthConfig());
  });

  ipcMain.handle('auth:import-config', async (): Promise<OAuthImportResult> => {
    const result = mainWindow
      ? await dialog.showOpenDialog(mainWindow, {
          properties: ['openFile'],
          filters: [{ name: 'JSON files', extensions: ['json'] }],
          title: 'Select Google OAuth desktop client JSON',
        })
      : await dialog.showOpenDialog({
        properties: ['openFile'],
        filters: [{ name: 'JSON files', extensions: ['json'] }],
        title: 'Select Google OAuth desktop client JSON',
      });

    if (result.canceled || result.filePaths.length === 0) {
      return { config: null, cancelled: true };
    }

    const raw = fs.readFileSync(result.filePaths[0], 'utf8');
    const config = parseGoogleOAuthDesktopClient(raw);
    saveGoogleOAuthConfig(config);

    return {
      config,
      cancelled: false,
    };
  });

  ipcMain.handle('artifact:get-selected', (): ArtifactId => {
    return getArtifactId();
  });

  ipcMain.handle('artifact:set-selected', (_event, artifactId: ArtifactId): RuntimeStatus => {
    saveArtifactId(artifactId);
    refreshTrayMenu();
    mainWindow?.webContents.send('runtime:updated');
    return {
      ...buildRuntimeStatus(),
    };
  });

  ipcMain.handle('auth:connect', async (): Promise<AuthStatus> => {
    const config = getGoogleOAuthConfig();

    if (!config) {
      throw new Error('Save a Google OAuth client ID first.');
    }

    const status = await beginGoogleOAuth(config);
    await poller.poll();
    refreshTrayMenu();
    mainWindow?.webContents.send('runtime:updated');
    return status;
  });

  ipcMain.handle('auth:disconnect', (): AuthStatus => {
    const config = getGoogleOAuthConfig();
    clearGoogleTokens();
    void poller.poll();
    refreshTrayMenu();
    mainWindow?.webContents.send('runtime:updated');
    return getAuthStatus(config);
  });

  ipcMain.handle('runtime:get-status', (): RuntimeStatus => {
    return buildRuntimeStatus();
  });

  ipcMain.handle('runtime:set-startup-enabled', (_event, enabled: boolean): RuntimeStatus => {
    setStartupEnabled(enabled);
    refreshTrayMenu();
    mainWindow?.webContents.send('runtime:updated');
    return buildRuntimeStatus();
  });

  ipcMain.handle('runtime:poll-now', async (): Promise<RuntimeStatus> => {
    await poller.poll();
    refreshTrayMenu();
    mainWindow?.webContents.send('runtime:updated');
    return buildRuntimeStatus();
  });

  ipcMain.handle('runtime:set-paused', (_event, paused: boolean): RuntimeStatus => {
    poller.setPaused(paused);
    wellnessScheduler.setPaused(paused);
    refreshTrayMenu();
    mainWindow?.webContents.send('runtime:updated');
    return buildRuntimeStatus();
  });

  ipcMain.handle('runtime:clear-reminder-history', (): RuntimeStatus => {
    clearReminderHistory();
    mainWindow?.webContents.send('runtime:updated');
    return buildRuntimeStatus();
  });

  ipcMain.handle('runtime:set-selected-calendars', async (_event, calendarIds: string[]): Promise<RuntimeStatus> => {
    saveSelectedCalendarIds(calendarIds);
    await poller.poll();
    refreshTrayMenu();
    mainWindow?.webContents.send('runtime:updated');
    return buildRuntimeStatus();
  });
}

async function bootstrap(): Promise<void> {
  await app.whenReady();
  ensureStartupEnabledByDefault();
  const startHidden = process.argv.includes('--hidden');

  mainWindow = createMainWindow(startHidden);
  overlayWindow = createOverlayWindow();
  wireTray();
  wireIpc();
  restoreSnoozedReminders();
  poller.start();
  wellnessScheduler.start();

  if (isSmokeTest) {
    mainWindow.hide();
    showOverlay({
      reminderId: 'smoke-test',
      title: 'Smoke test',
      subtitle: 'Windows created successfully',
      artifactId: getArtifactId(),
    });
    setTimeout(() => {
      tray?.destroy();
      process.exit(0);
    }, 1200);
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      mainWindow = createMainWindow(false);
      overlayWindow = createOverlayWindow();
      refreshTrayMenu();
    } else {
      mainWindow?.show();
    }
  });
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    // ponytail: background tray app; quitting is explicit from tray.
  }
});

declare global {
  namespace Electron {
    interface App {
      isQuiting?: boolean;
    }
  }
}

bootstrap().catch((error) => {
  console.error('Failed to start Pika-Boo', error);
  app.quit();
});
