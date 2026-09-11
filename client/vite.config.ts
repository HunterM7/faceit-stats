import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import viteChecker from 'vite-plugin-checker';
import path from 'path';

function ssrCssNoop(): Plugin {
  return {
    name: 'ssr-css-noop',
    apply: 'build',
    enforce: 'pre',
    transform(_code, id) {
      if (!/\.(css|scss)(?:$|\?)/.test(id)) {
        return;
      }
      return { code: 'export default {}', map: null };
    },
  };
}

// https://vite.dev/config/
export default defineConfig(({ command, isSsrBuild }) => ({
  cacheDir: path.resolve(__dirname, '../.cache/vite-client'),
  plugins: [
    react(),
    ...(isSsrBuild ? [ ssrCssNoop() ] : []),
    ...(command === 'serve' ? [
      viteChecker({
        typescript: {
          tsconfigPath: './tsconfig.app.json',
        },
        eslint: {
          lintCommand: 'eslint "./src/**/*.{ts,tsx}"',
        },
      }),
    ] : []),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@components': path.resolve(__dirname, 'src/components'),
      '@widgets': path.resolve(__dirname, 'src/widgets'),
      '@pages': path.resolve(__dirname, 'src/pages'),
      '@utils': path.resolve(__dirname, 'src/utils'),
      '@config': path.resolve(__dirname, 'src/config'),
      '@requests': path.resolve(__dirname, 'src/requests'),
      '@images': path.resolve(__dirname, 'src/images'),
    },
  },
  build: isSsrBuild
    ? { outDir: 'dist-ssr', emptyOutDir: true }
    : { manifest: true },
  server: {
    host: '127.0.0.1',
    port: 5173,
    strictPort: true,
  },
}));
