const path = require('path');
const config = require('../package.json');
const getProductionConfig = require('./production');

module.exports = () => ({
  ...getProductionConfig(),
  target: 'node',
  output: {
    path: path.resolve(__dirname, '../lib'),
    filename: `cjs/${config.name}.min.js`,
    library: {
      type: 'commonjs2'
    },
    clean: true
  }
});
