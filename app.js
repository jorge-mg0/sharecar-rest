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

app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const md5 = require('md5');
  const hashedPassword = md5(password);
  const newToken = md5(email + hashedPassword);
  const today = new Date().toISOString();
  const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
  const user = { email, hashedPassword };

  try {
    await client.connect();
    const collection = client.db("sharecar").collection("users");
    console.log(user)
    const result = await collection.findOneAndUpdate(user, { $set: { lastLogin: today, token: newToken } }, { returnDocument: 'after' });

    if (result) {
      console.log('User found:', result);
      res.json({ message: 'Login successful', user: result.email });
    } else {
      console.log('User not found');
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (err) {
    console.error('MongoDB error:', err);
    res.status(500).json({ error: 'Database error', details: err.message });
  } finally {
    await client.close();
  }
});

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
