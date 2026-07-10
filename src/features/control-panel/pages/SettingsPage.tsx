import type { Dispatch, SetStateAction } from 'react';
import { artifactCatalog } from '../../../shared/data/artifacts';
import type { AuthStatus, GoogleOAuthConfig, RuntimeStatus } from '../../../shared/contracts';
import { TopBar } from '../../../shared/ui/TopBar';

export function SettingsPage({
  config,
  authStatus,
  runtimeStatus,
  busy,
  error,
  setConfig,
  onSaveConfig,
  onImportGoogleConfig,
  onConnectGoogle,
  onDisconnectGoogle,
  onToggleStartup,
  onTogglePaused,
  onPollNow,
  onSaveSelectedCalendars,
}: {
  config: GoogleOAuthConfig;
  authStatus: AuthStatus | null;
  runtimeStatus: RuntimeStatus | null;
  busy: boolean;
  error: string;
  setConfig: Dispatch<SetStateAction<GoogleOAuthConfig>>;
  onSaveConfig: () => Promise<void>;
  onImportGoogleConfig: () => Promise<void>;
  onConnectGoogle: () => Promise<void>;
  onDisconnectGoogle: () => Promise<void>;
  onToggleStartup: () => Promise<void>;
  onTogglePaused: () => Promise<void>;
  onPollNow: () => Promise<void>;
  onSaveSelectedCalendars: (calendarIds: string[]) => Promise<void>;
}) {
  return (
    <>
      <TopBar
        rightSlot={
          <h1 className="font-headline-lg text-headline-lg text-sidebar-charcoal">Settings</h1>
        }
      />

      <div className="grid grid-cols-12 gap-bento-gutter">
        <section className="bento-card col-span-12 rounded-[28px] bg-white p-widget-padding shadow-card-soft lg:col-span-6">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="font-headline-lg text-headline-lg text-sidebar-charcoal">Google OAuth</h2>
            <span className="font-label-caps text-label-caps uppercase text-on-surface-variant">
              {authStatus?.connected ? 'Connected' : 'Setup'}
            </span>
          </div>

          <div className="space-y-4">
            <label className="block">
              <span className="mb-2 block font-label-caps text-label-caps uppercase text-on-surface-variant">
                Client ID
              </span>
              <input
                className="control-field"
                type="text"
                value={config.clientId}
                onChange={(event) => setConfig((current) => ({ ...current, clientId: event.target.value }))}
                placeholder="Google desktop app client ID"
              />
            </label>

            <label className="block">
              <span className="mb-2 block font-label-caps text-label-caps uppercase text-on-surface-variant">
                Client Secret
              </span>
              <input
                className="control-field"
                type="text"
                value={config.clientSecret ?? ''}
                onChange={(event) => setConfig((current) => ({ ...current, clientSecret: event.target.value }))}
                placeholder="Optional"
              />
            </label>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              disabled={busy || !config.clientId.trim()}
              onClick={() => void onSaveConfig()}
              className="action-pill bg-primary text-white hover:bg-primary/90"
            >
              Save Config
            </button>
            <button type="button" disabled={busy} onClick={() => void onImportGoogleConfig()} className="action-pill">
              Import JSON
            </button>
            <button
              type="button"
              disabled={busy || !authStatus?.configured}
              onClick={() => void onConnectGoogle()}
              className="action-pill"
            >
              Connect
            </button>
            <button
              type="button"
              disabled={busy || !authStatus?.connected}
              onClick={() => void onDisconnectGoogle()}
              className="action-pill"
            >
              Disconnect
            </button>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-4">
            <div className="rounded-[24px] bg-surface-container p-5">
              <div className="font-label-caps text-label-caps uppercase text-on-surface-variant">Configured</div>
              <div className="mt-2 text-2xl font-semibold text-sidebar-charcoal">
                {authStatus?.configured ? 'Yes' : 'No'}
              </div>
            </div>
            <div className="rounded-[24px] bg-surface-container p-5">
              <div className="font-label-caps text-label-caps uppercase text-on-surface-variant">
                Refresh Token
              </div>
              <div className="mt-2 text-2xl font-semibold text-sidebar-charcoal">
                {authStatus?.hasRefreshToken ? 'Saved' : 'Missing'}
              </div>
            </div>
          </div>

          <div className="mt-8 rounded-[24px] bg-surface-container p-5">
            <div className="mb-3 flex items-center justify-between">
              <div className="font-label-caps text-label-caps uppercase text-on-surface-variant">Calendars</div>
              <div className="text-xs text-on-surface-variant">
                {runtimeStatus?.availableCalendars.filter((calendar) => calendar.selected).length ?? 0} selected
              </div>
            </div>
            <div className="grid gap-3">
              {runtimeStatus?.availableCalendars.length ? (
                runtimeStatus.availableCalendars.map((calendar) => (
                  <label
                    key={calendar.id}
                    className="flex items-center justify-between gap-3 rounded-2xl bg-white/70 px-4 py-3 text-sm text-sidebar-charcoal"
                  >
                    <span className="flex min-w-0 flex-1 items-center gap-3">
                      <span
                        className="h-3 w-3 shrink-0 rounded-full border border-sidebar-charcoal/10"
                        style={{ backgroundColor: calendar.backgroundColor ?? '#d1d5db' }}
                      />
                      <span className="break-words">
                        {calendar.summary}
                        {calendar.primary ? ' | Primary' : ''}
                      </span>
                    </span>
                    <input
                      type="checkbox"
                      className="shrink-0"
                      checked={calendar.selected}
                      onChange={(event) => {
                        const currentIds =
                          runtimeStatus?.availableCalendars
                            .filter((entry) => entry.selected)
                            .map((entry) => entry.id) ?? [];
                        const nextIds = event.target.checked
                          ? [...currentIds, calendar.id]
                          : currentIds.filter((calendarId) => calendarId !== calendar.id);
                        if (nextIds.length === 0) {
                          return;
                        }
                        void onSaveSelectedCalendars(nextIds);
                      }}
                    />
                  </label>
                ))
              ) : (
                <div className="rounded-2xl bg-white/70 px-4 py-3 text-sm text-sidebar-charcoal/70">
                  Connect Google, then poll once to load calendar choices.
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="bento-card col-span-12 rounded-[28px] bg-lavender p-widget-padding shadow-card-purple lg:col-span-6">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="font-headline-lg text-headline-lg text-sidebar-charcoal">Runtime</h2>
            <span className="font-label-caps text-label-caps uppercase text-on-surface-variant">
              {runtimeStatus?.paused ? 'Paused' : 'Live'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              disabled={busy || runtimeStatus?.paused}
              onClick={() => void onPollNow()}
              className="rounded-[24px] bg-white/60 p-5 text-left transition hover:bg-white"
            >
              <div className="font-body-md font-bold text-sidebar-charcoal">Poll Calendar</div>
              <div className="mt-1 text-xs text-sidebar-charcoal/60">Manual sync now</div>
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => void onTogglePaused()}
              className="rounded-[24px] bg-white/60 p-5 text-left transition hover:bg-white"
            >
              <div className="font-body-md font-bold text-sidebar-charcoal">
                {runtimeStatus?.paused ? 'Resume Reminders' : 'Pause Reminders'}
              </div>
              <div className="mt-1 text-xs text-sidebar-charcoal/60">Background reminder engine</div>
            </button>
            <button
              type="button"
              disabled={busy || !runtimeStatus?.startupSupported}
              onClick={() => void onToggleStartup()}
              className="rounded-[24px] bg-white/60 p-5 text-left transition hover:bg-white"
            >
              <div className="font-body-md font-bold text-sidebar-charcoal">
                {runtimeStatus?.startupEnabled ? 'Disable Startup' : 'Enable Startup'}
              </div>
              <div className="mt-1 text-xs text-sidebar-charcoal/60">Packaged app only</div>
            </button>
            <div className="rounded-[24px] bg-white/60 p-5">
              <div className="font-label-caps text-label-caps uppercase text-sidebar-charcoal/60">Reminder Cadence</div>
              <div className="mt-3 text-lg font-semibold text-sidebar-charcoal">
                {(runtimeStatus?.reminderLeadTimes ?? [30, 5, 1]).join('m • ')}m
              </div>
              <div className="mt-2 text-xs text-sidebar-charcoal/60">Morning briefing at 8:00 AM, then 30m, 5m, and 1m before each moment.</div>
            </div>
          </div>

          <div className="mt-8 rounded-[24px] bg-white/50 p-5">
            <div className="mb-3 font-label-caps text-label-caps uppercase text-sidebar-charcoal/60">
              Selected Artifact
            </div>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {artifactCatalog.map((artifact) => (
                <div
                  key={artifact.id}
                  className={`rounded-2xl p-3 text-center text-xs ${artifact.id === runtimeStatus?.artifactId ? 'bg-primary text-white' : 'bg-white/60 text-sidebar-charcoal'}`}
                >
                  {artifact.label}
                </div>
              ))}
            </div>
          </div>
        </section>

        {error ? (
          <section className="col-span-12 rounded-[28px] bg-error-container p-widget-padding shadow-card-soft">
            <h2 className="font-headline-lg text-headline-lg text-on-error-container">Error</h2>
            <div className="mt-4 rounded-2xl bg-white/40 p-4 text-sm text-on-error-container">{error}</div>
          </section>
        ) : null}
      </div>
    </>
  );
}
