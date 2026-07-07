/// <reference types="vite/client" />

import type {
  ArtifactId,
  AuthStatus,
  GoogleOAuthConfig,
  OAuthImportResult,
  ReminderPayload,
  RuntimeStatus,
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
      getAuthStatus: () => Promise<AuthStatus>;
      getGoogleOAuthConfig: () => Promise<GoogleOAuthConfig>;
      importGoogleOAuthConfig: () => Promise<OAuthImportResult>;
      saveGoogleOAuthConfig: (config: GoogleOAuthConfig) => Promise<AuthStatus>;
      connectGoogle: () => Promise<AuthStatus>;
      disconnectGoogle: () => Promise<AuthStatus>;
      getRuntimeStatus: () => Promise<RuntimeStatus>;
      setStartupEnabled: (enabled: boolean) => Promise<RuntimeStatus>;
      setPaused: (paused: boolean) => Promise<RuntimeStatus>;
      pollNow: () => Promise<RuntimeStatus>;
      onRuntimeUpdated: (callback: () => void) => () => void;
      onOverlayShow: (callback: (payload: ReminderPayload) => void) => () => void;
    };
  }
}

export {};
