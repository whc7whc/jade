module.exports = {
    root: true,
    env: {
        node: true,
        es2021: true
    },
    extends: [
        'plugin:vue/vue3-essential',
        'eslint:recommended'
    ],
    parserOptions: {
        ecmaVersion: 2021,
        sourceType: 'module'
    },
    rules: {
        'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
        'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
        'no-unused-vars': 'warn',
        'no-undef': 'warn'
    },
    ignorePatterns: [
        'node_modules/',
        'dist/',
        '*.min.js',
        'public/',
        'mock-api-server.js',
        'vue.config.js'
    ]
}
