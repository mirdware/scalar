const MiniCSSExtractPlugin = require('mini-css-extract-plugin');

module.exports = (babelPlugins = []) => ({
  rules: [{
    test: /\.js$/,
    exclude: /node_modules/,
    use: {
      loader: 'babel-loader',
      options: {
        cacheDirectory: false,
        presets: ['@babel/preset-env'],
        plugins: [
          ...babelPlugins,
          ["@babel/plugin-proposal-decorators", { "legacy": true }]
        ]
      }
    }
  }, {
    test: /\.css$/,
    use: [
      MiniCSSExtractPlugin.loader,
      "css-loader"
    ]
  }]
});
