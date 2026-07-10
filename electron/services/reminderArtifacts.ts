import type { ArtifactId, CalendarEventSummary } from '../../src/shared/contracts';
import { getArtifactId } from './settingsStore';

function pickKeywordArtifact(summary: string): ArtifactId | null {
  const text = summary.toLowerCase();

  if (text.includes('birthday')) {
    return 'santa';
  }

  if (text.includes('water')) {
    return 'ufo';
  }

  if (text.includes('eye') || text.includes('relax') || text.includes('break')) {
    return 'ghost';
  }

  if (text.includes('train')) {
    return 'train';
  }

  if (text.includes('flight') || text.includes('travel')) {
    return 'paper-plane';
  }

  return null;
}

export function getArtifactForEvent(event: CalendarEventSummary): ArtifactId {
  const keywordArtifact = pickKeywordArtifact(event.summary);
  if (keywordArtifact) {
    return keywordArtifact;
  }

  if (event.kind === 'task') {
    return 'cat';
  }

  if (event.label === 'Birthday') {
    return 'santa';
  }

  if (event.label === 'Focus') {
    return 'minimal';
  }

  if (event.meetingUrl) {
    return 'paper-plane';
  }

  return getArtifactId();
}

export function getArtifactForNamedReminder(title: string, fallback: ArtifactId = getArtifactId()): ArtifactId {
  return pickKeywordArtifact(title) ?? fallback;
}
