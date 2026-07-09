import { app } from 'electron';

export function isStartupSupported(): boolean {
  return app.isPackaged;
}

export function getStartupEnabled(): boolean {
  if (!isStartupSupported()) {
    return false;
  }

  return app.getLoginItemSettings().openAtLogin;
}

export function setStartupEnabled(enabled: boolean): boolean {
  if (!isStartupSupported()) {
    return false;
  }

  app.setLoginItemSettings({
    openAtLogin: enabled,
    path: process.execPath,
  });

  return getStartupEnabled();
}
