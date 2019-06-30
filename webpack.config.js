const CompressionPlugin = require("compression-webpack-plugin");
const config = require('./package.json');

module.exports = {
  plugins: [
    new CompressionPlugin(),
  ],
  entry: {
    scalar: ['./' + config.name + '.js'],
    app: './test/app.js'
  },
  output: {
    path: __dirname,
    filename: './dist/[name].min.js',
    library: config.name,
    libraryTarget: 'umd',
    umdNamedDefine: true
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
            plugins: [
              ['@babel/plugin-proposal-class-properties']
            ]
          }
        }
      }
    ]
  },
  devServer: {
    host: 'localhost',
    port: 6969,
    inline: true
  }
};
