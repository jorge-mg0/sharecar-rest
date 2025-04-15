export const find = async (collectionName, query, findOne = false) => {
  const client = new MongoClient(process.env.DATABASE_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });

  try {
    await client.connect();
    const database = client.db('sharecar');
    const collection = database.collection(collectionName);
    const result = findOne ? await collection.findOne(query) : await collection.find(query);
    return result;
  } catch (error) {
    console.error('Error finding:', error);
    return false;
  } finally {
    await client.close();
  }
}

export const insert = async (collectionName, data) => {
  const client = new MongoClient(process.env.DATABASE_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
  try {
    await client.connect();
    const database = client.db('sharecar');
    const collection = database.collection(collectionName);
    const result = await collection.insertOne(data);
    return result.insertedId;
  } catch (error) {
    console.error('Error inserting:', error);
    return false;
  } finally {
    await client.close();
  }
}

export const update = async (collectionName, query, data, updateOne = false) => {
  const client = new MongoClient(process.env.DATABASE_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
  try {
    await client.connect();
    const database = client.db('sharecar');
    const collection = database.collection(collectionName);
    const result = updateOne ? await collection.updateOne(query, data) : await collection.updateMany(query, data);
    return result.modifiedCount;
  } catch (error) {
    console.error('Error updating:', error);
    return false;
  } finally {
    await client.close();
  }
}

export const remove = async (collectionName, query, removeOne = false) => {
  const client = new MongoClient(process.env.DATABASE_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
  try {
    await client.connect();
    const database = client.db('sharecar');
    const collection = database.collection(collectionName);
    const result = removeOne ? await collection.deleteOne(query) : await collection.deleteMany(query);
    return result.deletedCount;
  } catch (error) {
    console.error('Error removing:', error);
    return false;
  } finally {
    await client.close();
  }
}