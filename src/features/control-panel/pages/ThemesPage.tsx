import { artifactCatalog, getArtifactDetails } from '../../../shared/data/artifacts';
import type { ArtifactId, RuntimeStatus } from '../../../shared/contracts';
import { TopBar } from '../../../shared/ui/TopBar';

export function ThemesPage({
  artifactId,
  runtimeStatus,
  onSelectArtifact,
  onShowDemo,
}: {
  artifactId: ArtifactId;
  runtimeStatus: RuntimeStatus | null;
  onSelectArtifact: (artifactId: ArtifactId) => Promise<void>;
  onShowDemo: () => Promise<void>;
}) {
  const selectedArtifact = getArtifactDetails(artifactId);

  return (
    <>
      <TopBar
        rightSlot={
          <button type="button" onClick={() => void onShowDemo()} className="action-pill">
            Preview Overlay
          </button>
        }
      />

      <div className="grid grid-cols-12 gap-bento-gutter">
        <section className="col-span-12 rounded-[28px] bg-white p-widget-padding shadow-card-soft lg:col-span-5">
          <h1 className="font-headline-lg text-headline-lg text-sidebar-charcoal">Current Theme</h1>
          <div className="mt-6 rounded-[28px] p-6 text-center shadow-card-soft">
            <img className="mx-auto h-40 w-40 object-contain" src={selectedArtifact.imageUrl} alt={selectedArtifact.label} />
            <div className="mt-4 font-headline-lg text-headline-lg text-sidebar-charcoal">{selectedArtifact.title}</div>
            <div className="mt-2 text-sm text-sidebar-charcoal/60">{selectedArtifact.description}</div>
            <div className="mt-4 text-xs uppercase tracking-widest text-sidebar-charcoal/50">
              Reminder cadence: {(runtimeStatus?.reminderLeadTimes ?? [30, 5, 1]).join('m • ')}m
            </div>
          </div>
        </section>

        <section className="col-span-12 rounded-[28px] bg-flamingo-pink p-widget-padding shadow-card-pink lg:col-span-7">
          <h2 className="font-headline-lg text-headline-lg text-sidebar-charcoal">Available Themes</h2>
          <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
            {artifactCatalog.map((artifact) => {
              const selected = artifact.id === artifactId;

              return (
                <button
                  key={artifact.id}
                  type="button"
                  onClick={() => void onSelectArtifact(artifact.id)}
                  className={`flex flex-col items-start gap-4 rounded-[24px] bg-white/55 p-4 text-left transition hover:bg-white sm:flex-row sm:items-center ${selected ? 'ring-4 ring-primary/20' : ''}`}
                >
                  <img className="h-16 w-16 shrink-0 object-contain" src={artifact.imageUrl} alt={artifact.label} />
                  <div className="min-w-0 flex-1">
                    <div className="text-card-title font-body-md font-bold text-sidebar-charcoal">{artifact.label}</div>
                    <div className="text-card-copy mt-1 text-sm text-sidebar-charcoal/60">{artifact.previewHint}</div>
                  </div>
                  <div className="shrink-0 self-start font-label-caps text-label-caps uppercase text-primary sm:self-center">
                    {selected ? 'Selected' : 'Use'}
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      </div>
    </>
  );
}
