/*
  Filename: server.js
  Function: Node.js server to serve 'webpage.html' and handle login POST.
  Follows Express usage in minimal lines. 
*/

const express = require('express');
const path = require('path');

// Meaningful variable names in CamelCase
const portNumber = 3000;
const appExpress = express();

// Limit code repetition with a single start function
function startServer() {
  // Use express.json or express.urlencoded if you want to parse form data
  appExpress.use(express.urlencoded({ extended: false }));

  // Serve static files (webpage.html, stylesheet.css) from current dir
  // Adjust if you keep them in another directory
  appExpress.use(express.static(__dirname));

  // Basic POST route for the login form
  appExpress.post('/login', (req, res) => {
    const userName = req.body.usernameField;
    const userPassword = req.body.passwordField;

    // For demonstration only:
    // In real use, you'd authenticate userName/userPassword here
    // Possibly redirect or respond with a success/failure
    if (userName && userPassword) {
      return res.send(`Hello, ${userName}. You are logged in.`);
    }
    return res.send('Login failed. Missing username or password.');
  });

  appExpress.listen(portNumber, () => {
    // Keep line short, under 70 chars
    console.log(`Server listening on port ${portNumber}...`);
  });
}

// Start the server
startServer();
