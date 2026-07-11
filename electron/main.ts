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
  createCustomThemeRule,
  clearSnoozedReminder,
  deleteCustomThemeRule,
  listEventTimeline,
  listRecentReminders,
  listSnoozedReminders,
  recordReminderDelivery,
  saveThemeRuleOverride,
  saveSnoozedReminder,
  upsertSeenEvents,
} from './services/historyDb';
import { CalendarPoller, EVENT_REMINDER_LEAD_TIMES } from './services/poller';
import { listThemeRules } from './services/reminderArtifacts';
import {
  getArtifactId,
  getEyeBreakEnabled,
  getGoogleOAuthConfig,
  getGoogleOAuthConfigForUi,
  getStandBreakEnabled,
  getTimeAwarenessEnabled,
  getWaterBreakEnabled,
  getWellnessEnabled,
  parseGoogleOAuthDesktopClient,
  saveArtifactId,
  saveEyeBreakEnabled,
  saveGoogleOAuthConfig,
  saveSelectedCalendarIds,
  saveStandBreakEnabled,
  saveTimeAwarenessEnabled,
  saveWaterBreakEnabled,
  saveWellnessEnabled,
} from './services/settingsStore';
import { ensureStartupEnabledByDefault, getStartupEnabled, isStartupSupported, setStartupEnabled } from './services/startup';
import {
  EYE_BREAK_INTERVAL_MINUTES,
  STAND_BREAK_INTERVAL_MINUTES,
  TIME_AWARENESS_INTERVAL_MINUTES,
  WATER_BREAK_INTERVAL_MINUTES,
  WellnessScheduler,
} from './services/wellnessScheduler';

const isDev = Boolean(process.env.VITE_DEV_SERVER_URL);
const isSmokeTest = process.argv.includes('--smoke-test') || process.env.PIKA_BOO_SMOKE_TEST === '1';
const gotSingleInstanceLock = app.requestSingleInstanceLock();
let mainWindow: BrowserWindow | null = null;
let overlayWindow: BrowserWindow | null = null;
let splashWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
let overlayHideTimer: NodeJS.Timeout | null = null;
let splashFallbackTimer: NodeJS.Timeout | null = null;
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
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  window.loadURL(getRendererUrl());

  window.once('ready-to-show', () => {
    if (splashFallbackTimer) {
      clearTimeout(splashFallbackTimer);
      splashFallbackTimer = null;
    }

    splashWindow?.close();
    splashWindow = null;

    if (!startHidden) {
      window.show();
    }
  });

  window.on('close', (event) => {
    if (!app.isQuiting && !isSmokeTest) {
      event.preventDefault();
      window.hide();
    }
  });

  return window;
}

