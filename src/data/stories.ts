import keplerPoster from '../assets/images/kepler_scifi_poster_1792679202175.jpg';
import fogPoster from '../assets/images/nordic_fog_poster_1792679202682.jpg';
import neonPoster from '../assets/images/neon_cyberpunk_poster_1792679204523.jpg';
import { StoryData } from '../types';
import { CINEMATIC_SCENES } from './scenes';

export const STORIES: StoryData[] = [
  {
    id: 'kepler-last-light',
    title: 'ACTORSELF: Última luz de Kepler',
    tagline: 'La estrella se apaga. La tripulación depende de una sola orden.',
    genre: 'Ciencia Ficción & Aventura',
    durationLabel: '15.0s · Escena Cinematográfica Autorizada',
    setting: 'Interior del puente de mando de la fragata estelar Kepler-One, a 0.2 unidades astronómicas de la estrella moribunda Kepler-452.',
    synopsis: 'Durante una misión de cartografía en los confines del sector exterior, una anomalía gravitatoria arrastra a la nave hacia el horizonte de radiación de una estrella inestable. Como Comandante, debes ejecutar la maniobra de escape hiperespacial antes de que la cabina colapse.',
    coverImage: keplerPoster,
    isAvailable: true,
    badge: 'HISTORIA AUTORIZADA · SALTO HIPERESPACIAL',
    roles: [
      {
        id: 'commander',
        name: 'Comandante de la Nave',
        rank: 'Líder de Misión Orbital (Nikolaj Coster-Waldau)',
        description: 'Máxima autoridad a bordo. Responsable de la navegación crítica, la toma de decisiones bajo fuego estelar y la activación del salto hiperespacial.',
        type: 'Protagonista Principal',
        suitColor: '#1e3a8a',
        avatarIcon: 'Shield',
      },
    ],
    scenes: [CINEMATIC_SCENES[0]],
  },
  {
    id: 'secret-of-the-fog',
    title: 'El Secreto de la Niebla',
    tagline: 'En un archipiélago donde la niebla nunca despeja, la verdad tiene un precio.',
    genre: 'Misterio & Thriller Nórdico',
    durationLabel: '15.0s · Escena Cinematográfica Autorizada',
    setting: 'Un faro centenario aislado en las costas de Noruega.',
    synopsis: 'Un detective privado investiga la desaparición de un convoy marítimo en el mar del norte y descubre señales cifradas en las rocas submarinas.',
    coverImage: fogPoster,
    isAvailable: true,
    badge: 'HISTORIA AUTORIZADA · INTERROGATORIO NOIR',
    roles: [
      {
        id: 'detective',
        name: 'Inspector Miller',
        rank: 'Investigador Principal (Mads Mikkelsen)',
        description: 'Lidera la reconstrucción de los hechos y la confrontación en el faro bajo la tormenta.',
        type: 'Protagonista Principal',
        suitColor: '#334155',
        avatarIcon: 'Compass',
      },
    ],
    scenes: [CINEMATIC_SCENES[1]],
  },
  {
    id: 'neon-city-2099',
    title: 'Ciudad Neón 2099',
    tagline: 'En la megalópolis subterránea, tu memoria es la única mercancía que importa.',
    genre: 'Cyberpunk & Acción',
    durationLabel: '15.0s · Escena Cinematográfica Autorizada',
    setting: 'Nivel 14 de Neo-Shinjuku, rascacielos sumergidos bajo lluvia ácida.',
    synopsis: 'Un mensajero de datos intercepta un nanodisco con la clave para restaurar el suministro de energía limpia de toda la ciudad mientras es perseguido por drones corporativos.',
    coverImage: neonPoster,
    isAvailable: true,
    badge: 'HISTORIA AUTORIZADA · FUGA EN CORNISA',
    roles: [
      {
        id: 'runner',
        name: 'Agente Kaelen',
        rank: 'Infiltrado / Hacker (Keanu Reeves)',
        description: 'Especialista en evasión de drones corporativos en las cornisas iluminadas por neones.',
        type: 'Protagonista Principal',
        suitColor: '#059669',
        avatarIcon: 'Zap',
      },
    ],
    scenes: [CINEMATIC_SCENES[2]],
  },
];
