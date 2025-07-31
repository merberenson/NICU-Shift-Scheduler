const routes = require('./routes/loginRoutes');
const ptoRoutes = require('./routes/pto');
const schedulingRoutes = require('./routes/schedulingRoutes');
const callInRoutes = require('./routes/callInRoutes');
const callOutRoutes = require('./routes/callOutRoutes');

const express = require('express');
const mongoose = require('mongoose');
const bodyparser = require('body-parser');
const cors = require('cors');

const initalizeApp = () => {

const app = express();
const PORT = 5000;
const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017/NICU-db';

app.use(express.json());

//cors
app.use(cors());

//mongo connection
mongoose.connect(MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('Successfully Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));


const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

//bodyparser
app.use(bodyparser.urlencoded({ extended: true }))
app.use(bodyparser.json())

//test to check if application is working.
app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello from backend!' });
});

app.use('/', routes);
app.use('/api/pto', ptoRoutes);
app.use('/api', schedulingRoutes); 
app.use('/callins', callInRoutes);
app.use('/callout', callOutRoutes);
return app;
}

module.exports = initalizeApp;