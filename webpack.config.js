const path = require('path');
const config = require('./package.json');
const webpack = require('webpack');

module.exports = {
  entry: {
    scalar: ['./' + config.name + '.js'],
    app: './examples/app.js'
  },
  output: {
    path: __dirname,
    filename: './dist/[name].min.js'
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
    }),
    new webpack.DefinePlugin({
      __DEV__: JSON.stringify(JSON.parse(process.env.BUILD_DEV || 'true')),
      __PRERELEASE__: JSON.stringify(JSON.parse(process.env.BUILD_PRERELEASE || 'false'))
    })
  ]
};
