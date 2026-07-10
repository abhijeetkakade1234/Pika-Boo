import type { ArtifactId, CalendarEventSummary, ThemeRuleAssignment, ThemeRuleKey } from '../../src/shared/contracts';
import { listThemeRulesFromDb } from './historyDb';
import { getArtifactId } from './settingsStore';

const defaultThemeRules: ThemeRuleAssignment[] = [
  { key: 'task', label: 'Google Tasks', artifactId: 'cat', builtin: true },
  { key: 'meeting-link', label: 'Meetings with link', artifactId: 'paper-plane', builtin: true },
  { key: 'birthday', label: 'Birthdays', artifactId: 'santa', builtin: true },
  { key: 'focus-time', label: 'Focus time', artifactId: 'minimal', builtin: true },
  { key: 'water-break', label: 'Water break', artifactId: 'ufo', builtin: true },
  { key: 'eye-break', label: 'Eye relax break', artifactId: 'ghost', builtin: true },
  { key: 'stand-break', label: 'Stand and stretch', artifactId: 'train', builtin: true },
  { key: 'morning-briefing', label: 'Morning briefing', artifactId: 'rocket', builtin: true },
];

function mergedThemeRules(): ThemeRuleAssignment[] {
  const stored = listThemeRulesFromDb();
  const builtinOverrides = new Map(stored.filter((rule) => rule.builtin).map((rule) => [rule.key, rule.artifactId]));
  const customRules = stored.filter((rule) => !rule.builtin);

  return [
    ...customRules,
    ...defaultThemeRules.map((rule) => ({
      ...rule,
      artifactId: builtinOverrides.get(rule.key) ?? rule.artifactId,
    })),
  ];
}

function artifactForRule(key: ThemeRuleKey, fallback: ArtifactId): ArtifactId {
  return mergedThemeRules().find((rule) => rule.key === key)?.artifactId ?? fallback;
}

function artifactForCustomMatch(summary: string): ArtifactId | null {
  const text = summary.toLowerCase();
  const customRule = mergedThemeRules().find((rule) => !rule.builtin && rule.matchText && text.includes(rule.matchText.toLowerCase()));
  return customRule?.artifactId ?? null;
}

export function listThemeRules(): ThemeRuleAssignment[] {
  return mergedThemeRules();
}

export function getArtifactForEvent(event: CalendarEventSummary): ArtifactId {
  const customMatch = artifactForCustomMatch(event.summary);
  if (customMatch) {
    return customMatch;
  }

  if (event.kind === 'task') {
    return artifactForRule('task', 'cat');
  }

  if (event.label === 'Birthday') {
    return artifactForRule('birthday', 'santa');
  }

  if (event.label === 'Focus') {
    return artifactForRule('focus-time', 'minimal');
  }

  if (event.meetingUrl) {
    return artifactForRule('meeting-link', 'paper-plane');
  }

  return getArtifactId();
}

export function getArtifactForNamedReminder(key: ThemeRuleKey, fallback: ArtifactId = getArtifactId(), title?: string): ArtifactId {
  const customMatch = title ? artifactForCustomMatch(title) : null;
  return customMatch ?? artifactForRule(key, fallback);
}
