/*
  Filename: loginController.js
  Purpose: Contains functions to handle user login logic with MongoDB
*/

const { MongoClient } = require('mongodb');

// Usually you'll want to connect once and reuse the client
// For demonstration, we'll connect every time handleLogin runs.
// In a real app, you'd do a single connection in, say, a db.js file.

const mongoUri = process.env.MONGO_URI || 'mongodb://docker_mongo:27017/myProjectDB';

async function handleLoginRequest(req, res) {
  // Basic checks
  const userName = req.body.usernameField;
  const userPassword = req.body.passwordField;
  if (!userName || !userPassword) {
    return res.send('Login failed. Missing username or password.');
  }

  // Connect to Mongo
  let dbClient;
  try {
    dbClient = new MongoClient(mongoUri);
    await dbClient.connect();
    const db = dbClient.db('myProjectDB');
    const usersCollection = db.collection('users');

    // Check if user already exists
    const existingUser = await usersCollection.findOne({ userName });
    if (existingUser) {
      // For demonstration: do a simple password check or skip it
      // If matches, login successful
      // else say "wrong password" etc.
      return res.send(`Welcome back, ${userName}!`);
    } else {
      // Create new user if doesn't exist
      await usersCollection.insertOne({ userName, userPassword });
      return res.send(`New user created: ${userName}`);
    }
  } catch (error) {
    console.error('Error in handleLoginRequest:', error);
    return res.status(500).send('Server error');
  } finally {
    // Make sure to close the client
    if (dbClient) {
      await dbClient.close();
    }
  }
}

module.exports = { handleLoginRequest };
