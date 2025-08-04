require('dotenv').config();
const createApp = require('./index'); 

const app = createApp(); 
console.log(typeof app); 

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log('Server is running on port', PORT);
});

module.exports = server;
