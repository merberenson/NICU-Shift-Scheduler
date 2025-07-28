const mongoose = require('mongoose');
require('dotenv').config();

//(process.NODE_ENV === 'test) ?
mongoose.connect(
    process.env.MONGODB_URL,
    { useNewUrlParser: true, useUnifiedTopology: true }
).then(() => console.log('Successfully Connected to MongoDB'))
 .catch(err => console.error('MongoDB connection error', err));

module.exports = mongoose;


