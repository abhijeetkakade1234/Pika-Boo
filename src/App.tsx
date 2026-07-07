import { useEffect, useState } from 'react';
import type { AuthStatus, GoogleOAuthConfig, ReminderPayload, RuntimeStatus } from './shared/contracts';

const defaultReminder: ReminderPayload = {
  title: 'Continue Breaking Ice redesign',
  subtitle: 'Focus block starts now',
};

function OverlayView() {
  const [reminder, setReminder] = useState<ReminderPayload>(defaultReminder);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    return window.pikaBoo.onOverlayShow((payload) => {
      setReminder(payload);
      setVisible(false);

      requestAnimationFrame(() => {
        setVisible(true);
      });
    });
  }, []);

  return (
    <div className="overlay-shell">
      <div className={`overlay-banner ${visible ? 'overlay-banner--visible' : ''}`}>
        <div className="overlay-banner__icon">👀</div>
        <div>
          <div className="overlay-banner__title">{reminder.title}</div>
          <div className="overlay-banner__subtitle">{reminder.subtitle}</div>
        </div>
      </div>
    </div>
  );
}

function ControlPanel() {
  const [config, setConfig] = useState<GoogleOAuthConfig>({ clientId: '', clientSecret: '' });
  const [authStatus, setAuthStatus] = useState<AuthStatus | null>(null);
  const [runtimeStatus, setRuntimeStatus] = useState<RuntimeStatus | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadStatus() {
      const [nextAuth, nextRuntime] = await Promise.all([
        window.pikaBoo.getAuthStatus(),
        window.pikaBoo.getRuntimeStatus(),
      ]);

      setAuthStatus(nextAuth);
      setRuntimeStatus(nextRuntime);
    }

    loadStatus().catch((reason: unknown) => {
      setError(reason instanceof Error ? reason.message : 'Failed to load app status.');
    });

    return window.pikaBoo.onRuntimeUpdated(() => {
      void loadStatus();
    });
  }, []);

  async function saveConfig() {
    setBusy(true);
    setError('');

    try {
      const status = await window.pikaBoo.saveGoogleOAuthConfig(config);
      setAuthStatus(status);
      setRuntimeStatus(await window.pikaBoo.getRuntimeStatus());
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Failed to save config.');
    } finally {
      setBusy(false);
    }
  }

  async function connectGoogle() {
    setBusy(true);
    setError('');

    try {
      const status = await window.pikaBoo.connectGoogle();
      setAuthStatus(status);
      setRuntimeStatus(await window.pikaBoo.getRuntimeStatus());
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Google sign-in failed.');
    } finally {
      setBusy(false);
    }
  }

  async function disconnectGoogle() {
    setBusy(true);
    setError('');

    try {
      const status = await window.pikaBoo.disconnectGoogle();
      setAuthStatus(status);
      setRuntimeStatus(await window.pikaBoo.getRuntimeStatus());
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Disconnect failed.');
    } finally {
      setBusy(false);
    }
  }

  async function toggleStartup() {
    setBusy(true);
    setError('');

    try {
      const status = await window.pikaBoo.setStartupEnabled(!runtimeStatus?.startupEnabled);
      setRuntimeStatus(status);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Failed to update startup setting.');
    } finally {
      setBusy(false);
    }
  }

  async function pollNow() {
    setBusy(true);
    setError('');

    try {
      const status = await window.pikaBoo.pollNow();
      setRuntimeStatus(status);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Manual poll failed.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="app-shell">
      <section className="hero-card">
        <p className="eyebrow">Ambient desktop reminders</p>
        <h1>Pika-Boo</h1>
        <p className="lede">
          Google Calendar reminders later. Right now the scaffold proves the tray flow and moving
          top-banner overlay.
        </p>
        <div className="cta-row">
          <button type="button" onClick={() => void window.pikaBoo.showOverlayDemo()}>
            Play overlay demo
          </button>
        </div>
      </section>

      <section className="status-grid">
        <article className="status-card">
          <h2>Google OAuth</h2>
          <label className="field">
            <span>Client ID</span>
            <input
              type="text"
              value={config.clientId}
              onChange={(event) => setConfig((current) => ({ ...current, clientId: event.target.value }))}
              placeholder="Google desktop app client ID"
            />
          </label>
          <label className="field">
            <span>Client secret (optional)</span>
            <input
              type="text"
              value={config.clientSecret ?? ''}
              onChange={(event) =>
                setConfig((current) => ({ ...current, clientSecret: event.target.value }))
              }
              placeholder="Optional"
            />
          </label>
          <div className="button-row">
            <button type="button" disabled={busy || !config.clientId.trim()} onClick={() => void saveConfig()}>
              Save config
            </button>
            <button
              type="button"
              className="button-secondary"
              disabled={busy || !authStatus?.configured}
              onClick={() => void connectGoogle()}
            >
              Connect Google
            </button>
            <button
              type="button"
              className="button-secondary"
              disabled={busy || !authStatus?.connected}
              onClick={() => void disconnectGoogle()}
            >
              Disconnect
            </button>
          </div>
          <ul>
            <li>Configured: {authStatus?.configured ? 'yes' : 'no'}</li>
            <li>Connected: {authStatus?.connected ? 'yes' : 'no'}</li>
            <li>Refresh token saved: {authStatus?.hasRefreshToken ? 'yes' : 'no'}</li>
          </ul>
          {error ? <p className="error-text">{error}</p> : null}
        </article>
        <article className="status-card">
          <h2>Scaffold status</h2>
          <ul>
            <li>Electron main process wired</li>
            <li>Tray menu wired</li>
            <li>Transparent overlay window wired</li>
          </ul>
        </article>
        <article className="status-card">
          <h2>Runtime</h2>
          <div className="button-row">
            <button
              type="button"
              className="button-secondary"
              disabled={busy}
              onClick={() => void pollNow()}
            >
              Poll calendar now
            </button>
            <button
              type="button"
              className="button-secondary"
              disabled={busy}
              onClick={() => void toggleStartup()}
            >
              {runtimeStatus?.startupEnabled ? 'Disable startup' : 'Enable startup'}
            </button>
          </div>
          <ul>
            <li>Startup enabled: {runtimeStatus?.startupEnabled ? 'yes' : 'no'}</li>
            <li>Poller running: {runtimeStatus?.pollerRunning ? 'yes' : 'no'}</li>
            <li>Upcoming events loaded: {runtimeStatus?.upcomingCount ?? 0}</li>
            <li>
              Last poll:{' '}
              {runtimeStatus?.lastPollAt ? new Date(runtimeStatus.lastPollAt).toLocaleTimeString() : 'never'}
            </li>
            <li>Last poll error: {runtimeStatus?.lastPollError ?? 'none'}</li>
          </ul>
        </article>
      </section>
    </main>
  );
}

export default function App() {
  return window.location.hash === '#overlay' ? <OverlayView /> : <ControlPanel />;
}
