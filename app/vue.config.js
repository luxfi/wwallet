process.env.VUE_APP_VERSION = process.env.npm_package_version
const path = require('path')
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin')
const { VueLoaderPlugin } = require('vue-loader')
const { defineConfig } = require('@vue/cli-service')

module.exports = {
    parallel: false,
    chainWebpack: (config) => {
        config.stats('verbose')
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

            .tap((options) => {
                return {
                    ...options,
                    transpileOnly: true,
                    appendTsSuffixTo: [/\.vue$/],
                }
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
        // config.module
        //     .rule('scss')
        //     .oneOf('vue')
        //     .use('sass-loader')
        //     .tap((options) => {
        //         return {
        //             ...options,
        //         }
        //     })
        // Ensure SCSS files are handled with SCSS syntax
        config.module
            .rule('scss')
            .oneOf('vue')
            .use('sass-loader')
            .loader('sass-loader')
            .tap((options) => {
                options = options || {}
                options.implementation = require('sass')
                options.sassOptions = options.sassOptions || {}
                options.sassOptions.indentedSyntax = false // Use SCSS syntax for .scss files
                return options
            })

        // Ensure SASS files are handled with indented syntax
        config.module
            .rule('sass')
            .oneOf('vue')
            .use('sass-loader')
            .loader('sass-loader')
            .tap((options) => {
                options = options || {}
                options.implementation = require('sass')
                options.sassOptions = options.sassOptions || {}
                options.sassOptions.indentedSyntax = true // Use indented syntax for .sass files
                return options
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
        stats: 'verbose',
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
                bip32: path.resolve(__dirname, 'node_modules/bip32/src/index.js'),
                // ecpair: path.resolve(__dirname, 'node_modules/ecpair/src/index.js'),
                // '@bitcoinerlab/secp256k1': path.resolve(
                //     __dirname,
                //     'node_modules/@bitcoinerlab/secp256k1'
                // ),
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
