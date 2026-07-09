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
  onSaveReminderLeadMinutes,
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
  onSaveReminderLeadMinutes: (minutes: number) => Promise<void>;
}) {
  return (
    <>
      <TopBar
        searchPlaceholder="Search settings..."
        rightSlot={
          <div className="flex flex-col items-end">
            <h1 className="font-headline-lg text-headline-lg text-sidebar-charcoal">Settings</h1>
            <p className="text-sm text-on-surface-variant">
              Wire the live calendar flow without losing the new UI shell.
            </p>
          </div>
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
              <div className="font-label-caps text-label-caps uppercase text-sidebar-charcoal/60">Lead Time</div>
              <select
                className="control-field mt-3 bg-white"
                value={runtimeStatus?.reminderLeadMinutes ?? 5}
                onChange={(event) => void onSaveReminderLeadMinutes(Number(event.target.value))}
                disabled={busy}
              >
                {[1, 5, 10, 15, 30, 60].map((minutes) => (
                  <option key={minutes} value={minutes}>
                    {minutes} minute{minutes === 1 ? '' : 's'}
                  </option>
                ))}
              </select>
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

        <section className="col-span-12 rounded-[28px] bg-honey-yellow p-widget-padding shadow-card-yellow">
          <h2 className="font-headline-lg text-headline-lg text-sidebar-charcoal">Remaining Proof Gaps</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-[24px] bg-white/60 p-5">
              <div className="font-body-md font-bold text-sidebar-charcoal">Live Sign-In</div>
              <div className="mt-2 text-sm text-sidebar-charcoal/70">
                Still needs a real Google desktop client and a live OAuth run.
              </div>
            </div>
            <div className="rounded-[24px] bg-white/60 p-5">
              <div className="font-body-md font-bold text-sidebar-charcoal">Real Calendar Data</div>
              <div className="mt-2 text-sm text-sidebar-charcoal/70">
                Still needs a connected account with upcoming events to prove the poller.
              </div>
            </div>
            <div className="rounded-[24px] bg-white/60 p-5">
              <div className="font-body-md font-bold text-sidebar-charcoal">Installed Startup</div>
              <div className="mt-2 text-sm text-sidebar-charcoal/70">
                Still needs a real installer install and a Windows login restart test.
              </div>
            </div>
          </div>
          {error ? (
            <div className="mt-6 rounded-2xl bg-error-container p-4 text-sm text-on-error-container">
              {error}
            </div>
          ) : null}
        </section>
      </div>
    </>
  );
}
