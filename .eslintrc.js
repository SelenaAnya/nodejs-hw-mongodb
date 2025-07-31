module.exports = {
    env: {
        browser: false,
        es2021: true,
        node: true,
    },
    extends: ['eslint:recommended'],
    parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
    },
    rules: {
        semi: 'error',
        'prefer-const': 'error',
        'no-unused-vars': 'error',
        'no-undef': 'error',
    },
};
