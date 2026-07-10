import type { RuntimeStatus } from '../../../shared/contracts';
import { TopBar } from '../../../shared/ui/TopBar';

function formatEventDate(startAt: string): string {
  return new Date(startAt).toLocaleString([], {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function getMomentBadge(event: RuntimeStatus['upcomingEvents'][number]): string {
  return event.label ?? (event.kind === 'task' ? 'Task' : 'Event');
}

export function MomentsPage({
  runtimeStatus,
  busy,
  pendingAction,
  onPollNow,
}: {
  runtimeStatus: RuntimeStatus | null;
  busy: boolean;
  pendingAction: string;
  onPollNow: () => Promise<void>;
}) {
  const calendars = runtimeStatus?.availableCalendars ?? [];
  const selectedCalendars = calendars.filter((calendar) => calendar.selected);
  const events = (runtimeStatus?.upcomingEvents ?? []).filter((event) => event.kind !== 'task');
  const tasks = (runtimeStatus?.upcomingEvents ?? []).filter((event) => event.kind === 'task');
  const eventTimeline = runtimeStatus?.eventTimeline.slice(0, 12) ?? [];

  return (
    <>
      <TopBar
        rightSlot={
          <button type="button" onClick={() => void onPollNow()} disabled={busy} className="action-pill">
            {pendingAction === 'poll-now' ? 'Refreshing...' : 'Refresh'}
          </button>
        }
      />

      <div className="grid grid-cols-12 gap-bento-gutter">
        <section className="col-span-12 rounded-[28px] bg-white p-widget-padding shadow-card-soft lg:col-span-4">
          <h1 className="font-headline-lg text-headline-lg text-sidebar-charcoal">Selected Calendars</h1>
          <div className="mt-6 max-h-[420px] space-y-3 overflow-y-auto overflow-x-hidden pr-2">
            {selectedCalendars.length > 0 ? (
              selectedCalendars.map((calendar) => (
                <div key={calendar.id} className="rounded-2xl bg-surface-container px-4 py-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <span
                      className="h-3 w-3 shrink-0 rounded-full border border-sidebar-charcoal/10"
                      style={{ backgroundColor: calendar.backgroundColor ?? '#d1d5db' }}
                    />
                    <span className="min-w-0 break-all text-sm font-semibold text-sidebar-charcoal">{calendar.summary}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-2xl bg-surface-container px-4 py-3 text-sm text-sidebar-charcoal/70">
                No calendars selected.
              </div>
            )}
          </div>
        </section>

        <section className="col-span-12 rounded-[28px] bg-lavender p-widget-padding shadow-card-purple lg:col-span-8">
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:justify-between">
            <div className="min-w-0">
              <h2 className="font-headline-lg text-headline-lg text-sidebar-charcoal">Pending Tasks</h2>
              <p className="mt-2 text-sm text-sidebar-charcoal/70">
                Every incomplete Google Task we can load, not just the next 30 days.
              </p>
            </div>
            <div className="shrink-0 rounded-full bg-white/50 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-sidebar-charcoal/70">
              {tasks.length} loaded
            </div>
          </div>

          <div className="mt-8 max-h-[420px] space-y-4 overflow-y-auto overflow-x-hidden pr-2">
            {tasks.length > 0 ? (
              tasks.map((task) => (
                <div
                  key={`${task.calendarId}:${task.id}:${task.startAt}`}
                  className="flex flex-col gap-3 rounded-[24px] bg-white/45 p-5 md:flex-row md:items-center md:justify-between"
                >
                  <div className="min-w-0 flex-1">
                    <div className="text-card-title font-body-md font-bold text-sidebar-charcoal">{task.summary}</div>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-sidebar-charcoal/60">
                      <span>{task.calendarSummary}</span>
                      <span className="rounded-full bg-white/60 px-2 py-1 text-[10px] font-semibold uppercase tracking-widest text-sidebar-charcoal/70">
                        Task
                      </span>
                    </div>
                  </div>
                  <div className="min-w-0 flex flex-wrap items-center gap-3">
                    <div className="text-sm text-sidebar-charcoal/70">
                      {task.dueAt ? formatEventDate(task.dueAt) : 'No due date'}
                    </div>
                    {task.sourceUrl ? (
                      <button type="button" onClick={() => void window.pikaBoo.openExternal(task.sourceUrl!)} className="action-pill">
                        Open in Google
                      </button>
                    ) : null}
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-[24px] bg-white/40 p-6 text-sidebar-charcoal/70">
                No pending tasks loaded yet.
              </div>
            )}
          </div>
        </section>

        <section className="col-span-12 rounded-[28px] bg-sage-green p-widget-padding shadow-card-green">
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:justify-between">
            <div className="min-w-0">
              <h2 className="font-headline-lg text-headline-lg text-sidebar-charcoal">Upcoming Moments</h2>
              <p className="mt-2 text-sm text-sidebar-charcoal/70">
                This is the real 30-day calendar lookahead from the selected Google calendars.
              </p>
            </div>
            <div className="shrink-0 rounded-full bg-white/50 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-sidebar-charcoal/70">
              {events.length} loaded
            </div>
          </div>

          <div className="mt-8 max-h-[520px] space-y-4 overflow-y-auto overflow-x-hidden pr-2">
            {events.length > 0 ? (
              events.map((event) => (
                <div
                  key={`${event.calendarId}:${event.id}:${event.startAt}`}
                  className="flex flex-col gap-3 rounded-[24px] bg-white/45 p-5 md:flex-row md:items-center md:justify-between"
                >
                  <div className="min-w-0 flex-1">
                    <div className="text-card-title font-body-md font-bold text-sidebar-charcoal">{event.summary}</div>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-sidebar-charcoal/60">
                      <span>{event.calendarSummary}</span>
                      <span className="rounded-full bg-white/60 px-2 py-1 text-[10px] font-semibold uppercase tracking-widest text-sidebar-charcoal/70">
                        {getMomentBadge(event)}
                      </span>
                    </div>
                  </div>
                  <div className="min-w-0 flex flex-wrap items-center gap-3">
                    <div className="text-sm text-sidebar-charcoal/70">{formatEventDate(event.startAt)}</div>
                    {event.meetingUrl ? (
                      <button type="button" onClick={() => void window.pikaBoo.openExternal(event.meetingUrl!)} className="action-pill">
                        Open Link
                      </button>
                    ) : null}
                    {event.sourceUrl ? (
                      <button type="button" onClick={() => void window.pikaBoo.openExternal(event.sourceUrl!)} className="action-pill">
                        Open in Google
                      </button>
                    ) : null}
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-[24px] bg-white/40 p-6 text-sidebar-charcoal/70">
                No upcoming calendar events in the next 30 days. Add a test event, then refresh.
              </div>
            )}
          </div>
        </section>

        <section className="col-span-12 rounded-[28px] bg-white p-widget-padding shadow-card-soft">
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:justify-between">
            <div className="min-w-0">
              <h2 className="font-headline-lg text-headline-lg text-sidebar-charcoal">Past Moment History</h2>
              <p className="mt-2 text-sm text-sidebar-charcoal/70">
                Stored locally after syncs, but only shows moments whose start time has already passed.
              </p>
            </div>
            <div className="shrink-0 rounded-full bg-surface-container px-4 py-2 text-xs font-semibold uppercase tracking-widest text-sidebar-charcoal/70">
              {eventTimeline.length} stored
            </div>
          </div>

          <div className="mt-8 max-h-[520px] space-y-4 overflow-y-auto overflow-x-hidden pr-2">
            {eventTimeline.length > 0 ? (
              eventTimeline.map((event) => (
                <div
                  key={`${event.calendarId}:${event.id}:${event.startAt}:${event.lastSeenAt}`}
                  className="flex flex-col gap-3 rounded-[24px] bg-surface-container p-5 md:flex-row md:items-center md:justify-between"
                >
                  <div className="min-w-0 flex-1">
                    <div className="text-card-title font-body-md font-bold text-sidebar-charcoal">{event.summary}</div>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-sidebar-charcoal/60">
                      <span>{event.calendarSummary}</span>
                      <span className="rounded-full bg-white/70 px-2 py-1 text-[10px] font-semibold uppercase tracking-widest text-sidebar-charcoal/70">
                        {getMomentBadge(event)}
                      </span>
                    </div>
                  </div>
                  <div className="min-w-0 flex flex-wrap items-center gap-3 text-sm text-sidebar-charcoal/60">
                    <div>Start: {formatEventDate(event.startAt)}</div>
                    <div>
                      Seen: {new Date(event.lastSeenAt).toLocaleString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                    </div>
                    {event.sourceUrl ? (
                      <button type="button" onClick={() => void window.pikaBoo.openExternal(event.sourceUrl!)} className="action-pill">
                        Open in Google
                      </button>
                    ) : null}
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-[24px] bg-surface-container p-6 text-sidebar-charcoal/70">
                No past moment history yet. Let a few events pass, then refresh.
              </div>
            )}
          </div>
        </section>
      </div>
    </>
  );
}
