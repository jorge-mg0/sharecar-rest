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
      const today = new Date().toISOString();
      const newToken = md5(today + Math.random() * 1000);
      const updateResult = await collection.updateOne(
        { email: user.email },
        { $set: { token: newToken, lastLogin: today } }
      );

      if (updateResult.modifiedCount === 1) {
        // Update was successful
        user.token = newToken; // Update the user object with the new token
        user.lastLogin = today; // Update the user object with the new lastLogin
        return user;
      } else {
        // Update failed
        console.error('Failed to update user token');
        return false;
      }
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