function createSplashWindow(): BrowserWindow {
  const window = new BrowserWindow({
    width: 480,
    height: 520,
    frame: false,
    transparent: true,
    resizable: false,
    movable: false,
    minimizable: false,
    maximizable: false,
    fullscreenable: false,
    show: true,
    center: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    backgroundColor: '#00000000',
  });

  const logoUrl = pathToFileURL(getBundledAssetPath('pika-boo-logo.png')).toString();
  const html = `
    <!doctype html>
    <html>
      <body style="margin:0;display:grid;place-items:center;width:100vw;height:100vh;background:transparent;font-family:Segoe UI,sans-serif;">
        <div style="width:420px;border-radius:32px;padding:24px 24px 28px;background:rgba(255,250,242,0.96);box-shadow:0 24px 60px rgba(28,20,44,0.18);text-align:center;">
          <img src="${logoUrl}" alt="Pika-Boo" style="width:100%;display:block;" />
          <div style="margin-top:10px;font-size:12px;letter-spacing:0.28em;font-weight:700;color:#5d5667;text-transform:uppercase;">Ambient Reminders</div>
        </div>
      </body>
    </html>
  `;

  window.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`);
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
  try {
    recordReminderDelivery(payload);
  } catch (error) {
    console.warn('Failed to record reminder delivery', error);
  }
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

function syncWellnessScheduler(paused = poller.getStatus(getStartupEnabled(), isStartupSupported()).paused): void {
  wellnessScheduler.setPaused(paused);
}

function buildRuntimeStatus(): RuntimeStatus {
  return {
    ...poller.getStatus(getStartupEnabled(), isStartupSupported()),
    wellnessEnabled: getWellnessEnabled(),
    eyeBreakEnabled: getEyeBreakEnabled(),
    standBreakEnabled: getStandBreakEnabled(),
    waterBreakEnabled: getWaterBreakEnabled(),
    timeAwarenessEnabled: getTimeAwarenessEnabled(),
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
          syncWellnessScheduler(!runtime.paused);
          refreshTrayMenu();
          mainWindow?.webContents.send('runtime:updated');
        },
      },
      { label: `Reminder cadence: ${EVENT_REMINDER_LEAD_TIMES.join(' / ')}m` },
      { label: 'Morning briefing: 8:00 AM' },
      {
        label: 'Wellness reminders',
        type: 'checkbox',
        checked: getWellnessEnabled(),
        click: () => {
          saveWellnessEnabled(!getWellnessEnabled());
          syncWellnessScheduler(runtime.paused);
          refreshTrayMenu();
          mainWindow?.webContents.send('runtime:updated');
        },
      },
      { label: `Wellness cadence: eyes ${EYE_BREAK_INTERVAL_MINUTES}m / stand ${STAND_BREAK_INTERVAL_MINUTES}m / water ${WATER_BREAK_INTERVAL_MINUTES}m` },
      {
        label: 'Time awareness',
        type: 'checkbox',
        checked: getTimeAwarenessEnabled(),
        click: () => {
          saveTimeAwarenessEnabled(!getTimeAwarenessEnabled());
          refreshTrayMenu();
          mainWindow?.webContents.send('runtime:updated');
        },
      },
      { label: `Time checks: every ${TIME_AWARENESS_INTERVAL_MINUTES}m` },
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

  ipcMain.handle('artifact:get-theme-rules', () => {
    return listThemeRules();
  });

  ipcMain.handle('artifact:set-theme-rule', (_event, key: string, artifactId: ArtifactId) => {
    saveThemeRuleOverride(key as Parameters<typeof saveThemeRuleOverride>[0], artifactId);
    refreshTrayMenu();
    mainWindow?.webContents.send('runtime:updated');
    return listThemeRules();
  });

  ipcMain.handle('artifact:add-theme-rule', (_event, label: string, matchText: string, artifactId: ArtifactId) => {
    createCustomThemeRule(label, matchText, artifactId);
    refreshTrayMenu();
    mainWindow?.webContents.send('runtime:updated');
    return listThemeRules();
  });

  ipcMain.handle('artifact:delete-theme-rule', (_event, key: string) => {
    deleteCustomThemeRule(key);
    refreshTrayMenu();
    mainWindow?.webContents.send('runtime:updated');
    return listThemeRules();
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
    syncWellnessScheduler(paused);
    refreshTrayMenu();
    mainWindow?.webContents.send('runtime:updated');
    return buildRuntimeStatus();
  });

  ipcMain.handle('runtime:set-wellness-enabled', (_event, enabled: boolean): RuntimeStatus => {
    saveWellnessEnabled(enabled);
    syncWellnessScheduler();
    refreshTrayMenu();
    mainWindow?.webContents.send('runtime:updated');
    return buildRuntimeStatus();
  });

  ipcMain.handle('runtime:set-wellness-type-enabled', (_event, kind: 'eye' | 'stand' | 'water', enabled: boolean): RuntimeStatus => {
    if (kind === 'eye') {
      saveEyeBreakEnabled(enabled);
    } else if (kind === 'stand') {
      saveStandBreakEnabled(enabled);
    } else {
      saveWaterBreakEnabled(enabled);
    }

    syncWellnessScheduler();
    refreshTrayMenu();
    mainWindow?.webContents.send('runtime:updated');
    return buildRuntimeStatus();
  });

  ipcMain.handle('runtime:set-time-awareness-enabled', (_event, enabled: boolean): RuntimeStatus => {
    saveTimeAwarenessEnabled(enabled);
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

  if (!startHidden && !isSmokeTest) {
    splashWindow = createSplashWindow();
  }

  mainWindow = createMainWindow(startHidden);
  overlayWindow = createOverlayWindow();

  if (splashWindow) {
    splashFallbackTimer = setTimeout(() => {
      splashWindow?.close();
      splashWindow = null;
      if (!startHidden) {
        mainWindow?.show();
      }
    }, 8000);
  }

  wireTray();
  wireIpc();
  restoreSnoozedReminders();
  poller.start();
  syncWellnessScheduler(false);

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

if (!gotSingleInstanceLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (!mainWindow) {
      return;
    }

    if (mainWindow.isMinimized()) {
      mainWindow.restore();
    }

    mainWindow.show();
    mainWindow.focus();
  });

  bootstrap().catch((error) => {
    console.error('Failed to start Pika-Boo', error);
    app.quit();
  });
}
