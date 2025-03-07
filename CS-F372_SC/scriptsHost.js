/*
  Filename: scriptsServer.js
  Purpose: Contains functions to handle user login and account creating

  Todo: create db.js that contains the connection logic, and reuses client
*/

const { MongoClient } = require('mongodb');
const crypto = require('crypto');
const e = require('express');
const mongoUri = process.env.MONGO_URI;

/*
  Function: validPassword
  Purpose: Check password complexity
  Input: password
  Output: Boolean
*/
function validPassword(password) {
  // Split assignment up as to not exceed 70 characters per line. Sitll to long, I think this rule is silly.
  const complexityRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()\-_=+\[\]{}\\|\/?,<.>;:'"`~])[A-Za-z\d!@#$%^&*()\-_=+\[\]{}\\|\/?,<.>;:'"`~]{8,}$/;
  return complexityRegex.test(password);
}

/*
  Function: validEmail
  Purpose: Checks if useremail is valid email 
  Input: email
  Output: Boolean
*/
function validEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/*
  Function: hashPassword
  Purpose: Hash password with salt
  Input: password, salt
  Output: Hashed password
*/
function hashPassword(password, salt) {
  return crypto.createHash('sha256').update(password + salt).digest('hex');
}

/*
  Function: generateSalt
  Purpose: Generate a random salt
  Input: None
  Output: Salt
*/
function generateSalt() {
  return crypto.randomBytes(16).toString('hex');
}

/*
  Function: accountLogin
  Purpose: Handle account logins
  Input: req, res
  Output: JSON response
*/
async function accountLogin(req, res) {
  const userEmail = req.body.loginEmail;
  const userPassword = req.body.loginPassword;
  
  // Basic checks
  if (!userEmail || !userPassword) {
    return res.json({ success: false, message: 'Login failed. Missing email or password.' });
  }

  // Connect to Mongo
  let dbClient;

  try {
    dbClient = new MongoClient(mongoUri);
    await dbClient.connect();

    const db = dbClient.db('myProjectDB');
    const usersCollection = db.collection('users');
    const existingUser = await usersCollection.findOne({ userEmail });

    // Check if user already exists
    if (existingUser) {
      const hashedPassword = hashPassword(userPassword, existingUser.userSalt);

      // Debugging logs
      // console.log('Provided password:', userPassword);
      // console.log('Stored salt:', existingUser.userSalt);
      // console.log('Hashed provided password:', hashedPassword);
      // console.log('Stored hashed password:', existingUser.userPassword);

      // If account exists and password matches, log in
      if (existingUser.userPassword === hashedPassword) {
        req.session.user = userEmail; // Set session variable
        return res.json({ success: true, message: 'Login successful. Redirecting to gallery...' });

      // If account exists but password doesn't match, increment failed attempts
      } else {
        const failedAttempts = existingUser.failedAttempts || [];
        const now = new Date();
        const recentAttempts = failedAttempts.filter(attempt => now - new Date(attempt) < 24 * 60 * 60 * 1000);
        recentAttempts.push(now);
        await usersCollection.updateOne({ userEmail }, { $set: { failedAttempts: recentAttempts } });
        const attemptsRemaining = 3 - recentAttempts.length;
        if (attemptsRemaining > 0) {
          const attemptsMessage = attemptsRemaining === 2 ? 'two attempts remaining.' : 'one attempt remaining. Account will then be deleted';
          return res.json({ success: false, message: `Login failed. ${attemptsMessage}` });
        } else {
          await usersCollection.deleteOne({ userEmail });
          return res.json({ success: false, message: 'All attempts exhausted, account deleted.' });
        }
      }
      
    // Create new user if doesn't exist
    } else {
      if (!validEmail(userEmail)) {
        return res.json({ success: false, message: 'Email must be a valid email.' });
      }
      if (!validPassword(userPassword)) {
        return res.json({ success: false, message: 'Password must contain at least 1 uppercase letter, 1 lowercase letter, 1 number, 1 special character, and be at least 8 characters long.' });
      }
      const userSalt = generateSalt();
      const hashedPassword = hashPassword(userPassword, userSalt);
      await usersCollection.insertOne({ userEmail, userPassword: hashedPassword, userSalt });
      req.session.user = userEmail; // Set session variable
      return res.json({ success: true, message: 'Account created. Redirecting to Gallery...' });
    }
  } catch (error) {
    console.error('Error in accountLogin:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  } finally {
    // Make sure to close the client
    if (dbClient) {
      await dbClient.close();
    }
  }
}

/*
  Function: accountUpdate
  Purpose: Handle account updates
  Input: req, res
  Output: JSON response
*/
async function accountUpdate(req, res) {
  const newEmail = req.body.updateEmail;
  const newPassword = req.body.updatePassword;

  // Connect to Mongo
  let dbClient;
  const currentEmail = req.session.user;
  // let errormessage = '';

  // errormessage += "1";
  // Check if session data for login exists
  if (!currentEmail) {
    return res.json({ success: false, message: 'User not logged in.' });
  }

  // errormessage += "2";
  // Check if both email and password are missing
  if ((!newEmail || newEmail.trim() === '') && (!newPassword || newPassword.trim() === '')) {
    return res.json({ success: false, message: 'Please enter an email or password to update.' });
  }

  // errormessage += "3";
  try {
    // errormessage += "4";
    dbClient = new MongoClient(mongoUri);
    await dbClient.connect();

    const db = dbClient.db('myProjectDB');
    const usersCollection = db.collection('users');
    const existingUser = await usersCollection.findOne({ userEmail: currentEmail });

    // errormessage += "5";
    if (!existingUser) {
      return res.json({ success: false, message: 'User not found.' });
    }

    // Return string message
    let updatedEmail = false;
    let updatedPassword = false;

    // errormessage += "6";
    if (newEmail && newEmail.trim() !== '') {
      if (!validEmail(newEmail)) {
        return res.json({ success: false, message: 'New email must be a valid email.' });
      } else {
        // errormessage += "7";
        await usersCollection.updateOne({ userEmail: currentEmail }, { $set: { userEmail: newEmail }});
        req.session.user = newEmail;
        updatedEmail = true;
      }
    }

    // errormessage += "8";
    if (newPassword && newPassword.trim() !== '') {
      if (!validPassword(newPassword)) {
        return res.json({ success: false, message: 'New password must contain at least 1 uppercase letter, 1 lowercase letter, 1 number, 1 special character, and be at least 8 characters long.' });
      } else {
        // errormessage += "9";
        const userSalt = existingUser.userSalt;
        const hashedPassword = hashPassword(newPassword, userSalt);
        await usersCollection.updateOne({ userEmail: currentEmail }, { $set: { userPassword: hashedPassword }});
        updatedPassword = true;
      }
    }

    // errormessage += "-10";
    if (!updatedEmail && !updatedPassword) {
      return res.json({ success: false, message: 'No updates made.' });
    } else if (updatedEmail && updatedPassword) {
      return res.json({ success: true, message: 'Email and password updated.' });
    } else if (updatedEmail) {
      return res.json({ success: true, message: 'Email updated.' });
    } else if (updatedPassword) {
      return res.json({ success: true, message: 'Password updated.' });
    }

    errormessage += "-11";
  } catch (error) {
    console.error('Error updating account:', error);
    return res.status(500).json({ success: false, message: 'Server error: ' + errormessage });
  } finally {
    // Make sure to close the client
    if (dbClient) {
      await dbClient.close();
    }
  }
}

// Export all functions
module.exports = { 
  accountLogin, 
  accountUpdate
};