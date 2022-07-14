module.exports = {
    tabWidth: 4,
    singleQuote: true,
    semi: true,
    'no-prose-wrap': true,
    trailingComma: 'all',
    'comma-dangle': [2, 'always-multiline'],
    overrides: [
        {
            files: '*.md',
            options: {
                tabWidth: 4,
            },
        },
    ],
    importOrderParserPlugins: ['jsx', 'js', 'tsx', 'tsx'],
    importOrder: [
        '^@core/(.*)$',
        '<THIRD_PARTY_MODULES>',
        '^@ui/(.*)$',
        '^[./]',
    ],
    importOrderSeparation: true,
    importOrderSortSpecifiers: true,
    importOrderParserPlugins: [
        'typescript',
        'classProperties',
        'decorators-legacy',
        'jsx',
    ],
    plugins: [require.resolve('@trivago/prettier-plugin-sort-imports')],
};
