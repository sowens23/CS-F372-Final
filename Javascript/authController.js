// authController.js
const connectDB = require('./db');
const crypto = require('crypto');
const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

const path = require("path");
const fs = require("fs"); // Ensure the `fs` module is also imported for file operations

function hash(password, salt) {
  return crypto.createHash('sha256').update(password + salt).digest('hex');
}

function generateSalt() {
  return crypto.randomBytes(16).toString('hex');
}

// Register.js
exports.register = async (req, res) => {
  console.log("Received request", req.body);
  const { username, email, password, roles = [] } = req.body; // Default roles to an empty array
  const db = await connectDB();
  const users = db.collection('users');

  try {
    // Validate input
    if (!username || !email || !password) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const user = await users.findOne({ email });
    if (user) {
      return res.json({ success: false, message: 'User already registered' });
    }

    // Email validation regex
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!emailRegex.test(email)) {
      return res.json({ success: false, message: '⚠️ Please enter a valid email address.' });
    }

    if (!strongPasswordRegex.test(password)) {
      return res.json({
        success: false,
        message: "Password must include uppercase, lowercase, number, special character, and be at least 8 characters long."
      });
    }

    const salt = generateSalt();
    const hashed = hash(password, salt);

    // Insert the new user into the database
    try {
      await users.insertOne({ username, email, password: hashed, salt, roles });
    } catch (dbError) {
      console.error("❌ Database error during registration:", dbError);
      return res.status(500).json({ success: false, message: "Database error" });
    }

    // Automatically log the user in by creating a session
    req.session.user = { 
      email: email, 
      username: username, 
      roles: roles
    };

    // Determine redirection based on roles
    let redirectPage = "/html/index_Home.html"; // Default page
    if (roles.includes("Marketing Manager")) {
      redirectPage = "/html/index_MarketingManager.html";
    } else if (roles.includes("Content Editor")) {
      redirectPage = "/html/index_ContentEditor.html";
    }

    res.json({ success: true, message: "Registration successful", redirect: redirectPage });
  } catch (error) {
    console.error("❌ Error during registration:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  const db = await connectDB();
  const users = db.collection("users");

  // Check if email and password are provided
  if (!email || !password) {
    return res.status(400).json({ success: false, message: "Missing email or password" });
  }

  // Email validation regex
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  if (!emailRegex.test(email)) {
    return res.json({ success: false, message: '⚠️ Please enter a valid email address.' });
  }

  const user = await users.findOne({ email });
  if (!user) {
    return res.json({ success: false, message: 'Email not found' });
  }

  const hashed = hash(password, user.salt);

  if (hashed === user.password) {
    // Store email, username, and roles in session
    req.session.user = { 
      email: email, 
      username: user.username, 
      roles: user.roles || ["viewer"] // Default to "viewer" if roles are not defined
    };

    // Determine redirection based on roles
    let redirectPage = "/html/index_Home.html"; // Default page
    if (user.roles.includes("Marketing Manager")) {
      redirectPage = "/html/index_MarketingManager.html";
    } else if (user.roles.includes("Content Editor")) {
      redirectPage = "/html/index_ContentEditor.html";
    }

    res.json({ success: true, message: 'Login successful', redirect: redirectPage });
    console.log("Session data:", req.session);
  } else {
    res.json({ success: false, message: 'Wrong password' });
  }
};

// API to retrieve the session information
exports.getSession = async (req, res) => {
  try {
    if (req.session && req.session.user) {
      res.json({
        success: true,
        email: req.session.user.email,
        username: req.session.user.username,
        roles: req.session.user.roles
      });
    } else {
      res.json({ success: false, message: "No active session" });
    }
  } catch (error) {
    console.error("❌ Error fetching session:", error);
    res.status(500).json({ success: false, message: "Failed to fetch session" });
  }
};


// ======================== ADDED FAVORITES API ========================
exports.addFavorites = async (req, res) => {
  console.log("Received request to add favorite:", req.body); // Debugging log

  const { email, movieTitle } = req.body;
  if (!email || !movieTitle) {
    return res.json({ success: false, message: 'Missing email or movie title' });
  }

  const db = await connectDB();
  const users = db.collection('users');

  const user = await users.findOne({ email });
  if (!user) {
    return res.json({ success: false, message: 'User not found' });
  }

  const favorites = user.favorites || [];
  if (favorites.includes(movieTitle)) {
    return res.json({ success: false, message: 'Already in favorites' });
  }

  await users.updateOne({ email }, { $push: { favorites: movieTitle } });
  res.json({ success: true, message: 'Added to favorites!' });
};

// ======================== REMOVE FAVORITES API ========================
exports.removeFavorites = async (req, res) => {
  const { email, movieTitle } = req.body;

  console.log("Received request to remove favorite:", { email, movieTitle }); // Debugging log

  if (!email || !movieTitle) {
    return res.json({ success: false, message: 'Missing email or movie title' });
  }

  const db = await connectDB();
  const users = db.collection('users');

  const user = await users.findOne({ email });
  if (!user) {
    return res.json({ success: false, message: 'User not found' });
  }

  const favorites = user.favorites || [];
  if (!favorites.includes(movieTitle)) {
    return res.json({ success: false, message: 'Movie not in favorites' });
  }

  await users.updateOne({ email }, { $pull: { favorites: movieTitle } });
  res.json({ success: true, message: 'Removed from favorites!' });
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
  const db = await connectDB();
  const users = db.collection("users");

  try {
    const user = await users.findOne({ email });
    if (!user || !user.likedMovies) {
      return res.json({ success: true, likedMovies: [] }); // Return an empty array if no likes
    }

    res.json({ success: true, likedMovies: user.likedMovies });
  } catch (error) {
    console.error("❌ Error fetching liked movies:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
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
  const { email, movieTitle, action } = req.body;

  if (!email || !movieTitle || !action) {
    return res.status(400).json({ success: false, message: "Missing required fields" });
  }

  const db = await connectDB();
  const users = db.collection("users");

  try {
    const user = await users.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const update = {};
    if (action === "like") {
      update.$addToSet = { likedMovies: movieTitle }; // Add to likedMovies array if not already present
      update.$pull = { dislikedMovies: movieTitle }; // Remove from dislikedMovies array if present
    } else if (action === "dislike") {
      update.$addToSet = { dislikedMovies: movieTitle }; // Add to dislikedMovies array if not already present
      update.$pull = { likedMovies: movieTitle }; // Remove from likedMovies array if present
    } else if (action === "clear") {
      update.$pull = { likedMovies: movieTitle, dislikedMovies: movieTitle }; // Remove from both arrays
    }

    await users.updateOne({ email }, update);

    res.json({ success: true, message: `Movie ${action}d successfully` });
  } catch (error) {
    console.error("❌ Error updating likes/dislikes:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ======================== Add Movie ========================
exports.addMovie = async (req, res) => {
  const { title, genre, poster, filepath } = req.body; // Get movie details from the request body
  const db = await connectDB();
  const movies = db.collection("movies");

  try {
    // Check if the movie already exists
    const existingMovie = await movies.findOne({ title });
    if (existingMovie) {
      return res.status(400).json({ success: false, message: "Movie with this title already exists." });
    }

    // Add the movie to the database
    const timestamp = new Date(); // Current timestamp
    const newMovie = {
      title,
      genre,
      poster,
      filepath,
      createdAt: timestamp,
    };
    await movies.insertOne(newMovie);

    res.json({ success: true, message: "Movie added successfully." });
  } catch (error) {
    console.error("❌ Error adding movie:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ======================== Update play count ========================
exports.updatePlayCount = async (req, res) => {
  console.log("Received request to update play count:", req.body);
  const { title } = req.body;

  if (!title) {
    return res.status(400).json({ success: false, message: "Missing movie title" });
  }

  const db = await connectDB();
  const movies = db.collection("movies");

  try {
    const result = await movies.updateOne(
      { title }, // Match the movie by title
      { $inc: { plays: 1 } }, // Increment the play count
      { upsert: false } // Do not insert a new document if it doesn't exist
    );

    if (result.matchedCount === 0) {
      console.warn(`⚠ Movie with title "${title}" not found.`);
      return res.status(404).json({ success: false, message: "Movie not found" });
    }

    console.log(`✅ Play count updated successfully for "${title}"`);
    res.json({ success: true, message: "Play count updated successfully" });
  } catch (err) {
    console.error("❌ Error updating play count:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ======================== Update Watch History ========================
exports.updateWatchHistory = async (req, res) => {
  console.log("Received request to update watch history:", req.body);
  const { title, email } = req.body;

  // Validate the input
  if (!title || !email) {
    return res.status(400).json({ success: false, message: "Missing movie title or user email" });
  }

  const db = await connectDB();
  const users = db.collection("users");

  try {
    // Update the user's watch history
    const timestamp = new Date();
    const result = await users.updateOne(
      { email }, // Match the user by email
      { $push: { watchHistory: { title, watchedAt: timestamp } } }, // Add to watch history
      { upsert: false } // Do not insert a new document if it doesn't exist
    );

    if (result.matchedCount === 0) {
      console.warn(`⚠ User with email "${email}" not found.`);
      return res.status(404).json({ success: false, message: "User not found" });
    }

    console.log(`✅ Watch history updated for "${email}" with movie "${title}"`);
    res.json({ success: true, message: "Watch history updated successfully" });
  } catch (err) {
    console.error("❌ Error updating watch history:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ======================== Get Watch History ========================
exports.getWatchHistory = async (req, res) => {
  console.log("Received request to fetch watch history:", req.body);
  const { email } = req.body;

  // Validate the input
  if (!email) {
    return res.status(400).json({ success: false, message: "Missing user email" });
  }

  const db = await connectDB();
  const users = db.collection("users");

  try {
    // Fetch the user's watch history
    const user = await users.findOne({ email }, { projection: { watchHistory: 1 } });

    if (!user || !user.watchHistory) {
      console.warn(`⚠ User with email "${email}" not found or no watch history.`);
      return res.status(404).json({ success: false, message: "You have not watched any movies yet." });
    }

    console.log(`✅ Watch history fetched for "${email}"`);
    res.json({ success: true, watchHistory: user.watchHistory });
  } catch (err) {
    console.error("❌ Error fetching watch history:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ======================== Add Feedback ========================
exports.addFeedback = async (req, res) => {
  console.log("Received feedback submission:", req.body);
  const { movie, comment, email } = req.body;

  if (!movie || !comment || !email) {
    return res.status(400).json({ success: false, message: "Missing movie, comment, or user email" });
  }

  const db = await connectDB();
  const movies = db.collection("movies");

  try {
    // Ensure the feedback field exists
    await movies.updateOne(
      { title: movie },
      { $setOnInsert: { feedback: [] } },
      { upsert: true }
    );

    // Add the feedback
    const result = await movies.updateOne(
      { title: movie },
      { $push: { feedback: { email, comment, submittedAt: new Date() } } }
    );

    if (result.matchedCount === 0) {
      console.warn(`⚠ Movie with title "${movie}" not found.`);
      return res.status(404).json({ success: false, message: "Movie not found" });
    }

    console.log(`✅ Feedback added for movie "${movie}" by user "${email}"`);
    res.json({ success: true, message: "Feedback added successfully" });
  } catch (err) {
    console.error("❌ Error adding feedback:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ======================== Search Movies ========================
exports.searchMovies = async (req, res) => {
  const { query } = req.body; // Get the search query from the request body
  const db = await connectDB();
  const movies = db.collection("movies");

  try {
    // Search for movies with titles matching the query (case-insensitive)
    const searchResults = await movies.find({
      title: { $regex: query, $options: "i" } // "i" makes it case-insensitive
    }).toArray();

    res.json({ success: true, movies: searchResults });
  } catch (error) {
    console.error("❌ Error searching movies:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ======================== Update Movies ========================
exports.updateMovie = async (req, res) => {
  const { originalTitle, updatedTitle, updatedGenre, updatedPoster, updatedFilepath } = req.body;
  const db = await connectDB();
  const movies = db.collection("movies");

  try {
    // Find the movie by its original title
    const movie = await movies.findOne({ title: originalTitle });
    if (!movie) {
      return res.status(404).json({ success: false, message: "Movie not found" });
    }

    // Update the movie with the new details
    await movies.updateOne(
      { title: originalTitle },
      {
        $set: {
          title: updatedTitle,
          genre: updatedGenre,
          poster: updatedPoster,
          filepath: updatedFilepath,
        },
      }
    );

    console.log("Original title received:", originalTitle);
    res.json({ success: true, message: `Movie "${updatedTitle}" updated successfully.` });
  } catch (error) {
    console.error("❌ Error updating movie:", error);
    res.status(500).json({ success: false, message: "Failed to update movie" });
  }
};

// API to fetch all movies with play counts and feedback
exports.getAllMovies = async (req, res) => {
  const db = await connectDB();
  const movies = db.collection("movies");

  try {
    // Fetch all movies from the database
    const allMovies = await movies.find({}).toArray();

    res.json({ success: true, movies: allMovies });
  } catch (error) {
    console.error("❌ Error fetching movies:", error);
    res.status(500).json({ success: false, message: "Failed to fetch movies" });
  }
};

// API to Logout
exports.logout = async (req, res) => {
  try {
    req.session.destroy((err) => {
      if (err) {
        console.error("❌ Error destroying session:", err);
        return res.status(500).json({ success: false, message: "Failed to log out" });
      }
      res.clearCookie("connect.sid"); // Clear the session cookie
      res.json({ success: true, message: "Logged out successfully" });
    });
  } catch (error) {
    console.error("❌ Error during logout:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Delete Movie
exports.deleteMovie = async (req, res) => {
  const { title } = req.body; // Get the movie title from the request body
  const db = await connectDB();
  const movies = db.collection("movies");

  try {
    // Delete the movie from the database
    const result = await movies.deleteOne({ title });
  } catch (error) {
    console.error("❌ Error deleting movie:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.getUserReactions = async (req, res) => {
  const { email } = req.body;
  const db = await connectDB();
  const users = db.collection("users");

  try {
    // Fetch the user's liked, disliked, and favorited movies
    const user = await users.findOne(
      { email },
      { projection: { likedMovies: 1, dislikedMovies: 1, favorites: 1 } }
    );

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Construct the reactions object
    const reactions = {};

    // Initialize all reactions as false
    const allMovies = new Set([
      ...(user.likedMovies || []),
      ...(user.dislikedMovies || []),
      ...(user.favorites || []),
    ]);

    allMovies.forEach((movie) => {
      reactions[movie] = { likedMovies: false, dislikedMovies: false, favorites: false };
    });

    // Update reactions based on database hits
    (user.likedMovies || []).forEach((movie) => {
      reactions[movie].likedMovies = true;
    });

    (user.dislikedMovies || []).forEach((movie) => {
      reactions[movie].dislikedMovies = true;
    });

    (user.favorites || []).forEach((movie) => {
      reactions[movie].favorites = true;
    });

    res.json({ success: true, reactions });
  } catch (error) {
    console.error("❌ Error fetching user reactions:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Returns all user emails from the database
exports.getAllUsers = async (req, res) => {
  const db = await connectDB();
  const users = db.collection("users");

  try {
    // Fetch all users and project only their email field
    const userEmails = await users.find({}, { projection: { email: 1, _id: 0 } }).toArray();

    // Extract emails into a simple array
    const emails = userEmails.map((user) => user.email);

    res.json({ success: true, emails });
  } catch (error) {
    console.error("❌ Error fetching user emails:", error);
    res.status(500).json({ success: false, message: "Failed to fetch user emails" });
  }
};

// Update Marketing Manager Notes
exports.updateMovieNote = async (req, res) => {
  const { title, note } = req.body;
  const db = await connectDB();
  const movies = db.collection("movies");

  try {
    const result = await movies.updateOne(
      { title },
      { $set: { note } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ success: false, message: "Movie not found" });
    }

    res.json({ success: true, message: `Note for movie "${title}" updated successfully.` });
  } catch (error) {
    console.error("❌ Error updating movie note:", error);
    res.status(500).json({ success: false, message: "Failed to update movie note" });
  }
};


// ======================== Import Movies API ========================
const importMovies = require("./script_ImportMovies");

exports.importMovies = async (req, res) => {
  try {
    const result = await importMovies();
    if (result.success) {
      res.json({ success: true, message: result.message });
    } else {
      res.status(400).json({ success: false, message: result.message });
    }
  } catch (error) {
    console.error("❌ Error in importMovies API:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
};