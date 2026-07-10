import type { ArtifactId } from '../contracts';
import catImage from '../assets/artifacts/cat.svg';
import ghostImage from '../assets/artifacts/ghost.svg';
import minimalImage from '../assets/artifacts/minimal.svg';
import paperPlaneImage from '../assets/artifacts/paper-plane.svg';
import rocketImage from '../assets/artifacts/rocket.svg';
import santaImage from '../assets/artifacts/santa.svg';
import trainImage from '../assets/artifacts/train.svg';
import ufoImage from '../assets/artifacts/ufo.svg';

export interface ArtifactDetails {
  id: ArtifactId;
  label: string;
  title: string;
  description: string;
  imageUrl: string;
  galleryColor: string;
  previewColor: string;
  previewState: string;
  previewHint: string;
}

export const artifactCatalog: ArtifactDetails[] = [
  {
    id: 'rocket',
    label: 'Rocket',
    title: 'Cosmic Voyager',
    description: 'A high-fidelity rocket artifact that pulses with a warm amber glow during focus sessions.',
    imageUrl: rocketImage,
    galleryColor: 'bg-white',
    previewColor: 'bg-sky-blue',
    previewState: 'State: Active',
    previewHint: 'Primed for deep-work launches',
  },
  {
    id: 'paper-plane',
    label: 'Paper Plane',
    title: 'Drift',
    description: 'Quietly gliding across your workspace to keep your attention in motion.',
    imageUrl: paperPlaneImage,
    galleryColor: 'bg-sky-blue',
    previewColor: 'bg-surface-container-highest',
    previewState: 'Peek mode active',
    previewHint: 'Hovers softly in your corner',
  },
  {
    id: 'ghost',
    label: 'Ghost',
    title: 'Spook',
    description: 'A friendly companion that appears only when your next task needs attention.',
    imageUrl: ghostImage,
    galleryColor: 'bg-flamingo-pink',
    previewColor: 'bg-lavender',
    previewState: 'State: Idle',
    previewHint: 'Watching for distractions',
  },
  {
    id: 'cat',
    label: 'Cat',
    title: 'Mochi',
    description: 'A moon-soft cat artifact that settles next to your focus sessions.',
    imageUrl: catImage,
    galleryColor: 'bg-sage-green',
    previewColor: 'bg-flamingo-pink',
    previewState: 'State: Cozy',
    previewHint: 'Ready for long focus blocks',
  },
  {
    id: 'train',
    label: 'Train',
    title: 'Night Line',
    description: 'Pulls your reminders across the top edge in a steady, readable rhythm.',
    imageUrl: trainImage,
    galleryColor: 'bg-lavender',
    previewColor: 'bg-sage-green',
    previewState: 'State: Rolling',
    previewHint: 'Keeps a steady schedule pace',
  },
  {
    id: 'ufo',
    label: 'UFO',
    title: 'Orbit',
    description: 'A hovering artifact with a quiet sci-fi pulse and wide-screen presence.',
    imageUrl: ufoImage,
    galleryColor: 'bg-honey-yellow',
    previewColor: 'bg-sky-blue',
    previewState: 'State: Scanning',
    previewHint: 'Tracks your next arrival window',
  },
  {
    id: 'santa',
    label: 'Santa',
    title: 'Holiday Run',
    description: 'Brings a festive overlay pass when you want reminders to feel playful.',
    imageUrl: santaImage,
    galleryColor: 'bg-flamingo-pink',
    previewColor: 'bg-honey-yellow',
    previewState: 'State: Cheerful',
    previewHint: 'Seasonal pass for soft alerts',
  },
  {
    id: 'minimal',
    label: 'Minimal',
    title: 'Mark',
    description: 'A stripped-back artifact for when you only want the message and motion.',
    imageUrl: minimalImage,
    galleryColor: 'bg-surface-container-highest',
    previewColor: 'bg-white',
    previewState: 'State: Minimal',
    previewHint: 'Only motion and message',
  },
];

export function getArtifactDetails(artifactId: ArtifactId): ArtifactDetails {
  return artifactCatalog.find((artifact) => artifact.id === artifactId) ?? artifactCatalog[0];
}
