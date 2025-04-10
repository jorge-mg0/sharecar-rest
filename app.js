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

  const dbUser = "root"
  const dbPassword = "6EZOMHDcalieZHPD"

  // connect to mongoDB
  const { MongoClient } = require('mongodb');
  const uri = "mongodb+srv://root:" + dbPassword + "@sharecar.1yutnho.mongodb.net/?retryWrites=true&w=majority&appName=sharecar";
  // sign in to mongodb
  const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  client.connect(err => {
    if (err) {
      console.error('MongoDB connection error:', err);
      return;
    }
    console.log('Connected to MongoDB');

    // Perform database operations here
    const collection = client.db("sharecar").collection("users");
    // Example: Insert a document
    collection.insertOne(receivedData, (err, result) => {
      if (err) {
        console.error('Error inserting document:', err);
      } else {
        console.log('Document inserted:', result.ops);
      }
      client.close();
    });

    // returnn mongodb response
    const response = {
      message: 'Data received successfully',
      data: receivedData,
      dbResponse: 'Document inserted successfully'
    };
  });

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
