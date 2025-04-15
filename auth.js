import { MongoClient } from 'mongodb';

export const checkUser = async (email, token) => {
  const client = new MongoClient(process.env.DATABASE_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
  try {
    await client.connect();
    const database = client.db('sharecar');
    const collection = database.collection('users');

    const user = await collection.findOne({ email: email, token: token });

    if (user) {
      return user; // Token is valid
    } else {
      return false; // Token is invalid
    }
  } catch (error) {
    console.error('Error checking token:', error);
    return false;
  } finally {
    await client.close();
  }
}
