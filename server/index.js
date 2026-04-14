const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const History = require('./models/History');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// In-memory fallback if MongoDB isn't running locally
let useInMemory = false;
let memoryHistory = [];

mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/calculator')
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((err) => {
    console.warn('MongoDB connection failed. Falling back to in-memory storage.', err.message);
    useInMemory = true;
  });

// Routes
app.get('/api/history', async (req, res) => {
  try {
    if (useInMemory) {
      return res.json(memoryHistory);
    }
    const history = await History.find().sort({ timestamp: -1 }).limit(50);
    res.json(history);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

app.post('/api/history', async (req, res) => {
  const { equation, result } = req.body;
  if (!equation || !result) {
    return res.status(400).json({ error: 'Equation and result are required' });
  }

  try {
    if (useInMemory) {
      const newEntry = {
        _id: Date.now().toString(),
        equation,
        result,
        timestamp: new Date()
      };
      memoryHistory.unshift(newEntry);
      if (memoryHistory.length > 50) memoryHistory.pop();
      return res.status(201).json(newEntry);
    }

    const newHistory = new History({ equation, result });
    await newHistory.save();
    res.status(201).json(newHistory);
  } catch (err) {
    res.status(500).json({ error: 'Failed to save history' });
  }
});

app.delete('/api/history', async (req, res) => {
  try {
    if (useInMemory) {
      memoryHistory = [];
      return res.status(200).json({ message: 'History cleared' });
    }
    await History.deleteMany({});
    res.status(200).json({ message: 'History cleared' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to clear history' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
