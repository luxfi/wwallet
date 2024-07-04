module.exports = {
    parser: 'vue-eslint-parser',
    root: true,
    env: {
        node: true,
        browser: true,
        es2020: true,
    },
    extends: [
        'plugin:vue/essential',
        'plugin:vuetify/base',
        'eslint:recommended',
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
        'no-unused-vars': 'off',
        '@typescript-eslint/no-unused-vars': 'off',

        'vue/multi-word-component-names': [
            'error',
            {
                ignores: ['datetime', 'fa'],
            },
        ],
    },
}
