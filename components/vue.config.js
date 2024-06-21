/*
 * @Author: Jason
 * @Description:
 */
const webpack = require('webpack')
const path = require('path')

module.exports = {
    transpileDependencies: [/@metamask/, /@ethereumjs/, /superstruct/],
    chainWebpack: (config) => {
        // Set resolve aliases
        config.resolve.alias
            .set(
                '@ledgerhq/cryptoassets/data/eip712',
                path.resolve(__dirname, 'node_modules/@ledgerhq/cryptoassets/lib-es/data/eip712')
            )
            .set(
                '@ledgerhq/cryptoassets/data/evm/index',
                path.resolve(__dirname, 'node_modules/@ledgerhq/cryptoassets/lib-es/data/evm/index')
            )
            .set(
                '@ledgerhq/domain-service/signers/index',
                path.resolve(
                    __dirname,
                    'node_modules/@ledgerhq/domain-service/lib-es/signers/index'
                )
            )
            .set(
                '@ledgerhq/evm-tools/message/EIP712/index',
                path.resolve(
                    __dirname,
                    'node_modules/@ledgerhq/evm-tools/lib-es/message/EIP712/index'
                )
            )
            .set(
                '@ledgerhq/evm-tools/selectors/index',
                path.resolve(__dirname, 'node_modules/@ledgerhq/evm-tools/lib-es/selectors/index')
            )
            .set('crypto', 'crypto-browserify')
            .set('http', 'stream-http')
            .set('https', 'https-browserify')
            .set('os', 'os-browserify/browser')
            .set('path', 'path-browserify')
            .set('zlib', 'browserify-zlib')
            .set('stream', 'stream-browserify')
            .set('vm', 'vm-browserify')

        // Provide global variables
        config.plugin('provide').use(webpack.ProvidePlugin, [
            {
                process: 'process/browser',
            },
        ])

        // Configure module rules

        config.module
            .rule('js')
            .test(/\.js$/)
            .include.add(path.resolve(__dirname, 'src'))
            .add(/node_modules[\\/]@metamask/)
            .add(/node_modules[\\/]@ethereumjs/)
            .add(/node_modules[\\/]superstruct/)
            .end()
            .use('babel-loader')
            .loader('babel-loader')
            .options({
                presets: ['@babel/preset-env'],
                plugins: ['@babel/plugin-transform-runtime'],
            })

        config.module
            .rule('mjs')
            .test(/\.mjs$/)
            .type('javascript/auto')
            .use('babel-loader')
            .loader('babel-loader')
            .options({
                presets: ['@babel/preset-env'],
                plugins: ['@babel/plugin-transform-runtime'],
            })

        // Configure TypeScript rules
        config.module
            .rule('typescript')
            .test(/\.tsx?$/)
            .exclude.add(
                (filepath) =>
                    /node_modules/.test(filepath) && !/node_modules\/@ledgerhq/.test(filepath)
            )
            .end()
            .use('ts-loader')
            .loader('ts-loader')
            .options({
                transpileOnly: true,
                configFile: 'tsconfig.json',
            })

        // Add resolve extensions
        config.resolve.extensions.merge(['.ts', '.tsx'])

        // handle WebAssembly
        config.module
            .rule('wasm')
            .test(/secp256k1\.wasm$/)
            .type('webassembly/async')
    },
    configureWebpack: {
        experiments: {
            asyncWebAssembly: true,
        },
        plugins: [
            new webpack.ProvidePlugin({
                process: 'process/browser',
            }),
        ],
        resolve: {
            alias: {
                crypto: 'crypto-browserify',
                http: 'stream-http',
                https: 'https-browserify',
                os: 'os-browserify/browser',
                path: 'path-browserify',
                zlib: 'browserify-zlib',
                stream: 'stream-browserify',
                vm: 'vm-browserify',
            },
        },
    },
}
