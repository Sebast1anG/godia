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
  ],
};
