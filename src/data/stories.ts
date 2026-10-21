import { StoryData } from '../types';

export const STORIES: StoryData[] = [
  {
    id: 'kepler-last-light',
    title: 'ACTORSELF: Última luz de Kepler',
    tagline: 'La estrella se apaga. La tripulación depende de una sola orden.',
    genre: 'Ciencia Ficción & Aventura',
    durationLabel: '5.0 segundos · Demo Oficial',
    setting: 'Interior del puente de mando de la fragata estelar Kepler-One, a 0.2 unidades astronómicas de la estrella moribunda Kepler-452.',
    synopsis: 'Durante una misión de cartografía en los confines del sector exterior, una anomalía gravitatoria arrastra a la nave hacia el horizonte de radiación de una estrella inestable. Como Comandante, debes ejecutar la maniobra de escape hiperespacial antes de que la cabina colapse.',
    coverImage: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
    isAvailable: true,
    badge: 'HISTORIA ORIGINAL DISPONIBLE',
    roles: [
      {
        id: 'commander',
        name: 'Comandante de la Nave',
        rank: 'Líder de Misión Orbital',
        description: 'Máxima autoridad a bordo. Responsable de la navegación crítica, la toma de decisiones bajo fuego estelar y la activación del salto hiperespacial.',
        type: 'Protagonista Principal',
        suitColor: '#1e3a8a',
        avatarIcon: 'Shield'
      }
    ]
  },
  {
    id: 'secret-of-the-fog',
    title: 'El Secreto de la Niebla',
    tagline: 'En un archipiélago donde la niebla nunca despeja, la verdad tiene un precio.',
    genre: 'Misterio & Thriller Nórdico',
    durationLabel: 'Próximamente en Prime Video',
    setting: 'Un faro centenario aislado en las costas de Noruega.',
    synopsis: 'Un detective privado investiga la desaparición de un convoy marítimo y descubre señales cifradas en las rocas submarinas.',
    coverImage: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
    isAvailable: false,
    badge: 'PRÓXIMO TÍTULO EN CATÁLOGO',
    roles: [
      {
        id: 'detective',
        name: 'Detective Asignado',
        rank: 'Investigador Principal',
        description: 'Lidera la reconstrucción de los hechos y la búsqueda en el faro.',
        type: 'Protagonista',
        suitColor: '#334155',
        avatarIcon: 'Compass'
      }
    ]
  },
  {
    id: 'neon-city-2099',
    title: 'Ciudad Neón 2099',
    tagline: 'En la megalópolis subterránea, tu memoria es la única mercancía que importa.',
    genre: 'Cyberpunk & Acción',
    durationLabel: 'Próximamente en Prime Video',
    setting: 'Nivel 14 de Neo-Shinjuku, rascacielos sumergidos bajo lluvia ácida.',
    synopsis: 'Un mensajero de datos intercepta un nanodisco con la clave para restaurar el suministro de energía limpia de toda la ciudad.',
    coverImage: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=800&q=80',
    isAvailable: false,
    badge: 'EN DESARROLLO DE DERECHOS',
    roles: [
      {
        id: 'runner',
        name: 'Mensajero Hacker',
        rank: 'Infiltrado',
        description: 'Especialista en evasión de drones corporativos.',
        type: 'Protagonista',
        suitColor: '#059669',
        avatarIcon: 'Zap'
      }
    ]
  }
];
