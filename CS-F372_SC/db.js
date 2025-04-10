// db.js
const { MongoClient } = require('mongodb');
const uri = 'mongodb://localhost:27017'; // 或你自己的 Mongo URI

const client = new MongoClient(uri);

async function connectDB() {
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB!');
    return client.db('moviehub'); // 你自己起的 DB 名字
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
  }
}

module.exports = connectDB;
