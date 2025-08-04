const routes = require('./routes/loginRoutes');
const ptoRoutes = require('./routes/pto');
const schedulingRoutes = require('./routes/schedulingRoutes');
const emergencyRoutes = require('./routes/emergencyRoutes');
const nurseRoutes = require('./routes/nurseRoutes');
const express = require('express');
const mongoose = require('mongoose');
const bodyparser = require('body-parser');
const cors = require('cors');

const debugRoutes = (req, res, next) => {
    if (req.path.startsWith('/api/')) {
        console.log(`[ROUTE DEBUG] ${req.method} ${req.path}`);
        console.log(`[ROUTE DEBUG] Params:`, req.params);
        console.log(`[ROUTE DEBUG] Query:`, req.query);
        console.log(`[ROUTE DEBUG] Body:`, req.body);
        console.log('---');
    }
    next();
};

const initalizeApp = () => {

const app = express();
const PORT = 5000;
const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017/rsdb';

app.use(express.json());

//cors
app.use(cors());
app.use(debugRoutes);

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
app.use('/api/emergency', emergencyRoutes);
app.use('/api/nurses', nurseRoutes);

return app;
}

module.exports = initalizeApp;