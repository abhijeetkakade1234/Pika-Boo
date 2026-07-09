export function PlaceholderPage({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="grid grid-cols-12 gap-bento-gutter">
      <section className="bento-card col-span-12 rounded-[28px] bg-white p-widget-padding shadow-card-soft lg:col-span-8">
        <span className="status-pill mb-6">Ambient Space</span>
        <h1 className="font-headline-xl text-headline-xl text-sidebar-charcoal">{title}</h1>
        <p className="mt-4 max-w-2xl font-body-lg text-body-lg text-on-surface-variant">
          {description}
        </p>
      </section>
      <section className="bento-card col-span-12 rounded-[28px] bg-surface-container p-widget-padding shadow-card-soft lg:col-span-4">
        <h2 className="font-headline-lg text-headline-lg text-sidebar-charcoal">Template Hold</h2>
        <p className="mt-3 text-on-surface-variant">
          This panel stays intentionally simple. The main template screens are Mission Control,
          Artifacts, and the reminder overlay.
        </p>
      </section>
    </div>
  );
}
