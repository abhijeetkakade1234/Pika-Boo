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
  secureStorageAvailable: boolean;
}

export interface CalendarEventSummary {
  id: string;
  summary: string;
  startAt: string;
  meetingUrl?: string;
}

export interface RuntimeStatus {
  startupEnabled: boolean;
  startupSupported: boolean;
  pollerRunning: boolean;
  lastPollAt: number | null;
  lastPollError: string | null;
  upcomingCount: number;
  upcomingEvents: CalendarEventSummary[];
}
