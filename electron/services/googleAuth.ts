import { safeStorage, shell, app } from 'electron';
import crypto from 'node:crypto';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import type { AddressInfo } from 'node:net';
import { URL } from 'node:url';
import type {
  AuthStatus,
  CalendarEventSummary,
  CalendarListEntry,
  GoogleOAuthConfig,
} from '../../src/shared/contracts';

const GOOGLE_SCOPES = [
  'https://www.googleapis.com/auth/calendar.readonly',
  'https://www.googleapis.com/auth/tasks.readonly',
].join(' ');
const AUTH_ENDPOINT = 'https://accounts.google.com/o/oauth2/v2/auth';
const TOKEN_ENDPOINT = 'https://oauth2.googleapis.com/token';

interface StoredTokens {
  accessToken: string;
  refreshToken?: string;
  expiresAt: number | null;
  tokenType?: string;
  scope?: string;
}

interface TokenResponse {
  access_token: string;
  expires_in?: number;
  refresh_token?: string;
  scope?: string;
  token_type?: string;
}

interface GoogleCalendarEvent {
  id: string;
  status?: string;
  summary?: string;
  eventType?: 'birthday' | 'default' | 'focusTime' | 'fromGmail' | 'outOfOffice' | 'workingLocation';
  htmlLink?: string;
  start?: {
    dateTime?: string;
    date?: string;
  };
  hangoutLink?: string;
  conferenceData?: {
    entryPoints?: Array<{
      uri?: string;
    }>;
  };
}

interface EventsListResponse {
  items?: GoogleCalendarEvent[];
}

interface GoogleCalendarListItem {
  id: string;
  summary?: string;
  summaryOverride?: string;
  primary?: boolean;
  backgroundColor?: string;
}

interface CalendarListResponse {
  items?: GoogleCalendarListItem[];
}

interface GoogleTaskList {
  id: string;
  title?: string;
}

interface TaskListsResponse {
  items?: GoogleTaskList[];
}

interface GoogleTask {
  id: string;
  title?: string;
  due?: string;
  status?: 'completed' | 'needsAction';
  deleted?: boolean;
  hidden?: boolean;
  webViewLink?: string;
  assignmentInfo?: {
    linkToTask?: string;
  };
}

interface TasksListResponse {
  items?: GoogleTask[];
}

function toLocalAnchorIso(dateText: string, hour: number): string {
  const [year, month, day] = dateText.split('-').map(Number);
  const anchored = new Date(year, (month ?? 1) - 1, day ?? 1, hour, 0, 0, 0);
  return anchored.toISOString();
}

function getTokenPath(): string {
  return path.join(app.getPath('userData'), 'google-tokens.json');
}

function createCodeVerifier(): string {
  return crypto.randomBytes(64).toString('base64url');
}

function createCodeChallenge(verifier: string): string {
  return crypto.createHash('sha256').update(verifier).digest('base64url');
}

function readTokens(): StoredTokens | null {
  const tokenPath = getTokenPath();

  if (!fs.existsSync(tokenPath)) {
    return null;
  }

  const raw = fs.readFileSync(tokenPath, 'utf8');

  if (raw.startsWith('{')) {
    return JSON.parse(raw) as StoredTokens;
  }

  if (!safeStorage.isEncryptionAvailable()) {
    throw new Error('Stored Google token is encrypted, but secure storage is unavailable.');
  }

  const decrypted = safeStorage.decryptString(Buffer.from(raw, 'base64'));
  return JSON.parse(decrypted) as StoredTokens;
}

function writeTokens(tokens: StoredTokens): void {
  fs.mkdirSync(path.dirname(getTokenPath()), { recursive: true });
  const payload = JSON.stringify(tokens);

  if (safeStorage.isEncryptionAvailable()) {
    const encrypted = safeStorage.encryptString(payload).toString('base64');
    fs.writeFileSync(getTokenPath(), encrypted, 'utf8');
    return;
  }

  fs.writeFileSync(getTokenPath(), JSON.stringify(tokens, null, 2), 'utf8');
}

