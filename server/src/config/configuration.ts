import path from 'node:path';

/** Идентификатор игры CS2 на FACEIT. */
export const CS2_FACEIT_GAME_ID = 'cs2' as const;

export const configuration = () => ({
  app: {
    port: Number(process.env.PORT || 3333),
    corsOrigin: process.env.CLIENT_URL || '',
    // Resolve from compiled server directory, not process cwd.
    webDistPath: path.resolve(__dirname, '..', '..', 'client', 'dist'),
  },
  faceit: {
    apiKey: process.env.FACEIT_API_KEY || '',
    gameId: CS2_FACEIT_GAME_ID,
  },
  admin: {
    login: process.env.ADMIN_LOGIN || '',
    password: process.env.ADMIN_PASSWORD || '',
  },
});
