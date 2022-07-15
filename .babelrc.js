module.exports = {
    exclude: 'node_modules/**',
    plugins: ['@babel/plugin-proposal-class-properties'],
    presets: [
        [
            '@babel/preset-env',
            {
                targets: {
                    browsers: [
                        "last 2 versions",
                        "safari >= 7"
                    ]
                }
            }
        ]
    ]
};
