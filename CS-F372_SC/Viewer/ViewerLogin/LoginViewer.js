document.addEventListener("DOMContentLoaded", () => {
// Login Section
document.getElementById('login-button').addEventListener('click', async (event) => {
    event.preventDefault(); // 防止页面刷新
  
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
  
    const res = await fetch('http://localhost:3000/api/account/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({  email,  password }),
    });
  
    const data = await res.json();
    alert(data.message);
    if (data.success) {
      localStorage.setItem("currentUserEmail", email);
      window.location.href = '../../HomeTemplate/index_HomePage.html';
    }
  });
  
  // Register Section
  document.getElementById('register-button').addEventListener('click', async (event) => {
    event.preventDefault();
  
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
  
    const res = await fetch('http://localhost:3000/api/account/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({  email,  password }),
    });
  
    const data = await res.json();
    alert(data.message);
    if (data.success) {
      window.location.href = '../ViewerHomePage/index_ViewerHomePage.html';
    }
  });
});