process.env.VUE_APP_VERSION = process.env.npm_package_version
const path = require('path')
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin')
const { VueLoaderPlugin } = require('vue-loader')

module.exports = {
    chainWebpack: (config) => {
        // TypeScript loader configuration
        config.module
            .rule('typescript')
            .test(/\.tsx?$/)
            .exclude.add(
                (filepath) =>
                    /node_modules/.test(filepath) && !/node_modules\/@ledgerhq/.test(filepath)
            )
            .end()
            .use('babel-loader')
            .loader('babel-loader')
            .options({
                presets: ['@babel/preset-env', '@babel/preset-typescript'],
            })
            .end()
            .use('ts-loader')
            .loader('ts-loader')
            .options({
                transpileOnly: true,
                appendTsSuffixTo: [/\.vue$/],
            })

        // Vue loader configuration
        config.module
            .rule('vue')
            .test(/\.vue$/)
            .use('vue-loader')
            .loader('vue-loader')
            .tap((options) => {
                return {
                    ...options,
                }
            })
            .end()

        // SCSS loader configuration
        config.module
            .rule('scss')
            .oneOf('vue')
            .use('sass-loader')
            .tap((options) => {
                return {
                    ...options,
                }
            })

        // Add resolve extensions
        config.resolve.extensions.merge(['.ts', '.tsx', '.vue'])

        // WebAssembly loader configuration
        config.module
            .rule('wasm')
            .test(/\.wasm$/)
            .type('webassembly/async')
    },
    productionSourceMap: false,
    transpileDependencies: ['vuetify'],
    devServer: {
        server: {
            type: 'https',
            // port: 5000,
        },
        // disableHostCheck: true,
        // https:
        // https: !process.env.USE_HTTP,
        port: 5000,
    },
    configureWebpack: {
        plugins: [
            new NodePolyfillPlugin(),

            // new VueLoaderPlugin()
        ],
        optimization: {
            splitChunks: {
                chunks: 'all',
                minSize: 600 * 1000,
                maxSize: 4000 * 1000,
            },
        },
        experiments: {
            asyncWebAssembly: true,
        },
        resolve: {
            symlinks: false,
            alias: {
                '@': path.resolve(__dirname, 'src'),
                '@public': path.resolve(__dirname, 'public'),
            },
            fallback: {
                buffer: require.resolve('buffer/'),
                ieee754: require.resolve('ieee754'),
                'base64-js': require.resolve('base64-js'),
                inherits: require.resolve('inherits'),
                process: require.resolve('process/browser'),
            },
        },
    },
    pwa: {
        name: 'LUX Wallet',
        manifestOptions: {
            start_url: '/',
        },
        iconPaths: {
            favicon16: 'img/icons/favicon-16x16.png',
            favicon32: 'img/icons/favicon-32x32.png',
            appleTouchIcon: 'img/icons/apple-touch-icon.png',
            maskIcon: 'img/icons/favicon-32x32.png',
            msTileImage: 'img/icons/mstile-150x150.png',
        },
    },
}
