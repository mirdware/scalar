const path = require('path');
const config = require('../package.json');

module.exports = {
  ...require('./production'),
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
};
