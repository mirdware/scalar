const port = process.env.port || 6969;

module.exports = {
  host: '0.0.0.0',
  allowedHosts: 'all',
  hot:false,
  liveReload: true,
  client: {
    webSocketURL: { port: 0 }
  },
  open: {
    target: ['http://localhost:' + port]
  },
  port: port
};
