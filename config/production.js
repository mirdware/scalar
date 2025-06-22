const config = require('../package.json');
const CompressionPlugin = require('compression-webpack-plugin');
const UnminifiedWebpackPlugin = require('unminified-webpack-plugin');

module.exports = {
  entry: {
    [config.name]: ['./src/' + config.name + '.js'],
  },
  plugins: [
    new UnminifiedWebpackPlugin(),
    new CompressionPlugin({
      include: /\.min\.js$/
    })
  ],
  module: require('./module'),
  optimization : require('./optimization'),
  devtool: 'source-map'
};
