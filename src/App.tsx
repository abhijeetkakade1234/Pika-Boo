import { useEffect, useState } from 'react';
import { ArtifactOverlay, artifactRegistry } from './artifacts';
import type {
  ArtifactId,
  AuthStatus,
  GoogleOAuthConfig,
  ReminderPayload,
  RuntimeStatus,
} from './shared/contracts';

const defaultReminder: ReminderPayload = {
  reminderId: 'demo-reminder',
  title: 'Continue Breaking Ice redesign',
  subtitle: 'Focus block starts now',
  artifactId: 'ghost',
  meetingUrl: 'https://meet.google.com/example-link',
};

const reminderLeadOptions = [1, 5, 10, 15, 30, 60];

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

  return <ArtifactOverlay reminder={reminder} visible={visible} />;
}

function ControlPanel() {
  const [config, setConfig] = useState<GoogleOAuthConfig>({ clientId: '', clientSecret: '' });
  const [authStatus, setAuthStatus] = useState<AuthStatus | null>(null);
  const [runtimeStatus, setRuntimeStatus] = useState<RuntimeStatus | null>(null);
  const [artifactId, setArtifactId] = useState<ArtifactId>('ghost');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadStatus() {
      const [nextAuth, nextRuntime, nextConfig, nextArtifactId] = await Promise.all([
        window.pikaBoo.getAuthStatus(),
        window.pikaBoo.getRuntimeStatus(),
        window.pikaBoo.getGoogleOAuthConfig(),
        window.pikaBoo.getSelectedArtifact(),
      ]);

      setAuthStatus(nextAuth);
      setRuntimeStatus(nextRuntime);
      setConfig(nextConfig);
      setArtifactId(nextArtifactId);
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

  async function importGoogleConfig() {
    setBusy(true);
    setError('');

    try {
      const result = await window.pikaBoo.importGoogleOAuthConfig();
      if (result.cancelled || !result.config) {
        return;
      }

      setConfig(result.config);
      setAuthStatus(await window.pikaBoo.getAuthStatus());
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Failed to import Google OAuth config.');
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

  async function togglePaused() {
    setBusy(true);
    setError('');

    try {
      const status = await window.pikaBoo.setPaused(!runtimeStatus?.paused);
      setRuntimeStatus(status);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Failed to update pause mode.');
    } finally {
      setBusy(false);
    }
  }

  async function saveArtifact(nextArtifactId: ArtifactId) {
    setBusy(true);
    setError('');

    try {
      setArtifactId(nextArtifactId);
      const status = await window.pikaBoo.setSelectedArtifact(nextArtifactId);
      setRuntimeStatus(status);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Failed to save artifact.');
    } finally {
      setBusy(false);
    }
  }

  async function saveReminderLeadMinutes(reminderLeadMinutes: number) {
    setBusy(true);
    setError('');

    try {
      const status = await window.pikaBoo.setReminderLeadMinutes(reminderLeadMinutes);
      setRuntimeStatus(status);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Failed to save reminder lead time.');
    } finally {
      setBusy(false);
    }
  }

  function renderUpcomingEvents() {
    if (!runtimeStatus?.upcomingEvents.length) {
      return <p className="empty-text">No upcoming events loaded yet.</p>;
    }

    return (
      <div className="events-list">
        {runtimeStatus.upcomingEvents.map((event) => (
          <article key={`${event.id}:${event.startAt}`} className="event-card">
            <div>
              <div className="event-card__title">{event.summary}</div>
              <div className="event-card__meta">{new Date(event.startAt).toLocaleString()}</div>
            </div>
            {event.meetingUrl ? (
              <button
                type="button"
                className="button-secondary"
                onClick={() => void window.pikaBoo.openExternal(event.meetingUrl)}
              >
                Open link
              </button>
            ) : null}
          </article>
        ))}
      </div>
    );
  }

  function renderBlockers() {
    const blockers = [
      authStatus?.configured ? null : 'Google desktop OAuth client still needs to be configured.',
      authStatus?.connected ? null : 'Live Google sign-in still needs to be completed and verified.',
      runtimeStatus?.upcomingCount ? null : 'Live calendar fetch still needs verification against a real connected account.',
      'Installed-run Windows startup still needs verification after a real installer install.',
    ].filter(Boolean) as string[];

    if (blockers.length === 0) {
      return <p className="empty-text">No local blocker is visible here. Final proof still depends on real Google and installed-run checks.</p>;
    }

    return (
      <ul>
        {blockers.map((blocker) => (
          <li key={blocker}>{blocker}</li>
        ))}
      </ul>
    );
  }

  return (
    <main className="app-shell">
      <section className="hero-card">
        <p className="eyebrow">Ambient desktop reminders</p>
        <h1>Pika-Boo</h1>
        <p className="lede">
          Artifacts now carry the reminder across the screen. Pick one, then trigger the demo or a
          real calendar poll.
        </p>
        <div className="cta-row">
          <button type="button" onClick={() => void window.pikaBoo.showOverlayDemo()}>
            Play overlay demo
          </button>
        </div>
      </section>

      <section className="status-grid">
        <article className="status-card">
          <h2>Artifact</h2>
          <label className="field">
            <span>Active artifact</span>
            <select
              value={artifactId}
              onChange={(event) => void saveArtifact(event.target.value as ArtifactId)}
              disabled={busy}
              className="field-select"
            >
              {artifactRegistry.map((artifact) => (
                <option key={artifact.id} value={artifact.id}>
                  {artifact.label}
                </option>
              ))}
            </select>
          </label>
          <div className="artifact-picker" role="list" aria-label="Artifact previews">
            {artifactRegistry.map((artifact) => {
              const selected = artifact.id === artifactId;

              return (
                <button
                  key={artifact.id}
                  type="button"
                  className={`artifact-picker__card ${selected ? 'artifact-picker__card--selected' : ''}`}
                  onClick={() => void saveArtifact(artifact.id)}
                  disabled={busy}
                >
                  <div className="artifact-picker__label">{artifact.label}</div>
                  <div className="artifact-picker__preview">
                    <span>{artifact.lead}</span>
                    <span>{artifact.trail}</span>
                  </div>
                </button>
              );
            })}
          </div>
          <ul>
            <li>Selected artifact: {artifactRegistry.find((artifact) => artifact.id === artifactId)?.label}</li>
            <li>Artifacts carry the reminder body instead of a plain banner</li>
          </ul>
        </article>

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
              disabled={busy}
              onClick={() => void importGoogleConfig()}
            >
              Import Google JSON
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
            <li>Secure token storage: {authStatus?.secureStorageAvailable ? 'yes' : 'fallback'}</li>
          </ul>
          {error ? <p className="error-text">{error}</p> : null}
        </article>

        <article className="status-card">
          <h2>Runtime</h2>
          <label className="field">
            <span>Reminder lead time</span>
            <select
              value={runtimeStatus?.reminderLeadMinutes ?? 5}
              onChange={(event) => void saveReminderLeadMinutes(Number(event.target.value))}
              disabled={busy}
              className="field-select"
            >
              {reminderLeadOptions.map((minutes) => (
                <option key={minutes} value={minutes}>
                  {minutes} minute{minutes === 1 ? '' : 's'}
                </option>
              ))}
            </select>
          </label>
          <div className="button-row">
            <button
              type="button"
              className="button-secondary"
              disabled={busy || runtimeStatus?.paused}
              onClick={() => void pollNow()}
            >
              Poll calendar now
            </button>
            <button
              type="button"
              className="button-secondary"
              disabled={busy}
              onClick={() => void togglePaused()}
            >
              {runtimeStatus?.paused ? 'Resume reminders' : 'Pause reminders'}
            </button>
            <button
              type="button"
              className="button-secondary"
              disabled={busy || !runtimeStatus?.startupSupported}
              onClick={() => void toggleStartup()}
            >
              {runtimeStatus?.startupEnabled ? 'Disable startup' : 'Enable startup'}
            </button>
          </div>
          <ul>
            <li>Startup supported here: {runtimeStatus?.startupSupported ? 'yes' : 'packaged build only'}</li>
            <li>Startup enabled: {runtimeStatus?.startupEnabled ? 'yes' : 'no'}</li>
            <li>Poller running: {runtimeStatus?.pollerRunning ? 'yes' : 'no'}</li>
            <li>Paused: {runtimeStatus?.paused ? 'yes' : 'no'}</li>
            <li>
              Reminder lead time: {runtimeStatus?.reminderLeadMinutes ?? 5} minute
              {(runtimeStatus?.reminderLeadMinutes ?? 5) === 1 ? '' : 's'}
            </li>
            <li>Upcoming events loaded: {runtimeStatus?.upcomingCount ?? 0}</li>
            <li>Active artifact: {runtimeStatus?.artifactId ?? artifactId}</li>
            <li>
              Last poll:{' '}
              {runtimeStatus?.lastPollAt ? new Date(runtimeStatus.lastPollAt).toLocaleTimeString() : 'never'}
            </li>
            <li>Last poll error: {runtimeStatus?.lastPollError ?? 'none'}</li>
          </ul>
        </article>

        <article className="status-card status-card--wide">
          <h2>Upcoming events</h2>
          {renderUpcomingEvents()}
        </article>

        <article className="status-card status-card--wide">
          <h2>Remaining proof gaps</h2>
          {renderBlockers()}
        </article>
      </section>
    </main>
  );
}

export default function App() {
  return window.location.hash === '#overlay' ? <OverlayView /> : <ControlPanel />;
}
