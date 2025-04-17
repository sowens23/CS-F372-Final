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
    const movieCards = document.querySelectorAll('.movie-card');
    let currentCard = null;
  
    // Banner
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
      currentIndex = (currentIndex + 1) % totalSlides;
      updateSlidePosition(currentIndex !== 0);
    };
  
    window.prevSlide = function () {
      currentIndex = (currentIndex - 1 + totalSlides) % totalSlides;
      updateSlidePosition();
    };
  
    // Movie Play
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
  
    // ========= Edit Modal =========
editButtons.forEach(btn => {
    btn.addEventListener("click", (e) => {
      currentCard = e.target.closest(".movie-card");
      const title = currentCard.querySelector("h3").textContent;
      const genre = currentCard.querySelector("p").textContent.replace("Genre: ", "");
      const movieId = currentCard.getAttribute("data-movie");
  
      titleInput.value = title;
      genreInput.value = genre;
      pathInput.value = `Assets/Videos/${movieId}.mp4`;  // default path
  
      modal.style.display = "block";
      overlay.style.display = "block";
    });
  });
  
  // click only once to open the file window
  pathInput.addEventListener("click", () => {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "video/*";
  
    fileInput.addEventListener("change", () => {
      const file = fileInput.files[0];
      if (file) {
        pathInput.value = file.name;
        console.log("🎬 Selected video file:", file.name);
      }
    });
  
    fileInput.click();  
  });
  
  
  saveBtn.addEventListener("click", () => {
    const newTitle = titleInput.value;
    const newGenre = genreInput.value;
    const newPath = pathInput.value;
  
    if (currentCard) {
      currentCard.querySelector("h3").textContent = newTitle;
      currentCard.querySelector("p").textContent = `Genre: ${newGenre}`;
      console.log("Movie updated:", newTitle, newGenre, newPath);
    }
  
    modal.style.display = "none";
    overlay.style.display = "none";
  });
  
  // click random palce to close the window 
  overlay.addEventListener("click", () => {
    modal.style.display = "none";
    overlay.style.display = "none";
  });
  
  
    saveBtn.addEventListener("click", () => {
      const newTitle = titleInput.value;
      const newGenre = genreInput.value;
      const newPath = pathInput.value;
  
      if (currentCard) {
        currentCard.querySelector("h3").textContent = newTitle;
        currentCard.querySelector("p").textContent = `Genre: ${newGenre}`;
        console.log("✅ Movie updated:", newTitle, newGenre, newPath);
      }
  
      modal.style.display = "none";
      overlay.style.display = "none";
    });
  
    overlay.addEventListener("click", () => {
      modal.style.display = "none";
      overlay.style.display = "none";
    });
  
    // Upload Poster
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
  
    // Hide Movie
    document.querySelectorAll(".hide-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const card = btn.closest(".movie-card");
        card.style.display = "none";
        console.log("🙈 Hidden:", card.querySelector("h3").textContent);
      });
    });
  
    // Remove Movie
    document.querySelectorAll(".remove-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const card = btn.closest(".movie-card");
        const title = card.querySelector("h3").textContent;
  
        const confirmDelete = confirm(`❗Are you sure you want to delete "${title}"?`);
        if (confirmDelete) {
          card.remove();
          console.log("🗑️ Removed:", title);
        }
      });
    });
  
    // Search
    searchInput.addEventListener('input', function () {
      const searchTerm = searchInput.value.toLowerCase();
      movieCards.forEach(card => {
        const title = card.querySelector('h3').textContent.toLowerCase();
        card.style.display = title.includes(searchTerm) ? 'block' : 'none';
      });
    });
  
    // Sort
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
        cards.sort((a, b) => a.querySelector("p").textContent.localeCompare(b.querySelector("p").textContent));
      }
      cards.forEach(card => movieGrid.appendChild(card));
    });
  
    // Genre Filter
    genreSelect.addEventListener("change", function () {
      const selectedGenre = genreSelect.value.toLowerCase();
      document.querySelectorAll(".movie-card").forEach(card => {
        const genre = card.querySelector("p").textContent.toLowerCase();
        card.style.display = (selectedGenre === "all" || genre.includes(selectedGenre)) ? "block" : "none";
      });
    });
  
  }); 
  