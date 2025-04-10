// authController.js
const connectDB = require('./db');
const crypto = require('crypto');

function hash(password, salt) {
  return crypto.createHash('sha256').update(password + salt).digest('hex');
}

function generateSalt() {
  return crypto.randomBytes(16).toString('hex');
}

// Register.js
exports.register = async (req, res) => {
  console.log("Received request", req.body);
  const { email, password } = req.body;
  const db = await connectDB();
  const users = db.collection('users');

  const existing = await users.findOne({ email });
  if (existing) {
    return res.json({ success: false, message: 'Email already registered' });
  }

  const salt = generateSalt();
  const hashed = hash(password, salt);

  await users.insertOne({ email, password: hashed, salt });
  res.json({ success: true, message: 'Registration successful' });
};

// Login.js 
exports.login = async (req, res) => {
  const { email, password } = req.body;
  const db = await connectDB();
  const users = db.collection('users');

  const user = await users.findOne({ email });
  if (!user) {
    return res.json({ success: false, message: 'Email not found' });
  }

  const hashed = hash(password, user.salt);
  if (hashed === user.password) {
    res.json({ success: true, message: 'Login successful' });
  } else {
    res.json({ success: false, message: 'Wrong password' });
  }
};

// Update.js
exports.update = async (req, res) => {
    const { email, newEmail, newPassword } = req.body;
    const db = await connectDB();
    const users = db.collection('users');
  
    const user = await users.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: 'User not found' });
    }
  
    const updateFields = {};
  
    if (newEmail && newEmail !== email) {
      const existing = await users.findOne({ email: newEmail });
      if (existing) {
        return res.json({ success: false, message: 'New email already in use' });
      }
      updateFields.email = newEmail;
    }
  
    if (newPassword && newPassword.trim().length >= 6) {
      const hashed = hash(newPassword, user.salt);
      updateFields.password = hashed;
    }
  
    if (Object.keys(updateFields).length === 0) {
      return res.json({ success: false, message: 'No update fields provided' });
    }
  
    await users.updateOne({ email }, { $set: updateFields });
    res.json({ success: true, message: 'Update successful' });
  };

// ======================== ADDED FAVORITES API ========================

exports.addFavorites = async (req, res) => {
  const { email, movieId } = req.body;
  if (!email || !movieId) {
    return res.json({ success: false, message: 'Missing email or movie ID' });
  }

  const db = await connectDB();
  const users = db.collection('users');

  const user = await users.findOne({ email });
  if (!user) {
    return res.json({ success: false, message: 'User not found' });
  }

  const favorites = user.favorites || [];
  if (favorites.includes(movieId)) {
    return res.json({ success: false, message: 'Already in favorites' });
  }

  await users.updateOne({ email }, { $push: { favorites: movieId } });
  res.json({ success: true, message: 'Added to favorites!' });
};

// ======================== GET FAVORITES API ========================
exports.getFavorites = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.json({ success: false, message: "Missing email" });

  const db = await connectDB();
  const user = await db.collection("users").findOne({ email });
  if (!user) return res.json({ success: false, message: "User not found" });

  res.json({ success: true, favorites: user.favorites || [] });
};

// ======================== ADD LIKED API ========================

  exports.addLikedMovie = async (req, res) => {
  const { email, movieId } = req.body;

  if (!email || !movieId) {
    return res.json({ success: false, message: "Missing data" });
  }

  const db = await connectDB();
  const users = db.collection("users");

  try {
    const user = await users.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    const likedMovies = user.likedMovies || [];

    if (likedMovies.includes(movieId)) {
      return res.json({ success: false, message: "Already liked" });
    }

    await users.updateOne(
      { email },
      { $push: { likedMovies: movieId } }
    );

    res.json({ success: true, message: "Movie liked!" });
  } catch (err) {
    console.error("❌ Error in addLikedMovie:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ======================== GET LIKED API ========================

exports.getLikedMovies = async (req, res) => {
  const { email } = req.body; 

  if (!email) return res.json({ success: false, message: "Missing email" });

  const db = await connectDB();
  const users = db.collection("users");

  const user = await users.findOne({ email });
  if (!user) {
    return res.json({ success: false, message: "User not found" });
  }

  res.json({ success: true, likedMovies: user.likedMovies || [] });
};

// ======================== ADD DISLIKED API ========================

exports.addDislikedMovie = async (req, res) => {
  const { email, movieId } = req.body;
  if (!email || !movieId) {
    return res.json({ success: false, message: "Missing data" });
  }

  const db = await connectDB();
  const users = db.collection("users");

  try {
    const user = await users.findOne({ email });
    if (!user) return res.json({ success: false, message: "User not found" });

    const dislikedMovies = user.dislikedMovies || [];

    if (dislikedMovies.includes(movieId)) {
      return res.json({ success: false, message: "Already disliked" });
    }

    await users.updateOne(
      { email },
      { $push: { dislikedMovies: movieId } }
    );

    res.json({ success: true, message: "Movie disliked!" });
  } catch (err) {
    console.error("❌ Error in addDislikedMovie:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ======================== GET LIKED API ========================

exports.getDislikedMovies = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.json({ success: false, message: "Missing email" });

  const db = await connectDB();
  const users = db.collection("users");

  const user = await users.findOne({ email });
  if (!user) {
    return res.json({ success: false, message: "User not found" });
  }

  res.json({ success: true, dislikedMovies: user.dislikedMovies || []  });
};