// Switch between Login and Register
const loginBox = document.getElementById('loginBox');
const registerBox = document.getElementById('registerBox');

document.getElementById('goRegister').addEventListener('click', (e) => {
  e.preventDefault();
  loginBox.classList.add('hidden');
  registerBox.classList.remove('hidden');
});

document.getElementById('goLogin').addEventListener('click', (e) => {
  e.preventDefault();
  registerBox.classList.add('hidden');
  loginBox.classList.remove('hidden');
});

// Handle Login
const loginForm = document.getElementById('loginForm');
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;

  try {
    const res = await fetch('/api/editor/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (data.success) {
      alert('🎉 Welcome back, Editor!');
      window.location.href = "../MovieEditor/index_MovieEditor.html";
    } else {
      alert('❗ Login failed: ' + data.message);
    }
  } catch (err) {
    console.error(err);
    alert('⚠️ Network error. Please try again later.');
  }
});

// Handle Register
const registerForm = document.getElementById('registerForm');
registerForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = document.getElementById('registerUsername').value;
  const email = document.getElementById('registerEmail').value;
  const password = document.getElementById('registerPassword').value;

  if (!username || !email || !password) {
    alert('⚠️ Please fill in all fields.');
    return;
  }

  try {
    const res = await fetch('/api/editor/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (data.success) {
      alert('🎉 Registration successful! Redirecting to login...');
      setTimeout(() => {
        window.location.href = '../MovieEditor/index_MovieEditor.html';
      }, 2000); // 2 seconds delay then go login page
    } else {
      console.error('❗ Registration failed:', data.message);
      alert('❗ Registration failed: ' + data.message);
    }
  } catch (err) {
    console.error(err);
    alert('⚠️ Network error. Please try again later.');
  }
});
