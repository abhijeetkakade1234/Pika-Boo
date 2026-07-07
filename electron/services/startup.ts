import { app } from 'electron';

export function getStartupEnabled(): boolean {
  return app.getLoginItemSettings().openAtLogin;
}

export function setStartupEnabled(enabled: boolean): boolean {
  app.setLoginItemSettings({
    openAtLogin: enabled,
    path: process.execPath,
  });

  return getStartupEnabled();
}
