import { app, BrowserWindow, Menu, Tray, ipcMain, nativeImage, screen } from 'electron';
import type { NativeImage } from 'electron';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import type { ReminderPayload } from '../src/shared/contracts';
import type { AuthStatus, GoogleOAuthConfig } from '../src/shared/contracts';
import { beginGoogleOAuth, clearGoogleTokens, getAuthStatus } from './services/googleAuth';
import { getGoogleOAuthConfig, saveGoogleOAuthConfig } from './services/settingsStore';

const isDev = Boolean(process.env.VITE_DEV_SERVER_URL);
const isSmokeTest = process.argv.includes('--smoke-test') || process.env.PIKA_BOO_SMOKE_TEST === '1';

let mainWindow: BrowserWindow | null = null;
let overlayWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
let overlayHideTimer: NodeJS.Timeout | null = null;

function getRendererUrl(hash = ''): string {
  const devUrl = process.env.VITE_DEV_SERVER_URL;

  if (devUrl) {
    return `${devUrl}/${hash}`;
  }

  const fileUrl = pathToFileURL(path.join(__dirname, '..', 'dist', 'index.html')).toString();
  return hash ? `${fileUrl}${hash}` : fileUrl;
}

function createMainWindow(): BrowserWindow {
  const window = new BrowserWindow({
    width: 960,
    height: 680,
    minWidth: 840,
    minHeight: 560,
    title: 'Pika-Boo Control Panel',
    autoHideMenuBar: true,
    backgroundColor: '#12141a',
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
    height: 96,
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
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64">
      <rect width="64" height="64" rx="16" fill="#111827" />
      <circle cx="24" cy="24" r="10" fill="#fde68a" />
      <path d="M16 44c6-10 15-14 30-14" stroke="#93c5fd" stroke-width="6" stroke-linecap="round" fill="none" />
    </svg>
  `.trim();

  return nativeImage.createFromDataURL(`data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`);
}

function showOverlay(payload: ReminderPayload): void {
  if (!overlayWindow) {
    return;
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

function wireTray(): void {
  tray = new Tray(createTrayIcon());
  tray.setToolTip('Pika-Boo');
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
            title: 'Continue building Pika-Boo',
            subtitle: 'Scaffold is live. Overlay is moving.',
          });
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

  tray.on('double-click', () => {
    mainWindow?.show();
    mainWindow?.focus();
  });
}

function wireIpc(): void {
  ipcMain.handle('app:show-overlay-demo', () => {
    showOverlay({
      title: 'Meeting with Albert',
      subtitle: 'Starts in 5 minutes',
    });
  });

  ipcMain.handle('app:open-settings', () => {
    mainWindow?.show();
    mainWindow?.focus();
  });

  ipcMain.handle('auth:get-status', (): AuthStatus => {
    return getAuthStatus(getGoogleOAuthConfig());
  });

  ipcMain.handle('auth:save-config', (_event, config: GoogleOAuthConfig): AuthStatus => {
    saveGoogleOAuthConfig(config);
    return getAuthStatus(getGoogleOAuthConfig());
  });

  ipcMain.handle('auth:connect', async (): Promise<AuthStatus> => {
    const config = getGoogleOAuthConfig();

    if (!config) {
      throw new Error('Save a Google OAuth client ID first.');
    }

    return beginGoogleOAuth(config);
  });

  ipcMain.handle('auth:disconnect', (): AuthStatus => {
    const config = getGoogleOAuthConfig();
    clearGoogleTokens();
    return getAuthStatus(config);
  });
}

async function bootstrap(): Promise<void> {
  await app.whenReady();

  mainWindow = createMainWindow();
  overlayWindow = createOverlayWindow();
  wireTray();
  wireIpc();

  if (isSmokeTest) {
    mainWindow.hide();
    showOverlay({
      title: 'Smoke test',
      subtitle: 'Windows created successfully',
    });
    setTimeout(() => {
      tray?.destroy();
      process.exit(0);
    }, 1200);
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      mainWindow = createMainWindow();
      overlayWindow = createOverlayWindow();
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
