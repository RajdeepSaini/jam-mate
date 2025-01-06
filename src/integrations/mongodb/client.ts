import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = 'music_sessions';

let client: MongoClient;

export async function connectToDatabase() {
  if (!client) {
    client = new MongoClient(MONGODB_URI);
    await client.connect();
  }
  return {
    client,
    db: client.db(DB_NAME),
  };
}

export async function getSessionsCollection() {
  const { db } = await connectToDatabase();
  return db.collection('sessions');
}

export async function getQueueCollection() {
  const { db } = await connectToDatabase();
  return db.collection('queue');
}