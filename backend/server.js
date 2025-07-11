const app = require('./index')
require('dotenv').config;

const config = {
  port: process.env.PORT || 5000,
};

const server = app.listen(config.port, () => {
  console.log('Server is running on port 5000');
});

module.exports = server;