const OptimizeCssAssetsWebpackPlugin = require('optimize-css-assets-webpack-plugin');
const TerserWebpackPlugin = require('terser-webpack-plugin');

module.exports = {
  splitChunks: {
    cacheGroups: {
      scalar: {
        chunks: 'initial',
        name: 'scalar',
        test: 'scalar',
        enforce: true
      }
    }
  },
  minimizer: [
    new OptimizeCssAssetsWebpackPlugin(),
    new TerserWebpackPlugin()
  ]
};
