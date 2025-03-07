
/*
  Filename: scriptsClient.js
  Purpose: Handle Client side functions
  Functions:
    showPage
    updateSessionStatus
    loginForm
    updateForm
*/

/*
  Function: showPage
  Purpose: This is the script to set 
    website pages to active or inactive
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


/*
Function: updateSessionStatus
Purpose: This is the script to update the session status
Input: None
Output: Updates the session status
*/
function updateSessionStatus() {
  // Display active session
  const sessionStatus = document.getElementById('sessionStatus');
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

// Global function to handle form submission
function handleFormSubmit(event) {
  event.preventDefault();
  const form = event.target;
  let email;
  let password;
  let endpoint;
  let messageElement;
  let requestBody;

  if (form.id === 'loginForm') {
    email = form.querySelector('#loginEmail').value;
    password = form.querySelector('#loginPassword').value;
    endpoint = '/accountLogin';
    messageElement = document.getElementById('accountLoginMessage');
    requestBody = { loginEmail: email, loginPassword: password };
  } else if (form.id === 'updateForm') {
    email = form.querySelector('#updateEmail').value;
    password = form.querySelector('#updatePassword').value;
    endpoint = '/accountUpdate';
    messageElement = document.getElementById('accountUpdateMessage');
    requestBody = { updateEmail: email, updatePassword: password };
  }

  console.log('Form ID:', form.id);
  console.log('Email:', email);
  console.log('Password:', password);
  console.log('Request Body:', requestBody);

  fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(requestBody)
  })
  .then(response => {
    console.log('Response status:', response.status);
    return response.json();
  })
  .then(data => {
    console.log('Response data:', data);
    if (data.success) {
      messageElement.innerText = data.message;
      messageElement.style.color = 'green';
      updateSessionStatus();
      if (form.id === 'loginForm') {
        setTimeout(() => {
          showPage('galleryPage', 'galleryTab');
        }, 2000);
      }
    } else {
      messageElement.innerText = data.message;
      messageElement.style.color = 'red';
    }
  })
  .catch(error => {
    console.error('Fetch error:', error);
    messageElement.innerText = 'An error occurred. Please try again.';
    messageElement.style.color = 'red';
  });
}

document.addEventListener('DOMContentLoaded', () => {
  // Call updateSessionStatus initially to check if there's already an active session
  updateSessionStatus();

  // Initially show the home page
  showPage('homePage', 'homeTab');

  // Collect form data
  const loginForm = document.getElementById('loginForm');
  const updateForm = document.getElementById('updateForm');

  // Add event listeners for forms
  loginForm.addEventListener('submit', handleFormSubmit);
  updateForm.addEventListener('submit', handleFormSubmit);
});