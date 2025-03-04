/*
  Filename: server.js
  Purpose: Express server that delegates login logic to loginController.js
*/

const express = require('express');
const session = require('express-session');
const path = require('path');
const { handleLoginRequest } = require('./loginController');

const appExpress = express();
const portNumber = 3000;

// Middleware to parse form data
appExpress.use(express.urlencoded({ extended: true }));
appExpress.use(express.json());

// Configure session middleware
appExpress.use(session({
  secret: 'Super_Secret_Key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Set to true if using HTTPS
}));

// Serve static files if you have webpage.html, etc.
appExpress.use(express.static(__dirname));

// Basic POST route for the login form
appExpress.post('/login', handleLoginRequest);

// Route to serve landing_page.html
appExpress.get('/landing', (req, res) => {
  if (req.session.user) {
    res.sendFile(path.join(__dirname, 'landing_page.html'));
  } else {
    res.redirect('/webpage.html'); // Redirect to login page if not authenticated
  }
});

// Start server
appExpress.listen(portNumber, () => {
  console.log(`Server listening on port ${portNumber}...`);
});
