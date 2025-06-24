const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

const DATA_FILE = path.join(__dirname, 'views.json');

app.use(express.json());
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*'); // pentru dezvoltare
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// GET: număr vizualizări
app.get('/api/views/:id', (req, res) => {
  const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
  res.json({ count: data[req.params.id] !== undefined ? data[req.params.id] : 0 });
});

// POST: incrementează
app.post('/api/views/:id', (req, res) => {
  const id = req.params.id;
  let data;

  try {
    data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
  } catch (err) {
    data = {};
  }

  if (!data[id]) {
    data[id] = 0; // adaugă automat dacă nu există
  }

  data[id] += 1;

  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));

  res.json({ success: true, newCount: data[id] });
});


const PORT = 3001;
app.listen(PORT, () => {
  console.log(`✅ Backend server running at http://localhost:${PORT}`);
});
