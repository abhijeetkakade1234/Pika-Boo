/// <reference types="vite/client" />

import type {
  ArtifactId,
  AuthStatus,
  GoogleOAuthConfig,
  OAuthImportResult,
  ReminderPayload,
  RuntimeStatus,
  ThemeRuleAssignment,
} from './shared/contracts';

declare global {
  interface Window {
    pikaBoo: {
      showOverlayDemo: () => Promise<void>;
      openSettings: () => Promise<void>;
      openExternal: (url: string) => Promise<void>;
      snoozeReminder: (reminderId: string, minutes: number) => Promise<void>;
      dismissReminder: (reminderId: string) => Promise<void>;
      getSelectedArtifact: () => Promise<ArtifactId>;
      setSelectedArtifact: (artifactId: ArtifactId) => Promise<RuntimeStatus>;
      getThemeRules: () => Promise<ThemeRuleAssignment[]>;
      setThemeRule: (key: ThemeRuleAssignment['key'], artifactId: ArtifactId) => Promise<ThemeRuleAssignment[]>;
      addThemeRule: (label: string, matchText: string, artifactId: ArtifactId) => Promise<ThemeRuleAssignment[]>;
      deleteThemeRule: (key: string) => Promise<ThemeRuleAssignment[]>;
      getAuthStatus: () => Promise<AuthStatus>;
      getGoogleOAuthConfig: () => Promise<GoogleOAuthConfig>;
      importGoogleOAuthConfig: () => Promise<OAuthImportResult>;
      saveGoogleOAuthConfig: (config: GoogleOAuthConfig) => Promise<AuthStatus>;
      connectGoogle: () => Promise<AuthStatus>;
      disconnectGoogle: () => Promise<AuthStatus>;
      getRuntimeStatus: () => Promise<RuntimeStatus>;
      setStartupEnabled: (enabled: boolean) => Promise<RuntimeStatus>;
      setPaused: (paused: boolean) => Promise<RuntimeStatus>;
      setWellnessEnabled: (enabled: boolean) => Promise<RuntimeStatus>;
      setWellnessTypeEnabled: (kind: 'eye' | 'stand' | 'water', enabled: boolean) => Promise<RuntimeStatus>;
      setTimeAwarenessEnabled: (enabled: boolean) => Promise<RuntimeStatus>;
      clearReminderHistory: () => Promise<RuntimeStatus>;
      pollNow: () => Promise<RuntimeStatus>;
      setSelectedCalendars: (calendarIds: string[]) => Promise<RuntimeStatus>;
      onRuntimeUpdated: (callback: () => void) => () => void;
      onOverlayShow: (callback: (payload: ReminderPayload) => void) => () => void;
    };
  }
}

export {};

declare module '*.svg' {
  const src: string;
  export default src;
}
