const path = require('path')
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin')
const { VuetifyPlugin } = require('webpack-plugin-vuetify')

process.env.VUE_APP_VERSION = process.env.npm_package_version

module.exports = {
    chainWebpack: (config) => {
        config.resolve.alias.set('vue', '@vue/compat')

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
                    compilerOptions: {
                        compatConfig: {
                            MODE: 3,
                        },
                    },
                }
            })
            .end()

        // Add resolve extensions
        config.resolve.extensions.merge(['.ts', '.tsx', '.vue'])

        // WebAssembly loader configuration
        config.module
            .rule('wasm')
            .test(/\.wasm$/)
            .type('webassembly/async')
    },
    productionSourceMap: false,
    devServer: {
        proxy: {
            '/api': {
                target: 'https://api.lux.network',
                changeOrigin: true,
                pathRewrite: {
                    '^/api': '',
                },
            },
        },
        server: {
            type: 'https',
        },
        port: 5000,
    },
    configureWebpack: {
        plugins: [
            new NodePolyfillPlugin(),
            new VuetifyPlugin({
                autoImport: true, // 启用自动导入
            }),
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
                bip32: path.resolve(__dirname, 'node_modules/bip32/src/index.js'),
            },
            fallback: {
                buffer: require.resolve('buffer/'),
                ieee754: require.resolve('ieee754'),
                'base64-js': require.resolve('base64-js'),
                inherits: require.resolve('inherits'),
                process: require.resolve('process/browser'),
                fs: false, // 确保 fs 模块在浏览器环境中被替换
            },
        },
    },
    pluginOptions: {
        vuetify: {
            // 你可以在这里添加任何 vuetify 插件的选项
            // 例如： customVariables: ['~/src/styles/variables.scss']
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
