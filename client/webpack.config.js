const path = require('path');

module.exports = {
    entry: './js/main.js', //путь к вашему главному js файлу
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: './bundle.js',
    },
    devtool: 'inline-source-map',
    module: {
        rules: [{
            test: /\.js$/, // запустим загрузчик во всех файлах .js
            exclude: /node_modules/,
            use: {
                loader: 'babel-loader',
                options: {
                    presets: ['env']
                }
            },
        }]
    },
    
    watch: true,

    watchOptions: {
        aggregateTimeout: 100
    },
};