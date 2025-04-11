// db.js
// This is from Project2-Spencer
const { MongoClient } = require('mongodb');

const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/moviehub'; // 本地开发 & Docker 都支持！

const client = new MongoClient(uri);

async function connectDB() {
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB!');
    return client.db(); // 会自动从 URI 中取 moviehub
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
  }
}

module.exports = connectDB;
