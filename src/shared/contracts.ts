export type ArtifactId = 'ghost' | 'rocket' | 'train' | 'ufo' | 'minimal';

export interface ReminderPayload {
  title: string;
  subtitle: string;
  artifactId: ArtifactId;
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
  artifactId: ArtifactId;
}
