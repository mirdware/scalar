const path = require('path');
const config = require('../package.json');

module.exports = {
  ...require('./production'),
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
};
