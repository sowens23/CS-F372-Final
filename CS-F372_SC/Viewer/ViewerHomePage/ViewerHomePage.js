// === 同步 reactions 从数据库到 localStorage ===
async function renderReactions() {
  const email = localStorage.getItem("currentUserEmail");
  if (!email) return;

  try {
    const likedRes = await fetch("http://localhost:3000/api/account/like/get", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email })
    });
    const likedData = await likedRes.json();
    if (likedData.success) {
      likedData.likedMovies.forEach(movieId => {
        localStorage.setItem(`liked_${movieId}`, "true");
        localStorage.removeItem(`disliked_${movieId}`);
      });
    }

    const dislikedRes = await fetch("http://localhost:3000/api/account/dislike/get", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email })
    });
    const dislikedData = await dislikedRes.json();
    if (dislikedData.success) {
      dislikedData.dislikedMovies.forEach(movieId => {
        localStorage.setItem(`disliked_${movieId}`, "true");
        localStorage.removeItem(`liked_${movieId}`);
      });
    }

    console.log("✅ Reactions synced from DB to localStorage");
  } catch (err) {
    console.error("❌ Failed to sync reactions:", err);
  }
}


window.addEventListener("DOMContentLoaded", async () => {
  // 同步点赞/点踩状态
  await renderReactions();

  // === 显示用户名 ===
  const username = localStorage.getItem("username") || "Viewer";
  document.getElementById("username").textContent = username;

  // === 左侧菜单切换功能 ===
  const buttons = document.querySelectorAll(".menu-item");
  const sections = document.querySelectorAll(".content-section");

  buttons.forEach(btn => {
    btn.addEventListener("click", () => {
      const target = btn.getAttribute("data-section");

      sections.forEach(sec => {
        sec.classList.toggle("hidden", sec.id !== target);
      });

      // 页面切换时触发内容加载
      if (target === "favorite") renderFavorites();
      if (target === "history") renderHistory();
      if (target === "liked") renderLikedMovies();
      if (target === "disliked") loadDislikedMovies();
    });
  });

  // === Feedback 提交监听 ===
  const feedbackForm = document.getElementById("feedback-form");
  const feedbackResult = document.getElementById("feedback-result");

  if (feedbackForm) {
    feedbackForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const movie = document.getElementById("movie-select").value;
      const comment = document.getElementById("comment").value;

      console.log("🎬 Feedback:", { movie, comment });

      feedbackResult.textContent = `Thank you for your feedback to《${movie}》！🍿`;
      feedbackForm.reset();
    });
  }

  /* My Fav */
  async function renderFavorites() {
    console.log("🧲 触发收藏加载！");
    const container = document.getElementById("favorite-movie-list");
    container.innerHTML = "";

    const email = localStorage.getItem("currentUserEmail");
    if (!email) return;

    const res = await fetch("http://localhost:3000/api/account/favorite/get", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();
    if (!data.success) {
      container.innerHTML = "<p>Failed to load favorites.</p>";
      return;
    }

    const movies = data.favorites;
    for (const id of movies) {
      const movie = allMovies[id];
      if (!movie) continue;

      const card = document.createElement("div");
      card.className = "movie-card";
      card.innerHTML = `
        <img src="${movie.poster}" alt="${movie.title}" />
        <h3>${movie.title}</h3>
        <p>Genre: ${movie.genre}</p>
        <div class="controls">
          <button class="play-button">▶ Play</button>
        </div>
      `;

      card.querySelector(".play-button").addEventListener("click", () => {
        window.location.href = `../../Viewer/ViewerPlayer/index_Player.html?movie=${id}`;
      });

      container.appendChild(card);
    }
  }

  /* Liked Movies */
  async function renderLikedMovies() {
    console.log("👍 正在加载你喜欢的电影...");
    const container = document.getElementById("liked-movie-list");
    container.innerHTML = "";

    const email = localStorage.getItem("currentUserEmail");
    if (!email) {
      console.error("❌ 没有找到 localStorage 中的 currentUserEmail");
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
      console.log("✅ 完整 liked 返回数据", data);

      if (!data || !data.success) {
        container.innerHTML = "<p>Failed to load liked movies.</p>";
        return;
      }

      const movies = data.likedMovies;
      if (movies.length === 0) {
        container.innerHTML = "<p>You haven't liked any movies yet.</p>";
        return;
      }

      for (const id of movies) {
        const movie = allMovies[id];
        if (!movie) continue;

        const card = document.createElement("div");
        card.className = "movie-card";
        card.innerHTML = `
          <img src="${movie.poster}" alt="${movie.title}" />
          <h3>${movie.title}</h3>
          <p>Genre: ${movie.genre}</p>
          <div class="controls">
            <button class="play-button">▶ Play</button>
          </div>
        `;
        card.querySelector(".play-button").addEventListener("click", () => {
          window.location.href = `../../Viewer/ViewerPlayer/index_Player.html?movie=${id}`;
        });

        container.appendChild(card);
      }
    } catch (err) {
      console.error("❌ Error loading liked movies:", err);
      container.innerHTML = "<p>Error loading liked movies.</p>";
    }
  }

  /* Disliked Movies */
  async function loadDislikedMovies() {
    const email = localStorage.getItem("currentUserEmail");
    const container = document.getElementById("disliked-movie-list");
    container.innerHTML = "";

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

      if (!data.dislikedMovies || data.dislikedMovies.length === 0) {
        container.innerHTML = "<p>You haven't disliked any movies yet.</p>";
        return;
      }

      data.dislikedMovies.forEach(movieId => {
        const movie = allMovies[movieId];
        if (!movie) return;

        const card = document.createElement("div");
        card.className = "movie-card";
        card.innerHTML = `
          <img src="${movie.poster}" alt="${movie.title}" />
          <h3>${movie.title}</h3>
          <p>Genre: ${movie.genre}</p>
          <div class="controls">
            <button class="play-button">▶ Play</button>
          </div>
        `;
        card.querySelector(".play-button").addEventListener("click", () => {
          window.location.href = `../../Viewer/ViewerPlayer/index_Player.html?movie=${movieId}`;
        });

        container.appendChild(card);
      });

    } catch (err) {
      console.error("❌ Failed to load disliked movies", err);
      container.innerHTML = "<p>Error loading disliked movies.</p>";
    }
  }

  /* Viewed History */
  function renderHistory() {
    const historyList = document.getElementById("history-list");
    if (!historyList) return;

    const viewedHistory = [
      { title: "Inside Out 2", date: "2025-04-01" },
      { title: "Oppenheimer", date: "2025-03-28" },
      { title: "Wonka", date: "2025-03-25" }
    ];

    historyList.innerHTML = "";
    viewedHistory.forEach(item => {
      const li = document.createElement("li");
      li.textContent = `${item.title} —— 观看时间：${item.date}`;
      historyList.appendChild(li);
    });
  }
});
