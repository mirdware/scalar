const MiniCSSExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
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
};
