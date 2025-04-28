let currentUserEmail = null; // Global variable to store the logged-in user's email
let username = null; // Global variable to store the logged-in user's username
let allMovies = null; // Global variable to store all movie details

let favoritesRendered = false; // Flag to prevent multiple renders

// === Initialization Logic ===
document.addEventListener("DOMContentLoaded", async () => {
  const bannerEmail = document.getElementById("banner-email");
  const usernameElement = document.getElementById("username"); // Select the username span

  try {
    // === Session Initialization ===
    const sessionResponse = await fetch("http://localhost:3000/api/account/session", {
      credentials: "include",
    });
    const sessionData = await sessionResponse.json();

    if (sessionData.success) {
      currentUserEmail = sessionData.email;
      // roles = sessionData.roles;
      username = sessionData.username || ""; // Leave blank if username is not provided
      bannerEmail.textContent = `Logged in as: ${sessionData.email}`;
      usernameElement.textContent = username; // Update the username in the DOM
      console.log("✅ Session initialized:", sessionData.email, username);
    } else {
      currentUserEmail = null;
      username = null;
      bannerEmail.textContent = "Not logged in";
      usernameElement.textContent = ""; // Leave blank if no active session
      alert("❌ You must be logged in to access this page.");
      window.location.href = "../html/index_Login.html"; // Redirect to Login page
      console.warn("⚠ No active session found.");
    }

    // === Fetch All Movies ===
    console.log("Fetching all movies...");
    try {
      const movieResponse = await fetch("http://localhost:3000/api/movies/getAllMovies");
      const movieData = await movieResponse.json();

      if (!movieResponse.ok || !movieData.success) {
        throw new Error(`Failed to fetch movies: ${movieData.message || movieResponse.status}`);
      }

      allMovies = movieData.movies; // Store the movies in the global variable
      console.log("🎥 All movies loaded:", allMovies);
    } catch (error) {
      console.error("❌ Error fetching movies:", error);
    }

    // === Render Favorites ===
    if (currentUserEmail) {
      await renderFavorites();
    } else {
      console.error("⚠ Cannot render favorites: User is not logged in.");
    }

    // === Sync Reactions from DB ===
    await renderReactions();
  } catch (error) {
    console.error("❌ Error during initialization:", error);
    currentUserEmail = null;
    username = null;
    bannerEmail.textContent = "Error loading session";
    usernameElement.textContent = ""; // Leave blank if session fetch fails
  }
});

async function renderFavorites() {
  console.log("🧲 renderFavorites called");
  console.log("Current user email:", currentUserEmail);

  const container = document.getElementById("favorite-movie-list");
  container.innerHTML = ""; // Clear the container before rendering

  if (!currentUserEmail) {
    console.error("⚠ User is not logged in.");
    container.innerHTML = "<p>Please log in to view your favorite movies.</p>";
    return;
  }

  // Fetch and render favorite movies
  try {
    const res = await fetch("http://localhost:3000/api/account/favorite/get", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: currentUserEmail }),
    });

    const data = await res.json();
    if (!data.success) {
      console.error("❌ Failed to load favorite movies:", data.message);
      container.innerHTML = "<p>Failed to load favorite movies.</p>";
      return;
    }

    // Check if there are no favorites
    if (!data.favorites || data.favorites.length === 0) {
      container.innerHTML = "<p>You haven't favorited any movies yet.</p>";
      return;
    }

    // Render favorite movies
    const uniqueMovies = [...new Set(data.favorites)];
    uniqueMovies.forEach((movieTitle) => {
      const movie = Object.values(allMovies).find((m) => m.title === movieTitle);
      if (movie) {
        const card = document.createElement("div");
        card.className = "movie-card";
        card.innerHTML = `
          <img src="${movie.poster}" alt="${movie.title}" />
          <h3>${movie.title}</h3>
          <p>Genre: ${movie.genre || "Unknown"}</p>
          <div class="controls">
            <button class="play-button">▶ Play</button>
          </div>
        `;

        // Attach event listener to the play button
        card.querySelector(".play-button").addEventListener("click", () => {
          window.location.href = `../../html/VideoPlayer.html?title=${encodeURIComponent(movie.title)}`;
        });

        container.appendChild(card);
      }
    });

    console.log("✅ Favorite movies loaded successfully.");
  } catch (error) {
    console.error("❌ Error loading favorite movies:", error);
    container.innerHTML = "<p>Error loading favorite movies.</p>";
  }
}