async function refreshAccessToken(config: GoogleOAuthConfig, refreshToken: string): Promise<StoredTokens> {
  const body = new URLSearchParams({
    client_id: config.clientId,
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
  });

  if (config.clientSecret) {
    body.set('client_secret', config.clientSecret);
  }

  const response = await fetch(TOKEN_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });

  if (!response.ok) {
    throw new Error(`Token refresh failed with ${response.status}.`);
  }

  const tokenResponse = (await response.json()) as TokenResponse;

  const nextTokens: StoredTokens = {
    accessToken: tokenResponse.access_token,
    refreshToken,
    expiresAt: tokenResponse.expires_in ? Date.now() + tokenResponse.expires_in * 1000 : null,
    scope: tokenResponse.scope,
    tokenType: tokenResponse.token_type,
  };

  writeTokens(nextTokens);
  return nextTokens;
}

async function fetchGoogleJson<T>(config: GoogleOAuthConfig, url: URL): Promise<T> {
  const accessToken = await getValidAccessToken(config);
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Google API request failed with ${response.status}.`);
  }

  return (await response.json()) as T;
}

function isScopeOrApiAvailabilityError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }

  return /Google API request failed with 40(1|3)|insufficient|scope|tasks/i.test(error.message);
}

function getEventLabel(eventType: GoogleCalendarEvent['eventType']): string | undefined {
  switch (eventType) {
    case 'birthday':
      return 'Birthday';
    case 'focusTime':
      return 'Focus';
    case 'fromGmail':
      return 'From Gmail';
    case 'outOfOffice':
      return 'Out of Office';
    case 'workingLocation':
      return 'Working Location';
    default:
      return undefined;
  }
}

async function startAuthorizationServer(): Promise<{
  redirectUri: string;
  codePromise: Promise<string>;
}> {
  return new Promise((resolve, reject) => {
    const server = http.createServer((request, response) => {
      const requestUrl = request.url ? new URL(request.url, `http://${request.headers.host}`) : null;
      const code = requestUrl?.searchParams.get('code');
      const error = requestUrl?.searchParams.get('error');

      response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      response.end('<html><body><h2>Pika-Boo connected.</h2><p>You can close this tab.</p></body></html>');

      setImmediate(() => {
        server.close();
      });

      if (error) {
        pendingReject(new Error(`Google OAuth failed: ${error}`));
        return;
      }

      if (!code) {
        pendingReject(new Error('Google OAuth did not return an authorization code.'));
        return;
      }

      pendingResolve(code);
    });

    let pendingResolve: (code: string) => void = () => undefined;
    let pendingReject: (error: Error) => void = () => undefined;
    const codePromise = new Promise<string>((innerResolve, innerReject) => {
      pendingResolve = innerResolve;
      pendingReject = innerReject;
    });

    server.on('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const address = server.address() as AddressInfo;
      resolve({
        redirectUri: `http://127.0.0.1:${address.port}/oauth/callback`,
        codePromise,
      });
    });
  });
}

async function exchangeCodeForTokens(
  config: GoogleOAuthConfig,
  code: string,
  codeVerifier: string,
  redirectUri: string,
): Promise<StoredTokens> {
  const body = new URLSearchParams({
    client_id: config.clientId,
    code,
    code_verifier: codeVerifier,
    grant_type: 'authorization_code',
    redirect_uri: redirectUri,
  });

  if (config.clientSecret) {
    body.set('client_secret', config.clientSecret);
  }

  const response = await fetch(TOKEN_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });

  if (!response.ok) {
    throw new Error(`Token exchange failed with ${response.status}.`);
  }

  const tokenResponse = (await response.json()) as TokenResponse;

  return {
    accessToken: tokenResponse.access_token,
    refreshToken: tokenResponse.refresh_token,
    expiresAt: tokenResponse.expires_in ? Date.now() + tokenResponse.expires_in * 1000 : null,
    scope: tokenResponse.scope,
    tokenType: tokenResponse.token_type,
  };
}

