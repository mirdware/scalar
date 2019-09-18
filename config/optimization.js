const OptimizeCssAssetsWebpackPlugin = require('optimize-css-assets-webpack-plugin');
const TerserWebpackPlugin = require('terser-webpack-plugin');

module.exports = {
  splitChunks: {
    chunks: 'async',
    maxInitialRequests: Infinity,
    minSize: 0
  },
  minimizer: [
    new OptimizeCssAssetsWebpackPlugin(),
    new TerserWebpackPlugin()
  ]
};
