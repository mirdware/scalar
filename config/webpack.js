const path = require('path');
const config = require('../package.json');

module.exports = {
  entry: {
    scalar: ['./' + config.name + '.js'],
    app: './app/app.js'
  },
  output: {
    path: path.resolve(__dirname, '../dist'),
    filename: './js/[name].min.js',
    library: config.name,
    libraryTarget: 'umd',
    umdNamedDefine: true
  },
  plugins: require('./plugins'),
  module: require('./module'),
  optimization: require('./optimization'),
  devServer: {
    host: 'local-ip',
    allowedHosts: ['all'],
    hot:false,
    liveReload: true,
    open: true,
    port: 6969
  },
  devtool: 'source-map'
};
