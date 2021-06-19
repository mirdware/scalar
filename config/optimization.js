const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const TerserWebpackPlugin = require('terser-webpack-plugin');

module.exports = {
  splitChunks: {
    chunks: 'async',
    maxInitialRequests: Infinity,
    minSize: 0
  },
  minimizer: [
    new CssMinimizerPlugin(),
    new TerserWebpackPlugin()
  ]
};
