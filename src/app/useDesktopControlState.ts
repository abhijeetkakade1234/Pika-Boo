import { startTransition, useEffect, useState } from 'react';
import type {
  ArtifactId,
  AuthStatus,
  GoogleOAuthConfig,
  RuntimeStatus,
} from '../shared/contracts';

export function useDesktopControlState() {
  const [config, setConfig] = useState<GoogleOAuthConfig>({ clientId: '', clientSecret: '' });
  const [authStatus, setAuthStatus] = useState<AuthStatus | null>(null);
  const [runtimeStatus, setRuntimeStatus] = useState<RuntimeStatus | null>(null);
  const [artifactId, setArtifactId] = useState<ArtifactId>('ghost');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function refresh() {
    const [nextAuth, nextRuntime, nextConfig, nextArtifactId] = await Promise.all([
      window.pikaBoo.getAuthStatus(),
      window.pikaBoo.getRuntimeStatus(),
      window.pikaBoo.getGoogleOAuthConfig(),
      window.pikaBoo.getSelectedArtifact(),
    ]);

    startTransition(() => {
      setAuthStatus(nextAuth);
      setRuntimeStatus(nextRuntime);
      setConfig(nextConfig);
      setArtifactId(nextArtifactId);
    });
  }

  useEffect(() => {
    refresh().catch((reason: unknown) => {
      setError(reason instanceof Error ? reason.message : 'Failed to load app status.');
    });

    return window.pikaBoo.onRuntimeUpdated(() => {
      void refresh();
    });
  }, []);

  async function runTask(task: () => Promise<void>, fallbackMessage: string) {
    setBusy(true);
    setError('');

    try {
      await task();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : fallbackMessage);
    } finally {
      setBusy(false);
    }
  }

  return {
    config,
    setConfig,
    authStatus,
    runtimeStatus,
    artifactId,
    busy,
    error,
    setError,
    refresh,
    saveConfig: () =>
      runTask(async () => {
        const status = await window.pikaBoo.saveGoogleOAuthConfig(config);
        setAuthStatus(status);
        await refresh();
      }, 'Failed to save config.'),
    importGoogleConfig: () =>
      runTask(async () => {
        const result = await window.pikaBoo.importGoogleOAuthConfig();
        if (result.cancelled || !result.config) {
          return;
        }

        setConfig(result.config);
        await refresh();
      }, 'Failed to import Google OAuth config.'),
    connectGoogle: () =>
      runTask(async () => {
        const status = await window.pikaBoo.connectGoogle();
        setAuthStatus(status);
        await refresh();
      }, 'Google sign-in failed.'),
    disconnectGoogle: () =>
      runTask(async () => {
        const status = await window.pikaBoo.disconnectGoogle();
        setAuthStatus(status);
        await refresh();
      }, 'Disconnect failed.'),
    toggleStartup: () =>
      runTask(async () => {
        const status = await window.pikaBoo.setStartupEnabled(!runtimeStatus?.startupEnabled);
        setRuntimeStatus(status);
      }, 'Failed to update startup setting.'),
    pollNow: () =>
      runTask(async () => {
        const status = await window.pikaBoo.pollNow();
        setRuntimeStatus(status);
      }, 'Manual poll failed.'),
    togglePaused: () =>
      runTask(async () => {
        const status = await window.pikaBoo.setPaused(!runtimeStatus?.paused);
        setRuntimeStatus(status);
      }, 'Failed to update pause mode.'),
    saveArtifact: (nextArtifactId: ArtifactId) =>
      runTask(async () => {
        setArtifactId(nextArtifactId);
        const status = await window.pikaBoo.setSelectedArtifact(nextArtifactId);
        setRuntimeStatus(status);
      }, 'Failed to save artifact.'),
    clearReminderHistory: () =>
      runTask(async () => {
        const status = await window.pikaBoo.clearReminderHistory();
        setRuntimeStatus(status);
      }, 'Failed to clear reminder history.'),
    saveSelectedCalendars: (calendarIds: string[]) =>
      runTask(async () => {
        const status = await window.pikaBoo.setSelectedCalendars(calendarIds);
        setRuntimeStatus(status);
      }, 'Failed to save selected calendars.'),
  };
}
