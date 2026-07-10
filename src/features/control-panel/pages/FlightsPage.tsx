import type { RuntimeStatus } from '../../../shared/contracts';
import { TopBar } from '../../../shared/ui/TopBar';

export function FlightsPage({
  runtimeStatus,
  busy,
  onPollNow,
  onTogglePaused,
  onClearHistory,
  onShowDemo,
}: {
  runtimeStatus: RuntimeStatus | null;
  busy: boolean;
  onPollNow: () => Promise<void>;
  onTogglePaused: () => Promise<void>;
  onClearHistory: () => Promise<void>;
  onShowDemo: () => Promise<void>;
}) {
  const recentReminders = runtimeStatus?.recentReminders ?? [];

  return (
    <>
      <TopBar
        rightSlot={
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => void onPollNow()} disabled={busy} className="action-pill">
              Sync
            </button>
            <button type="button" onClick={() => void onTogglePaused()} disabled={busy} className="action-pill">
              {runtimeStatus?.paused ? 'Resume' : 'Pause'}
            </button>
          </div>
        }
      />

      <div className="grid grid-cols-12 gap-bento-gutter">
        <section className="col-span-12 rounded-[28px] bg-lavender p-widget-padding shadow-card-purple lg:col-span-4">
          <h1 className="font-headline-lg text-headline-lg text-sidebar-charcoal">Engine Status</h1>
          <div className="mt-6 space-y-4 text-sm text-sidebar-charcoal/70">
            <div className="rounded-2xl bg-white/45 p-4">
              <div className="font-semibold text-sidebar-charcoal">Poller</div>
              <div className="mt-1">{runtimeStatus?.pollerRunning ? 'Running' : 'Stopped'}</div>
            </div>
            <div className="rounded-2xl bg-white/45 p-4">
              <div className="font-semibold text-sidebar-charcoal">State</div>
              <div className="mt-1">{runtimeStatus?.paused ? 'Paused' : 'Live'}</div>
            </div>
            <div className="rounded-2xl bg-white/45 p-4">
              <div className="font-semibold text-sidebar-charcoal">Current Overlay</div>
              <div className="mt-1">{runtimeStatus?.currentReminder?.title ?? 'None visible right now'}</div>
            </div>
            <div className="rounded-2xl bg-white/45 p-4">
              <div className="font-semibold text-sidebar-charcoal">Last Poll</div>
              <div className="mt-1">
                {runtimeStatus?.lastPollAt
                  ? new Date(runtimeStatus.lastPollAt).toLocaleString([], {
                      month: 'short',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                    })
                  : 'Never'}
              </div>
            </div>
            {runtimeStatus?.lastPollError ? (
              <div className="rounded-2xl bg-error-container p-4 text-on-error-container">
                {runtimeStatus.lastPollError}
              </div>
            ) : null}
            <button type="button" onClick={() => void onShowDemo()} className="action-pill">
              Run Preview
            </button>
          </div>
        </section>

        <section className="col-span-12 rounded-[28px] bg-white p-widget-padding shadow-card-soft lg:col-span-8">
          <div className="flex items-start justify-between gap-6">
            <div>
              <h2 className="font-headline-lg text-headline-lg text-sidebar-charcoal">Delivered Flights</h2>
              <p className="mt-2 text-sm text-sidebar-charcoal/70">
                Stored locally so reminder delivery history survives relaunches.
              </p>
            </div>
            <div className="rounded-full bg-surface-container px-4 py-2 text-xs font-semibold uppercase tracking-widest text-sidebar-charcoal/70">
              {recentReminders.length} delivered
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={() => void onClearHistory()}
              disabled={busy || recentReminders.length === 0}
              className="action-pill"
            >
              Clear History
            </button>
          </div>

          <div className="mt-8 space-y-4">
            {recentReminders.length > 0 ? (
              recentReminders.map((reminder) => (
                <div key={`${reminder.reminderId}:${reminder.deliveredAt}`} className="rounded-[24px] bg-surface-container p-5">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="text-card-title font-body-md font-bold text-sidebar-charcoal">{reminder.title}</div>
                      <div className="text-card-copy mt-1 text-sm text-sidebar-charcoal/60">{reminder.subtitle}</div>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="text-sm text-sidebar-charcoal/60">
                        {new Date(reminder.deliveredAt).toLocaleString([], {
                          month: 'short',
                          day: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit',
                        })}
                      </div>
                      {reminder.meetingUrl ? (
                        <button type="button" onClick={() => void window.pikaBoo.openExternal(reminder.meetingUrl!)} className="action-pill">
                          Open Link
                        </button>
                      ) : null}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-[24px] bg-surface-container p-6 text-sidebar-charcoal/70">
                No delivered reminders stored right now.
              </div>
            )}
          </div>
        </section>
      </div>
    </>
  );
}
