



function updateAccount() {
  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  if (name && email && password) {
      alert("Account information updated successfully!");
  } else {
      alert("Please fill in all fields.");
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('loginForm');
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const data = {
      usernameField: formData.get('usernameField'),
      passwordField: formData.get('passwordField')
    };

    try {
      const response = await fetch('/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      const result = await response.json();
      document.getElementById('message').innerText = result.message;

      if (result.success) {
        setTimeout(() => {
          window.location.href = '/landing';
        }, 2000);
      }
    } catch (error) {
      console.error('Error:', error);
      document.getElementById('message').innerText = 'Login failed. Please try again.';
    }
  });
});