const path = require('path');
const config = require('../package.json');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCSSExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  entry: {
    [config.name]: ['./src/' + config.name + '.js'],
    app: './app/app.js'
  },
  output: {
    path: path.resolve(__dirname, '../lib'),
    filename: './[name]/[name].min.js',
    library: {
      name: config.name,
      type: 'umd',
    },
    umdNamedDefine: true,
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('development')
    }),
    new HtmlWebpackPlugin({
      template: './app/index.html',
      favicon: './app/favicon.ico'
    }),
    new CopyWebpackPlugin({
      patterns: [
        { from: './app/response.json', to: 'response.json' },
      ]
    }),
    new MiniCSSExtractPlugin({
      filename: './css/[name].min.css'
    })
  ],
  module: require('./module')(),
  optimization: require('./optimization')(),
  devServer: require('./dev-server')(),
  devtool: 'eval-source-map',
  watchOptions: { poll: true }
};
