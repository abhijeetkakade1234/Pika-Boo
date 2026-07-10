import type { Dispatch, SetStateAction } from 'react';
import type { AuthStatus, GoogleOAuthConfig, RuntimeStatus } from '../../../shared/contracts';
import { TopBar } from '../../../shared/ui/TopBar';

function ActionCard({
  title,
  description,
  onClick,
  disabled,
}: {
  title: string;
  description: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="rounded-[24px] bg-white/60 p-5 text-left transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
    >
      <div className="font-body-md font-bold text-sidebar-charcoal">{title}</div>
      <div className="mt-1 text-xs text-sidebar-charcoal/60">{description}</div>
    </button>
  );
}

function ToggleRow({
  title,
  description,
  enabled,
  onToggle,
  disabled,
  busyLabel,
}: {
  title: string;
  description: string;
  enabled: boolean;
  onToggle: () => void;
  disabled?: boolean;
  busyLabel?: string;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onToggle}
      className="flex w-full items-center justify-between gap-4 rounded-[24px] bg-white/60 px-5 py-4 text-left transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
    >
      <div className="min-w-0 flex-1">
        <div className="font-body-md font-bold text-sidebar-charcoal">{title}</div>
        <div className="mt-1 text-xs text-sidebar-charcoal/60">{description}</div>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <span className={`text-xs font-semibold uppercase tracking-widest ${enabled ? 'text-primary' : 'text-sidebar-charcoal/45'}`}>
          {busyLabel ?? (enabled ? 'On' : 'Off')}
        </span>
        <span
          className={`relative h-7 w-12 rounded-full transition ${enabled ? 'bg-primary' : 'bg-sidebar-charcoal/15'}`}
          aria-hidden="true"
        >
          <span
            className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${enabled ? 'left-6' : 'left-1'}`}
          />
        </span>
      </div>
    </button>
  );
}

export function SettingsPage({
  config,
  authStatus,
  runtimeStatus,
  busy,
  pendingAction,
  error,
  setConfig,
  onSaveConfig,
  onImportGoogleConfig,
  onConnectGoogle,
  onDisconnectGoogle,
  onToggleStartup,
  onTogglePaused,
  onToggleWellness,
  onToggleWellnessType,
  onToggleTimeAwareness,
  onPollNow,
  onSaveSelectedCalendars,
}: {
  config: GoogleOAuthConfig;
  authStatus: AuthStatus | null;
  runtimeStatus: RuntimeStatus | null;
  busy: boolean;
  pendingAction: string;
  error: string;
  setConfig: Dispatch<SetStateAction<GoogleOAuthConfig>>;
  onSaveConfig: () => Promise<void>;
  onImportGoogleConfig: () => Promise<void>;
  onConnectGoogle: () => Promise<void>;
  onDisconnectGoogle: () => Promise<void>;
  onToggleStartup: () => Promise<void>;
  onTogglePaused: () => Promise<void>;
  onToggleWellness: () => Promise<void>;
  onToggleWellnessType: (kind: 'eye' | 'stand' | 'water', enabled: boolean) => Promise<void>;
  onToggleTimeAwareness: () => Promise<void>;
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
              {pendingAction === 'save-config' ? 'Saving...' : 'Save Config'}
            </button>
            <button type="button" disabled={busy} onClick={() => void onImportGoogleConfig()} className="action-pill">
              {pendingAction === 'import-google-config' ? 'Importing...' : 'Import JSON'}
            </button>
            <button
              type="button"
              disabled={busy || !authStatus?.configured}
              onClick={() => void onConnectGoogle()}
              className="action-pill"
            >
              {pendingAction === 'connect-google' ? 'Connecting...' : 'Connect'}
            </button>
            <button
              type="button"
              disabled={busy || !authStatus?.connected}
              onClick={() => void onDisconnectGoogle()}
              className="action-pill"
            >
              {pendingAction === 'disconnect-google' ? 'Disconnecting...' : 'Disconnect'}
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
            <ActionCard
              title="Poll Calendar"
              description={pendingAction === 'poll-now' ? 'Refreshing now...' : 'Manual sync now'}
              onClick={() => void onPollNow()}
              disabled={busy || runtimeStatus?.paused}
            />
            <ActionCard
              title={pendingAction === 'toggle-paused' ? 'Working...' : runtimeStatus?.paused ? 'Resume Reminders' : 'Pause Reminders'}
              description="Background reminder engine"
              onClick={() => void onTogglePaused()}
              disabled={busy}
            />
            <ActionCard
              title={pendingAction === 'toggle-startup'
                ? 'Working...'
                : runtimeStatus?.startupEnabled
                  ? 'Disable Startup'
                  : 'Enable Startup'}
              description="Packaged app only"
              onClick={() => void onToggleStartup()}
              disabled={busy || !runtimeStatus?.startupSupported}
            />
            <div className="rounded-[24px] bg-white/60 p-5">
              <div className="font-label-caps text-label-caps uppercase text-sidebar-charcoal/60">Reminder Cadence</div>
              <div className="mt-3 text-lg font-semibold text-sidebar-charcoal">
                {(runtimeStatus?.reminderLeadTimes ?? [30, 5, 1]).join(' / ')}m
              </div>
              <div className="mt-2 text-xs text-sidebar-charcoal/60">Morning briefing at 8:00 AM, then 30m, 5m, and 1m before each moment.</div>
            </div>
          </div>

          <div className="mt-6 rounded-[28px] bg-white/45 p-5">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="font-headline-sm text-sidebar-charcoal">Wellness Reminders</div>
                <div className="mt-1 text-sm text-sidebar-charcoal/60">Control the extra nudges separately from calendar reminders.</div>
              </div>
              <div className="text-xs font-semibold uppercase tracking-widest text-sidebar-charcoal/55">
                Eyes 20m / Stand 30m / Water 60m
              </div>
            </div>

            <div className="space-y-3">
              <ToggleRow
                title="Time Awareness"
                description="Give a simple half-hour time check all day and night."
                enabled={Boolean(runtimeStatus?.timeAwarenessEnabled)}
                onToggle={() => void onToggleTimeAwareness()}
                disabled={busy}
                busyLabel={pendingAction === 'toggle-time-awareness' ? 'Working...' : undefined}
              />
              <ToggleRow
                title="All Wellness Reminders"
                description="Master switch for eye, stand, and water nudges."
                enabled={Boolean(runtimeStatus?.wellnessEnabled)}
                onToggle={() => void onToggleWellness()}
                disabled={busy}
                busyLabel={pendingAction === 'toggle-wellness' ? 'Working...' : undefined}
              />
              <ToggleRow
                title="Eye Breaks"
                description="Show a 20-20-20 eye break reminder every 20 minutes."
                enabled={Boolean(runtimeStatus?.eyeBreakEnabled)}
                onToggle={() => void onToggleWellnessType('eye', !runtimeStatus?.eyeBreakEnabled)}
                disabled={busy || !runtimeStatus?.wellnessEnabled}
                busyLabel={pendingAction === 'toggle-wellness-eye' ? 'Working...' : undefined}
              />
              <ToggleRow
                title="Stand Breaks"
                description="Show a stand or stretch reminder every 30 minutes."
                enabled={Boolean(runtimeStatus?.standBreakEnabled)}
                onToggle={() => void onToggleWellnessType('stand', !runtimeStatus?.standBreakEnabled)}
                disabled={busy || !runtimeStatus?.wellnessEnabled}
                busyLabel={pendingAction === 'toggle-wellness-stand' ? 'Working...' : undefined}
              />
              <ToggleRow
                title="Water Breaks"
                description="Show a water reminder every 60 minutes."
                enabled={Boolean(runtimeStatus?.waterBreakEnabled)}
                onToggle={() => void onToggleWellnessType('water', !runtimeStatus?.waterBreakEnabled)}
                disabled={busy || !runtimeStatus?.wellnessEnabled}
                busyLabel={pendingAction === 'toggle-wellness-water' ? 'Working...' : undefined}
              />
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
