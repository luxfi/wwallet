module.exports = {
    root: true,
    env: {
        node: true
    },
    'extends': [
        'plugin:vue/essential',
        'eslint:recommended',
    ],
    rules: {
        'no-console': 'off',
        'vue/no-unused-components': 'off',
        'no-unreachable': 'off',
        'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off'
    },
}
