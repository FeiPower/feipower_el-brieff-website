export type PlatformLink = {
  id: 'spotify' | 'apple' | 'deezer' | 'iheart' | 'radionet';
  label: string;
  url: string;
};

export type SiteConfig = {
  siteUrl: 'https://el-brieff.fei-d02.workers.dev';
  locale: 'es-MX';
  name: 'El Brieff';
  pitch: string;
  host: {
    name: 'Arturo Salazar Bazúa';
    alternateName: '@elchearturo';
  };
  producer: { name: 'Brieffy'; url: 'https://www.brieffy.com' };
  spotify: {
    showId: '20HgvkIWtkxDP44PguN1Wi';
    showUrl: 'https://open.spotify.com/show/20HgvkIWtkxDP44PguN1Wi';
    embedTheme: '0';
    embedHeight: 352;
  };
  platforms: PlatformLink[];
  social: { instagram: 'https://www.instagram.com/elbrieff/' };
  press: { to: 'arturo@strtgy.ai'; cc: 'mar@strtgy.ai' };
  ogImage: '/elbrieff-cover.png';
};

export const site: SiteConfig = {
  siteUrl: 'https://el-brieff.fei-d02.workers.dev',
  locale: 'es-MX',
  name: 'El Brieff',
  pitch:
    'Somos el podcast que te ayuda a informarte en 15 minutos al día con los temas de conversación más importantes de México y el mundo, conducido por Arturo Salazar (@elchearturo) y publicado de lunes a viernes.',
  host: {
    name: 'Arturo Salazar Bazúa',
    alternateName: '@elchearturo',
  },
  producer: {
    name: 'Brieffy',
    url: 'https://www.brieffy.com',
  },
  spotify: {
    showId: '20HgvkIWtkxDP44PguN1Wi',
    showUrl: 'https://open.spotify.com/show/20HgvkIWtkxDP44PguN1Wi',
    embedTheme: '0',
    embedHeight: 352,
  },
  platforms: [
    {
      id: 'spotify',
      label: 'Spotify',
      url: 'https://open.spotify.com/show/20HgvkIWtkxDP44PguN1Wi',
    },
    {
      id: 'apple',
      label: 'Apple Podcasts',
      url: 'https://podcasts.apple.com/mx/podcast/el-brieff/id1444545033',
    },
    {
      id: 'deezer',
      label: 'Deezer',
      url: 'https://www.deezer.com/es/show/5905047',
    },
    {
      id: 'iheart',
      label: 'iHeart',
      url: 'https://www.iheart.com/podcast/256-el-brieff-30974371/',
    },
    {
      id: 'radionet',
      label: 'radio.net',
      url: 'https://mx.radio.net/podcast/el-brieff',
    },
  ],
  social: {
    instagram: 'https://www.instagram.com/elbrieff/',
  },
  press: {
    to: 'arturo@strtgy.ai',
    cc: 'mar@strtgy.ai',
  },
  ogImage: '/elbrieff-cover.png',
};
