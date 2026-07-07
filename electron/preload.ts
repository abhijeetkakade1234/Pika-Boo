import { contextBridge, ipcRenderer } from 'electron';
import type { AuthStatus, GoogleOAuthConfig, ReminderPayload, RuntimeStatus } from '../src/shared/contracts';

contextBridge.exposeInMainWorld('pikaBoo', {
  showOverlayDemo: () => ipcRenderer.invoke('app:show-overlay-demo'),
  openSettings: () => ipcRenderer.invoke('app:open-settings'),
  getAuthStatus: () => ipcRenderer.invoke('auth:get-status') as Promise<AuthStatus>,
  saveGoogleOAuthConfig: (config: GoogleOAuthConfig) => ipcRenderer.invoke('auth:save-config', config),
  connectGoogle: () => ipcRenderer.invoke('auth:connect') as Promise<AuthStatus>,
  disconnectGoogle: () => ipcRenderer.invoke('auth:disconnect') as Promise<AuthStatus>,
  getRuntimeStatus: () => ipcRenderer.invoke('runtime:get-status') as Promise<RuntimeStatus>,
  setStartupEnabled: (enabled: boolean) => ipcRenderer.invoke('runtime:set-startup-enabled', enabled) as Promise<RuntimeStatus>,
  pollNow: () => ipcRenderer.invoke('runtime:poll-now') as Promise<RuntimeStatus>,
  onRuntimeUpdated: (callback: () => void) => {
    const listener = () => {
      callback();
    };

    ipcRenderer.on('runtime:updated', listener);

    return () => {
      ipcRenderer.removeListener('runtime:updated', listener);
    };
  },
  onOverlayShow: (callback: (payload: ReminderPayload) => void) => {
    const listener = (_event: Electron.IpcRendererEvent, payload: ReminderPayload) => {
      callback(payload);
    };

    ipcRenderer.on('overlay:show', listener);

    return () => {
      ipcRenderer.removeListener('overlay:show', listener);
    };
  },
});
