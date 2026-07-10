import { getArtifactDetails } from '../../../shared/data/artifacts';
import type { AuthStatus, RuntimeStatus } from '../../../shared/contracts';
import { TopBar } from '../../../shared/ui/TopBar';
import type { ControlScreen } from '../components/SidebarNav';

function minutesUntil(startAt: string | undefined): string {
  if (!startAt) {
    return '--:--';
  }

  const deltaMs = Math.max(0, new Date(startAt).getTime() - Date.now());
  const minutes = Math.floor(deltaMs / 60_000);
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;

  return `${String(hours).padStart(2, '0')}:${String(remainder).padStart(2, '0')}`;
}

function describeRuntime(authStatus: AuthStatus | null, runtimeStatus: RuntimeStatus | null): string {
  if (!authStatus?.configured) {
    return 'Add your Google desktop client in Settings to start syncing.';
  }

  if (!authStatus.connected) {
    return 'Google is configured but not connected. Finish sign-in to start reminders.';
  }

  if (runtimeStatus?.lastPollError) {
    return runtimeStatus.lastPollError;
  }

  if (runtimeStatus?.upcomingEvents.length) {
    return `${runtimeStatus.upcomingEvents.length} upcoming event${runtimeStatus.upcomingEvents.length === 1 ? '' : 's'} loaded across selected calendars.`;
  }

  return 'Connected and polling. There are no events in the next 30 days on the selected calendars.';
}

function describeMomentKind(event: RuntimeStatus['upcomingEvents'][number] | undefined): string {
  if (!event) {
    return '';
  }

  return event.label ?? (event.kind === 'task' ? 'Task' : 'Event');
}

