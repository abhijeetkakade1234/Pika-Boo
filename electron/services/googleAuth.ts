import { shell } from 'electron';
import crypto from 'node:crypto';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import type { AddressInfo } from 'node:net';
import { URL } from 'node:url';
import { app } from 'electron';
import type { AuthStatus, GoogleOAuthConfig } from '../../src/shared/contracts';

const GOOGLE_SCOPE = 'https://www.googleapis.com/auth/calendar.readonly';
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

  return JSON.parse(fs.readFileSync(tokenPath, 'utf8')) as StoredTokens;
}

function writeTokens(tokens: StoredTokens): void {
  fs.mkdirSync(path.dirname(getTokenPath()), { recursive: true });
  fs.writeFileSync(getTokenPath(), JSON.stringify(tokens, null, 2), 'utf8');
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
  authUrl.searchParams.set('scope', GOOGLE_SCOPE);
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
