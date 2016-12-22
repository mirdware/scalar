var path = require('path'),
    config = require('./package.json'),
    webpack = require('webpack');

module.exports = {
    entry: './examples/'+config.name+'.js',
    output: {
        path: __dirname,
        filename: './dist/'+config.name+'.min.js'
    },
    module: {
        loaders: [
            {
                'test': path.join(__dirname, ''),
                'loader': 'babel-loader',
                query: {
                    'presets': ['es2015'],
                }
            }
        ]
    },
    devServer: {
        host: '0.0.0.0',
        port: 6969,
        inline: true
    },
    plugins: [
        new webpack.optimize.DedupePlugin(),
        new webpack.optimize.UglifyJsPlugin({
            compressor: {screw_ie8: true, keep_fnames: true, warnings: false},
            mangle: {screw_ie8: true, keep_fnames: true}
        })
    ]
};
