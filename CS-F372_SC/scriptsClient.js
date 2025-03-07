
/*
Filename: script.js
Purpose: Handle navigation and form submission
*/

/*
  Function: showPage
  Purpose: This is the script to set website pages to active or inactive
  Input: pageID, tabID
  Output: None
*/
function showPage(pageId, tabId) {
  // Hide all content sections
  var contents = document.querySelectorAll('.content');
  contents.forEach(content => content.classList.remove('active'));

  // Remove active class from all tabs 
  var tabs = document.querySelectorAll('ul li'); 
  tabs.forEach(tab => tab.classList.remove('active'));

  // Show the selected content
  document.getElementById(pageId).classList.add('active');

  // Add active class to the selected tab
  document.getElementById(tabId).classList.add('active');
}

document.addEventListener('DOMContentLoaded', () => {
  // Display active session
  const sessionStatus = document.getElementById('sessionStatus');

  // Function to update session status when called
  function updateSessionStatus() {
    fetch('/getSessionStatus', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    .then(response => response.json())
    .then(data => {
      if (data.activeSession) {
        sessionStatus.innerText = 'Logged in as: ' + data.userEmail;
      } else {
        sessionStatus.innerText = 'Not logged in';
      }
    })
    .catch(error => {
      console.error('Error fetching session status:', error);
      sessionStatus.innerText = 'Session status unknown';
    });
  }

  // Call updateSessionStatus initially to check if there's already an active session
  updateSessionStatus();

  // Initially show the home page
  showPage('homePage', 'homeTab');

  // Initiate Login
  const loginForm = document.getElementById('loginForm');

  loginForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    fetch('/accountLogin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ loginEmail: email, loginPassword: password })
    })
    .then(response => response.json())
    .then(data => {
      const accountLoginMessage = document.getElementById('accountLoginMessage');
      if (data.success) {
        accountLoginMessage.innerText = data.message;
        accountLoginMessage.style.color = 'green';
        updateSessionStatus();
        setTimeout(() => {
          showPage('galleryPage', 'galleryTab');
        }, 2000);
        
      } else {
        accountLoginMessage.innerText = data.message;
        accountLoginMessage.style.color = 'red';
      }
    })
    .catch(error => {
      document.getElementById('accountLoginMessage').innerText = 'Account Login error occurred. Please try again.';
      document.getElementById('accountLoginMessage').style.color = 'red';
    });
  });

  // Initiate Update Account
  const updateForm = document.getElementById('updateForm');

  updateForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const email = document.getElementById('updateEmail').value;
    const password = document.getElementById('updatePassword').value;

    fetch('/accountUpdate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ updateEmail: email, updatePassword: password })
    })
    .then(response => response.json())
    .then(data => {
      const accountUpdateMessage = document.getElementById('accountUpdateMessage');
      if (data.success) {
        accountUpdateMessage.innerText = data.message;
        accountUpdateMessage.style.color = 'green';
        updateSessionStatus();
      } else {
        accountUpdateMessage.innerText = data.message;
        accountUpdateMessage.style.color = 'red';
      }
    })
    .catch(error => {
      document.getElementById('accountUpdateMessage').innerText = 'Account Update error occurred. Please try again.';
      document.getElementById('accountUpdateMessage').style.color = 'red';
    });
  });

});