export function MissionControlPage({
  authStatus,
  runtimeStatus,
  onNavigate,
  onConnectGoogle,
  onClearHistory,
  onShowDemo,
  onPollNow,
  onTogglePaused,
}: {
  authStatus: AuthStatus | null;
  runtimeStatus: RuntimeStatus | null;
  onNavigate: (screen: ControlScreen) => void;
  onConnectGoogle: () => Promise<void>;
  onClearHistory: () => Promise<void>;
  onShowDemo: () => Promise<void>;
  onPollNow: () => Promise<void>;
  onTogglePaused: () => Promise<void>;
}) {
  const nextEvent =
    runtimeStatus?.upcomingEvents.find((event) => new Date(event.startAt).getTime() > Date.now()) ??
    runtimeStatus?.upcomingEvents[0];
  const selectedArtifact = getArtifactDetails(runtimeStatus?.artifactId ?? 'ghost');
  const taskMoments = (runtimeStatus?.upcomingEvents ?? []).filter((event) => event.kind === 'task').slice(0, 4);
  const upcomingEvents = (runtimeStatus?.upcomingEvents ?? []).filter((event) => event.kind !== 'task').slice(0, 4);
  const recentReminders = runtimeStatus?.recentReminders.slice(0, 3) ?? [];
  const selectedCalendarCount = runtimeStatus?.availableCalendars.filter((calendar) => calendar.selected).length ?? 0;
  const nextMomentKind = describeMomentKind(nextEvent);
  const reminderCadence = runtimeStatus?.reminderLeadTimes ?? [30, 5, 1];

  return (
    <>
      <TopBar
        rightSlot={
          <div className="flex flex-wrap justify-end gap-3">
            <button
              type="button"
              onClick={() => void onPollNow()}
              className="flex h-12 items-center justify-center rounded-full border border-white/50 bg-white/40 px-4 font-label-caps text-label-caps uppercase shadow-sm backdrop-blur-md transition-all hover:scale-105 hover:bg-white active:scale-95 sm:px-5"
            >
              Poll Now
            </button>
            <button
              type="button"
              onClick={() => void onTogglePaused()}
              className="group flex items-center gap-3 rounded-full bg-sidebar-charcoal px-4 py-3 text-white shadow-lg transition-all hover:scale-105 hover:bg-black active:scale-95 sm:px-6"
            >
              <span className="font-label-caps text-label-caps uppercase tracking-widest">
                {runtimeStatus?.paused ? 'Resume' : 'Pause'}
              </span>
              <span className="material-symbols-outlined text-flamingo-pink">
                {runtimeStatus?.paused ? 'play_arrow' : 'pause'}
              </span>
            </button>
          </div>
        }
      />

      <div className="grid grid-cols-12 gap-bento-gutter">
        <section className="bento-card relative col-span-12 flex flex-col gap-8 overflow-hidden rounded-[28px] bg-flamingo-pink p-widget-padding shadow-card-pink md:flex-row xl:col-span-8">
          <div className="flex min-w-0 flex-1 flex-col justify-between">
            <div>
              <div className="status-pill mb-6">
                <span className="pulse-status h-2 w-2 rounded-full bg-primary" />
                {runtimeStatus?.paused ? 'Reminder Engine Paused' : 'Reminder Engine Live'}
              </div>
              <h2 className="text-card-title mb-4 text-3xl font-bold leading-tight tracking-[-0.02em] text-sidebar-charcoal sm:text-4xl lg:text-headline-xl">
                {nextEvent ? nextEvent.summary : 'No upcoming event'}
                <br />
                with {selectedArtifact.label}
              </h2>
              <p className="text-card-copy max-w-xl font-body-lg text-body-lg text-sidebar-charcoal/70">
                {nextEvent
                  ? `${nextMomentKind ? `${nextMomentKind} | ` : ''}${nextEvent.calendarSummary} at ${new Date(nextEvent.startAt).toLocaleTimeString([], {
                      hour: 'numeric',
                      minute: '2-digit',
                    })}. The overlay fires at ${reminderCadence.join('m, ')}m before start.`
                  : describeRuntime(authStatus, runtimeStatus)}
              </p>
              {nextEvent ? (
                <div className="mt-6 flex flex-wrap gap-3">
                  {nextEvent.meetingUrl ? (
                    <button type="button" onClick={() => void window.pikaBoo.openExternal(nextEvent.meetingUrl!)} className="action-pill">
                      Open Meeting
                    </button>
                  ) : null}
                  {nextEvent.sourceUrl ? (
                    <button type="button" onClick={() => void window.pikaBoo.openExternal(nextEvent.sourceUrl!)} className="action-pill">
                      Open in Google
                    </button>
                  ) : null}
                </div>
              ) : null}
            </div>
            <div className="mt-8 flex flex-wrap items-end gap-2">
              <span className="break-all font-display-lg text-display-lg text-sidebar-charcoal">
                {minutesUntil(nextEvent?.startAt)}
              </span>
              <span className="mb-2 font-label-caps text-label-caps uppercase">Until Trigger Window</span>
            </div>
          </div>
          <div className="relative flex min-w-0 flex-1 items-center justify-center">
            <div className="flex h-72 w-full items-center justify-center overflow-hidden rounded-3xl border border-white/30 bg-white/20 backdrop-blur-xl md:h-full">
              <img
                className="h-4/5 w-4/5 object-contain drop-shadow-2xl"
                src={selectedArtifact.imageUrl}
                alt={selectedArtifact.label}
              />
            </div>
          </div>
        </section>

        <section
          className={`bento-card relative col-span-12 flex flex-col rounded-[28px] p-widget-padding shadow-card-blue lg:col-span-6 xl:col-span-4 ${selectedArtifact.previewColor}`}
        >
          <div className="relative z-10 flex flex-col items-start gap-4 sm:flex-row sm:justify-between">
            <div className="min-w-0">
              <h3 className="font-headline-lg text-headline-lg text-sidebar-charcoal">Reminder Setup</h3>
              <p className="text-card-copy font-body-md text-sidebar-charcoal/60">The live setup behind the next overlay.</p>
            </div>
            <button type="button" onClick={() => onNavigate('themes')} className="action-pill shrink-0">
              Themes
            </button>
          </div>

          <div className="mt-6 grid gap-4">
            <div className="rounded-[24px] bg-white/45 p-5">
              <div className="font-label-caps text-label-caps uppercase text-sidebar-charcoal/50">Theme</div>
              <div className="text-card-title mt-2 font-body-md font-bold text-sidebar-charcoal">{selectedArtifact.label}</div>
              <div className="text-card-copy mt-1 text-sm text-sidebar-charcoal/60">{selectedArtifact.previewHint}</div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="rounded-[24px] bg-white/45 p-5">
                <div className="font-label-caps text-label-caps uppercase text-sidebar-charcoal/50">Cadence</div>
                <div className="mt-2 text-2xl font-semibold text-sidebar-charcoal">
                  {reminderCadence.join('/')}m
                </div>
              </div>
              <div className="rounded-[24px] bg-white/45 p-5">
                <div className="font-label-caps text-label-caps uppercase text-sidebar-charcoal/50">Calendars</div>
                <div className="mt-2 text-2xl font-semibold text-sidebar-charcoal">{selectedCalendarCount}</div>
              </div>
            </div>

            <div className="rounded-[24px] bg-white/45 p-5">
              <div className="font-label-caps text-label-caps uppercase text-sidebar-charcoal/50">Engine State</div>
              <div className="mt-2 font-body-md font-bold text-sidebar-charcoal">
                {runtimeStatus?.paused ? 'Paused' : 'Live'}
              </div>
              <div className="text-card-copy mt-1 text-sm text-sidebar-charcoal/60">
                {runtimeStatus?.paused ? 'Reminders stay queued until you resume.' : 'Ready to fire the next artifact on time.'}
              </div>
            </div>
          </div>
        </section>

        <section className="bento-card relative col-span-12 overflow-hidden rounded-[28px] bg-sage-green p-widget-padding shadow-card-green lg:col-span-6 xl:col-span-4">
          <div className="blob-bg -right-10 -top-10 h-48 w-48 rounded-full bg-white/40" />
          <div className="relative z-10">
            <div className="mb-8 flex items-start justify-between">
              <h3 className="font-headline-lg text-headline-lg text-sidebar-charcoal">Upcoming Calendar</h3>
              <span className="material-symbols-outlined rounded-full bg-white/40 p-2 text-sidebar-charcoal">
                calendar_today
              </span>
            </div>
            <div className="space-y-6">
              {upcomingEvents.length > 0 ? (
                upcomingEvents.map((event, index) => (
                  <div
                    key={`${event.calendarId}:${event.id}:${event.startAt}`}
                    className={index === 0 ? 'flex min-w-0 flex-col gap-3 rounded-2xl border border-white/20 bg-white/40 p-4 sm:flex-row sm:gap-4' : 'flex min-w-0 flex-col gap-3 sm:flex-row sm:gap-4'}
                  >
                    <span className={`mt-1 font-label-caps text-label-caps ${index === 0 ? 'text-primary' : 'text-sidebar-charcoal/40'}`}>
                      {new Date(event.startAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    <div className="min-w-0 flex-1">
                      <span className="text-card-title block font-body-md font-bold text-sidebar-charcoal">{event.summary}</span>
                      <span className="text-card-copy block text-xs text-sidebar-charcoal/60">
                        {event.calendarSummary}
                        {event.label ? ` | ${event.label}` : event.kind === 'task' ? ' | Task' : ''}
                        {event.meetingUrl ? ' | Meeting link ready' : ''}
                      </span>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {event.meetingUrl ? (
                          <button type="button" onClick={() => void window.pikaBoo.openExternal(event.meetingUrl!)} className="action-pill">
                            Meet
                          </button>
                        ) : null}
                        {event.sourceUrl ? (
                          <button type="button" onClick={() => void window.pikaBoo.openExternal(event.sourceUrl!)} className="action-pill">
                            Google
                          </button>
                        ) : null}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl bg-white/30 p-5 text-sidebar-charcoal/70">
                  No events in the next 30 days across the selected calendars.
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="bento-card col-span-12 rounded-[28px] bg-lavender p-widget-padding shadow-card-purple lg:col-span-6 xl:col-span-4">
          <div className="mb-8 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="font-headline-lg text-headline-lg text-sidebar-charcoal">Pending Tasks</h3>
            <button
              type="button"
              onClick={() => onNavigate('moments')}
              className="shrink-0 font-label-caps text-label-caps uppercase text-primary hover:underline"
            >
              View All
            </button>
          </div>
          <div className="space-y-4">
              {taskMoments.length > 0 ? (
                taskMoments.map((task) => (
                <div key={`${task.calendarId}:${task.id}:${task.startAt}`} className="rounded-[24px] bg-white/45 p-5">
                  <div className="text-card-title font-body-md font-bold text-sidebar-charcoal">{task.summary}</div>
                  <div className="text-card-copy mt-1 text-sm text-sidebar-charcoal/60">{task.calendarSummary}</div>
                  <div className="text-card-copy mt-2 text-xs uppercase tracking-widest text-sidebar-charcoal/50">
                    Due {new Date(task.startAt).toLocaleString([], { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                  </div>
                  {task.sourceUrl ? (
                    <button type="button" onClick={() => void window.pikaBoo.openExternal(task.sourceUrl!)} className="mt-3 action-pill">
                      Open Task
                    </button>
                  ) : null}
                </div>
              ))
            ) : (
              <div className="rounded-[24px] bg-white/40 p-6 text-sidebar-charcoal/70">
                No pending tasks loaded from Google Tasks.
              </div>
            )}
          </div>
        </section>

        <section className="bento-card col-span-12 rounded-[28px] bg-lavender p-widget-padding shadow-card-purple lg:col-span-6 xl:col-span-4">
          <div className="mb-8 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="font-headline-lg text-headline-lg text-sidebar-charcoal">Recent Reminder Flights</h3>
            <div className="flex flex-wrap items-center gap-3">
              <button type="button" onClick={() => void onClearHistory()} className="action-pill">
                Clear History
              </button>
              <button
                type="button"
                onClick={() => onNavigate('flights')}
                className="shrink-0 font-label-caps text-label-caps uppercase text-primary hover:underline"
              >
                View All
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-[24px] bg-white/40 p-5 transition-colors hover:bg-white/60">
              <span className="material-symbols-outlined mb-3 text-primary">flight_takeoff</span>
              <h4 className="font-body-md font-bold text-sidebar-charcoal">Preview Overlay</h4>
              <p className="text-card-copy mb-3 text-xs text-sidebar-charcoal/60">Run a local preview with the selected artifact</p>
              <button type="button" onClick={() => void onShowDemo()} className="action-pill">
                Preview
              </button>
            </div>
            <div className="rounded-[24px] border-2 border-dashed border-sidebar-charcoal/10 bg-white/40 p-5">
              <span className="material-symbols-outlined mb-3 text-primary">rocket_launch</span>
              <h4 className="font-body-md font-bold text-sidebar-charcoal">Engine Status</h4>
              <p className="text-card-copy mb-3 text-xs text-sidebar-charcoal/60">
                {runtimeStatus?.paused ? 'Paused until resumed' : runtimeStatus?.lastPollError ?? 'Polling live'}
              </p>
              <div className="mt-2 h-1 w-full rounded-full bg-sidebar-charcoal/10">
                <div className={`h-full rounded-full bg-primary ${runtimeStatus?.paused ? 'w-1/4' : 'w-3/4'}`} />
              </div>
            </div>
            <div className="rounded-[24px] bg-sidebar-charcoal p-5 text-white md:col-span-2">
              <h4 className="font-body-md font-bold">Last Deliveries</h4>
              <div className="mt-4 space-y-3 text-sm">
                {recentReminders.length > 0 ? (
                  recentReminders.map((reminder) => (
                    <div key={`${reminder.reminderId}:${reminder.deliveredAt}`} className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="text-card-title">{reminder.title}</div>
                        <div className="text-card-copy text-white/60">{reminder.subtitle}</div>
                      </div>
                      <div className="shrink-0 text-white/60">
                        {new Date(reminder.deliveredAt).toLocaleTimeString([], {
                          hour: 'numeric',
                          minute: '2-digit',
                        })}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-white/60">No reminders have been delivered in this app session yet.</div>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="col-span-12 flex flex-col gap-bento-gutter lg:col-span-6 xl:col-span-4">
          <div className="bento-card flex flex-grow flex-col items-center justify-center rounded-[28px] bg-honey-yellow p-widget-padding text-center shadow-card-yellow">
            <div className="relative mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-sm">
              <span className="material-symbols-outlined text-4xl text-primary">calendar_month</span>
              <div
                className={`absolute -right-2 -top-2 h-5 w-5 rounded-full border-4 border-honey-yellow ${authStatus?.connected ? 'bg-green-500' : 'bg-sidebar-charcoal/20'}`}
              />
            </div>
            <h4 className="font-body-md font-bold text-sidebar-charcoal">
              {authStatus?.connected ? 'Google Connected' : 'Connect Calendar'}
            </h4>
            <p className="mt-2 text-xs text-sidebar-charcoal/60">
              {runtimeStatus?.lastPollAt
                ? `Last sync: ${new Date(runtimeStatus.lastPollAt).toLocaleTimeString([], {
                    hour: 'numeric',
                    minute: '2-digit',
                  })}`
                : 'No sync yet'}
            </p>
            <button
              type="button"
              onClick={() => void onConnectGoogle()}
              className="mt-6 action-pill bg-sidebar-charcoal/10 hover:bg-sidebar-charcoal/20"
            >
              {authStatus?.connected ? 'Reconnect' : 'Connect'}
            </button>
          </div>

          <div className="bento-card flex items-center justify-between rounded-[28px] bg-white p-widget-padding shadow-card-soft">
            <div className="flex min-w-0 items-center gap-3">
              <span className="material-symbols-outlined text-primary">tune</span>
              <div className="flex min-w-0 flex-col">
                <span className="text-xs font-bold text-sidebar-charcoal">Runtime Settings</span>
                <span className="text-card-copy text-[10px] text-sidebar-charcoal/50">
                  {reminderCadence.join('/')}m cadence | {selectedCalendarCount} calendars
                </span>
              </div>
            </div>
            <button type="button" onClick={() => onNavigate('settings')} className="action-pill">
              Open
            </button>
          </div>
        </section>
      </div>
    </>
  );
}