async function renderReactions() {
  if (!currentUserEmail) {
    console.error("⚠ Cannot sync reactions: User is not logged in.");
    return;
  }

  try {
    const likedRes = await fetch("http://localhost:3000/api/account/like/get", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: currentUserEmail }),
    });
    const likedData = await likedRes.json();
    if (likedData.success) {
      console.log("✅ Liked movies synced:", likedData.likedMovies);
    }

    const dislikedRes = await fetch("http://localhost:3000/api/account/dislike/get", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: currentUserEmail }),
    });
    const dislikedData = await dislikedRes.json();
    if (dislikedData.success) {
      console.log("✅ Disliked movies synced:", dislikedData.dislikedMovies);
    }
  } catch (err) {
    console.error("❌ Failed to sync reactions:", err);
  }
}


window.addEventListener("DOMContentLoaded", async () => {
  // 同步点赞/点踩状态
  await renderReactions();

  // === 显示用户名 ===
  const username = currentUserEmail;
  document.getElementById("username").textContent = username;

  // === 左侧菜单切换功能 ===
  const buttons = document.querySelectorAll(".menu-item");
  const sections = document.querySelectorAll(".content-section");

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = btn.getAttribute("data-section");
  
      sections.forEach((sec) => {
        sec.classList.toggle("hidden", sec.id !== target);
      });
  
      // Trigger content loading when switching tabs
      if (target === "favorite") {
        if (currentUserEmail) {
          renderFavorites();
        } else {
          console.error("⚠ Cannot render favorites: User is not logged in.");
        }
      }
      if (target === "history") renderHistory();
      if (target === "liked") renderLikedMovies();
      if (target === "disliked") loadDislikedMovies();
    });
  });

  // === Feedback Form ===
  const feedbackForm = document.getElementById("feedback-form");
  const feedbackResult = document.getElementById("feedback-result");
  
  feedbackForm.addEventListener("submit", async (e) => {
    e.preventDefault();
  
    const movie = document.getElementById("movie-select").value; // Selected movie title
    const comment = document.getElementById("comment").value; // User's comment
  
    if (!movie || !comment) {
      alert("⚠ Please select a movie and enter a comment.");
      return;
    }
  
    try {
      const res = await fetch("http://localhost:3000/api/movies/feedback/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ movie, comment, email: currentUserEmail }),
      });
  
      const data = await res.json();
      if (data.success) {
        feedbackResult.textContent = `🎉 Thank you for your feedback on "${movie}"!`;
        feedbackForm.reset();
      } else {
        feedbackResult.textContent = `❌ Failed to submit feedback: ${data.message}`;
      }
    } catch (err) {
      console.error("❌ Error submitting feedback:", err);
      feedbackResult.textContent = "❌ Error submitting feedback. Please try again.";
    }
  });

  /* Liked Movies */
  async function renderLikedMovies() {
    console.log("👍 Loading liked movies...");
    const container = document.getElementById("liked-movie-list");
    container.innerHTML = ""; // Clear the container before rendering
  
    const email = currentUserEmail;
    if (!email) {
      console.error("❌ User not signed in.");
      container.innerHTML = "<p>Error: Email not found.</p>";
      return;
    }
  
    try {
      const res = await fetch("http://localhost:3000/api/account/like/get", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
  
      const data = await res.json();
      console.log("✅ Liked movies response:", data);
  
      if (!data || !data.success) {
        container.innerHTML = "<p>Failed to load liked movies.</p>";
        return;
      }
  
      const likedMovies = data.likedMovies;
      if (likedMovies.length === 0) {
        container.innerHTML = "<p>You haven't liked any movies yet.</p>";
        return;
      }
  
      // Iterate through likedMovies and find matching movies in allMovies by title
      for (const likedTitle of likedMovies) {
        const movie = Object.values(allMovies).find((m) => m.title === likedTitle);
        if (!movie) {
          console.warn(`⚠ Movie with title "${likedTitle}" not found in allMovies.`);
          continue;
        }
  
        const card = document.createElement("div");
        card.className = "movie-card";
        card.innerHTML = `
          <img src="${movie.poster}" alt="${movie.title}" />
          <h3>${movie.title}</h3>
          <p>Genre: ${movie.genre || "Unknown"}</p>
          <div class="controls">
            <button class="play-button">▶ Play</button>
          </div>
        `;
  
        // Attach event listener to the play button
        card.querySelector(".play-button").addEventListener("click", () => {
          window.location.href = `../../html/VideoPlayer.html?title=${encodeURIComponent(movie.title)}`;
        });
  
        container.appendChild(card);
      }
  
      console.log("✅ Liked movies loaded successfully.");
    } catch (err) {
      console.error("❌ Error loading liked movies:", err);
      container.innerHTML = "<p>Error loading liked movies.</p>";
    }
  }

  /* Disliked Movies */
  async function loadDislikedMovies() {
    console.log("👎 Loading disliked movies...");
    const container = document.getElementById("disliked-movie-list");
    container.innerHTML = ""; // Clear the container before rendering
  
    const email = currentUserEmail;
    if (!email) {
      container.innerHTML = "<p>Please log in to view disliked movies.</p>";
      return;
    }
  
    try {
      const res = await fetch("http://localhost:3000/api/account/dislike/get", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
  
      const data = await res.json();
      console.log("✅ Disliked movies response:", data);
  
      if (!data || !data.success) {
        container.innerHTML = "<p>Failed to load disliked movies.</p>";
        return;
      }
  
      const dislikedMovies = data.dislikedMovies;
      if (dislikedMovies.length === 0) {
        container.innerHTML = "<p>You haven't disliked any movies yet.</p>";
        return;
      }
  
      // Iterate through dislikedMovies and find matching movies in allMovies by title
      for (const dislikedTitle of dislikedMovies) {
        const movie = Object.values(allMovies).find((m) => m.title === dislikedTitle);
        if (!movie) {
          console.warn(`⚠ Movie with title "${dislikedTitle}" not found in allMovies.`);
          continue;
        }
  
        const card = document.createElement("div");
        card.className = "movie-card";
        card.innerHTML = `
          <img src="${movie.poster}" alt="${movie.title}" />
          <h3>${movie.title}</h3>
          <p>Genre: ${movie.genre || "Unknown"}</p>
          <div class="controls">
            <button class="play-button">▶ Play</button>
          </div>
        `;
  
        // Attach event listener to the play button
        card.querySelector(".play-button").addEventListener("click", () => {
          window.location.href = `../../html/VideoPlayer.html?title=${encodeURIComponent(movie.title)}`;
        });
  
        container.appendChild(card);
      }
  
      console.log("✅ Disliked movies loaded successfully.");
    } catch (err) {
      console.error("❌ Failed to load disliked movies", err);
      container.innerHTML = "<p>Error loading disliked movies.</p>";
    }
  }


  // === Watch History ===
  async function renderHistory() {
    const historyList = document.getElementById("history-list");
    const feedbackDropdown = document.getElementById("movie-select"); // Dropdown for feedback
    if (!historyList || !feedbackDropdown) return;
  
    const email = currentUserEmail;
    if (!email) {
      console.error("❌ Email not found in localStorage.");
      historyList.innerHTML = "<p>Please log in to view your watch history.</p>";
      return;
    }
  
    try {
      // Fetch the user's watch history from the backend
      const res = await fetch("http://localhost:3000/api/account/watchHistory/get", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
  
      const data = await res.json();
      console.log("✅ Watch history response:", data);
  
      if (!data.success || !data.watchHistory) {
        historyList.innerHTML = "<p>You have not watched any movies yet.</p>";
        return;
      }
  
      // Render the watch history
      historyList.innerHTML = ""; // Clear the list before rendering
      feedbackDropdown.innerHTML = ""; // Clear the dropdown before populating
  
      // Reverse the watchHistory array to show the most recent items first
      const reversedHistory = data.watchHistory.reverse();
      const uniqueTitles = new Set();
  
      reversedHistory.forEach((item) => {
        uniqueTitles.add(item.title); // Add unique titles to the Set
  
        const li = document.createElement("li");
        li.textContent = `${item.title} —— Watched on: ${new Date(item.watchedAt).toLocaleDateString()}`;
        historyList.appendChild(li);
      });
  
      // Populate the dropdown with unique titles
      uniqueTitles.forEach((title) => {
        const option = document.createElement("option");
        option.value = title;
        option.textContent = title;
        feedbackDropdown.appendChild(option);
      });
  
      console.log("✅ Watch history and dropdown rendered successfully.");
    } catch (err) {
      console.error("❌ Error loading watch history:", err);
      historyList.innerHTML = "<p>Error loading watch history.</p>";
    }
  }
});