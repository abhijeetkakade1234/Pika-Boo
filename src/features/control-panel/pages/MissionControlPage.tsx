import { useMemo } from 'react';
import { getArtifactDetails } from '../../../shared/data/artifacts';
import type { AuthStatus, RuntimeStatus } from '../../../shared/contracts';
import { TopBar } from '../../../shared/ui/TopBar';
import type { ControlScreen } from '../components/SidebarNav';

function formatTimeLabel(startAt: string | undefined): string {
  if (!startAt) {
    return '00:00';
  }

  const deltaMs = Math.max(0, new Date(startAt).getTime() - Date.now());
  const minutes = Math.floor(deltaMs / 60_000);
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;

  return `${String(hours).padStart(2, '0')}:${String(remainder).padStart(2, '0')}`;
}

export function MissionControlPage({
  authStatus,
  runtimeStatus,
  onNavigate,
  onConnectGoogle,
  onShowDemo,
}: {
  authStatus: AuthStatus | null;
  runtimeStatus: RuntimeStatus | null;
  onNavigate: (screen: ControlScreen) => void;
  onConnectGoogle: () => Promise<void>;
  onShowDemo: () => Promise<void>;
}) {
  const nextEvent = runtimeStatus?.upcomingEvents[0];
  const selectedArtifact = getArtifactDetails(runtimeStatus?.artifactId ?? 'ghost');
  const todayEvents = runtimeStatus?.upcomingEvents.slice(0, 4) ?? [];
  const proofGaps = useMemo(
    () =>
      [
        authStatus?.configured ? null : 'Google OAuth client not configured yet',
        authStatus?.connected ? null : 'Live Google sign-in still needs a real account run',
        runtimeStatus?.upcomingCount ? null : 'Calendar polling still needs real upcoming events to prove it',
        runtimeStatus?.startupSupported
          ? 'Installed-run startup still needs post-install verification'
          : 'Startup only proves in packaged builds, not the dev shell',
      ].filter(Boolean) as string[],
    [authStatus, runtimeStatus],
  );

  return (
    <>
      <TopBar
        searchPlaceholder="Search your space..."
        rightSlot={
          <>
            <button className="flex h-12 w-12 items-center justify-center rounded-full border border-white/50 bg-white/40 shadow-sm backdrop-blur-md transition-all hover:scale-110 hover:bg-white active:scale-95">
              <span className="material-symbols-outlined text-on-background">notifications</span>
            </button>
            <button className="group flex items-center gap-3 rounded-full bg-sidebar-charcoal px-6 py-3 text-white shadow-lg transition-all hover:scale-105 hover:bg-black active:scale-95">
              <span className="font-label-caps text-label-caps uppercase tracking-widest">Peek Mode</span>
              <span className="material-symbols-outlined text-flamingo-pink group-hover:animate-bounce">visibility</span>
            </button>
          </>
        }
      />

      <div className="grid grid-cols-12 gap-bento-gutter">
        <section className="bento-card relative col-span-12 flex flex-col gap-8 overflow-hidden rounded-[28px] bg-flamingo-pink p-widget-padding shadow-card-pink md:flex-row lg:col-span-8">
          <div className="flex flex-1 flex-col justify-between">
            <div>
              <div className="status-pill mb-6">
                <span className="pulse-status h-2 w-2 rounded-full bg-primary" />
                Upcoming Sequence
              </div>
              <h2 className="mb-4 font-headline-xl text-headline-xl text-sidebar-charcoal">
                {nextEvent ? nextEvent.summary : 'Deep Focus'}
                <br />
                with {selectedArtifact.label}
              </h2>
              <p className="max-w-sm font-body-lg text-body-lg text-sidebar-charcoal/70">
                {nextEvent
                  ? `Your ${selectedArtifact.label.toLowerCase()} artifact is preparing a soft reminder flight for ${new Date(nextEvent.startAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}.`
                  : `The ${selectedArtifact.label.toLowerCase()} artifact is ready to carry your next reminder across the top of the screen.`}
              </p>
            </div>
            <div className="mt-8 flex items-end gap-2">
              <span className="font-display-lg text-display-lg text-sidebar-charcoal">
                {formatTimeLabel(nextEvent?.startAt)}
              </span>
              <span className="mb-4 font-label-caps text-label-caps uppercase">Minutes Left</span>
            </div>
          </div>
          <div className="relative flex flex-1 items-center justify-center">
            <div className="flex h-72 w-full items-center justify-center overflow-hidden rounded-3xl border border-white/30 bg-white/20 backdrop-blur-xl md:h-full">
              <img
                className="h-4/5 w-4/5 object-contain drop-shadow-2xl transition-transform duration-700 hover:scale-110"
                src={selectedArtifact.imageUrl}
                alt={selectedArtifact.label}
              />
            </div>
          </div>
        </section>

        <section
          className={`bento-card relative col-span-12 flex flex-col justify-between overflow-hidden rounded-[28px] p-widget-padding shadow-card-blue lg:col-span-4 ${selectedArtifact.previewColor}`}
        >
          <div className="relative z-10">
            <h3 className="font-headline-lg text-headline-lg text-sidebar-charcoal">Companion</h3>
            <p className="font-body-md text-sidebar-charcoal/60">{selectedArtifact.title}</p>
          </div>
          <div className="glass-card relative z-10 mt-6 flex flex-grow flex-col items-center justify-center rounded-3xl bg-white/20 p-6 text-center">
            <div className="mb-4 h-32 w-32">
              <img className="h-full w-full object-contain" src={selectedArtifact.imageUrl} alt={selectedArtifact.label} />
            </div>
            <span className="mb-1 font-label-caps text-label-caps uppercase text-primary">
              {selectedArtifact.previewState}
            </span>
            <p className="font-body-md font-semibold text-sidebar-charcoal">{selectedArtifact.previewHint}</p>
          </div>
          <div className="relative z-10 mt-6 flex items-center justify-between">
            <span className="font-label-caps text-label-caps uppercase text-sidebar-charcoal/50">
              Lead {runtimeStatus?.reminderLeadMinutes ?? 5}m
            </span>
            <div className="h-2 w-24 overflow-hidden rounded-full bg-white/40">
              <div className="h-full w-3/4 rounded-full bg-primary" />
            </div>
          </div>
        </section>

        <section className="bento-card relative col-span-12 overflow-hidden rounded-[28px] bg-sage-green p-widget-padding shadow-card-green lg:col-span-4">
          <div className="blob-bg -right-10 -top-10 h-48 w-48 rounded-full bg-white/40" />
          <div className="relative z-10">
            <div className="mb-8 flex items-start justify-between">
              <h3 className="font-headline-lg text-headline-lg text-sidebar-charcoal">Today</h3>
              <span className="material-symbols-outlined rounded-full bg-white/40 p-2 text-sidebar-charcoal">
                calendar_today
              </span>
            </div>
            <div className="space-y-6">
              {todayEvents.length > 0 ? (
                todayEvents.map((event, index) => (
                  <div
                    key={`${event.id}:${event.startAt}`}
                    className={index === 1 ? 'flex gap-4 rounded-2xl border border-white/20 bg-white/40 p-4' : 'flex gap-4'}
                  >
                    <span
                      className={`mt-1 font-label-caps text-label-caps ${index === 1 ? 'text-primary' : 'text-sidebar-charcoal/40'}`}
                    >
                      {new Date(event.startAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    <div className="flex flex-col">
                      <span className="font-body-md font-bold text-sidebar-charcoal">{event.summary}</span>
                      <span className="text-xs text-sidebar-charcoal/60">
                        {event.meetingUrl ? 'Meeting link ready' : 'Calendar event'}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl bg-white/30 p-5 text-sidebar-charcoal/70">
                  No live events yet. Connect Google to fill this rail.
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="bento-card col-span-12 rounded-[28px] bg-lavender p-widget-padding shadow-card-purple lg:col-span-5">
          <div className="mb-8 flex items-center justify-between">
            <h3 className="font-headline-lg text-headline-lg text-sidebar-charcoal">Recent Flights</h3>
            <button
              type="button"
              onClick={() => onNavigate('artifacts')}
              className="font-label-caps text-label-caps uppercase text-primary hover:underline"
            >
              View All
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-[24px] bg-white/40 p-5 transition-colors hover:bg-white/60">
              <span className="material-symbols-outlined mb-3 text-primary">flight_takeoff</span>
              <h4 className="font-body-md font-bold text-sidebar-charcoal">Overlay Demo</h4>
              <p className="mb-3 text-xs text-sidebar-charcoal/60">Use the shipped overlay motion</p>
              <button type="button" onClick={() => void onShowDemo()} className="action-pill">
                Play Demo
              </button>
            </div>
            <div className="rounded-[24px] border-2 border-dashed border-sidebar-charcoal/10 bg-white/40 p-5 transition-colors hover:bg-white/60">
              <span className="material-symbols-outlined mb-3 text-primary">rocket_launch</span>
              <h4 className="font-body-md font-bold text-sidebar-charcoal">Reminder Engine</h4>
              <p className="mb-3 text-xs text-sidebar-charcoal/60">
                {runtimeStatus?.paused ? 'Paused until resumed' : 'Background polling live'}
              </p>
              <div className="mt-2 h-1 w-full rounded-full bg-sidebar-charcoal/10">
                <div
                  className={`h-full rounded-full bg-primary ${runtimeStatus?.paused ? 'w-1/4' : 'w-3/4'}`}
                />
              </div>
            </div>
            <div className="group relative col-span-2 cursor-pointer overflow-hidden rounded-[24px] bg-sidebar-charcoal p-5 text-white">
              <div className="relative z-10">
                <h4 className="font-body-md font-bold">Proof Gaps Still Open</h4>
                <p className="text-xs text-white/60">Surface the real blockers instead of hiding them in docs.</p>
              </div>
              <span className="material-symbols-outlined relative z-10 text-flamingo-pink transition-transform group-hover:translate-x-2">
                arrow_forward
              </span>
              <div className="absolute inset-0 origin-left scale-x-0 bg-primary/20 transition-transform duration-500 group-hover:scale-x-100" />
            </div>
          </div>
        </section>

        <section className="col-span-12 flex flex-col gap-bento-gutter lg:col-span-3">
          <div className="bento-card flex flex-grow flex-col items-center justify-center rounded-[28px] bg-honey-yellow p-widget-padding text-center shadow-card-yellow">
            <div className="relative mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-sm">
              <span className="material-symbols-outlined text-4xl text-primary">calendar_month</span>
              <div
                className={`absolute -right-2 -top-2 h-5 w-5 rounded-full border-4 border-honey-yellow ${authStatus?.connected ? 'bg-green-500' : 'bg-sidebar-charcoal/20'}`}
              />
            </div>
            <h4 className="font-body-md font-bold text-sidebar-charcoal">
              {authStatus?.connected ? 'G-Cal Connected' : 'Connect Calendar'}
            </h4>
            <p className="mt-2 text-xs text-sidebar-charcoal/60">
              {runtimeStatus?.lastPollAt
                ? `Last sync: ${new Date(runtimeStatus.lastPollAt).toLocaleTimeString([], {
                    hour: 'numeric',
                    minute: '2-digit',
                  })}`
                : 'No live sync yet'}
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
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary">energy_savings_leaf</span>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-sidebar-charcoal">Proof Gaps</span>
                <span className="text-[10px] text-sidebar-charcoal/50">{proofGaps.length} still open</span>
              </div>
            </div>
            <button type="button" onClick={() => onNavigate('settings')} className="action-pill">
              Review
            </button>
          </div>
        </section>
      </div>

      <div className="fixed bottom-8 right-8 z-40 flex flex-col gap-4 md:flex-row-reverse">
        <button
          type="button"
          onClick={() => onNavigate('artifacts')}
          className="group flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-primary text-white shadow-[0_20px_40px_rgba(2,0,231,0.3)] transition-all hover:scale-110 active:scale-95"
        >
          <span className="material-symbols-outlined text-3xl transition-transform group-hover:rotate-12">add</span>
        </button>
        <button
          type="button"
          onClick={() => onNavigate('settings')}
          className="flex items-center gap-3 rounded-full border border-white/50 bg-white/80 px-6 py-4 text-sidebar-charcoal shadow-lg backdrop-blur-md transition-all hover:scale-105 hover:bg-white active:scale-95"
        >
          <span className="material-symbols-outlined text-sky-blue">link</span>
          <span className="font-label-caps text-label-caps uppercase">Connect Calendar</span>
        </button>
      </div>
    </>
  );
}
