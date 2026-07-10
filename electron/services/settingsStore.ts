import { app } from 'electron';
import fs from 'node:fs';
import path from 'node:path';
import type { ArtifactId, GoogleOAuthConfig } from '../../src/shared/contracts';
import { getAppSettingValue, setAppSettingValue } from './historyDb';

interface AppSettings {
  googleOAuth?: GoogleOAuthConfig;
  artifactId?: ArtifactId;
  reminderLeadMinutes?: number;
  selectedCalendarIds?: string[];
  wellnessEnabled?: boolean;
  eyeBreakEnabled?: boolean;
  standBreakEnabled?: boolean;
  waterBreakEnabled?: boolean;
  timeAwarenessEnabled?: boolean;
  startupConfigured?: boolean;
  lastMorningBriefingDate?: string;
}

const DEFAULT_ARTIFACT_ID: ArtifactId = 'ghost';
const DEFAULT_REMINDER_LEAD_MINUTES = 5;
const DEFAULT_WELLNESS_ENABLED = true;
const DEFAULT_EYE_BREAK_ENABLED = true;
const DEFAULT_STAND_BREAK_ENABLED = true;
const DEFAULT_WATER_BREAK_ENABLED = true;
const DEFAULT_TIME_AWARENESS_ENABLED = false;
const MIN_REMINDER_LEAD_MINUTES = 1;
const MAX_REMINDER_LEAD_MINUTES = 60;
const WELLNESS_ENABLED_KEY = 'wellnessEnabled';
const EYE_BREAK_ENABLED_KEY = 'eyeBreakEnabled';
const STAND_BREAK_ENABLED_KEY = 'standBreakEnabled';
const WATER_BREAK_ENABLED_KEY = 'waterBreakEnabled';
const TIME_AWARENESS_ENABLED_KEY = 'timeAwarenessEnabled';

function getSettingsPath(): string {
  return path.join(app.getPath('userData'), 'settings.json');
}

export function readSettings(): AppSettings {
  const settingsPath = getSettingsPath();

  if (!fs.existsSync(settingsPath)) {
    return {};
  }

  return JSON.parse(fs.readFileSync(settingsPath, 'utf8')) as AppSettings;
}

export function saveGoogleOAuthConfig(config: GoogleOAuthConfig): void {
  const settings = readSettings();
  settings.googleOAuth = {
    clientId: config.clientId.trim(),
    clientSecret: config.clientSecret?.trim() || undefined,
  };

  fs.mkdirSync(path.dirname(getSettingsPath()), { recursive: true });
  fs.writeFileSync(getSettingsPath(), JSON.stringify(settings, null, 2), 'utf8');
}

export function getGoogleOAuthConfig(): GoogleOAuthConfig | null {
  const settings = readSettings();
  const config = settings.googleOAuth;

  if (!config?.clientId) {
    return null;
  }

  return config;
}

export function getGoogleOAuthConfigForUi(): GoogleOAuthConfig {
  return getGoogleOAuthConfig() ?? { clientId: '', clientSecret: '' };
}

export function parseGoogleOAuthDesktopClient(rawText: string): GoogleOAuthConfig {
  const parsed = JSON.parse(rawText) as {
    installed?: {
      client_id?: string;
      client_secret?: string;
    };
  };

  const clientId = parsed.installed?.client_id?.trim();
  const clientSecret = parsed.installed?.client_secret?.trim();

  if (!clientId) {
    throw new Error('The selected file does not contain an installed Google OAuth client ID.');
  }

  return {
    clientId,
    clientSecret: clientSecret || undefined,
  };
}

export function getArtifactId(): ArtifactId {
  return readSettings().artifactId ?? DEFAULT_ARTIFACT_ID;
}

export function saveArtifactId(artifactId: ArtifactId): ArtifactId {
  const settings = readSettings();
  settings.artifactId = artifactId;

  fs.mkdirSync(path.dirname(getSettingsPath()), { recursive: true });
  fs.writeFileSync(getSettingsPath(), JSON.stringify(settings, null, 2), 'utf8');
  return settings.artifactId;
}

function normalizeReminderLeadMinutes(value: number): number {
  if (!Number.isFinite(value)) {
    return DEFAULT_REMINDER_LEAD_MINUTES;
  }

  const rounded = Math.round(value);
  return Math.min(MAX_REMINDER_LEAD_MINUTES, Math.max(MIN_REMINDER_LEAD_MINUTES, rounded));
}

export function getReminderLeadMinutes(): number {
  return normalizeReminderLeadMinutes(readSettings().reminderLeadMinutes ?? DEFAULT_REMINDER_LEAD_MINUTES);
}

