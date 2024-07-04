
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath } from 'url';
import path from 'path';
import wasm from 'vite-plugin-wasm';
import vueJsx from '@vitejs/plugin-vue-jsx'

const filename = fileURLToPath(import.meta.url);
const pathSegments = path.dirname(filename);

export default defineConfig({
  plugins: [
    vue(),
    wasm(),
    vueJsx(),
  ],
  // optimizeDeps: {
  //   disabled: true,
  // },
  resolve: {
    alias: {
      '@': path.resolve(pathSegments, './src'),
      '@public': path.resolve(__dirname, 'public'),
      'bip32': path.resolve(__dirname, 'node_modules/bip32/src/index.js'),
      'vue': '@vue/compat',
      'crypto': 'crypto-browserify',
      'stream': 'stream-browserify',
      '@luxfi/hw-app-lux': path.resolve(__dirname, './node_modules/@luxfi/hw-app-lux/lib/Lux.js'),
    },
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', ".vue"],
  },
  optimizeDeps: {
    esbuildOptions: {
      target: 'esnext'
    }
  },
  esbuild: {
    supported: {
      'top-level-await': true
    },
  },
  build: {
    target: 'esnext',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return 'vendor'
          }
        },
      },
    },
  },
  // server: {
  //   proxy: {
  //     '/api': {
  //       target: 'https://api.lux.network',
  //       changeOrigin: true,
  //       rewrite: (path) => path.replace(/^\/api/, ''),
  //     },
  //   },
  //   // https: true,
  //   // port: 5000,
  // },
  // optimizeDeps: {
  //   exclude: ['buffer', 'ieee754', 'base64-js', 'inherits', 'process'],
  // },
  // define: {
  //   'process.env.VUE_APP_VERSION': JSON.stringify(process.env.npm_package_version),
  // },
})
