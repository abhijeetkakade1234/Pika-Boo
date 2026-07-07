export type ArtifactId = 'ghost' | 'rocket' | 'train' | 'ufo' | 'minimal' | 'cat' | 'paper-plane' | 'santa';

export interface ReminderPayload {
  reminderId: string;
  title: string;
  subtitle: string;
  artifactId: ArtifactId;
  meetingUrl?: string;
}

export interface GoogleOAuthConfig {
  clientId: string;
  clientSecret?: string;
}

export interface OAuthImportResult {
  config: GoogleOAuthConfig | null;
  cancelled: boolean;
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
  paused: boolean;
  reminderLeadMinutes: number;
  lastPollAt: number | null;
  lastPollError: string | null;
  upcomingCount: number;
  upcomingEvents: CalendarEventSummary[];
  artifactId: ArtifactId;
}
