export type PlatformLink = {
  id: 'spotify' | 'apple' | 'deezer' | 'iheart' | 'radionet';
  label: string;
  url: string;
};

export type SiteConfig = {
  siteUrl: 'https://el-brieff.strtgy.ai';
  locale: 'es-MX';
  name: 'El Brieff';
  pitch: string;
  host: {
    name: 'Arturo Salazar Bazúa';
    alternateName: '@elchearturo';
    bioShort: string;
    bioLong: string;
  };
  producer: { name: 'Brieffy' };
  spotify: {
    showId: '20HgvkIWtkxDP44PguN1Wi';
    showUrl: 'https://open.spotify.com/show/20HgvkIWtkxDP44PguN1Wi';
    embedTheme: '0';
    embedHeight: 352;
  };
  platforms: PlatformLink[];
  social: { instagram: 'https://www.instagram.com/elbrieff/' };
  press: {
    from: 'prensa@strtgy.ai';
    to: 'arturo@strtgy.ai';
    cc: 'mar@strtgy.ai';
  };
  features: {
    mediaKitEmailEnabled: boolean;
  };
  /** Public editorial surfaces introduced by the CMS control plane. */
  editorial: {
    opinionBasePath: '/opinion/';
    adminBasePath: '/admin/';
    rssPath: '/rss.xml';
    syndicationPath: '/syndication.xml';
    agentApiPath: '/api/admin/agent';
  };
  ogImage: '/elbrieff-cover.png';
};

const hostBioLong =
  'Arturo Salazar Bazúa (conocido en redes sociales como @elchearturo) es un emprendedor, estratega de negocios y comunicador mexicano. Es reconocido principalmente por su rol como creador y conductor de El Brieff, uno de los podcasts diarios de noticias y actualidad empresarial más escuchados en México y Latinoamérica. Adicionalmente es cofundador STRTGY, una empresa de ingeniería de soluciones centrada en la inteligencia de decisiones. Es titular del podcast InteligencIA, donde analiza el impacto de la inteligencia artificial generativa, la automatización y la productividad en el entorno corporativo. Participa de forma habitual como conferencista, analista y panelista en foros de tecnología, innovación y emprendimiento.';

const hostBioShort =
  'Arturo Salazar Bazúa (conocido en redes sociales como @elchearturo) es un emprendedor, estratega de negocios y comunicador mexicano. Es reconocido principalmente por su rol como creador y conductor de El Brieff, uno de los podcasts diarios de noticias y actualidad empresarial más escuchados en México y Latinoamérica.';

export const site: SiteConfig = {
  siteUrl: 'https://el-brieff.strtgy.ai',
  locale: 'es-MX',
  name: 'El Brieff',
  pitch:
    'Somos el podcast que te ayuda a informarte en 15 minutos al día con los temas de conversación más importantes de México y el mundo, conducido por Arturo Salazar (@elchearturo) y publicado de lunes a viernes.',
  host: {
    name: 'Arturo Salazar Bazúa',
    alternateName: '@elchearturo',
    bioShort: hostBioShort,
    bioLong: hostBioLong,
  },
  producer: {
    name: 'Brieffy',
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
    from: 'prensa@strtgy.ai',
    to: 'arturo@strtgy.ai',
    cc: 'mar@strtgy.ai',
  },
  features: {
    mediaKitEmailEnabled: false,
  },
  editorial: {
    opinionBasePath: '/opinion/',
    adminBasePath: '/admin/',
    rssPath: '/rss.xml',
    syndicationPath: '/syndication.xml',
    agentApiPath: '/api/admin/agent',
  },
  ogImage: '/elbrieff-cover.png',
};
