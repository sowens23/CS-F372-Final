/*
  Filename: server.js
  Purpose: Express server that delegates all javascripts functions to scriptsHost.js
  TODO: Embedded credentials in code risks unauthorized access. Use environment variables.
  Functions:
    - /getSessionStatus: Checks for active session, returns boolean and user email
    - /: Serves landingPage.html if session active, redirects to login page otherwise
    - /accountLogin: POST request to validate user login credentials
    - /accountUpdate: POST request to update user account details
    - /landingPage: Serves landingPage.html
    - /scriptsHost/accountLogin: POST request to validate user login credentials
    - /scriptsHost/accountUpdate: POST request to update user account details
  Dependencies:
    - express
    - express-session
    - path
    - body-parser
    - scriptsHost
  Deployment: 
    - Install dependencies
    - Run server.js
    - Access server at http://localhost:3000/
*/

const express = require('express');
const session = require('express-session');
const path = require('path');
const bodyParser = require('body-parser');
const scriptsHost = require('./scriptsHost')

const app = express();
const portNumber = 3000;

// Middleware to parse form data
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Serve static files
app.use(express.static(__dirname));

// Session configuration
app.use(session({
  secret: 'Super_Secret_Key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Set to true if using HTTPS
}));

// Checks for active session and sets session variable
app.get('/getSessionStatus', (req, res) => {
  if (req.session.user) {
    res.json({ activeSession: true, userEmail: req.session.user });
  } else {
    res.json({ activeSession: false });
  }
});

// Checks for sessions, then serves the landingPage
app.get('/', (req, res) => {
  if (req.session.user) {
    res.sendFile(path.join(__dirname, 'landingPage.html'));
  } else {
    res.redirect('/landingPage.html');
  }
});

// POST Redirects to process Host Side scripts
app.post('/accountLogin', scriptsHost.accountLogin);
app.post('/accountUpdate', scriptsHost.accountUpdate);

// Start server
app.listen(portNumber, () => {
  console.log(`Server listening on port ${portNumber}...`);
  console.log(`Server running at http://localhost:${portNumber}/`);
});
