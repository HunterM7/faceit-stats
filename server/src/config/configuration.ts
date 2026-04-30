import path from 'node:path';

export const configuration = () => ({
  app: {
    port: Number(process.env.PORT || 3333),
    corsOrigin: process.env.CLIENT_URL || '',
    // Resolve from compiled server directory, not process cwd.
    webDistPath: path.resolve(__dirname, '..', '..', 'client', 'dist'),
  },
  faceit: {
    apiKey: process.env.FACEIT_API_KEY || '',
    gameId: 'cs2',
  },
  admin: {
    login: process.env.ADMIN_LOGIN || '',
    password: process.env.ADMIN_PASSWORD || '',
  },
});
