
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

      if (movieId) {
        window.location.href = `../../Viewer/ViewerPlayer/index_Player.html?movie=${movieId}`;
      } else {
        alert("⚠️ 没有 data-movie，跳转失败");
      }
    });
  });

  // ======================== Favorite Feature ========================
  document.querySelectorAll(".favorite-btn").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      const card = e.target.closest(".movie-card");
      const movieId = card.getAttribute("data-movie");
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
        alert("Failed to add to favorites");
      }
    });
  });

  // ======================== Set Like/Dislike State ========================
  document.querySelectorAll(".movie-card").forEach(card => {
    const movieId = card.getAttribute("data-movie");
    const likeBtn = card.querySelector(".like-buttons button:nth-child(1)");
    const dislikeBtn = card.querySelector(".like-buttons button:nth-child(2)");

    if (localStorage.getItem(`liked_${movieId}`) || localStorage.getItem(`disliked_${movieId}`)) {
      likeBtn.disabled = true;
      dislikeBtn.disabled = true;
      likeBtn.style.opacity = 0.5;
      dislikeBtn.style.opacity = 0.5;
    }
  });

  // ======================== Like ========================
  document.querySelectorAll(".like-buttons button:nth-child(1)").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      const card = e.target.closest(".movie-card");
      const movieId = card.getAttribute("data-movie");
      const userEmail = localStorage.getItem("currentUserEmail");

      if (!userEmail) return alert("⚠ Please log in");

      if (localStorage.getItem(`disliked_${movieId}`)) return alert("❗ Already disliked");
      if (localStorage.getItem(`liked_${movieId}`)) return alert("❗ Already liked");

      const res = await fetch("http://localhost:3000/api/account/like/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail, movieId }),
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem(`liked_${movieId}`, "true");
        btn.disabled = true;
        btn.style.opacity = 0.5;
        const sibling = card.querySelector(".like-buttons button:nth-child(2)");
        sibling.disabled = true;
        sibling.style.opacity = 0.5;
      }
      alert(data.message);
    });
  });

  // ======================== Dislike ========================
  document.querySelectorAll(".like-buttons button:nth-child(2)").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      const card = e.target.closest(".movie-card");
      const movieId = card.getAttribute("data-movie");
      const userEmail = localStorage.getItem("currentUserEmail");

      if (!userEmail) return alert("⚠ Please log in");

      if (localStorage.getItem(`liked_${movieId}`)) return alert("❗ Already liked");
      if (localStorage.getItem(`disliked_${movieId}`)) return alert("❗ Already disliked");

      const res = await fetch("http://localhost:3000/api/account/dislike/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail, movieId }),
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem(`disliked_${movieId}`, "true");
        btn.disabled = true;
        btn.style.opacity = 0.5;
        const sibling = card.querySelector(".like-buttons button:nth-child(1)");
        sibling.disabled = true;
        sibling.style.opacity = 0.5;
      }
      alert(data.message);
    });
  });


  // ======================== Per-Movie Clear Like/Dislike ========================
document.querySelectorAll(".clear-reaction-btn").forEach((btn) => {
  btn.addEventListener("click", (e) => {
    const card = e.target.closest(".movie-card");
    const movieId = card.getAttribute("data-movie");

    if (!movieId) return;

    const confirmClear = confirm(`Clear reactions for movie: ${movieId}?`);
    if (!confirmClear) return;

    localStorage.removeItem(`liked_${movieId}`);
    localStorage.removeItem(`disliked_${movieId}`);

    // 重新启用按钮
    const likeBtn = card.querySelector(".like-buttons button:nth-child(1)");
    const dislikeBtn = card.querySelector(".like-buttons button:nth-child(2)");
    if (likeBtn && dislikeBtn) {
      likeBtn.disabled = false;
      dislikeBtn.disabled = false;
      likeBtn.style.opacity = 1;
      dislikeBtn.style.opacity = 1;
    }

    alert(`Reactions cleared for ${movieId}`);
  });
});

  // ======================== Search ========================
  const searchInput = document.querySelector('.search-bar');
  const movieCards = document.querySelectorAll('.movie-card');
  searchInput.addEventListener('input', function () {
    const searchTerm = searchInput.value.toLowerCase();
    movieCards.forEach(card => {
      const title = card.querySelector('h3').textContent.toLowerCase();
      card.style.display = title.includes(searchTerm) ? 'block' : 'none';
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
      cards.sort((a, b) => a.querySelector("h3").textContent.localeCompare(b.querySelector("h3").textContent));
    }
    if (option === "Genre") {
      cards.sort((a, b) =>
        a.querySelector("p").textContent.localeCompare(b.querySelector("p").textContent));
    }
    cards.forEach(card => movieGrid.appendChild(card));
  });

  // ======================== Genre Filter ========================
  genreSelect.addEventListener("change", function () {
    const selectedGenre = genreSelect.value.toLowerCase();
    document.querySelectorAll(".movie-card").forEach(card => {
      const genre = card.querySelector("p").textContent.toLowerCase();
      card.style.display = (selectedGenre === "all" || genre.includes(selectedGenre)) ? "block" : "none";
    });
  });

});