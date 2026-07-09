import { artifactCatalog, getArtifactDetails } from '../../../shared/data/artifacts';
import type { ArtifactId } from '../../../shared/contracts';
import { TopBar } from '../../../shared/ui/TopBar';

export function ArtifactGalleryPage({
  artifactId,
  onSelectArtifact,
  onShowDemo,
}: {
  artifactId: ArtifactId;
  onSelectArtifact: (artifactId: ArtifactId) => Promise<void>;
  onShowDemo: () => Promise<void>;
}) {
  const selectedArtifact = getArtifactDetails(artifactId);

  return (
    <>
      <TopBar
        searchPlaceholder="Find an artifact..."
        rightSlot={
          <div className="flex flex-col items-end">
            <h1 className="font-headline-lg text-headline-lg text-sidebar-charcoal">Artifact Gallery</h1>
            <p className="text-sm text-on-surface-variant">Choose your ambient companion</p>
          </div>
        }
      />

      <div className="grid grid-cols-12 items-start gap-bento-gutter">
        <section className="group relative col-span-12 flex h-[600px] flex-col justify-between overflow-hidden rounded-[32px] bg-white p-widget-padding shadow-2xl lg:col-span-7">
          <div className="organic-blob left-10 top-10" />
          <div className="organic-blob bottom-20 right-20 bg-sky-blue/20" />
          <div className="z-10 flex h-full flex-col justify-between">
            <div>
              <span className="rounded-full bg-sidebar-charcoal px-4 py-1.5 font-label-caps text-label-caps uppercase text-white">
                Featured Artifact
              </span>
              <h2 className="mt-6 font-display-lg text-display-lg text-sidebar-charcoal">
                {selectedArtifact.title.split(' ')[0]}
                <br />
                {selectedArtifact.title.split(' ').slice(1).join(' ') || selectedArtifact.label}
              </h2>
              <p className="mt-4 max-w-sm font-body-lg text-body-lg text-on-surface-variant">
                {selectedArtifact.description} Designed to elevate your deep work state.
              </p>
            </div>
            <div className="flex items-center gap-6">
              <button
                type="button"
                onClick={() => void onSelectArtifact(selectedArtifact.id)}
                className="rounded-full bg-primary px-8 py-4 font-label-caps text-label-caps uppercase text-white transition-transform hover:scale-105 active:scale-95"
              >
                Select Artifact
              </button>
              <button
                type="button"
                onClick={() => void onShowDemo()}
                className="font-label-caps text-label-caps uppercase text-sidebar-charcoal decoration-2 underline-offset-4 hover:underline"
              >
                View Specs
              </button>
            </div>
          </div>
          <div className="pointer-events-none absolute bottom-[-10%] right-[-10%] h-full w-[120%] transition-transform duration-700 group-hover:scale-110">
            <img className="h-full w-full object-contain" src={selectedArtifact.imageUrl} alt={selectedArtifact.label} />
          </div>
        </section>

        <section className="col-span-12 flex flex-col gap-bento-gutter lg:col-span-5">
          <div className="glass-card flex flex-col gap-6 rounded-[32px] border border-white/50 p-widget-padding shadow-card-soft backdrop-blur-2xl">
            <div className="flex items-start justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm">
                <span
                  className="material-symbols-outlined text-primary"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  visibility
                </span>
              </div>
              <span className="font-label-caps text-label-caps uppercase text-on-surface-variant">
                Peek Mode active
              </span>
            </div>
            <h3 className="font-headline-lg text-headline-lg text-sidebar-charcoal">Desktop Preview</h3>
            <div className="flex h-48 w-full items-center justify-center overflow-hidden rounded-2xl border border-dashed border-outline-variant bg-canvas-warm/50">
              <div className="relative h-32 w-32 animate-bounce">
                <img className="h-full w-full object-contain" src={selectedArtifact.imageUrl} alt={selectedArtifact.label} />
              </div>
            </div>
            <p className="text-body-md text-on-surface-variant">
              “Peek Mode” lets {selectedArtifact.label} hover subtly in the corner of your screen while you work.
            </p>
          </div>

          <div className="flex h-[280px] flex-col justify-between rounded-[32px] bg-lavender p-widget-padding shadow-lg">
            <div className="flex justify-between">
              <span className="material-symbols-outlined scale-150 text-sidebar-charcoal">bolt</span>
              <span className="font-label-caps text-label-caps uppercase text-sidebar-charcoal">98% Synced</span>
            </div>
            <div>
              <h4 className="font-headline-lg text-headline-lg text-sidebar-charcoal">Artifact Synergy</h4>
              <p className="mt-2 text-on-secondary-fixed-variant">
                Connect multiple artifacts to create an ambient ecosystem.
              </p>
            </div>
          </div>
        </section>

        <div className="col-span-12 mt-4 grid grid-cols-1 gap-bento-gutter md:grid-cols-2 lg:grid-cols-4">
          {artifactCatalog.map((artifact) => {
            const selected = artifact.id === artifactId;
            const isForge = artifact.id === 'minimal';

            return (
              <button
                key={artifact.id}
                type="button"
                onClick={() => void onSelectArtifact(artifact.id)}
                className={[
                  'group min-h-[400px] rounded-[32px] p-8 text-left shadow-sm transition-all hover:-translate-y-2 hover:shadow-xl',
                  artifact.galleryColor,
                  selected ? 'ring-4 ring-primary/20' : '',
                ].join(' ')}
              >
                <div className="flex h-full flex-col justify-between">
                  <div className="flex h-40 w-full items-center justify-center overflow-hidden">
                    <img
                      className="h-full object-contain transition-transform group-hover:scale-110"
                      src={artifact.imageUrl}
                      alt={artifact.label}
                    />
                  </div>
                  <div>
                    <h5 className="font-headline-lg text-headline-lg text-sidebar-charcoal">{artifact.title}</h5>
                    <p className="mt-2 text-sm text-on-secondary-fixed-variant">{artifact.description}</p>
                    <div className="mt-6 flex items-center gap-3">
                      <span className="w-full rounded-full bg-white px-4 py-3 text-center font-label-caps text-label-caps uppercase text-sidebar-charcoal transition-colors group-hover:bg-sidebar-charcoal group-hover:text-white">
                        {selected ? 'Selected' : 'Select'}
                      </span>
                      {isForge ? <span className="material-symbols-outlined text-primary">add</span> : null}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}
