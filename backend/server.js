const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = 5000;
const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017/rsdb';

app.use(cors());
app.use(express.json());

//added by pradyuthi
const scheduleRoutes = require('./routes/schedule');
const ptoRoutes = require('./routes/pto');
const nurseRoutes = require('./routes/nurse');
const authRoutes = require('./routes/auth');

app.use('/schedule', scheduleRoutes);
app.use('/pto', ptoRoutes);
app.use('/nurse', nurseRoutes);
app.use('/auth', authRoutes);
//added by pradyuthi 


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


app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello from backend!' });
});

const Sample = mongoose.model('Sample', new mongoose.Schema({}, { strict: false }), 'sample_data');

app.get('/sample_data', async (req, res) => {
  try {
    const data = await Sample.find().limit(10);
    res.json(data);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log('Server is running on port 5000');
});