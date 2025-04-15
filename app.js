import express from 'express';
import { MongoClient } from 'mongodb';
import { checkUser } from './auth.js';
import md5 from 'md5';
const app = express();
app.use(express.json()); // Middleware to parse JSON

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Express web service!' });
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const md5 = require('md5');
  const hashedPassword = md5(password);

  const today = new Date().toISOString();
  const newToken = md5(today + Math.random() * 1000);
  const client = new MongoClient(process.env.DATABASE_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
  const user = { email, hashedPassword };

  try {
    await client.connect();
    const collection = client.db("sharecar").collection("users");
    const result = await collection.findOne({ email: user.email });

    if (result) {
      console.log('User found:', result);
      if (hashedPassword !== result.password) {
        console.log('Incorrect password');
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      await collection.updateOne(
        { email: user.email },
        { $set: { token: newToken, lastLogin: today } }
      );
      res.json({ message: 'Login successful', user: result.email, token: newToken });
    } else {
      console.log('User not found');
      res.status(401).json({ error: 'Invalid email or password' });
    }
  } catch (err) {
    console.error('MongoDB error:', err);
    res.status(500).json({ error: 'Database error', details: err.message });
  } finally {
    await client.close();
  }
});

app.get('/getTrips', async (req, res) => {
  const client = new MongoClient(process.env.DATABASE_URL, {
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
  const token = req.headers.authorization;
  const user = await checkUser(receivedData.email, token);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const client = new MongoClient(process.env.DATABASE_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });

  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');

    const collection = client.db("sharecar").collection("trips");
    const result = await collection.insertOne({ receivedData, idUser: user._id });
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

app.post('/refresh', async (req, res) => {
  const token = req.headers.authorization.split(' ')[1];
  const user = await checkUser(req.body.email, token);
  if (!user) {
    return res.status(401).json({ error: '🚫 Unauthorized' });
  }
  const today = new Date().toISOString();
  const newToken = md5(today + Math.random() * 1000);
  await collection.updateOne(
    { email: user.email },
    { $set: { token: newToken, lastLogin: today } }
  );
  res.json({ message: '✅ Refresh successful', token: newToken });
})

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
