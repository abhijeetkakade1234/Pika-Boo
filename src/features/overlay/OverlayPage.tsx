import { getArtifactDetails } from '../../shared/data/artifacts';
import eyeBreakImage from '../../shared/assets/wellness/eye-break.svg';
import standBreakImage from '../../shared/assets/wellness/stand-break.svg';
import timeAwarenessImage from '../../shared/assets/wellness/time-awareness.svg';
import waterBreakImage from '../../shared/assets/wellness/water-break.svg';
import type { ReminderPayload } from '../../shared/contracts';

function parseReminderSubtitle(subtitle: string) {
  if (subtitle.startsWith('Starts in ')) {
    return { badge: 'Coming Up', detail: subtitle.replace('Starts in ', 'In ') };
  }

  if (subtitle === 'Starting now') {
    return { badge: 'Starting', detail: 'Now' };
  }

  return { badge: 'Reminder', detail: subtitle };
}

function getReminderImage(reminder: ReminderPayload): { imageUrl: string; label: string } {
  if (reminder.reminderId.startsWith('eye-break:')) {
    return { imageUrl: eyeBreakImage, label: 'Eye Break' };
  }

  if (reminder.reminderId.startsWith('stand-break:')) {
    return { imageUrl: standBreakImage, label: 'Stand Break' };
  }

  if (reminder.reminderId.startsWith('water-break:')) {
    return { imageUrl: waterBreakImage, label: 'Water Break' };
  }

  if (reminder.reminderId.startsWith('time-awareness:')) {
    return { imageUrl: timeAwarenessImage, label: 'Time Awareness' };
  }

  const artifact = getArtifactDetails(reminder.artifactId);
  return { imageUrl: artifact.imageUrl, label: artifact.label };
}

export function OverlayPage({
  reminder,
}: {
  reminder: ReminderPayload;
}) {
  const visual = getReminderImage(reminder);
  const meta = parseReminderSubtitle(reminder.subtitle);

  return (
    <div className="h-screen overflow-hidden bg-background font-body-md text-on-background">
      <div className="pointer-events-none fixed inset-0 scale-105 select-none opacity-40 blur-xl">
        <div className="flex h-full">
          <div className="m-6 h-[calc(100%-48px)] w-sidebar-width rounded-[28px] bg-sidebar-charcoal" />
          <div className="grid flex-1 grid-cols-12 gap-6 p-8">
            <div className="col-span-8 h-64 rounded-[32px] bg-sky-blue" />
            <div className="col-span-4 h-64 rounded-[32px] bg-lavender" />
            <div className="col-span-4 h-96 rounded-[32px] bg-honey-yellow" />
            <div className="col-span-8 h-96 rounded-[32px] bg-sage-green" />
          </div>
        </div>
      </div>

      <div className="fixed inset-x-0 top-0 z-50 flex justify-center px-container-margin pt-6">
        <div className="animate-float-in glow-soft glass-panel relative flex h-24 w-full max-w-5xl items-center justify-between overflow-visible rounded-[32px] px-8">
          <div className="flex items-center gap-8">
            <div className="relative -mt-6 h-24 w-24">
              <div className="animate-mascot flex h-full w-full items-center justify-center">
                <img className="h-20 w-20 object-contain drop-shadow-lg" src={visual.imageUrl} alt={visual.label} />
              </div>
            </div>

            {reminder.meetingUrl ? (
              <button
                type="button"
                onClick={() => void window.pikaBoo.openExternal(reminder.meetingUrl!)}
                className="flex flex-col text-left transition hover:opacity-80"
              >
                <h1 className="text-[24px] tracking-tight text-on-background">{reminder.title}</h1>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 font-label-caps text-primary">{meta.badge}</span>
                  <p className="text-on-surface-variant">{meta.detail}</p>
                </div>
              </button>
            ) : (
              <div className="flex flex-col">
                <h1 className="text-[24px] tracking-tight text-on-background">{reminder.title}</h1>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 font-label-caps text-primary">{meta.badge}</span>
                  <p className="text-on-surface-variant">{meta.detail}</p>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => void window.pikaBoo.dismissReminder(reminder.reminderId)}
              className="flex items-center justify-center rounded-full p-3 text-on-surface-variant transition-colors hover:bg-black/5"
            >
              <span className="material-symbols-outlined text-[24px]">close</span>
            </button>
            <button
              type="button"
              onClick={() => void window.pikaBoo.snoozeReminder(reminder.reminderId, 5)}
              className="h-12 rounded-full bg-primary px-8 font-label-caps text-white shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95"
            >
              Snooze
            </button>
          </div>

          <div className="absolute -left-10 -top-10 -z-10 h-40 w-40 rounded-full bg-sky-blue/20 blur-[60px]" />
          <div className="absolute -bottom-10 -right-10 -z-10 h-40 w-40 rounded-full bg-lavender/20 blur-[60px]" />
        </div>
      </div>

      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-[20%] top-[10%] h-[400px] w-[400px] rounded-full bg-sky-blue/10 blur-[120px]" />
        <div className="absolute bottom-[20%] right-[10%] h-[500px] w-[500px] rounded-full bg-flamingo-pink/10 blur-[150px]" />
      </div>
    </div>
  );
}
