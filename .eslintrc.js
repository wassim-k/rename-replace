module.exports = {
    parser: '@typescript-eslint/parser',
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended'
    ],
    parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
        project: './tsconfig.eslint.json'
    },
    plugins: [
        '@typescript-eslint',
    ],
    rules: {
        '@typescript-eslint/array-type': [
            'error',
            {
                default: 'generic'
            }
        ],
        '@typescript-eslint/quotes': [
            'error',
            'single'
        ],
        '@typescript-eslint/explicit-member-accessibility': 'error',
        '@typescript-eslint/prefer-readonly': 'error',
        'eqeqeq': [
            'error',
            'always'
        ],
        '@typescript-eslint/semi': 'error',
        'object-shorthand': 'error',
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-unused-vars': 'off',
        'no-undef': 'off',
        'no-cond-assign': 'off',
        'quotes': 'off',
    },
    ignorePatterns: ['dist', 'node_modules', '**/*.js']
};
