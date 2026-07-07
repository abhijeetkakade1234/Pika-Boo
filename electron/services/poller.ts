import type { CalendarEventSummary, ReminderPayload, RuntimeStatus } from '../../src/shared/contracts';
import { listUpcomingEvents } from './googleAuth';
import { getArtifactId, getGoogleOAuthConfig } from './settingsStore';

const POLL_INTERVAL_MS = 60_000;
const REMINDER_LEAD_MS = 5 * 60_000;
const LOOKAHEAD_MS = 30 * 60_000;

type OverlayHandler = (payload: ReminderPayload) => void;

function reminderKey(event: CalendarEventSummary): string {
  return `${event.id}:${event.startAt}`;
}

function buildReminder(event: CalendarEventSummary): ReminderPayload {
  const startTime = new Date(event.startAt).getTime();
  const deltaMs = startTime - Date.now();
  const deltaMinutes = Math.max(0, Math.round(deltaMs / 60_000));

  return {
    title: event.summary,
    subtitle: deltaMinutes <= 0 ? 'Starting now' : `Starts in ${deltaMinutes} minute${deltaMinutes === 1 ? '' : 's'}`,
    artifactId: getArtifactId(),
    meetingUrl: event.meetingUrl,
  };
}

export class CalendarPoller {
  private timer: NodeJS.Timeout | null = null;
  private shown = new Map<string, number>();
  private lastPollAt: number | null = null;
  private lastPollError: string | null = null;
  private upcomingCount = 0;
  private upcomingEvents: CalendarEventSummary[] = [];

  constructor(
    private readonly onReminder: OverlayHandler,
    private readonly onStatusChange: () => void,
  ) {}

  getStatus(startupEnabled: boolean, startupSupported: boolean): RuntimeStatus {
    return {
      startupEnabled,
      startupSupported,
      pollerRunning: this.timer !== null,
      lastPollAt: this.lastPollAt,
      lastPollError: this.lastPollError,
      upcomingCount: this.upcomingCount,
      upcomingEvents: this.upcomingEvents,
      artifactId: getArtifactId(),
    };
  }

  start(): void {
    if (this.timer) {
      return;
    }

    void this.poll();
    this.timer = setInterval(() => {
      void this.poll();
    }, POLL_INTERVAL_MS);
  }

  stop(): void {
    if (!this.timer) {
      return;
    }

    clearInterval(this.timer);
    this.timer = null;
  }

  async poll(): Promise<void> {
    const config = getGoogleOAuthConfig();
    if (!config) {
      this.lastPollError = 'Google OAuth is not configured.';
      this.upcomingCount = 0;
      this.upcomingEvents = [];
      this.lastPollAt = Date.now();
      this.onStatusChange();
      return;
    }

    try {
      const now = new Date();
      const events = await listUpcomingEvents(config, now, new Date(now.getTime() + LOOKAHEAD_MS));

      this.lastPollAt = Date.now();
      this.lastPollError = null;
      this.upcomingCount = events.length;
      this.upcomingEvents = events;
      this.pruneShown(events);

      for (const event of events) {
        const startMs = new Date(event.startAt).getTime();
        const key = reminderKey(event);

        if (Number.isNaN(startMs) || this.shown.has(key)) {
          continue;
        }

        if (startMs >= now.getTime() && startMs - now.getTime() <= REMINDER_LEAD_MS) {
          this.shown.set(key, startMs);
          this.onReminder(buildReminder(event));
        }
      }

      this.onStatusChange();
    } catch (error) {
      this.lastPollAt = Date.now();
      this.lastPollError = error instanceof Error ? error.message : 'Calendar poll failed.';
      this.upcomingEvents = [];
      this.onStatusChange();
    }
  }

  private pruneShown(events: CalendarEventSummary[]): void {
    const activeKeys = new Set(events.map((event) => reminderKey(event)));
    const expiryCutoff = Date.now() - 60 * 60_000;

    for (const [key, startMs] of this.shown) {
      if (startMs < expiryCutoff || !activeKeys.has(key)) {
        this.shown.delete(key);
      }
    }
  }
}
