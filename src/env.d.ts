/// <reference types="vite/client" />

import type { AuthStatus, GoogleOAuthConfig, ReminderPayload, RuntimeStatus } from './shared/contracts';

declare global {
  interface Window {
    pikaBoo: {
      showOverlayDemo: () => Promise<void>;
      openSettings: () => Promise<void>;
      getAuthStatus: () => Promise<AuthStatus>;
      saveGoogleOAuthConfig: (config: GoogleOAuthConfig) => Promise<AuthStatus>;
      connectGoogle: () => Promise<AuthStatus>;
      disconnectGoogle: () => Promise<AuthStatus>;
      getRuntimeStatus: () => Promise<RuntimeStatus>;
      setStartupEnabled: (enabled: boolean) => Promise<RuntimeStatus>;
      pollNow: () => Promise<RuntimeStatus>;
      onRuntimeUpdated: (callback: () => void) => () => void;
      onOverlayShow: (callback: (payload: ReminderPayload) => void) => () => void;
    };
  }
}

export {};
