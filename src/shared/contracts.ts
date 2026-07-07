export interface ReminderPayload {
  title: string;
  subtitle: string;
}

export interface GoogleOAuthConfig {
  clientId: string;
  clientSecret?: string;
}

export interface AuthStatus {
  configured: boolean;
  connected: boolean;
  hasRefreshToken: boolean;
  expiresAt: number | null;
}
