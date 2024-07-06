
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath } from 'url';
import path from 'path';
import wasm from 'vite-plugin-wasm';
import vueJsx from '@vitejs/plugin-vue-jsx'
import { esbuildCommonjs } from '@originjs/vite-plugin-commonjs'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import commonjs from 'vite-plugin-commonjs'
const filename = fileURLToPath(import.meta.url);
const pathSegments = path.dirname(filename);

export default defineConfig({
  plugins: [
    vue(),
    wasm(),
    vueJsx(),
    nodePolyfills(),
    commonjs ()
  ],
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
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: '',
      },
      sass: {
        additionalData: '',
        indentedSyntax: true
      }
    }
  },
  optimizeDeps: {
    esbuildOptions: {
      target: 'esnext',
      // plugins:[
      //   esbuildCommonjs([''])
      // ]
    },
    include: ['vuetify']
  },
  esbuild: {
    supported: {
      'top-level-await': true
    },
    define: {
      global: 'globalThis'
    },
  },
  build: {
    target: 'esnext',
    sourcemap: false,
    chunkSizeWarningLimit: 4000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return id.toString().split('node_modules/')[1].split('/')[0].toString();
          }
        }
      }
    },
    commonjsOptions: { transformMixedEsModules: true } // enable require,
  },
  define: {
    // By default, Vite doesn't include shims for NodeJS/
    // necessary for segment analytics lib to work
    "global": {},
    // "process.env": {},
    "Buffer": Buffer,
    "process.env": process.env, 
    //"process.env.version" : '3.5',
    "process.browser": true,
  },
  server: {
    // port: 5000,
    proxy: {
      '/api': {
        target: 'https://api.lux.network/',
        changeOrigin: true,
        rewrite: (path) => path.replace('^/api', '')
      }
    },
    // https: true
  },
  // optimizeDeps: {
  //   exclude: ['buffer', 'ieee754', 'base64-js', 'inherits', 'process'],
  // },
  // define: {
  //   'process.env.VUE_APP_VERSION': JSON.stringify(process.env.npm_package_version),
  // },
})
