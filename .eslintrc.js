module.exports = {
    root: true,
    env: {
        node: true,
        browser: true,
        es2020: true,
    },
    extends: [
        'plugin:vue/essential',
        'eslint:recommended',
        '@vue/typescript',
        '@vue/typescript/recommended',
    ],
    parserOptions: {
        parser: '@typescript-eslint/parser',
        ecmaVersion: 2020,
        sourceType: 'module',
    },
    rules: {
        'no-console': 'off',
        'vue/no-unused-components': 'off',
        'vue/multiline-html-element-content-newline': 'off',
        'no-unreachable': 'off',
        'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    },
}
