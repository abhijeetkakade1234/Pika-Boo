import type { ArtifactId } from '../contracts';

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
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuARzeS3Z8VVuMijwUFetHDmL-IyXRoY_izBF55OOf0gBi9QLwo9vFtbhGRTvf7YyGfa9FfCGG_4OvcT2NAegP8H9b50XbHvyyzSreeTZ4mP5LbnWk49IYVv1XlOgez220q9eWeJ5AzPw8eLR3Re5_wf5b9PuTm60liSXWxmW08WG68o0NmAtsa1vhTwpXHGFbu5GFifqoK0S-aBXvHk4naOvuqKWOvFOSEZb8A83_4XHQ1wwjeL_xZzKA',
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
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDJ_0cCVDAO4K2EIGGWHcAkEWVQ8K5Z1t3oR9HFxG3gyfenmrD67TO2WRYrl8h1B4dzf6DNVZrp1CkiHN1L305dYLfXne_uVg2nEAYfRaIllCfDcEGxGAc6tkmLYXj9KsM9r1sMaw3pkAt7Ax_HoKg4FlbvuC5U6BRosRwmUO3TRi6gAcOnKjTSf1YWERkLlVYcdSD_o7jsAqKlTFKeJZYtrJWROd45HEAKCyHK8bYD87HAvswRC4rjUA',
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
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAryom8KJBIbv0mU-oCsUiFvQZ1D_x-61sNLYZqc3P0ZD_qCV_Nf531HGXIxHZ8uZ1bcZ2dEL6zMvC_9YKNcPiZZv18NmVvWCcmNsh5hi7fH42pR3JV3tSCek_pGObCMbtVYHaJsIQ-NaZ_YKRJc3lauub9ncJc7bT2U4V2UtIS40GRxV7ii8Q4SePy1TsZhikHmNMJfla84zzJzy-VeOrcSK5sGwIbmYkGBkKntMj12OHN6JphJTpjPw',
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
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBM9zzl1KpafDpIvdUX2kadVx6Y02pZthhNnVJMRJG6GzOx0wUV03zhK6Y0-0jCRJhnUUMjMXIpF1fSLfv_-RcNwWSg3l9qXnHgIXYfhWTJvgspX03Bbpt0ixYAEUXCwT7AHLRTzSStK3FDQQcXECiBJ-dOJm1omTNsh1qAcBi6oIgYUjuPax18hzXNXDitqTQem-Ey5CFKfXbXuXXdsJh3FPfAlsakx6O5EgB6FulKOb3dnSRmTEAjfg',
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
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDJ_0cCVDAO4K2EIGGWHcAkEWVQ8K5Z1t3oR9HFxG3gyfenmrD67TO2WRYrl8h1B4dzf6DNVZrp1CkiHN1L305dYLfXne_uVg2nEAYfRaIllCfDcEGxGAc6tkmLYXj9KsM9r1sMaw3pkAt7Ax_HoKg4FlbvuC5U6BRosRwmUO3TRi6gAcOnKjTSf1YWERkLlVYcdSD_o7jsAqKlTFKeJZYtrJWROd45HEAKCyHK8bYD87HAvswRC4rjUA',
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
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBrGBdM-ja_hgv2x7vZZjv_PTQ94QsDnrVmPJjCd9dDlvWJi12v3SE-hMQsewkAUewSj59RLHUhCEW7eK49ECuUYfVUC5SU6zhAgFIecqg_BjeSCHaaRQaylP4Ty17nEAVVT1ngXix4JzspoW0u0W4-jNCFHBu8iy1MH3VPrQ9sSVRW8F7ghbkjkTofaLpRG7_MjL2MHnpBa07twlhW1H54_8PBCg6HVerBiwDPlxRMlu6BIl4oZdWIow',
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
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDJ_0cCVDAO4K2EIGGWHcAkEWVQ8K5Z1t3oR9HFxG3gyfenmrD67TO2WRYrl8h1B4dzf6DNVZrp1CkiHN1L305dYLfXne_uVg2nEAYfRaIllCfDcEGxGAc6tkmLYXj9KsM9r1sMaw3pkAt7Ax_HoKg4FlbvuC5U6BRosRwmUO3TRi6gAcOnKjTSf1YWERkLlVYcdSD_o7jsAqKlTFKeJZYtrJWROd45HEAKCyHK8bYD87HAvswRC4rjUA',
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
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuB3sbBan7l2pY2C3NoKbGMxMIW5Q-kcrr62acaPKR7qOQCOyUEqXHJLSRTvKKdcE5P5pOxT48I39DsrE_nU3qdc0YAXVVJNzTlysGFCM7dHn0c7KJQGOMybBALCJfzMMiHNBUsL9xRVTW6VuRq-K0Y3gU7bW-i75kLJ3OeASEKduofzNEZHouDUPq6fwZX2fuO5-VfVu-7FHIN4Cy1QCeb8SvqzJ4wtRCWY4QQaRUOpF57qFoSq_yDByw',
    galleryColor: 'bg-surface-container-highest',
    previewColor: 'bg-white',
    previewState: 'State: Minimal',
    previewHint: 'Only motion and message',
  },
];

export function getArtifactDetails(artifactId: ArtifactId): ArtifactDetails {
  return artifactCatalog.find((artifact) => artifact.id === artifactId) ?? artifactCatalog[0];
}
