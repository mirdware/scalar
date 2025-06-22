const path = require('path');
const config = require('../package.json');

module.exports = {
  ...require('./production'),
  target: 'node',
  output: {
    path: path.resolve(__dirname, '../lib'),
    filename: `cjs/${config.name}.min.js`,
    library: {
      type: 'commonjs2'
    },
    clean: true
  }
};
