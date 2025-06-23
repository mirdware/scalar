module.exports = (env, argv) => {
  if (env.WEBPACK_SERVE) {
    console.log('🚀 Starting development server...');
    const develompent = require('./development');
    develompent.mode = 'development';
    return develompent;
  } else {
    const mode = argv.mode || 'production';
    const libraries = ['common', 'ecmascript', 'universal'];
    return libraries.map(name => {
      console.log(`📦 Building library ${name} in mode: ${mode}`);
      const config = require(`./${name}`)();
      config.mode = mode;
      return config;
    });
  }
};
