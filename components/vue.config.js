const webpack = require('webpack');
const path = require('path');

module.exports = {
    chainWebpack: config => {
        // Set resolve aliases
        config.resolve.alias
            .set('@ledgerhq/cryptoassets/data/eip712', path.resolve(__dirname, 'node_modules/@ledgerhq/cryptoassets/lib-es/data/eip712'))
            .set('@ledgerhq/cryptoassets/data/evm/index', path.resolve(__dirname, 'node_modules/@ledgerhq/cryptoassets/lib-es/data/evm/index'))
            .set('@ledgerhq/domain-service/signers/index', path.resolve(__dirname, 'node_modules/@ledgerhq/domain-service/lib-es/signers/index'))
            .set('@ledgerhq/evm-tools/message/EIP712/index', path.resolve(__dirname, 'node_modules/@ledgerhq/evm-tools/lib-es/message/EIP712/index'))
            .set('@ledgerhq/evm-tools/selectors/index', path.resolve(__dirname, 'node_modules/@ledgerhq/evm-tools/lib-es/selectors/index'))
            .set('crypto', 'crypto-browserify')
            .set('http', 'stream-http')
            .set('https', 'https-browserify')
            .set('os', 'os-browserify/browser')
            .set('path', 'path-browserify')
            .set('zlib', 'browserify-zlib');

        // Provide global variables
        config.plugin('provide').use(webpack.ProvidePlugin, [
            {
                process: 'process/browser',
            },
        ]);

        // Configure module rules
        config.module
            .rule('js')
            .include
                .add(/node_modules\/@metamask/)
                .add(/node_modules\/@ethereumjs/)
                .add(/node_modules\/superstruct/)
                .end()
            .use('babel-loader')
                .loader('babel-loader')
                .tap(options => {
                    return options;
                });

        // Configure TypeScript rules
        config.module
            .rule('typescript')
            .test(/\.tsx?$/)
            .exclude
                .add(filepath => (
                    /node_modules/.test(filepath) && !/node_modules\/@ledgerhq/.test(filepath)
                ))
                .end()
            .use('ts-loader')
                .loader('ts-loader')
                .options({
                    transpileOnly: true,
                    configFile: 'tsconfig.json',
                });

        // Add resolve extensions
        config.resolve.extensions
            .merge(['.ts', '.tsx']);
    },
    configureWebpack: {
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
            },
        },
    },
};
