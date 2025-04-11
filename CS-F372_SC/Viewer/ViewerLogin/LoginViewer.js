document.addEventListener("DOMContentLoaded", () => {

  // ===== Login Section =====
  document.getElementById('login-button').addEventListener('click', async (event) => {
    event.preventDefault(); // 防止页面刷新

    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    const res = await fetch('/api/account/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    alert(data.message);

    if (data.success) {
      localStorage.setItem("currentUserEmail", email);
      localStorage.setItem("username", email.split("@")[0]);

      // clean like/dislike 
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith("liked_") || key.startsWith("disliked_")) {
          localStorage.removeItem(key);
        }
      });

      window.location.href = '../../HomeTemplate/index_HomePage.html';
    }
  });

  // ===== Register Section =====
  document.getElementById('register-button').addEventListener('click', async (event) => {
    event.preventDefault();

    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;

    const res = await fetch('/api/account/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    alert(data.message);

    if (data.success) {
      localStorage.setItem("currentUserEmail", email);
      localStorage.setItem("username", email.split("@")[0]);

      // clean like/dislike 
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith("liked_") || key.startsWith("disliked_")) {
          localStorage.removeItem(key);
        }
      });

      window.location.href = '../../HomeTemplate/index_HomePage.html';
    }
  });

});
