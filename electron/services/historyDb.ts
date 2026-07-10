import { app } from 'electron';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import type { CalendarEventSummary, CalendarEventTimelineEntry, ReminderDeliverySummary, ReminderPayload, ThemeRuleKey, ArtifactId, ThemeRuleAssignment } from '../../src/shared/contracts';

let db: DatabaseSync | null = null;

function ensureThemeRuleColumns(database: DatabaseSync): void {
  const columns = new Set(
    (database.prepare('PRAGMA table_info(theme_rules)').all() as Array<Record<string, unknown>>).map((row) => String(row.name)),
  );

  if (!columns.has('rule_label')) {
    database.exec('ALTER TABLE theme_rules ADD COLUMN rule_label TEXT');
  }

  if (!columns.has('match_text')) {
    database.exec('ALTER TABLE theme_rules ADD COLUMN match_text TEXT');
  }

  if (!columns.has('builtin')) {
    database.exec('ALTER TABLE theme_rules ADD COLUMN builtin INTEGER NOT NULL DEFAULT 1');
  }
}

function getDb(): DatabaseSync {
  if (db) {
    return db;
  }

  db = new DatabaseSync(path.join(app.getPath('userData'), 'pikaboo.sqlite'));
  db.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA busy_timeout = 5000;
    PRAGMA synchronous = NORMAL;
  `);
  db.exec(`
    CREATE TABLE IF NOT EXISTS reminder_history (
      reminder_id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      subtitle TEXT NOT NULL,
      artifact_id TEXT NOT NULL,
      meeting_url TEXT,
      delivered_at INTEGER NOT NULL
    ) STRICT;

    CREATE TABLE IF NOT EXISTS event_timeline (
      event_key TEXT PRIMARY KEY,
      event_id TEXT NOT NULL,
      calendar_id TEXT NOT NULL,
      calendar_summary TEXT NOT NULL,
      summary TEXT NOT NULL,
      start_at TEXT NOT NULL,
      meeting_url TEXT,
      last_seen_at INTEGER NOT NULL
    ) STRICT;

    CREATE TABLE IF NOT EXISTS snoozed_reminders (
      reminder_id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      subtitle TEXT NOT NULL,
      artifact_id TEXT NOT NULL,
      meeting_url TEXT,
      wake_at INTEGER NOT NULL
    ) STRICT;

    CREATE TABLE IF NOT EXISTS theme_rules (
      rule_key TEXT PRIMARY KEY,
      artifact_id TEXT NOT NULL
    ) STRICT;

    CREATE INDEX IF NOT EXISTS idx_reminder_history_delivered_at
      ON reminder_history(delivered_at DESC);

    CREATE INDEX IF NOT EXISTS idx_event_timeline_start_at
      ON event_timeline(start_at ASC);

    CREATE INDEX IF NOT EXISTS idx_snoozed_reminders_wake_at
      ON snoozed_reminders(wake_at ASC);
  `);
  ensureThemeRuleColumns(db);

  return db;
}

function eventKey(event: CalendarEventSummary): string {
  return `${event.calendarId}:${event.id}:${event.startAt}`;
}

export function recordReminderDelivery(reminder: ReminderPayload): void {
  const database = getDb();
  const deliveredAt = Date.now();
  database
    .prepare(`
      INSERT INTO reminder_history (
        reminder_id,
        title,
        subtitle,
        artifact_id,
        meeting_url,
        delivered_at
      ) VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT(reminder_id) DO UPDATE SET
        title = excluded.title,
        subtitle = excluded.subtitle,
        artifact_id = excluded.artifact_id,
        meeting_url = excluded.meeting_url,
        delivered_at = excluded.delivered_at
    `)
    .run(
      reminder.reminderId,
      reminder.title,
      reminder.subtitle,
      reminder.artifactId,
      reminder.meetingUrl ?? null,
      deliveredAt,
    );
}

export function saveSnoozedReminder(reminder: ReminderPayload, wakeAt: number): void {
  const database = getDb();
  database
    .prepare(`
      INSERT INTO snoozed_reminders (
        reminder_id,
        title,
        subtitle,
        artifact_id,
        meeting_url,
        wake_at
      ) VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT(reminder_id) DO UPDATE SET
        title = excluded.title,
        subtitle = excluded.subtitle,
        artifact_id = excluded.artifact_id,
        meeting_url = excluded.meeting_url,
        wake_at = excluded.wake_at
    `)
    .run(
      reminder.reminderId,
      reminder.title,
      reminder.subtitle,
      reminder.artifactId,
      reminder.meetingUrl ?? null,
      wakeAt,
    );
}

export function clearSnoozedReminder(reminderId: string): void {
  const database = getDb();
  database.prepare('DELETE FROM snoozed_reminders WHERE reminder_id = ?').run(reminderId);
}

export function listThemeRulesFromDb(): ThemeRuleAssignment[] {
  const database = getDb();
  return (database
    .prepare(`
      SELECT
        rule_key AS ruleKey,
        artifact_id AS artifactId,
        rule_label AS ruleLabel,
        match_text AS matchText,
        builtin
      FROM theme_rules
      ORDER BY rule_key ASC
    `)
    .all() as Array<Record<string, unknown>>).map((row) => ({
      key: String(row.ruleKey) as ThemeRuleKey,
      label: row.ruleLabel ? String(row.ruleLabel) : String(row.ruleKey),
      artifactId: String(row.artifactId) as ArtifactId,
      matchText: row.matchText ? String(row.matchText) : undefined,
      builtin: Number(row.builtin ?? 1) === 1,
    }));
}

export function saveThemeRuleOverride(key: ThemeRuleKey, artifactId: ArtifactId): void {
  const database = getDb();
  database
    .prepare(`
      INSERT INTO theme_rules (
        rule_key,
        artifact_id,
        builtin
      ) VALUES (?, ?, 1)
      ON CONFLICT(rule_key) DO UPDATE SET
        artifact_id = excluded.artifact_id,
        builtin = 1
    `)
    .run(key, artifactId);
}

export function createCustomThemeRule(label: string, matchText: string, artifactId: ArtifactId): void {
  const database = getDb();
  const key = `custom:${Date.now()}:${Math.random().toString(36).slice(2, 8)}`;
  database
    .prepare(`
      INSERT INTO theme_rules (
        rule_key,
        artifact_id,
        rule_label,
        match_text,
        builtin
      ) VALUES (?, ?, ?, ?, 0)
    `)
    .run(key, artifactId, label, matchText.toLowerCase());
}

export function deleteCustomThemeRule(key: string): void {
  const database = getDb();
  database.prepare('DELETE FROM theme_rules WHERE rule_key = ? AND builtin = 0').run(key);
}

export function listSnoozedReminders(): Array<ReminderPayload & { wakeAt: number }> {
  const database = getDb();
  return (database
    .prepare(`
      SELECT
        reminder_id AS reminderId,
        title,
        subtitle,
        artifact_id AS artifactId,
        meeting_url AS meetingUrl,
        wake_at AS wakeAt
      FROM snoozed_reminders
      ORDER BY wake_at ASC
    `)
    .all() as Array<Record<string, unknown>>).map((row) => ({
      reminderId: String(row.reminderId),
      title: String(row.title),
      subtitle: String(row.subtitle),
      artifactId: row.artifactId as ReminderPayload['artifactId'],
      meetingUrl: row.meetingUrl ? String(row.meetingUrl) : undefined,
      wakeAt: Number(row.wakeAt),
    }));
}

export function upsertSeenEvents(events: CalendarEventSummary[]): void {
  if (events.length === 0) {
    return;
  }

  const database = getDb();
  const statement = database.prepare(`
    INSERT INTO event_timeline (
      event_key,
      event_id,
      calendar_id,
      calendar_summary,
      summary,
      start_at,
      meeting_url,
      last_seen_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(event_key) DO UPDATE SET
      calendar_summary = excluded.calendar_summary,
      summary = excluded.summary,
      meeting_url = excluded.meeting_url,
      last_seen_at = excluded.last_seen_at
  `);
  const now = Date.now();

  for (const event of events) {
    statement.run(
      eventKey(event),
      event.id,
      event.calendarId,
      event.calendarSummary,
      event.summary,
      event.startAt,
      event.meetingUrl ?? null,
      now,
    );
  }
}

export function listRecentReminders(limit = 25): ReminderDeliverySummary[] {
  const database = getDb();
  return (database
    .prepare(`
      SELECT
        reminder_id AS reminderId,
        title,
        subtitle,
        artifact_id AS artifactId,
        meeting_url AS meetingUrl,
        delivered_at AS deliveredAt
      FROM reminder_history
      ORDER BY delivered_at DESC
      LIMIT ?
    `)
    .all(limit) as Array<Record<string, unknown>>).map((row) => ({
      reminderId: String(row.reminderId),
      title: String(row.title),
      subtitle: String(row.subtitle),
      artifactId: row.artifactId as ReminderDeliverySummary['artifactId'],
      meetingUrl: row.meetingUrl ? String(row.meetingUrl) : undefined,
      deliveredAt: Number(row.deliveredAt),
    }));
}

export function clearReminderHistory(): void {
  getDb().prepare('DELETE FROM reminder_history').run();
}

export function listEventTimeline(limit = 200): CalendarEventTimelineEntry[] {
  const database = getDb();
  const rows = (database
    .prepare(`
      SELECT
        event_id AS id,
        calendar_id AS calendarId,
        calendar_summary AS calendarSummary,
        summary,
        start_at AS startAt,
        meeting_url AS meetingUrl,
        last_seen_at AS lastSeenAt
      FROM event_timeline
      ORDER BY datetime(start_at) DESC
      LIMIT ?
    `)
    .all(limit) as Array<Record<string, unknown>>);

  return rows.map((row): CalendarEventTimelineEntry => ({
      id: String(row.id),
      calendarId: String(row.calendarId),
      calendarSummary: String(row.calendarSummary),
      summary: String(row.summary),
      startAt: String(row.startAt),
      meetingUrl: row.meetingUrl ? String(row.meetingUrl) : undefined,
      sourceUrl: undefined,
      lastSeenAt: Number(row.lastSeenAt),
      kind: String(row.calendarId).startsWith('tasks:') ? 'task' : 'event',
      label: String(row.calendarId).startsWith('tasks:') ? 'Task' : undefined,
    })).filter((row) => new Date(row.startAt).getTime() <= Date.now());
}
