const CompressionPlugin = require('compression-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCSSExtractPlugin = require('mini-css-extract-plugin');
const UnminifiedWebpackPlugin = require('unminified-webpack-plugin');

module.exports = [
  new UnminifiedWebpackPlugin(),
  new CompressionPlugin({
    include: /\.min\.js$/
  }),
  new MiniCSSExtractPlugin({
    filename: './css/[name].min.css'
  }),
  new HtmlWebpackPlugin({
    template: './app/index.html',
    favicon: './app/favicon.ico'
  }),
  new CopyWebpackPlugin({
    patterns: [
      { from: './app/response.json', to: 'response.json' },
    ]
  })
];
