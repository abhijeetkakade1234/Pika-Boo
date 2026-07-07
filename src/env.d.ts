/// <reference types="vite/client" />

import type { AuthStatus, GoogleOAuthConfig, ReminderPayload } from './shared/contracts';

declare global {
  interface Window {
    pikaBoo: {
      showOverlayDemo: () => Promise<void>;
      openSettings: () => Promise<void>;
      getAuthStatus: () => Promise<AuthStatus>;
      saveGoogleOAuthConfig: (config: GoogleOAuthConfig) => Promise<AuthStatus>;
      connectGoogle: () => Promise<AuthStatus>;
      disconnectGoogle: () => Promise<AuthStatus>;
      onOverlayShow: (callback: (payload: ReminderPayload) => void) => () => void;
    };
  }
}

export {};
