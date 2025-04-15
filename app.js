import express from 'express';
import { MongoClient } from 'mongodb';
import { checkUser } from './database/users.js';
import md5 from 'md5';
import { getAllTrips, addTrip } from './database/trips.js';
const app = express();
app.use(express.json()); // Middleware to parse JSON

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Express web service!' });
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;

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
  try {
    console.log('✅ Fetching trips from database');
    const trips = await getAllTrips();
    console.log('📦 Data retrieved:', trips);
    res.json(trips);
  } catch (err) {
    console.error('❌ Error fetching trips:', err);
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

app.post('/postTrip', async (req, res) => {
  const receivedData = req.body;
  const token = req.headers.authorization;
  const user = await checkUser(receivedData.email, token);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    console.log('✅ Adding new trip to database');
    const tripData = { ...receivedData, idUser: user._id };
    const newTrip = await addTrip(tripData);
    console.log('📦 Trip added with _id:', newTrip._id);

    res.json({
      message: 'Trip added successfully',
      data: receivedData,
      insertedId: newTrip._id
    });
  } catch (err) {
    console.error('❌ Error adding trip:', err);
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

app.post('/refresh', async (req, res) => {
  const token = req.headers.authorization.split(' ')[1];
  const user = await checkUser(req.body.email, token);
  if (!user) {
    return res.status(401).json({ error: '🚫 Unauthorized' });
  }

  res.json({ message: '✅ Refresh successful', token: user.token });
})

app.post('/logout', async (req, res) => {
  const token = req.headers.authorization.split(' ')[1];
  const user = await checkUser(req.body.email, token);

  if (user) {
    await removeToken(user.email);
  }

  return res.json({ message: '✅ Logout successful' });
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
