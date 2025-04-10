document.addEventListener("DOMContentLoaded", function () {
  const sortSelect = document.getElementById("sort");
  const genreSelect = document.getElementById("genre-filter");
  const movieGrid = document.querySelector(".movie-grid");
  const originalOrder = Array.from(document.querySelectorAll(".movie-card"));

  // ======================== Banner ========================
  let currentIndex = 0;
  const track = document.getElementById("banner-track");
  const slides = document.querySelectorAll(".banner-slide");
  const totalSlides = slides.length;

  function updateSlidePosition(animate = true) {
    if (!animate) {
      track.classList.add("no-transition");
    } else {
      track.classList.remove("no-transition");
    }

    track.style.transform = `translateX(-${currentIndex * 100}%)`;
  }

  window.nextSlide = function () {
    if (currentIndex < totalSlides - 1) {
      currentIndex++;
      updateSlidePosition();
    } else {
      currentIndex = 0;
      updateSlidePosition(false);
      setTimeout(() => updateSlidePosition(true), 50);
    }
  };

  window.prevSlide = function () {
    if (currentIndex > 0) {
      currentIndex--;
      updateSlidePosition();
    } else {
      currentIndex = totalSlides - 1;
      updateSlidePosition();
    }
  };

  // ======================== Movie Play ========================
  document.querySelectorAll(".play-button").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const card = e.target.closest(".movie-card");
      const movieId = card?.getAttribute("data-movie");

      console.log("🎬 获取到的 movieId 是: ", movieId);

      if (movieId) {
        window.location.href = `../../Viewer/ViewerPlayer/index_Player.html?movie=${movieId}`;
      } else {
        alert("⚠️ 没有 data-movie，跳转失败");
      }
    });
  });

  // ======================== Favorite Feature (Backend) ========================
  document.querySelectorAll(".favorite-btn").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      const card = e.target.closest(".movie-card");
      const movieId = card.getAttribute("data-movie");

      if (!movieId) {
        alert("❗ No movie ID found");
        return;
      }

      const userEmail = localStorage.getItem("currentUserEmail");
      if (!userEmail) {
        alert("⚠ Please log in to add favorites");
        return;
      }

      try {
        const res = await fetch("http://localhost:3000/api/account/favorite/add", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: userEmail, movieId }),
        });

        const data = await res.json();
        alert(data.message);
      } catch (err) {
        console.error("❌ Favorite add failed", err);
        alert("Failed to add to favorites");
      }
    });
  });

  // ======================== Liked Movies ========================
  document.querySelectorAll(".like-buttons button:nth-child(1)").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      const card = e.target.closest(".movie-card");
      const movieId = card.getAttribute("data-movie");
      const userEmail = localStorage.getItem("currentUserEmail");

      if (!userEmail) {
        alert("⚠ Please log in to like movies");
        return;
      }

      try {
        const res = await fetch("http://localhost:3000/api/account/like/add", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: userEmail, movieId }),
        });

        const data = await res.json();
        alert(data.message);
      } catch (err) {
        console.error("❌ Like failed", err);
        alert("Failed to like movie");
      }
    });
  });

  // ======================== Disliked  Movie =========================

  document.querySelectorAll(".like-buttons button:nth-child(2)").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      const card = e.target.closest(".movie-card");
      const movieId = card.getAttribute("data-movie");
      const userEmail = localStorage.getItem("currentUserEmail");
  
      if (!userEmail) {
        alert("⚠ Please log in to dislike movies");
        return;
      }
  
      try {
        const res = await fetch("http://localhost:3000/api/account/dislike/add", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: userEmail, movieId }),
        });
  
        const data = await res.json();
        alert(data.message);
      } catch (err) {
        console.error("❌ Dislike failed", err);
        alert("Failed to dislike movie");
      }
    });
  });

  // ======================== Search Bar ========================
  const searchInput = document.querySelector('.search-bar');
  const movieCards = document.querySelectorAll('.movie-card');

  searchInput.addEventListener('input', function () {
    const searchTerm = searchInput.value.toLowerCase();

    movieCards.forEach(card => {
      const title = card.querySelector('h3').textContent.toLowerCase();
      if (title.includes(searchTerm)) {
        card.style.display = 'block';
      } else {
        card.style.display = 'none';
      }
    });
  });

  // ======================== Sort ========================
  sortSelect.addEventListener("change", function () {
    const option = sortSelect.value;
    const cards = Array.from(document.querySelectorAll(".movie-card"));

    if (option === "Default") {
      originalOrder.forEach(card => movieGrid.appendChild(card));
      return;
    }

    if (option === "Alphabetical") {
      cards.sort((a, b) => {
        const titleA = a.querySelector("h3").textContent.toLowerCase();
        const titleB = b.querySelector("h3").textContent.toLowerCase();
        return titleA.localeCompare(titleB);
      });
    }

    if (option === "Genre") {
      cards.sort((a, b) => {
        const genreA = a.querySelector("p").textContent.replace("Genre:", "").trim().toLowerCase();
        const genreB = b.querySelector("p").textContent.replace("Genre:", "").trim().toLowerCase();
        return genreA.localeCompare(genreB);
      });
    }

    cards.forEach(card => movieGrid.appendChild(card));
  });

  // ======================== Genre Filter（✅已放进来了） ========================
  genreSelect.addEventListener("change", function () {
    const selectedGenre = genreSelect.value.toLowerCase();
    const cards = document.querySelectorAll(".movie-card");

    cards.forEach(card => {
      const genreText = card.querySelector("p").textContent.replace("Genre:", "").trim().toLowerCase();
      if (selectedGenre === "all" || genreText.includes(selectedGenre)) {
        card.style.display = "block";
      } else {
        card.style.display = "none";
      }
    });
  });

}); //  所有功能代码都放在这个大括号内了
