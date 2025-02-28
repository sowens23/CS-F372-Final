/*
  Filename: server.js
  Purpose: Express server that delegates login logic to loginController.js
*/

const express = require('express');
const { handleLoginRequest } = require('./loginController');

const appExpress = express();
const portNumber = 3000;

// Middleware to parse form data
appExpress.use(express.urlencoded({ extended: true }));
appExpress.use(express.json());

// Serve static files if you have webpage.html, etc.
appExpress.use(express.static(__dirname));

// Basic POST route for the login form
appExpress.post('/login', handleLoginRequest);

// Start server
appExpress.listen(portNumber, () => {
  console.log(`Server listening on port ${portNumber}...`);
});
