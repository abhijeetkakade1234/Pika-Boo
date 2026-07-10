import { startTransition, useEffect, useState } from 'react';
import type {
  ArtifactId,
  AuthStatus,
  GoogleOAuthConfig,
  RuntimeStatus,
  ThemeRuleAssignment,
} from '../shared/contracts';

export function useDesktopControlState() {
  const [config, setConfig] = useState<GoogleOAuthConfig>({ clientId: '', clientSecret: '' });
  const [authStatus, setAuthStatus] = useState<AuthStatus | null>(null);
  const [runtimeStatus, setRuntimeStatus] = useState<RuntimeStatus | null>(null);
  const [artifactId, setArtifactId] = useState<ArtifactId>('ghost');
  const [themeRules, setThemeRules] = useState<ThemeRuleAssignment[]>([]);
  const [busy, setBusy] = useState(false);
  const [pendingAction, setPendingAction] = useState('');
  const [error, setError] = useState('');

  function canUseThemeRules(): boolean {
    return typeof window.pikaBoo.getThemeRules === 'function' && typeof window.pikaBoo.setThemeRule === 'function';
  }

  async function refresh() {
    const themeRulesPromise = canUseThemeRules()
      ? window.pikaBoo.getThemeRules()
      : Promise.resolve<ThemeRuleAssignment[]>([]);

    const [nextAuth, nextRuntime, nextConfig, nextArtifactId, nextThemeRules] = await Promise.all([
      window.pikaBoo.getAuthStatus(),
      window.pikaBoo.getRuntimeStatus(),
      window.pikaBoo.getGoogleOAuthConfig(),
      window.pikaBoo.getSelectedArtifact(),
      themeRulesPromise,
    ]);

    startTransition(() => {
      setAuthStatus(nextAuth);
      setRuntimeStatus(nextRuntime);
      setConfig(nextConfig);
      setArtifactId(nextArtifactId);
      setThemeRules(nextThemeRules);
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

  async function runTask(task: () => Promise<void>, fallbackMessage: string, actionLabel: string) {
    setBusy(true);
    setPendingAction(actionLabel);
    setError('');

    try {
      await task();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : fallbackMessage);
    } finally {
      setBusy(false);
      setPendingAction('');
    }
  }

  return {
    config,
    setConfig,
    authStatus,
    runtimeStatus,
    artifactId,
    themeRules,
    busy,
    pendingAction,
    error,
    setError,
    refresh,
    saveConfig: () =>
      runTask(async () => {
        const status = await window.pikaBoo.saveGoogleOAuthConfig(config);
        setAuthStatus(status);
        await refresh();
      }, 'Failed to save config.', 'save-config'),
    importGoogleConfig: () =>
      runTask(async () => {
        const result = await window.pikaBoo.importGoogleOAuthConfig();
        if (result.cancelled || !result.config) {
          return;
        }

        setConfig(result.config);
        await refresh();
      }, 'Failed to import Google OAuth config.', 'import-google-config'),
    connectGoogle: () =>
      runTask(async () => {
        const status = await window.pikaBoo.connectGoogle();
        setAuthStatus(status);
        await refresh();
      }, 'Google sign-in failed.', 'connect-google'),
    disconnectGoogle: () =>
      runTask(async () => {
        const status = await window.pikaBoo.disconnectGoogle();
        setAuthStatus(status);
        await refresh();
      }, 'Disconnect failed.', 'disconnect-google'),
    toggleStartup: () =>
      runTask(async () => {
        const status = await window.pikaBoo.setStartupEnabled(!runtimeStatus?.startupEnabled);
        setRuntimeStatus(status);
      }, 'Failed to update startup setting.', 'toggle-startup'),
    pollNow: () =>
      runTask(async () => {
        const status = await window.pikaBoo.pollNow();
        setRuntimeStatus(status);
      }, 'Manual poll failed.', 'poll-now'),
    togglePaused: () =>
      runTask(async () => {
        const status = await window.pikaBoo.setPaused(!runtimeStatus?.paused);
        setRuntimeStatus(status);
      }, 'Failed to update pause mode.', 'toggle-paused'),
    toggleWellness: () =>
      runTask(async () => {
        const status = await window.pikaBoo.setWellnessEnabled(!runtimeStatus?.wellnessEnabled);
        setRuntimeStatus(status);
      }, 'Failed to update wellness reminders.', 'toggle-wellness'),
    saveArtifact: (nextArtifactId: ArtifactId) =>
      runTask(async () => {
        setArtifactId(nextArtifactId);
        const status = await window.pikaBoo.setSelectedArtifact(nextArtifactId);
        setRuntimeStatus(status);
        if (canUseThemeRules()) {
          const nextRules = await window.pikaBoo.getThemeRules();
          setThemeRules(nextRules);
        }
      }, 'Failed to save artifact.', 'save-artifact'),
    saveThemeRule: (key: ThemeRuleAssignment['key'], nextArtifactId: ArtifactId) =>
      runTask(async () => {
        if (!canUseThemeRules()) {
          throw new Error('Restart Pika-Boo to load theme rule controls.');
        }

        const nextRules = await window.pikaBoo.setThemeRule(key, nextArtifactId);
        setThemeRules(nextRules);
      }, 'Failed to save theme rule.', 'save-theme-rule'),
    addThemeRule: (label: string, matchText: string, nextArtifactId: ArtifactId) =>
      runTask(async () => {
        if (!canUseThemeRules()) {
          throw new Error('Restart Pika-Boo to load theme rule controls.');
        }

        const nextRules = await window.pikaBoo.addThemeRule(label, matchText, nextArtifactId);
        setThemeRules(nextRules);
      }, 'Failed to add theme rule.', 'add-theme-rule'),
    deleteThemeRule: (key: string) =>
      runTask(async () => {
        if (!canUseThemeRules()) {
          throw new Error('Restart Pika-Boo to load theme rule controls.');
        }

        const nextRules = await window.pikaBoo.deleteThemeRule(key);
        setThemeRules(nextRules);
      }, 'Failed to delete theme rule.', 'delete-theme-rule'),
    clearReminderHistory: () =>
      runTask(async () => {
        const status = await window.pikaBoo.clearReminderHistory();
        setRuntimeStatus(status);
      }, 'Failed to clear reminder history.', 'clear-history'),
    saveSelectedCalendars: (calendarIds: string[]) =>
      runTask(async () => {
        const status = await window.pikaBoo.setSelectedCalendars(calendarIds);
        setRuntimeStatus(status);
      }, 'Failed to save selected calendars.', 'save-selected-calendars'),
  };
}
