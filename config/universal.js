const path = require('path');
const config = require('../package.json');
const getProductionConfig = require('./production');

module.exports = () => ({
  ...getProductionConfig(),
  target: 'web',
  output: {
    path: path.resolve(__dirname, '../lib'),
    filename: `umd/${config.name}.min.js`,
    library: {
      name: config.name,
      type: 'umd'
    },
    globalObject: 'this'
  }
});
