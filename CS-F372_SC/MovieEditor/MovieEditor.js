document.addEventListener("DOMContentLoaded", function () {
  const sortSelect = document.getElementById("sort");
  const genreSelect = document.getElementById("genre-filter");
  const movieGrid = document.querySelector(".movie-grid");
  const originalOrder = Array.from(document.querySelectorAll(".movie-card"));
  const editButtons = document.querySelectorAll(".edit-btn");
  const modal = document.getElementById("editModal");
  const overlay = document.getElementById("modalOverlay");
  const titleInput = document.getElementById("editTitle");
  const genreInput = document.getElementById("editGenre");
  const pathInput = document.getElementById("editPath");
  const saveBtn = document.getElementById("saveEdit");
  const searchInput = document.querySelector('.search-bar');
  let currentCard = null;

  // === Banner ===
  let currentIndex = 0;
  const track = document.getElementById("banner-track");
  const slides = document.querySelectorAll(".banner-slide");
  const totalSlides = slides.length;

  function updateSlidePosition(animate = true) {
    track.classList.toggle("no-transition", !animate);
    track.style.transform = `translateX(-${currentIndex * 100}%)`;
  }

  window.nextSlide = function () {
    currentIndex = (currentIndex + 1) % totalSlides;
    updateSlidePosition(currentIndex !== 0);
  };

  window.prevSlide = function () {
    currentIndex = (currentIndex - 1 + totalSlides) % totalSlides;
    updateSlidePosition();
  };

  // === Play Button ===
  document.querySelectorAll(".play-button").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const card = e.target.closest(".movie-card");
      const movieId = card?.getAttribute("data-movie");
      if (movieId) {
        window.location.href = `../../Viewer/ViewerPlayer/index_Player.html?movie=${movieId}`;
      } else {
        alert("⚠️ No movie ID found.");
      }
    });
  });

  // === Edit Modal ===
  editButtons.forEach(btn => {
    btn.addEventListener("click", (e) => {
      currentCard = e.target.closest(".movie-card");
      const title = currentCard.querySelector("h3").textContent;
      const genre = currentCard.querySelector("p").textContent.replace("Genre: ", "");
      const movieId = currentCard.getAttribute("data-movie");

      titleInput.value = title;
      genreInput.value = genre;
      pathInput.value = `Assets/Videos/${movieId}.mp4`;

      modal.style.display = "block";
      overlay.style.display = "block";
    });
  });

  pathInput.addEventListener("click", () => {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "video/*";
    fileInput.addEventListener("change", () => {
      const file = fileInput.files[0];
      if (file) {
        pathInput.value = file.name;
      }
    });
    fileInput.click();
  });

  saveBtn.addEventListener("click", () => {
    if (currentCard) {
      currentCard.querySelector("h3").textContent = titleInput.value;
      currentCard.querySelector("p").textContent = `Genre: ${genreInput.value}`;
    }
    modal.style.display = "none";
    overlay.style.display = "none";
  });

  overlay.addEventListener("click", () => {
    modal.style.display = "none";
    overlay.style.display = "none";
  });

  // === Upload Poster ===
  document.querySelectorAll(".poster-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const card = btn.closest(".movie-card");
      const fileInput = document.createElement("input");
      fileInput.type = "file";
      fileInput.accept = "image/*";
      fileInput.addEventListener("change", () => {
        const file = fileInput.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = function (e) {
            card.querySelector("img").src = e.target.result;
          };
          reader.readAsDataURL(file);
        }
      });
      fileInput.click();
    });
  });

  // === Hide Movie ===
  document.querySelectorAll(".hide-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      btn.closest(".movie-card").style.display = "none";
    });
  });

  // === Remove Movie ===
  document.querySelectorAll(".remove-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const card = btn.closest(".movie-card");
      const title = card.querySelector("h3").textContent;
      if (confirm(`❗ Are you sure you want to delete "${title}"?`)) {
        card.remove();
      }
    });
  });

  // === Search Movies ===
  searchInput.addEventListener('input', function () {
    const searchTerm = searchInput.value.toLowerCase();
    document.querySelectorAll('.movie-card').forEach(card => {
      const title = card.querySelector('h3').textContent.toLowerCase();
      card.style.display = title.includes(searchTerm) ? 'block' : 'none';
    });
  });

  // === Sort Movies ===
  sortSelect.addEventListener("change", function () {
    const option = sortSelect.value;
    const cards = Array.from(document.querySelectorAll(".movie-card"));

    if (option === "Default") {
      originalOrder.forEach(card => movieGrid.appendChild(card));
    } else {
      cards.sort((a, b) => {
        if (option === "Alphabetical") {
          return a.querySelector("h3").textContent.localeCompare(b.querySelector("h3").textContent);
        } else if (option === "Genre") {
          return a.querySelector("p").textContent.localeCompare(b.querySelector("p").textContent);
        }
      });
      cards.forEach(card => movieGrid.appendChild(card));
    }
  });

  // === Genre Filter ===
  genreSelect.addEventListener("change", function () {
    const selectedGenre = genreSelect.value.toLowerCase();
    document.querySelectorAll(".movie-card").forEach(card => {
      const genre = card.querySelector("p").textContent.toLowerCase();
      card.style.display = (selectedGenre === "all" || genre.includes(selectedGenre)) ? "block" : "none";
    });
  });

  // === Add New Movie ===
  const addMovieBtn = document.getElementById('addMovieBtn');
  if (addMovieBtn) {
    addMovieBtn.addEventListener('click', async () => {
      const title = document.getElementById('newTitle').value.trim();
      const genre = document.getElementById('newGenre').value.trim();
      const videoPath = document.getElementById('newVideoPath').value.trim();

      if (!title || !genre || !videoPath) {
        alert('⚠️ Please fill in all fields.');
        return;
      }

      try {
        const res = await fetch('/api/editor/add-movie', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, genre, videoPath })
        });
        const data = await res.json();
        if (data.success) {
          alert('🎬 Movie added successfully!');
          
          const newCard = document.createElement('div');
          newCard.classList.add('movie-card');
          newCard.setAttribute('data-movie', title.toLowerCase().replace(/\s+/g, '-'));

          newCard.innerHTML = `
            <img src="../../HomeTemplate/MoviePosters/default-poster.jpg" alt="Movie Poster" />
            <h3>${title}</h3>
            <p>Genre: ${genre}</p>
            <div class="controls">
              <button class="play-button">▶ Play</button>
              <div class="like-buttons">
                <button class="edit-btn">Edit</button>
                <button class="poster-btn">Upload Poster</button>
                <button class="hide-btn">Hide</button>
                <button class="remove-btn">Remove</button>
              </div>
            </div>
          `;
          movieGrid.appendChild(newCard);

          
          document.getElementById('newTitle').value = '';
          document.getElementById('newGenre').value = '';
          document.getElementById('newVideoPath').value = '';

          
          setupPlayButtons();
        } else {
          alert('❗ Add movie failed: ' + data.message);
        }
      } catch (err) {
        console.error('❌ Error adding movie:', err);
        alert('⚠️ Network error');
      }
    });
  }
});
