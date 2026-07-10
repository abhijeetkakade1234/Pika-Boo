import { useState } from 'react';
import { artifactCatalog, getArtifactDetails } from '../../../shared/data/artifacts';
import type { ArtifactId, RuntimeStatus, ThemeRuleAssignment } from '../../../shared/contracts';
import { TopBar } from '../../../shared/ui/TopBar';

const assignmentGroups = [
  {
    title: 'Calendar',
    keys: ['meeting-link', 'birthday', 'focus-time'] as const,
    samples: {
      'meeting-link': 'Weekly sync',
      birthday: 'Mom birthday dinner',
      'focus-time': 'No-meeting focus block',
    },
  },
  {
    title: 'Tasks',
    keys: ['task'] as const,
    samples: {
      task: 'Pay electricity bill',
    },
  },
  {
    title: 'Wellness',
    keys: ['water-break', 'eye-break', 'morning-briefing'] as const,
    samples: {
      'water-break': 'Hydrate before the next stretch',
      'eye-break': 'Look away for 20 seconds',
      'morning-briefing': 'First event at 10:00 AM',
    },
  },
];

export function ThemesPage({
  artifactId,
  runtimeStatus,
  themeRules,
  busy,
  pendingAction,
  onSelectArtifact,
  onSaveThemeRule,
  onAddThemeRule,
  onDeleteThemeRule,
  onShowDemo,
}: {
  artifactId: ArtifactId;
  runtimeStatus: RuntimeStatus | null;
  themeRules: ThemeRuleAssignment[];
  busy: boolean;
  pendingAction: string;
  onSelectArtifact: (artifactId: ArtifactId) => Promise<void>;
  onSaveThemeRule: (key: ThemeRuleAssignment['key'], artifactId: ArtifactId) => Promise<void>;
  onAddThemeRule: (label: string, matchText: string, artifactId: ArtifactId) => Promise<void>;
  onDeleteThemeRule: (key: string) => Promise<void>;
  onShowDemo: () => Promise<void>;
}) {
  const selectedArtifact = getArtifactDetails(artifactId);
  const rulesByKey = new Map(themeRules.map((rule) => [rule.key, rule]));
  const customRules = themeRules.filter((rule) => !rule.builtin);
  const [newLabel, setNewLabel] = useState('');
  const [newMatchText, setNewMatchText] = useState('');
  const [newArtifactId, setNewArtifactId] = useState<ArtifactId>('ghost');

  async function handleAddRule(): Promise<void> {
    if (!newLabel.trim() || !newMatchText.trim()) {
      return;
    }

    await onAddThemeRule(newLabel.trim(), newMatchText.trim(), newArtifactId);
    setNewLabel('');
    setNewMatchText('');
    setNewArtifactId('ghost');
  }

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
        <section className="col-span-12 rounded-[28px] bg-white p-widget-padding shadow-card-soft lg:col-span-4">
          <h1 className="font-headline-lg text-headline-lg text-sidebar-charcoal">Default Theme</h1>
          <div className="mt-6 rounded-[28px] p-6 text-center shadow-card-soft">
            <img className="mx-auto h-40 w-40 object-contain" src={selectedArtifact.imageUrl} alt={selectedArtifact.label} />
            <div className="mt-4 font-headline-lg text-headline-lg text-sidebar-charcoal">{selectedArtifact.title}</div>
            <div className="mt-2 text-sm text-sidebar-charcoal/60">{selectedArtifact.description}</div>
            <div className="mt-4 text-xs uppercase tracking-widest text-sidebar-charcoal/50">
              Reminder cadence: {(runtimeStatus?.reminderLeadTimes ?? [30, 5, 1]).join(' / ')}m
            </div>
          </div>

          <div className="mt-6 rounded-[28px] bg-surface-container p-5">
            <div className="font-body-md font-bold text-sidebar-charcoal">Fallback Behavior</div>
            <div className="mt-2 text-sm text-sidebar-charcoal/60">
              If no smart rule matches, the app uses <span className="font-semibold text-sidebar-charcoal">{selectedArtifact.label}</span>.
            </div>
          </div>
        </section>

        <section className="col-span-12 rounded-[28px] bg-flamingo-pink p-widget-padding shadow-card-pink lg:col-span-8">
          <h2 className="font-headline-lg text-headline-lg text-sidebar-charcoal">Auto Rules</h2>
          <div className="mt-3 text-sm text-sidebar-charcoal/60">Built-in types can be changed. Custom keyword rules are checked first and saved locally in SQLite.</div>

          <div className="mt-8 space-y-5">
            {assignmentGroups.map((group) => (
              <div key={group.title} className="rounded-[24px] bg-white/45 p-5">
                <div className="font-label-caps text-label-caps uppercase text-sidebar-charcoal/50">{group.title}</div>
                <div className="mt-4 space-y-3">
                  {group.keys.map((key) => {
                    const rule = rulesByKey.get(key);
                    const artifact = getArtifactDetails(rule?.artifactId ?? artifactId);
                    return (
                      <div key={key} className="rounded-2xl bg-white/70 p-4">
                        <div className="flex items-start gap-3">
                          <img className="h-12 w-12 shrink-0 object-contain" src={artifact.imageUrl} alt={artifact.label} />
                          <div className="min-w-0 flex-1">
                            <div className="text-sm font-semibold text-sidebar-charcoal">{rule?.label ?? key}</div>
                            <div className="mt-1 text-sm text-sidebar-charcoal/60">{group.samples[key]}</div>
                            <select
                              value={rule?.artifactId ?? artifactId}
                              disabled={busy}
                              onChange={(event) => void onSaveThemeRule(key, event.target.value as ArtifactId)}
                              className="control-field mt-3"
                            >
                              {artifactCatalog.map((option) => (
                                <option key={option.id} value={option.id}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            <div className="rounded-[24px] bg-white/45 p-5">
              <div className="font-label-caps text-label-caps uppercase text-sidebar-charcoal/50">Custom Keyword Rules</div>
              <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
                <input value={newLabel} onChange={(event) => setNewLabel(event.target.value)} className="control-field" placeholder="Rule label" />
                <input value={newMatchText} onChange={(event) => setNewMatchText(event.target.value)} className="control-field" placeholder="Match text" />
                <select value={newArtifactId} onChange={(event) => setNewArtifactId(event.target.value as ArtifactId)} className="control-field">
                  {artifactCatalog.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <button type="button" disabled={busy} onClick={() => void handleAddRule()} className="action-pill mt-4">
                {pendingAction === 'add-theme-rule' ? 'Adding...' : 'Add Rule'}
              </button>

              <div className="mt-4 space-y-3">
                {customRules.length > 0 ? (
                  customRules.map((rule) => {
                    const artifact = getArtifactDetails(rule.artifactId);
                    return (
                      <div key={rule.key} className="flex flex-col gap-3 rounded-2xl bg-white/70 p-4 md:flex-row md:items-center md:justify-between">
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-sidebar-charcoal">{rule.label}</div>
                          <div className="text-sm text-sidebar-charcoal/60">Matches: {rule.matchText}</div>
                          <div className="font-label-caps text-label-caps uppercase text-primary">{artifact.label}</div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <select
                            value={rule.artifactId}
                            disabled={busy}
                            onChange={(event) => void onSaveThemeRule(rule.key, event.target.value as ArtifactId)}
                            className="control-field"
                          >
                            {artifactCatalog.map((option) => (
                              <option key={option.id} value={option.id}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                          <button type="button" disabled={busy} onClick={() => void onDeleteThemeRule(rule.key)} className="action-pill">
                            {pendingAction === 'delete-theme-rule' ? 'Removing...' : 'Remove'}
                          </button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="rounded-2xl bg-white/70 p-4 text-sm text-sidebar-charcoal/60">
                    No custom keyword rules yet.
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="col-span-12 rounded-[28px] bg-white p-widget-padding shadow-card-soft">
          <h2 className="font-headline-lg text-headline-lg text-sidebar-charcoal">Available Themes</h2>
          <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            {artifactCatalog.map((artifact) => {
              const selected = artifact.id === artifactId;

              return (
                <button
                  key={artifact.id}
                  type="button"
                  disabled={busy}
                  onClick={() => void onSelectArtifact(artifact.id)}
                  className={`flex min-h-[180px] flex-col rounded-[24px] bg-surface-container p-5 text-left transition hover:bg-white ${selected ? 'ring-4 ring-primary/20' : ''}`}
                >
                  <div className="flex items-start gap-4">
                    <img className="h-16 w-16 shrink-0 object-contain" src={artifact.imageUrl} alt={artifact.label} />
                    <div className="min-w-0 flex-1">
                      <div className="text-card-title font-body-md font-bold text-sidebar-charcoal">{artifact.label}</div>
                      <div className="text-card-copy mt-1 text-sm text-sidebar-charcoal/60">{artifact.previewHint}</div>
                    </div>
                  </div>
                  <div className="mt-auto pt-4 font-label-caps text-label-caps uppercase text-primary">
                    {pendingAction === 'save-artifact' && selected ? 'Saving...' : selected ? 'Selected' : 'Use'}
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
