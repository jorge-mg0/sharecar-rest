const { MongoClient } = require('mongodb');

export const checkToken = async (token) => {
  const client = new MongoClient(process.env.MONGODB_URI);
  try {
    await client.connect();
    const database = client.db('sharecar');
    const collection = database.collection('users');

    const user = await collection.findOne({ token: token });

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
