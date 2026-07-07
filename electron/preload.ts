import { contextBridge, ipcRenderer } from 'electron';
import type {
  ArtifactId,
  AuthStatus,
  GoogleOAuthConfig,
  OAuthImportResult,
  ReminderPayload,
  RuntimeStatus,
} from '../src/shared/contracts';

contextBridge.exposeInMainWorld('pikaBoo', {
  showOverlayDemo: () => ipcRenderer.invoke('app:show-overlay-demo'),
  openSettings: () => ipcRenderer.invoke('app:open-settings'),
  openExternal: (url: string) => ipcRenderer.invoke('app:open-external', url),
  getSelectedArtifact: () => ipcRenderer.invoke('artifact:get-selected') as Promise<ArtifactId>,
  setSelectedArtifact: (artifactId: ArtifactId) =>
    ipcRenderer.invoke('artifact:set-selected', artifactId) as Promise<RuntimeStatus>,
  getAuthStatus: () => ipcRenderer.invoke('auth:get-status') as Promise<AuthStatus>,
  getGoogleOAuthConfig: () => ipcRenderer.invoke('auth:get-config') as Promise<GoogleOAuthConfig>,
  importGoogleOAuthConfig: () => ipcRenderer.invoke('auth:import-config') as Promise<OAuthImportResult>,
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
