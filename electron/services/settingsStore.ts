import { app } from 'electron';
import fs from 'node:fs';
import path from 'node:path';
import type { ArtifactId, GoogleOAuthConfig } from '../../src/shared/contracts';

interface AppSettings {
  googleOAuth?: GoogleOAuthConfig;
  artifactId?: ArtifactId;
}

const DEFAULT_ARTIFACT_ID: ArtifactId = 'ghost';

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
