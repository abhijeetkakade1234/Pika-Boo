export type ArtifactId = 'ghost' | 'rocket' | 'train' | 'ufo' | 'minimal' | 'cat' | 'paper-plane' | 'santa';

export interface ReminderPayload {
  reminderId: string;
  title: string;
  subtitle: string;
  artifactId: ArtifactId;
  meetingUrl?: string;
}

export interface ReminderDeliverySummary extends ReminderPayload {
  deliveredAt: number;
}

export interface CalendarEventTimelineEntry extends CalendarEventSummary {
  lastSeenAt: number;
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
  calendarId: string;
  calendarSummary: string;
  summary: string;
  startAt: string;
  meetingUrl?: string;
  sourceUrl?: string;
  kind: 'event' | 'task';
  label?: string;
}

export interface CalendarListEntry {
  id: string;
  summary: string;
  primary: boolean;
  selected: boolean;
  backgroundColor?: string;
}

export interface RuntimeStatus {
  startupEnabled: boolean;
  startupSupported: boolean;
  pollerRunning: boolean;
  paused: boolean;
  reminderLeadMinutes: number;
  reminderLeadTimes: number[];
  lastPollAt: number | null;
  lastPollError: string | null;
  upcomingCount: number;
  upcomingEvents: CalendarEventSummary[];
  availableCalendars: CalendarListEntry[];
  artifactId: ArtifactId;
  currentReminder: ReminderPayload | null;
  recentReminders: ReminderDeliverySummary[];
  eventTimeline: CalendarEventTimelineEntry[];
}
