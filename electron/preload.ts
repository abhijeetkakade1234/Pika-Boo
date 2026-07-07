import { contextBridge, ipcRenderer } from 'electron';
import type { ReminderPayload } from '../src/shared/contracts';

contextBridge.exposeInMainWorld('pikaBoo', {
  showOverlayDemo: () => ipcRenderer.invoke('app:show-overlay-demo'),
  openSettings: () => ipcRenderer.invoke('app:open-settings'),
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
