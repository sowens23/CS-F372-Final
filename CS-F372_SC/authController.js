// authController.js
const connectDB = require('./db');
const crypto = require('crypto');
const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

function hash(password, salt) {
  return crypto.createHash('sha256').update(password + salt).digest('hex');
}

function generateSalt() {
  return crypto.randomBytes(16).toString('hex');
}

// Register.js
exports.register = async (req, res) => {
  console.log("Received request", req.body);
  const { email, password,role } = req.body;
  const db = await connectDB();
  const users = db.collection('users');

  const existing = await users.findOne({ email });
  if (existing) {
    return res.json({ success: false, message: 'Email already registered' });
  }

  if (!strongPasswordRegex.test(password)) {
    return res.json({
      success: false,
      message: "Password must include uppercase, lowercase, number, special character, and be at least 8 characters long."
    });
  }

  const salt = generateSalt();
  const hashed = hash(password, salt);

  await users.insertOne({ email, password: hashed, salt});
  res.json({ success: true, message: 'Registration successful' });
};

// Login.js 
exports.login = async (req, res) => {
  const { email, password,role } = req.body;
  const db = await connectDB();
  const users = db.collection('users');

  const user = await users.findOne({ email,role });
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

    if (user.dislikedMovies && user.dislikedMovies.includes(movieId)) {
      return res.json({ success: false, message: "You already disliked this movie" });
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

    if (user.likedMovies && user.likedMovies.includes(movieId)) {
      return res.json({ success: false, message: "You already liked this movie" });
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

// ======================== GET DISLIKED API ========================

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

// ======================== TOGGLE LIKE / DISLIKE API ========================
exports.likeDislikeMovie = async (req, res) => {
  const { email, movieId, action } = req.body;

  if (!email || !movieId || !["like", "dislike", "clear"].includes(action)) {
    return res.status(400).json({ success: false, message: "Invalid input" });
  }

  const db = await connectDB();
  const users = db.collection("users");

  try {
    const user = await users.findOne({ email });
    if (!user) return res.json({ success: false, message: "User not found" });

    if (action === "like") {
      await users.updateOne(
        { email },
        {
          $addToSet: { likedMovies: movieId },
          $pull: { dislikedMovies: movieId }
        }
      );
    } else if (action === "dislike") {
      await users.updateOne(
        { email },
        {
          $addToSet: { dislikedMovies: movieId },
          $pull: { likedMovies: movieId }
        }
      );
    } else if (action === "clear") {
      await users.updateOne(
        { email },
        {
          $pull: {
            likedMovies: movieId,
            dislikedMovies: movieId
          }
        }
      );
    }

    res.json({ success: true, message: `Action '${action}' applied.` });
  } catch (err) {
    console.error("❌ Error in likeDislikeMovie:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ======================== Content Editor Register/Login ========================

// Register for Content Editor
exports.registerEditor = async (req, res) => {
  const { email, password } = req.body;
  const db = await connectDB();
  const users = db.collection('users');

  // Check if email already exists
  const existing = await users.findOne({ email });
  if (existing) {
    return res.json({ success: false, message: 'Email already registered' });
  }

  // Check password strength
  if (!strongPasswordRegex.test(password)) {
    return res.json({
      success: false,
      message: "Password must include uppercase, lowercase, number, special character, and be at least 8 characters long."
    });
  }

  // Hash password and save
  const salt = generateSalt();
  const hashed = hash(password, salt);

  await users.insertOne({ 
    email, 
    password: hashed, 
    salt, 
    role: "editor"  // 👈 Force role as editor
  });

  res.json({ success: true, message: 'Editor registration successful' });
};

// Login for Content Editor
exports.loginEditor = async (req, res) => {
  const { email, password } = req.body;
  const db = await connectDB();
  const users = db.collection('users');

  // Find editor account only
  const user = await users.findOne({ email, role: "editor" });
  if (!user) {
    return res.json({ success: false, message: 'Editor account not found' });
  }

  // Verify password
  const hashed = hash(password, user.salt);
  if (hashed === user.password) {
    res.json({ success: true, message: 'Editor login successful' });
  } else {
    res.json({ success: false, message: 'Wrong password' });
  }
};
