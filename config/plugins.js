const CompressionPlugin = require('compression-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCSSExtractPlugin = require('mini-css-extract-plugin');

module.exports = [
  new CompressionPlugin(),
  new MiniCSSExtractPlugin({
    filename: './css/[name].min.css'
  }),
  new HtmlWebpackPlugin({
    template: './app/index.html',
    favicon: './app/favicon.ico'
  }),
  new CopyWebpackPlugin([
    { from: './app/response.json', to: 'response.json' },
  ])
];
