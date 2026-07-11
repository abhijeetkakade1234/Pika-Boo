import type { CalendarEventSummary, CalendarListEntry, ReminderPayload, RuntimeStatus } from '../../src/shared/contracts';
import { listCalendars, listUpcomingEvents } from './googleAuth';
import { getArtifactForEvent, getArtifactForNamedReminder } from './reminderArtifacts';
import {
  getArtifactId,
  getGoogleOAuthConfig,
  getLastMorningBriefingDate,
  getReminderLeadMinutes,
  getSelectedCalendarIds,
  getEyeBreakEnabled,
  getStandBreakEnabled,
  getTimeAwarenessEnabled,
  getWaterBreakEnabled,
  getWellnessEnabled,
  saveLastMorningBriefingDate,
  saveSelectedCalendarIds,
} from './settingsStore';

const POLL_INTERVAL_MS = 60_000;
const LOOKAHEAD_MS = 30 * 24 * 60 * 60_000;
const MORNING_BRIEFING_HOUR = 8;
const MORNING_BRIEFING_CATCHUP_END_HOUR = 11;
export const EVENT_REMINDER_LEAD_TIMES = [30, 5, 1];

type OverlayHandler = (payload: ReminderPayload) => void;

function reminderKey(event: CalendarEventSummary, leadMinutes: number): string {
  return `${event.calendarId}:${event.id}:${event.startAt}:lead:${leadMinutes}`;
}

function buildReminder(event: CalendarEventSummary, leadMinutes: number): ReminderPayload {
  return {
    reminderId: reminderKey(event, leadMinutes),
    title: event.summary,
    subtitle: `Starts in ${leadMinutes} minute${leadMinutes === 1 ? '' : 's'} | ${event.calendarSummary}`,
    artifactId: getArtifactForEvent(event),
    meetingUrl: event.meetingUrl,
  };
}

function normalizeCalendars(calendars: CalendarListEntry[]): CalendarListEntry[] {
  if (calendars.some((calendar) => calendar.selected)) {
    return calendars;
  }

  const fallbackId = calendars.find((calendar) => calendar.primary)?.id ?? calendars[0]?.id;
  return calendars.map((calendar) => ({
    ...calendar,
    selected: calendar.id === fallbackId,
  }));
}

function getLocalDateKey(value: Date): string {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function isSameLocalDay(input: string, target: Date): boolean {
  return getLocalDateKey(new Date(input)) === getLocalDateKey(target);
}

function formatDigestSummary(events: CalendarEventSummary[]): { title: string; subtitle: string; meetingUrl?: string } {
  if (events.length === 0) {
    return {
      title: '🌅 Morning Briefing',
      subtitle: 'Nothing scheduled today yet. Enjoy the quiet start.',
    };
  }

  const first = events[0];
  const firstTime = new Date(first.startAt).toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
  });

  return {
    title: '🌅 Morning Briefing',
    subtitle: `Today: ${events.length} moment${events.length === 1 ? '' : 's'}. First is ${first.summary} at ${firstTime}.`,
    meetingUrl: first.meetingUrl,
  };
}

export class CalendarPoller {
  private timer: NodeJS.Timeout | null = null;
  private shown = new Map<string, number>();
  private scheduled = new Map<string, NodeJS.Timeout>();
  private morningBriefingTimer: NodeJS.Timeout | null = null;
  private lastPollAt: number | null = null;
  private lastPollError: string | null = null;
  private upcomingCount = 0;
  private upcomingEvents: CalendarEventSummary[] = [];
  private availableCalendars: CalendarListEntry[] = [];
  private paused = false;

  constructor(
    private readonly onReminder: OverlayHandler,
    private readonly onEventsSeen: (events: CalendarEventSummary[]) => void,
    private readonly onStatusChange: () => void,
  ) {}

