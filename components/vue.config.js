/*
 * @Author: Jason
 * @Description:
 */
/*
 * @Author: Jason
 * @Description:
 */
/*
 * @Author: Jason
 * @Description:
 */
const webpack = require('webpack')
const path = require('path')

module.exports = {
    configureWebpack: {
        resolve: {
            fallback: {
                buffer: require.resolve('buffer/'),
            },
        },
        plugins: [
            new webpack.ProvidePlugin({
                Buffer: ['buffer', 'Buffer'],
            }),
        ],
    },
    chainWebpack: (config) => {
        config.resolve.alias
            .set('crypto', 'crypto-browserify')
            .set('http', 'stream-http')
            .set('https', 'https-browserify')
            .set('os', 'os-browserify/browser')
            .set('path', 'path-browserify')
            .set('buffer', 'buffer/')
            .set('zlib', 'browserify-zlib')

        config.plugin('provide').use(webpack.ProvidePlugin, [
            {
                process: 'process/browser',
                Buffer: ['buffer', 'Buffer'],
            },
        ])
    },
    configureWebpack: {
        plugins: [
            new webpack.ProvidePlugin({
                process: 'process/browser',
                Buffer: ['buffer', 'Buffer'],
            }),
        ],
    },
}
