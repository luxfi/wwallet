process.env.VUE_APP_VERSION = process.env.npm_package_version
const path = require('path')
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin')

module.exports = {
    chainWebpack: (config) => {
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

        // Add resolve extensions
        config.resolve.extensions.merge(['.ts', '.tsx'])
        config.module
            .rule('scss')
            .oneOf('vue')
            .use('sass-loader')
            .tap((options) => {
                return {
                    ...options,
                }
            })
    },
    productionSourceMap: false,
    transpileDependencies: ['vuetify'],
    devServer: {
        /**
         * For e2e testing we turn this off using vue cli --mode e2e
         * @link https://cli.vuejs.org/guide/mode-and-env.html#modes
         */
        https: !process.env.USE_HTTP,
        port: 5000,
    },
    configureWebpack: {
        plugins: [new NodePolyfillPlugin()],
        optimization: {
            splitChunks: {
                chunks: 'all',
                minSize: 600 * 1000,
                maxSize: 2000 * 1000,
            },
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
