import { contextBridge, ipcRenderer } from 'electron';
import type {
  ArtifactId,
  AuthStatus,
  GoogleOAuthConfig,
  OAuthImportResult,
  ReminderPayload,
  RuntimeStatus,
  ThemeRuleAssignment,
} from '../src/shared/contracts';

contextBridge.exposeInMainWorld('pikaBoo', {
  showOverlayDemo: () => ipcRenderer.invoke('app:show-overlay-demo'),
  openSettings: () => ipcRenderer.invoke('app:open-settings'),
  openExternal: (url: string) => ipcRenderer.invoke('app:open-external', url),
  snoozeReminder: (reminderId: string, minutes: number) =>
    ipcRenderer.invoke('app:snooze-reminder', reminderId, minutes) as Promise<void>,
  dismissReminder: (reminderId: string) =>
    ipcRenderer.invoke('app:dismiss-reminder', reminderId) as Promise<void>,
  getSelectedArtifact: () => ipcRenderer.invoke('artifact:get-selected') as Promise<ArtifactId>,
  setSelectedArtifact: (artifactId: ArtifactId) =>
    ipcRenderer.invoke('artifact:set-selected', artifactId) as Promise<RuntimeStatus>,
  getThemeRules: () => ipcRenderer.invoke('artifact:get-theme-rules') as Promise<ThemeRuleAssignment[]>,
  setThemeRule: (key: ThemeRuleAssignment['key'], artifactId: ArtifactId) =>
    ipcRenderer.invoke('artifact:set-theme-rule', key, artifactId) as Promise<ThemeRuleAssignment[]>,
  addThemeRule: (label: string, matchText: string, artifactId: ArtifactId) =>
    ipcRenderer.invoke('artifact:add-theme-rule', label, matchText, artifactId) as Promise<ThemeRuleAssignment[]>,
  deleteThemeRule: (key: string) =>
    ipcRenderer.invoke('artifact:delete-theme-rule', key) as Promise<ThemeRuleAssignment[]>,
  getAuthStatus: () => ipcRenderer.invoke('auth:get-status') as Promise<AuthStatus>,
  getGoogleOAuthConfig: () => ipcRenderer.invoke('auth:get-config') as Promise<GoogleOAuthConfig>,
  importGoogleOAuthConfig: () => ipcRenderer.invoke('auth:import-config') as Promise<OAuthImportResult>,
  saveGoogleOAuthConfig: (config: GoogleOAuthConfig) => ipcRenderer.invoke('auth:save-config', config),
  connectGoogle: () => ipcRenderer.invoke('auth:connect') as Promise<AuthStatus>,
  disconnectGoogle: () => ipcRenderer.invoke('auth:disconnect') as Promise<AuthStatus>,
  getRuntimeStatus: () => ipcRenderer.invoke('runtime:get-status') as Promise<RuntimeStatus>,
  setStartupEnabled: (enabled: boolean) => ipcRenderer.invoke('runtime:set-startup-enabled', enabled) as Promise<RuntimeStatus>,
  setPaused: (paused: boolean) => ipcRenderer.invoke('runtime:set-paused', paused) as Promise<RuntimeStatus>,
  setWellnessEnabled: (enabled: boolean) =>
    ipcRenderer.invoke('runtime:set-wellness-enabled', enabled) as Promise<RuntimeStatus>,
  clearReminderHistory: () => ipcRenderer.invoke('runtime:clear-reminder-history') as Promise<RuntimeStatus>,
  pollNow: () => ipcRenderer.invoke('runtime:poll-now') as Promise<RuntimeStatus>,
  setSelectedCalendars: (calendarIds: string[]) =>
    ipcRenderer.invoke('runtime:set-selected-calendars', calendarIds) as Promise<RuntimeStatus>,
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
