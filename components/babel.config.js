module.exports = {
    plugins: ['@babel/plugin-transform-runtime'],
    presets: [
        '@vue/cli-plugin-babel/preset',
        [
            '@babel/preset-env',
            {
                targets: {
                    browsers: ['last 2 versions', 'ie >= 11'],
                },
                useBuiltIns: 'usage',
                corejs: 3,
            },
        ],
    ],
}
