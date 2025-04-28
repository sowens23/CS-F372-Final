// server.js
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');
const auth = require('./Javascript/authController'); // Custom authentication controller
const importMovies = require("./Javascript/script_ImportMovies"); // Import the importMovies function

const app = express();
const port = 3000;

// ================= Middleware =================
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
  secret: 'Super_Secret_Key',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 24 * 60 * 60 * 1000 } // 1 day
}));

// ================= Static Resources =================
app.use(express.static(path.join(__dirname))); // For example, login page, registration page, homepage, etc. (HTML files)

// ================= API Registration =================
app.post('/api/account/login', auth.login);
app.post('/api/account/register', auth.register);
// app.post('/api/account/update', auth.update);
app.get("/api/account/session", auth.getSession);
app.get("/api/movie/getFilePath", auth.getGetFilePath);

// For User Account Management
app.post('/api/account/favorite/add', auth.addFavorites);
app.post('/api/account/favorite/remove', auth.removeFavorites);
app.post('/api/account/favorite/get', auth.getFavorites);
app.post('/api/account/like-dislike', auth.likeDislikeMovie);
app.post('/api/account/like/get', auth.getLikedMovies);
app.post('/api/account/dislike/get', auth.getDislikedMovies);
app.post("/api/movies/search", auth.searchMovies);
app.post("/api/account/logout", auth.logout);
app.post("/api/account/watchHistory", auth.updateWatchHistory);
app.post("/api/account/watchHistory/get", auth.getWatchHistory);
app.post("/api/account/reactions", auth.getUserReactions);

// For Content Editor
app.post('/api/editor/add-movie', auth.addMovie);
app.post("/api/editor/update-movie", auth.updateMovie);
app.post("/api/editor/delete-movie", auth.deleteMovie);
app.post("/api/movies/import", auth.importMovies);

// For Marketing Manager
app.post('/api/marketing/play-count', auth.updatePlayCount);
app.post("/api/movies/feedback/add", auth.addFeedback);
app.get("/api/movies/getAllMovies", auth.getAllMovies);
app.get("/api/users/getAllUsers", auth.getAllUsers);
app.post("/api/movies/update-note", auth.updateMovieNote);

// ================= Import Movies on Server Start =================
// importMovies().then(() => {
//   console.log("✅ Movie import update process completed.");
// });

// ================= Default Webpage to jump to =================
app.get('/', (req, res) => {
  res.redirect('/html/index_Login.html');
});

// ================= 启动服务 =================
app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});
