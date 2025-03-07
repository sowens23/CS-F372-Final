/*
  Filename: server.js
  Purpose: Express server that delegates login logic to scriptsHost.js

  TODO: Embedded credentials in code risks unauthorized access. Use environment variables.
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

// Serve static files if you have webpage.html, etc.
app.use(express.static(__dirname));

/*
  Function: configureSession
  Purpose: Configure session middleware
  Input: None
  Output: None
*/
app.use(session({
  secret: 'Super_Secret_Key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Set to true if using HTTPS
}));

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

app.post('/accountLogin', scriptsHost.accountLogin);
app.post('/accountUpdate', scriptsHost.accountUpdate);

// Start server
app.listen(portNumber, () => {
  console.log(`Server listening on port ${portNumber}...`);
  console.log(`Server running at http://localhost:${portNumber}/`);
});