  getStatus(startupEnabled: boolean, startupSupported: boolean): RuntimeStatus {
    return {
      startupEnabled,
      startupSupported,
      pollerRunning: this.timer !== null,
      paused: this.paused,
      wellnessEnabled: getWellnessEnabled(),
      eyeBreakEnabled: getEyeBreakEnabled(),
      standBreakEnabled: getStandBreakEnabled(),
      waterBreakEnabled: getWaterBreakEnabled(),
      timeAwarenessEnabled: getTimeAwarenessEnabled(),
      reminderLeadMinutes: getReminderLeadMinutes(),
      reminderLeadTimes: EVENT_REMINDER_LEAD_TIMES,
      lastPollAt: this.lastPollAt,
      lastPollError: this.lastPollError,
      upcomingCount: this.upcomingCount,
      upcomingEvents: this.upcomingEvents,
      availableCalendars: this.availableCalendars,
      artifactId: getArtifactId(),
      currentReminder: null,
      recentReminders: [],
      eventTimeline: [],
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
    this.clearScheduled();
    this.clearMorningBriefing();
  }

  setPaused(paused: boolean): void {
    this.paused = paused;
    if (paused) {
      this.clearScheduled();
      this.clearMorningBriefing();
    } else {
      void this.poll();
    }
    this.onStatusChange();
  }

  async poll(): Promise<void> {
    if (this.paused) {
      this.lastPollError = null;
      this.lastPollAt = Date.now();
      this.onStatusChange();
      return;
    }

    const config = getGoogleOAuthConfig();
    if (!config) {
      this.lastPollError = 'Google OAuth is not configured.';
      this.upcomingCount = 0;
      this.upcomingEvents = [];
      this.availableCalendars = [];
      this.clearScheduled();
      this.clearMorningBriefing();
      this.lastPollAt = Date.now();
      this.onStatusChange();
      return;
    }

    try {
      const now = new Date();
      const calendars = normalizeCalendars(await listCalendars(config, getSelectedCalendarIds()));
      const selectedIds = calendars.filter((calendar) => calendar.selected).map((calendar) => calendar.id);
      saveSelectedCalendarIds(selectedIds);

      const events = await listUpcomingEvents(config, calendars, now, new Date(now.getTime() + LOOKAHEAD_MS));

      this.lastPollAt = Date.now();
      this.lastPollError = null;
      this.availableCalendars = calendars;
      this.upcomingCount = events.length;
      this.upcomingEvents = events;
      this.onEventsSeen(events);
      this.pruneShown(events);
      this.scheduleReminders(events);
      this.scheduleMorningBriefing(events);
      this.onStatusChange();
    } catch (error) {
      this.lastPollAt = Date.now();
      this.lastPollError = error instanceof Error ? error.message : 'Calendar poll failed.';
      this.upcomingCount = 0;
      this.upcomingEvents = [];
      this.availableCalendars = [];
      this.clearScheduled();
      this.clearMorningBriefing();
      this.onStatusChange();
    }
  }

  private scheduleReminders(events: CalendarEventSummary[]): void {
    const nowMs = Date.now();
    const activeKeys = new Set<string>();

    for (const event of events) {
      const startMs = new Date(event.startAt).getTime();
      if (Number.isNaN(startMs)) {
        continue;
      }

      for (const leadMinutes of EVENT_REMINDER_LEAD_TIMES) {
        const key = reminderKey(event, leadMinutes);
        const fireAt = startMs - leadMinutes * 60_000;
        activeKeys.add(key);

        if (this.shown.has(key)) {
          continue;
        }

        if (fireAt <= nowMs) {
          if (startMs > nowMs) {
            this.shown.set(key, fireAt);
            this.clearScheduledKey(key);
            this.onReminder(buildReminder(event, leadMinutes));
          }
          continue;
        }

        if (this.scheduled.has(key)) {
          continue;
        }

        const timer = setTimeout(() => {
          this.scheduled.delete(key);
          if (this.paused || this.shown.has(key)) {
            return;
          }

          this.shown.set(key, fireAt);
          this.onReminder(buildReminder(event, leadMinutes));
          this.onStatusChange();
        }, fireAt - nowMs);

        this.scheduled.set(key, timer);
      }
    }

    for (const [key] of this.scheduled) {
      if (!activeKeys.has(key) || this.shown.has(key)) {
        this.clearScheduledKey(key);
      }
    }
  }

  private scheduleMorningBriefing(events: CalendarEventSummary[]): void {
    this.clearMorningBriefing();

    const now = new Date();
    const todayKey = getLocalDateKey(now);
    const todaysEvents = events.filter((event) => isSameLocalDay(event.startAt, now));

    if (getLastMorningBriefingDate() === todayKey) {
      return;
    }

    if (now.getHours() >= MORNING_BRIEFING_HOUR && now.getHours() < MORNING_BRIEFING_CATCHUP_END_HOUR) {
      this.morningBriefingTimer = setTimeout(() => {
        if (this.paused || getLastMorningBriefingDate() === todayKey) {
          return;
        }

        const digest = formatDigestSummary(todaysEvents);
        saveLastMorningBriefingDate(todayKey);
        this.onReminder({
          reminderId: `morning-briefing:${todayKey}`,
          title: digest.title,
          subtitle: digest.subtitle,
          artifactId: getArtifactForNamedReminder('morning-briefing', 'rocket'),
          meetingUrl: digest.meetingUrl,
        });
      }, 10_000);
      return;
    }

    const nextMorning = new Date(now);
    nextMorning.setHours(MORNING_BRIEFING_HOUR, 0, 0, 0);
    if (nextMorning.getTime() <= now.getTime()) {
      nextMorning.setDate(nextMorning.getDate() + 1);
    }

    const nextDayKey = getLocalDateKey(nextMorning);
    this.morningBriefingTimer = setTimeout(() => {
      if (this.paused || getLastMorningBriefingDate() === nextDayKey) {
        return;
      }

      const upcomingForNextDay = this.upcomingEvents.filter((event) => isSameLocalDay(event.startAt, nextMorning));
      const digest = formatDigestSummary(upcomingForNextDay);
      saveLastMorningBriefingDate(nextDayKey);
      this.onReminder({
        reminderId: `morning-briefing:${nextDayKey}`,
        title: digest.title,
        subtitle: digest.subtitle,
        artifactId: getArtifactForNamedReminder('morning-briefing', 'rocket'),
        meetingUrl: digest.meetingUrl,
      });
    }, nextMorning.getTime() - now.getTime());
  }

  private pruneShown(events: CalendarEventSummary[]): void {
    const activeKeys = new Set(events.flatMap((event) => EVENT_REMINDER_LEAD_TIMES.map((leadMinutes) => reminderKey(event, leadMinutes))));
    const expiryCutoff = Date.now() - 2 * 60 * 60_000;

    for (const [key, fireAt] of this.shown) {
      if (fireAt < expiryCutoff || !activeKeys.has(key)) {
        this.shown.delete(key);
      }
    }
  }

  private clearScheduled(): void {
    for (const timer of this.scheduled.values()) {
      clearTimeout(timer);
    }

    this.scheduled.clear();
  }

  private clearScheduledKey(key: string): void {
    const timer = this.scheduled.get(key);
    if (!timer) {
      return;
    }

    clearTimeout(timer);
    this.scheduled.delete(key);
  }

  private clearMorningBriefing(): void {
    if (!this.morningBriefingTimer) {
      return;
    }

    clearTimeout(this.morningBriefingTimer);
    this.morningBriefingTimer = null;
  }
}
