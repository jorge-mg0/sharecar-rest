// app.js
const express = require('express');
const app = express();

// Middleware
app.use(express.json()); // Parse JSON request bodies

// Example GET route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Express web service!' });
});

// Example POST route
app.post('/data', (req, res) => {
  const receivedData = req.body;
  res.json({ message: 'Data received successfully', data: receivedData });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
