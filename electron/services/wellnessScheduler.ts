import type { ReminderPayload } from '../../src/shared/contracts';
import { getArtifactForNamedReminder } from './reminderArtifacts';

const DAY_START_HOUR = 9;
const DAY_END_HOUR = 19;
export const EYE_BREAK_INTERVAL_MINUTES = 20;
export const STAND_BREAK_INTERVAL_MINUTES = 30;
export const WATER_BREAK_INTERVAL_MINUTES = 60;

type ReminderHandler = (payload: ReminderPayload) => void;

function nextSlotTime(anchorHour: number, intervalMinutes: number, now: Date): Date {
  const start = new Date(now);
  start.setHours(anchorHour, 0, 0, 0);

  if (now.getTime() < start.getTime()) {
    return start;
  }

  const minutesSinceStart = Math.floor((now.getTime() - start.getTime()) / 60_000);
  const nextMinutes = (Math.floor(minutesSinceStart / intervalMinutes) + 1) * intervalMinutes;
  const next = new Date(start.getTime() + nextMinutes * 60_000);

  if (next.getHours() >= DAY_END_HOUR) {
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(anchorHour, 0, 0, 0);
    return tomorrow;
  }

  return next;
}

export class WellnessScheduler {
  private paused = false;
  private eyeTimer: NodeJS.Timeout | null = null;
  private standTimer: NodeJS.Timeout | null = null;
  private waterTimer: NodeJS.Timeout | null = null;

  constructor(private readonly onReminder: ReminderHandler) {}

  start(): void {
    this.scheduleEyeBreak();
    this.scheduleStandBreak();
    this.scheduleWaterBreak();
  }

  stop(): void {
    this.clearTimers();
  }

  setPaused(paused: boolean): void {
    this.paused = paused;
    this.clearTimers();

    if (!paused) {
      this.start();
    }
  }

  private scheduleEyeBreak(): void {
    const now = new Date();
    const next = nextSlotTime(DAY_START_HOUR, EYE_BREAK_INTERVAL_MINUTES, now);
    this.eyeTimer = setTimeout(() => {
      this.eyeTimer = null;
      if (this.paused) {
        return;
      }

      this.onReminder({
        reminderId: `eye-break:${next.toISOString()}`,
        title: 'Relax your eyes',
        subtitle: '20-20-20: look 20 feet away for 20 seconds.',
        artifactId: getArtifactForNamedReminder('eye-break', 'ghost'),
      });
      this.scheduleEyeBreak();
    }, Math.max(1_000, next.getTime() - now.getTime()));
  }

  private scheduleStandBreak(): void {
    const now = new Date();
    const next = nextSlotTime(DAY_START_HOUR, STAND_BREAK_INTERVAL_MINUTES, now);
    this.standTimer = setTimeout(() => {
      this.standTimer = null;
      if (this.paused) {
        return;
      }

      this.onReminder({
        reminderId: `stand-break:${next.toISOString()}`,
        title: 'Stand up for a minute',
        subtitle: 'Stand, stretch, or walk for 1 to 2 minutes.',
        artifactId: getArtifactForNamedReminder('stand-break', 'cat'),
      });
      this.scheduleStandBreak();
    }, Math.max(1_000, next.getTime() - now.getTime()));
  }

  private scheduleWaterBreak(): void {
    const now = new Date();
    const next = nextSlotTime(DAY_START_HOUR, WATER_BREAK_INTERVAL_MINUTES, now);
    this.waterTimer = setTimeout(() => {
      this.waterTimer = null;
      if (this.paused) {
        return;
      }

      this.onReminder({
        reminderId: `water-break:${next.toISOString()}`,
        title: 'Water break',
        subtitle: 'Take a few sips and reset before the next push.',
        artifactId: getArtifactForNamedReminder('water-break', 'ufo'),
      });
      this.scheduleWaterBreak();
    }, Math.max(1_000, next.getTime() - now.getTime()));
  }

  private clearTimers(): void {
    if (this.eyeTimer) {
      clearTimeout(this.eyeTimer);
      this.eyeTimer = null;
    }

    if (this.standTimer) {
      clearTimeout(this.standTimer);
      this.standTimer = null;
    }

    if (this.waterTimer) {
      clearTimeout(this.waterTimer);
      this.waterTimer = null;
    }
  }
}
