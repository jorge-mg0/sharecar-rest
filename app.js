const express = require('express');
const { MongoClient } = require('mongodb');

const app = express();
app.use(express.json()); // Middleware to parse JSON

const dbUser = "root";
const dbPassword = "6EZOMHDcalieZHPD";
const uri = `mongodb+srv://${dbUser}:${dbPassword}@sharecar.1yutnho.mongodb.net/?retryWrites=true&w=majority&appName=sharecar`;

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Express web service!' });
});

app.post('/login', (req, res) => {
  const { email, password } = req.body;

  const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
  const user = { email, password };
  try {
    await client.connect();
    const collection = client.db("sharecar").collection("users");
    const result = await collection.findOne(user);
    if (result) {
      console.log('User found:', result);
      res.json({ message: 'Login successful', user: result });
    } else {
      console.log('User not found');
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (err) {
    console.error('MongoDB error:', err);
    res.status(500).json({ error: 'Database error', details: err.message });
  }
  finally {
    await client.close();
  }
})

app.get('/getTrips', async (req, res) => {
  const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });

  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');

    const collection = client.db("sharecar").collection("trips");
    const data = await collection.find({}).toArray();
    console.log('📦 Data retrieved:', data);

    res.json(data);

  } catch (err) {
    console.error('❌ MongoDB error:', err);
    res.status(500).json({ error: 'Database error', details: err.message });
  } finally {
    await client.close();
  }
}
);

app.post('/postTrip', async (req, res) => {
  const receivedData = req.body;

  const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });

  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');

    const collection = client.db("sharecar").collection("trips");
    const result = await collection.insertOne(receivedData);
    console.log('📦 Document inserted with _id:', result.insertedId);

    res.json({
      message: 'Data received and inserted successfully',
      data: receivedData,
      insertedId: result.insertedId
    });

  } catch (err) {
    console.error('❌ MongoDB error:', err);
    res.status(500).json({ error: 'Database error', details: err.message });
  } finally {
    await client.close();
  }
});

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.use((err, req, res, next) => {
  console.error('Server Error:', err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
