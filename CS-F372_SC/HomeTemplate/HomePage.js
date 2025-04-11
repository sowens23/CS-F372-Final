
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

  function updateReactionUI(card, liked, disliked) {
    const likeBtn = card.querySelector(".like-buttons button:nth-child(1)");
    const dislikeBtn = card.querySelector(".like-buttons button:nth-child(2)");
  
    if (liked) {
      likeBtn.classList.add("selected");
      dislikeBtn.classList.remove("selected");
    } else if (disliked) {
      dislikeBtn.classList.add("selected");
      likeBtn.classList.remove("selected");
    } else {
      likeBtn.classList.remove("selected");
      dislikeBtn.classList.remove("selected");
    }
  }
  
  async function handleReaction(movieId, action, card) {
    const userEmail = localStorage.getItem("currentUserEmail");
    if (!userEmail) return alert("⚠ Please log in");
  
    try {
      const res = await fetch("http://localhost:3000/api/account/like-dislike", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail, movieId, action })
      });
  
      const data = await res.json();
      if (data.success) {
        // 同步本地状态（你可以也用服务器返回值来判断）
        if (action === "like") {
          localStorage.setItem(`liked_${movieId}`, "true");
          localStorage.removeItem(`disliked_${movieId}`);
        } else if (action === "dislike") {
          localStorage.setItem(`disliked_${movieId}`, "true");
          localStorage.removeItem(`liked_${movieId}`);
        } else {
          localStorage.removeItem(`liked_${movieId}`);
          localStorage.removeItem(`disliked_${movieId}`);
        }
  
        updateReactionUI(card, action === "like", action === "dislike");
        alert(data.message);
      } else {
        alert(data.message || "Failed to update reaction");
      }
    } catch (err) {
      console.error(err);
      alert("❌ Request failed");
    }
  }
  
  // 绑定点击事件
  document.querySelectorAll(".movie-card").forEach(card => {
    const movieId = card.getAttribute("data-movie");
    const likeBtn = card.querySelector(".like-buttons button:nth-child(1)");
    const dislikeBtn = card.querySelector(".like-buttons button:nth-child(2)");
  
    likeBtn.addEventListener("click", () => {
      const alreadyLiked = localStorage.getItem(`liked_${movieId}`);
      const action = alreadyLiked ? "clear" : "like";
      handleReaction(movieId, action, card);
    });
  
    dislikeBtn.addEventListener("click", () => {
      const alreadyDisliked = localStorage.getItem(`disliked_${movieId}`);
      const action = alreadyDisliked ? "clear" : "dislike";
      handleReaction(movieId, action, card);
    });
  
    // 初始 UI 设置
    updateReactionUI(
      card,
      !!localStorage.getItem(`liked_${movieId}`),
      !!localStorage.getItem(`disliked_${movieId}`)
    );
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