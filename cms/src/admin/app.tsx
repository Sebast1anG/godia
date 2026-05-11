import type { StrapiApp } from '@strapi/strapi/admin';

const GameIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
    <path d="M17 4H7C3.13 4 0 7.13 0 11s3.13 7 7 7h10c3.87 0 7-3.13 7-7s-3.13-7-7-7zm-9 8H7v1a1 1 0 01-2 0v-1H4a1 1 0 010-2h1v-1a1 1 0 012 0v1h1a1 1 0 010 2zm7 1a1 1 0 110-2 1 1 0 010 2zm2-3a1 1 0 110-2 1 1 0 010 2z"/>
  </svg>
);

export default {
  config: {
    locales: ['pl'],
  },
  bootstrap(app: StrapiApp) {
    app.addMenuLink({
      to: '/game-manager',
      icon: GameIcon,
      intlLabel: {
        id: 'game-manager.label',
        defaultMessage: 'Zarządzanie grą',
      },
      Component: () =>
        import('./extensions/GameManager').then(m => ({ default: m.default })),
    });
  },
};
