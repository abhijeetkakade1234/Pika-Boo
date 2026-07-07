import { app } from 'electron';
import fs from 'node:fs';
import path from 'node:path';
import type { ArtifactId, GoogleOAuthConfig } from '../../src/shared/contracts';

interface AppSettings {
  googleOAuth?: GoogleOAuthConfig;
  artifactId?: ArtifactId;
  reminderLeadMinutes?: number;
}

const DEFAULT_ARTIFACT_ID: ArtifactId = 'ghost';
const DEFAULT_REMINDER_LEAD_MINUTES = 5;
const MIN_REMINDER_LEAD_MINUTES = 1;
const MAX_REMINDER_LEAD_MINUTES = 60;

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