export function getAuthStatus(config: GoogleOAuthConfig | null): AuthStatus {
  const tokens = readTokens();

  return {
    configured: Boolean(config?.clientId),
    connected: Boolean(tokens?.accessToken || tokens?.refreshToken),
    hasRefreshToken: Boolean(tokens?.refreshToken),
    expiresAt: tokens?.expiresAt ?? null,
    secureStorageAvailable: safeStorage.isEncryptionAvailable(),
  };
}

export async function beginGoogleOAuth(config: GoogleOAuthConfig): Promise<AuthStatus> {
  const codeVerifier = createCodeVerifier();
  const codeChallenge = createCodeChallenge(codeVerifier);
  const authorization = await startAuthorizationServer();

  const authUrl = new URL(AUTH_ENDPOINT);
  authUrl.searchParams.set('client_id', config.clientId);
  authUrl.searchParams.set('redirect_uri', authorization.redirectUri);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('scope', GOOGLE_SCOPES);
  authUrl.searchParams.set('access_type', 'offline');
  authUrl.searchParams.set('prompt', 'consent');
  authUrl.searchParams.set('code_challenge', codeChallenge);
  authUrl.searchParams.set('code_challenge_method', 'S256');

  await shell.openExternal(authUrl.toString());

  const code = await authorization.codePromise;
  const tokens = await exchangeCodeForTokens(config, code, codeVerifier, authorization.redirectUri);
  writeTokens(tokens);

  return getAuthStatus(config);
}

export function clearGoogleTokens(): AuthStatus {
  const tokenPath = getTokenPath();

  if (fs.existsSync(tokenPath)) {
    fs.unlinkSync(tokenPath);
  }

  return getAuthStatus(null);
}

export async function getValidAccessToken(config: GoogleOAuthConfig): Promise<string> {
  const tokens = readTokens();

  if (!tokens) {
    throw new Error('Google account is not connected.');
  }

  const hasUsableAccessToken = Boolean(tokens.accessToken) && Boolean(tokens.expiresAt && tokens.expiresAt > Date.now() + 30_000);
  if (hasUsableAccessToken) {
    return tokens.accessToken;
  }

  if (!tokens.refreshToken) {
    throw new Error('Google token expired and no refresh token is available.');
  }

  const refreshed = await refreshAccessToken(config, tokens.refreshToken);
  return refreshed.accessToken;
}

export async function listCalendars(
  config: GoogleOAuthConfig,
  selectedCalendarIds: string[],
): Promise<CalendarListEntry[]> {
  const url = new URL('https://www.googleapis.com/calendar/v3/users/me/calendarList');
  url.searchParams.set('minAccessRole', 'reader');
  url.searchParams.set('showHidden', 'false');

  const payload = await fetchGoogleJson<CalendarListResponse>(config, url);
  const selectedIds = new Set(selectedCalendarIds);

  return (payload.items ?? [])
    .filter((calendar) => Boolean(calendar.id))
    .map((calendar) => ({
      id: calendar.id,
      summary: calendar.summaryOverride?.trim() || calendar.summary?.trim() || 'Untitled calendar',
      primary: Boolean(calendar.primary),
      selected: selectedIds.size > 0 ? selectedIds.has(calendar.id) : Boolean(calendar.primary),
      backgroundColor: calendar.backgroundColor,
    }))
    .sort((left, right) => Number(right.primary) - Number(left.primary) || left.summary.localeCompare(right.summary));
}

