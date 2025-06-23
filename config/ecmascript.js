const path = require('path');
const config = require('../package.json');
const getProductionConfig = require('./production');

module.exports = () => ({
  ...getProductionConfig(),
  output: {
    path: path.resolve(__dirname, '../lib'),
    filename: `mjs/${config.name}.min.js`,
    library: {
      type: 'module'
    }
  },
  experiments: {
    outputModule: true
  }
});
