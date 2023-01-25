const path = require('path');
const config = require('../package.json');

module.exports = {
  entry: {
    scalar: ['./src/' + config.name + '.js'],
    app: './app/app.js'
  },
  output: {
    path: path.resolve(__dirname, '../lib'),
    filename: './[name]/[name].min.js',
    library: config.name,
    libraryTarget: 'umd',
    umdNamedDefine: true
  },
  plugins: require('./plugins'),
  module: require('./module'),
  optimization: require('./optimization'),
  devServer: require('./dev-server'),
  devtool: 'source-map',
  watchOptions: { poll: true }
};