export function saveReminderLeadMinutes(reminderLeadMinutes: number): number {
  const settings = readSettings();
  settings.reminderLeadMinutes = normalizeReminderLeadMinutes(reminderLeadMinutes);

  fs.mkdirSync(path.dirname(getSettingsPath()), { recursive: true });
  fs.writeFileSync(getSettingsPath(), JSON.stringify(settings, null, 2), 'utf8');
  return settings.reminderLeadMinutes;
}

export function getSelectedCalendarIds(): string[] {
  return Array.from(
    new Set(
      (readSettings().selectedCalendarIds ?? [])
        .map((calendarId) => calendarId.trim())
        .filter(Boolean),
    ),
  );
}

export function saveSelectedCalendarIds(calendarIds: string[]): string[] {
  const settings = readSettings();
  settings.selectedCalendarIds = Array.from(
    new Set(
      calendarIds
        .map((calendarId) => calendarId.trim())
        .filter(Boolean),
    ),
  );

  fs.mkdirSync(path.dirname(getSettingsPath()), { recursive: true });
  fs.writeFileSync(getSettingsPath(), JSON.stringify(settings, null, 2), 'utf8');
  return settings.selectedCalendarIds;
}

export function getWellnessEnabled(): boolean {
  const stored = getAppSettingValue(WELLNESS_ENABLED_KEY);
  if (stored === '1' || stored === '0') {
    return stored === '1';
  }

  const value = readSettings().wellnessEnabled;
  return typeof value === 'boolean' ? value : DEFAULT_WELLNESS_ENABLED;
}

export function saveWellnessEnabled(enabled: boolean): boolean {
  setAppSettingValue(WELLNESS_ENABLED_KEY, enabled ? '1' : '0');
  return enabled;
}

export function getEyeBreakEnabled(): boolean {
  const stored = getAppSettingValue(EYE_BREAK_ENABLED_KEY);
  if (stored === '1' || stored === '0') {
    return stored === '1';
  }

  const value = readSettings().eyeBreakEnabled;
  return typeof value === 'boolean' ? value : DEFAULT_EYE_BREAK_ENABLED;
}

export function saveEyeBreakEnabled(enabled: boolean): boolean {
  setAppSettingValue(EYE_BREAK_ENABLED_KEY, enabled ? '1' : '0');
  return enabled;
}

export function getStandBreakEnabled(): boolean {
  const stored = getAppSettingValue(STAND_BREAK_ENABLED_KEY);
  if (stored === '1' || stored === '0') {
    return stored === '1';
  }

  const value = readSettings().standBreakEnabled;
  return typeof value === 'boolean' ? value : DEFAULT_STAND_BREAK_ENABLED;
}

export function saveStandBreakEnabled(enabled: boolean): boolean {
  setAppSettingValue(STAND_BREAK_ENABLED_KEY, enabled ? '1' : '0');
  return enabled;
}

export function getWaterBreakEnabled(): boolean {
  const stored = getAppSettingValue(WATER_BREAK_ENABLED_KEY);
  if (stored === '1' || stored === '0') {
    return stored === '1';
  }

  const value = readSettings().waterBreakEnabled;
  return typeof value === 'boolean' ? value : DEFAULT_WATER_BREAK_ENABLED;
}

export function saveWaterBreakEnabled(enabled: boolean): boolean {
  setAppSettingValue(WATER_BREAK_ENABLED_KEY, enabled ? '1' : '0');
  return enabled;
}

export function getTimeAwarenessEnabled(): boolean {
  const stored = getAppSettingValue(TIME_AWARENESS_ENABLED_KEY);
  if (stored === '1' || stored === '0') {
    return stored === '1';
  }

  const value = readSettings().timeAwarenessEnabled;
  return typeof value === 'boolean' ? value : DEFAULT_TIME_AWARENESS_ENABLED;
}

export function saveTimeAwarenessEnabled(enabled: boolean): boolean {
  setAppSettingValue(TIME_AWARENESS_ENABLED_KEY, enabled ? '1' : '0');
  return enabled;
}

export function getStartupConfigured(): boolean {
  return Boolean(readSettings().startupConfigured);
}

export function saveStartupConfigured(configured: boolean): boolean {
  const settings = readSettings();
  settings.startupConfigured = configured;

  fs.mkdirSync(path.dirname(getSettingsPath()), { recursive: true });
  fs.writeFileSync(getSettingsPath(), JSON.stringify(settings, null, 2), 'utf8');
  return settings.startupConfigured;
}

export function getLastMorningBriefingDate(): string | null {
  return readSettings().lastMorningBriefingDate ?? null;
}

export function saveLastMorningBriefingDate(dateKey: string): string {
  const settings = readSettings();
  settings.lastMorningBriefingDate = dateKey;

  fs.mkdirSync(path.dirname(getSettingsPath()), { recursive: true });
  fs.writeFileSync(getSettingsPath(), JSON.stringify(settings, null, 2), 'utf8');
  return settings.lastMorningBriefingDate;
}
