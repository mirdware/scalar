const CompressionPlugin = require('compression-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCSSExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCssAssetsWebpackPlugin = require('optimize-css-assets-webpack-plugin');
const TerserWebpackPlugin = require('terser-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
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
  plugins: [
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
  ],
  module: {
    rules: [{
      test: /\.js$/,
      exclude: /node_modules/,
      use: {
        loader: 'babel-loader',
        options: {
          presets: ['@babel/preset-env']
        }
      }
    }, {
      test: /\.css$/, 
      use: [
        MiniCSSExtractPlugin.loader,
        "css-loader"
      ]
    }]
  },
  optimization: {
    minimizer: [new OptimizeCssAssetsWebpackPlugin(), new TerserWebpackPlugin()]
  },
  devServer: {
    host: 'localhost',
    port: 6969,
    inline: true
  },
  devtool: 'source-map'
};
