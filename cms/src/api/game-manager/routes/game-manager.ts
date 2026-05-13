export default {
  routes: [
    {
      method: 'GET',
      path: '/game-manager/users',
      handler: 'game-manager.listUsers',
      config: { auth: false, policies: [] },
    },
    {
      method: 'GET',
      path: '/game-manager/users/:userId/characters',
      handler: 'game-manager.listCharacters',
      config: { auth: false, policies: [] },
    },
    {
      method: 'DELETE',
      path: '/game-manager/characters/:charId',
      handler: 'game-manager.deleteCharacter',
      config: { auth: false, policies: [] },
    },
    {
      method: 'GET',
      path: '/game-manager/accounts/search',
      handler: 'game-manager.searchAccounts',
      config: { auth: false, policies: [] },
    },
    {
      method: 'PUT',
      path: '/game-manager/accounts/:userId',
      handler: 'game-manager.updateAccount',
      config: { auth: false, policies: [] },
    },
    {
      method: 'GET',
      path: '/game-manager/accounts/:userId/login-history',
      handler: 'game-manager.getLoginHistory',
      config: { auth: false, policies: [] },
    },
  ],
};
