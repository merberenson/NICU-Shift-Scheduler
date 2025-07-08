const routes = require('./routes/loginRoutes');
const express = require('express');
const mongoose = require('mongoose');
const bodyparser = require('body-parser');
const cors = require('cors');


const app = express();
const PORT = 5000;
const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017/rsdb';

app.use(express.json());

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

//cors
app.use(cors());

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

routes(app);


app.listen(PORT, '0.0.0.0', () => {
  console.log('Server is running on port 5000');
});