export async function listUpcomingEvents(
  config: GoogleOAuthConfig,
  calendars: CalendarListEntry[],
  timeMin: Date,
  timeMax: Date,
): Promise<CalendarEventSummary[]> {
  const activeCalendars = calendars.filter((calendar) => calendar.selected);
  const payloads = await Promise.all(
    activeCalendars.map(async (calendar) => {
      const url = new URL(
        `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendar.id)}/events`,
      );
      url.searchParams.set('singleEvents', 'true');
      url.searchParams.set('orderBy', 'startTime');
      url.searchParams.set('timeMin', timeMin.toISOString());
      url.searchParams.set('timeMax', timeMax.toISOString());
      url.searchParams.set('maxResults', '100');

      return {
        calendar,
        payload: await fetchGoogleJson<EventsListResponse>(config, url),
      };
    }),
  );

  const calendarEvents = payloads
    .flatMap(({ calendar, payload }) =>
      (payload.items ?? []).map((event): CalendarEventSummary | null => {
        const startAt = event.start?.dateTime ?? (event.start?.date ? toLocalAnchorIso(event.start.date, 9) : undefined);
        if (!event.id || !startAt || event.status === 'cancelled') {
          return null;
        }

        const meetingUrl = event.hangoutLink ?? event.conferenceData?.entryPoints?.find((entry) => entry.uri)?.uri;

        return {
          id: event.id,
          calendarId: calendar.id,
          calendarSummary: calendar.summary,
          summary: event.summary?.trim() || 'Untitled event',
          startAt,
          meetingUrl,
          sourceUrl: event.htmlLink,
          kind: 'event',
          label: getEventLabel(event.eventType),
        };
      }),
    )
    .filter((event): event is CalendarEventSummary => event !== null);

  let taskEvents: CalendarEventSummary[] = [];

  try {
    const taskListsUrl = new URL('https://tasks.googleapis.com/tasks/v1/users/@me/lists');
    taskListsUrl.searchParams.set('maxResults', '100');
    const taskLists = await fetchGoogleJson<TaskListsResponse>(config, taskListsUrl);

    const taskPayloads = await Promise.all(
      (taskLists.items ?? []).map(async (taskList) => {
        if (!taskList.id) {
          return null;
        }

        const tasksUrl = new URL(`https://tasks.googleapis.com/tasks/v1/lists/${encodeURIComponent(taskList.id)}/tasks`);
        tasksUrl.searchParams.set('showCompleted', 'false');
        tasksUrl.searchParams.set('showDeleted', 'false');
        tasksUrl.searchParams.set('showHidden', 'false');
        tasksUrl.searchParams.set('showAssigned', 'true');
        tasksUrl.searchParams.set('maxResults', '100');

        return {
          taskList,
          payload: await fetchGoogleJson<TasksListResponse>(config, tasksUrl),
        };
      }),
    );

    taskEvents = taskPayloads
      .filter((entry): entry is NonNullable<typeof entry> => entry !== null)
      .flatMap(({ taskList, payload }) =>
        (payload.items ?? []).map((task): CalendarEventSummary | null => {
          if (!task.id || !task.due || task.status === 'completed' || task.deleted || task.hidden) {
            return null;
          }

          return {
            id: task.id,
            calendarId: `tasks:${taskList.id}`,
            calendarSummary: taskList.title?.trim() ? `Tasks | ${taskList.title.trim()}` : 'Tasks',
            summary: task.title?.trim() || 'Untitled task',
            startAt: toLocalAnchorIso(task.due.slice(0, 10), 9),
            sourceUrl: task.assignmentInfo?.linkToTask ?? task.webViewLink,
            kind: 'task',
            label: 'Task',
          };
        }),
      )
      .filter((task): task is CalendarEventSummary => task !== null);
  } catch (error) {
    if (!isScopeOrApiAvailabilityError(error)) {
      throw error;
    }
  }

  return [...calendarEvents, ...taskEvents].sort(
    (left, right) => new Date(left.startAt).getTime() - new Date(right.startAt).getTime(),
  );
}
