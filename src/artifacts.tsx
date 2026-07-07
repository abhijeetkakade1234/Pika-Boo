import type { ArtifactId, ReminderPayload } from './shared/contracts';

export interface ArtifactDefinition {
  id: ArtifactId;
  label: string;
  lead: string;
  trail: string;
  className: string;
}

export const artifactRegistry: ArtifactDefinition[] = [
  { id: 'ghost', label: 'Ghost', lead: 'Ghost', trail: '-----*', className: 'artifact--ghost' },
  { id: 'rocket', label: 'Rocket', lead: 'Rocket', trail: '========>', className: 'artifact--rocket' },
  { id: 'train', label: 'Train', lead: 'Train', trail: '[] [] [] >', className: 'artifact--train' },
  { id: 'ufo', label: 'UFO', lead: 'UFO', trail: '~~~~~~~~~>', className: 'artifact--ufo' },
  { id: 'minimal', label: 'Minimal', lead: 'Mark', trail: '-------->', className: 'artifact--minimal' },
];

export function getArtifactDefinition(artifactId: ArtifactId): ArtifactDefinition {
  return artifactRegistry.find((artifact) => artifact.id === artifactId) ?? artifactRegistry[0];
}

export function ArtifactOverlay({
  reminder,
  visible,
}: {
  reminder: ReminderPayload;
  visible: boolean;
}) {
  const artifact = getArtifactDefinition(reminder.artifactId);

  return (
    <div className="overlay-shell">
      <div className={`artifact-run ${artifact.className} ${visible ? 'artifact-run--visible' : ''}`}>
        <div className="artifact-run__lead">{artifact.lead}</div>
        <div className="artifact-run__body">
          <div className="artifact-run__track">{artifact.trail}</div>
          <button
            type="button"
            className={`artifact-run__message ${reminder.meetingUrl ? 'artifact-run__message--clickable' : ''}`}
            disabled={!reminder.meetingUrl}
            onClick={() => {
              if (reminder.meetingUrl) {
                void window.pikaBoo.openExternal(reminder.meetingUrl);
              }
            }}
          >
            <div className="artifact-run__title">{reminder.title}</div>
            <div className="artifact-run__subtitle">{reminder.subtitle}</div>
            {reminder.meetingUrl ? (
              <div className="artifact-run__hint">Click artifact to open meeting</div>
            ) : null}
          </button>
          <div className="artifact-run__track">{artifact.trail}</div>
        </div>
      </div>
    </div>
  );
}
