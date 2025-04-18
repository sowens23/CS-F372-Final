document.addEventListener("DOMContentLoaded", async () => {
  const bannerEmail = document.getElementById("banner-email");

  try {
    const response = await fetch("http://localhost:3000/api/account/session", {
      credentials: "include", // Ensure cookies are sent with the request
    });
    const data = await response.json();

    if (data.success) {
      currentUserEmail = data.email; // Update the global variable
      bannerEmail.textContent = `Logged in as: ${data.email}`;
      console.log("✅ User logged in:", data.email);
    } else {
      currentUserEmail = null; // Ensure it's null if not logged in
      bannerEmail.textContent = "Not logged in";
      console.warn("⚠ No active session found.");
    }
  } catch (error) {
    console.error("❌ Error fetching session data:", error);
    bannerEmail.textContent = "Error fetching session";
    currentUserEmail = null; // Ensure it's null on error
  }

  // Fetch and render movies
  try {
    const response = await fetch("../Assets/MovieList.json");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const movies = await response.json();
    console.log("Movies fetched successfully:", movies);
    renderMovies(movies);
  } catch (error) {
    console.error("❌ Error loading movies:", error);
  }
});

// Event listener for the search bar
document.getElementById("search-bar").addEventListener("input", (e) => {
  const query = e.target.value.toLowerCase(); // Get the search query and convert to lowercase
  filterMovies(query);
});

// --------------------------------------------------
// Function to attach event listeners to play buttons
// --------------------------------------------------
function attachPlayButtonListener(movieCard) {
  const playButton = movieCard.querySelector(".play-button");
  playButton.addEventListener("click", () => {
    const movieTitle = movieCard.querySelector("h3").textContent; // Get the movie title
    console.log("Movie Title:", movieTitle); // Debugging log
    if (movieTitle) {
      window.location.href = `../html/VideoPlayer.html?title=${encodeURIComponent(movieTitle)}`;
    } else {
      alert("⚠️ No movie title found for this card.");
    }
  });
}


// ------------------------------------------------------
// Function to attach event listeners to favorite buttons
// ------------------------------------------------------
function attachFavoriteButtonListener(movieCard) {
  const favoriteButton = movieCard.querySelector(".favorite-btn");
  favoriteButton.addEventListener("click", async () => {
    if (!currentUserEmail) {
      alert("⚠ Please log in to add favorites");
      return;
    }

    const movieTitle = movieCard.querySelector("h3").textContent.trim(); // Extract the movie title
    console.log("Movie Title:", movieTitle); // Debugging log

    try {
      const response = await fetch("http://localhost:3000/api/account/favorite/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: currentUserEmail, movieTitle }), // Send email and movie title
      });

      const data = await response.json();
      if (data.success) {
        alert(`🎉 ${movieTitle} added to favorites!`);
        favoriteButton.classList.add("selected"); // Mark the button as selected
      } else {
        alert(`❌ Failed to add ${movieTitle} to favorites: ${data.message}`);
      }
    } catch (error) {
      console.error("❌ Error adding to favorites:", error);
      alert("⚠ Network error. Please try again later.");
    }
  });
}


// -------------------------------------------------------------
// Function to attach event listeners to remove favorite buttons
// -------------------------------------------------------------
function attachRemoveFavoriteButtonListener(movieCard) {
  const removeFavoriteButton = movieCard.querySelector(".clear-reaction-btn");
  removeFavoriteButton.addEventListener("click", async () => {
    const movieTitle = movieCard.querySelector("h3").textContent;

    if (!currentUserEmail) {
      alert("⚠ Please log in to remove favorites");
      return;
    }

    try {
      const response = await fetch("http://localhost:3000/api/account/favorite/remove", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: currentUserEmail, movieTitle }),
      });

      const data = await response.json();
      if (data.success) {
        alert(`🎉 "${movieTitle}" removed from favorites!`);
        movieCard.querySelector(".favorite-btn").classList.remove("selected");
      } else {
        alert(`❌ Failed to remove "${movieTitle}" from favorites: ${data.message}`);
      }
    } catch (error) {
      console.error("❌ Error removing from favorites:", error);
      alert("⚠ Network error. Please try again later.");
    }
  });
}


// ----------------------------------------------------------
// Function to attach event listeners to like/dislike buttons
// ----------------------------------------------------------
function attachLikeDislikeButtonListeners(movieCard) {
  const likeButton = movieCard.querySelector(".like-btn");
  const dislikeButton = movieCard.querySelector(".dislike-btn");

  likeButton.addEventListener("click", async () => {
    if (!currentUserEmail) {
      alert("⚠ Please log in to like a movie.");
      return;
    }

    const movieTitle = movieCard.querySelector("h3").textContent;

    try {
      const response = await fetch("http://localhost:3000/api/account/like-dislike", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: currentUserEmail, movieTitle, action: "like" }),
      });

      const data = await response.json();
      if (data.success) {
        updateReactionUI(movieCard, true, false); // Mark as liked
        alert(`🎉 You liked "${movieTitle}"`);
      } else {
        alert(`❌ Failed to like "${movieTitle}": ${data.message}`);
      }
    } catch (error) {
      console.error("❌ Error liking the movie:", error);
      alert("⚠ Network error. Please try again later.");
    }
  });

  dislikeButton.addEventListener("click", async () => {
    if (!currentUserEmail) {
      alert("⚠ Please log in to dislike a movie.");
      return;
    }

    const movieTitle = movieCard.querySelector("h3").textContent;

    try {
      const response = await fetch("http://localhost:3000/api/account/like-dislike", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: currentUserEmail, movieTitle, action: "dislike" }),
      });

      const data = await response.json();
      if (data.success) {
        updateReactionUI(movieCard, false, true); // Mark as disliked
        alert(`🎉 You disliked "${movieTitle}"`);
      } else {
        alert(`❌ Failed to dislike "${movieTitle}": ${data.message}`);
      }
    } catch (error) {
      console.error("❌ Error disliking the movie:", error);
      alert("⚠ Network error. Please try again later.");
    }
  });
}


// ----------------------------------------------------------
// Function to handle event listeners to like/dislike buttons
// ----------------------------------------------------------
async function handleReaction(movieTitle, action, card) {
  if (!currentUserEmail) {
    alert("⚠ Please log in to perform this action.");
    return;
  }

  try {
    const res = await fetch("http://localhost:3000/api/account/like-dislike", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: currentUserEmail, movieTitle, action }),
    });

    const data = await res.json();
    if (data.success) {
      // Update the UI based on the action
      updateReactionUI(card, action === "like", action === "dislike");
      alert(data.message);
    } else {
      alert(data.message || "Failed to update reaction");
    }
  } catch (err) {
    console.error("❌ Request failed:", err);
    alert("❌ Request failed");
  }
}

// ----------------------------------------------------------
// Function to update event listeners to like/dislike buttons
// ----------------------------------------------------------
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

document.addEventListener("DOMContentLoaded", function () {
  const sortSelect = document.getElementById("sort");
  const genreSelect = document.getElementById("genre-filter");

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
      // Smoothly transition to the first slide
      currentIndex++;
      updateSlidePosition();
      setTimeout(() => {
        currentIndex = 0;
        updateSlidePosition(false); // Disable animation for the reset
      }, 500); // Match the CSS transition duration
    }
  };

  window.prevSlide = function () {
    if (currentIndex > 0) {
      currentIndex--;
      updateSlidePosition();
    } else {
      // Smoothly transition to the last slide
      currentIndex = totalSlides - 1;
      updateSlidePosition(false); // Disable animation for the reset
      setTimeout(() => {
        updateSlidePosition(true); // Re-enable animation
      }, 50); // Small delay to ensure smooth transition
    }
  };

  // Auto-rotate the banner every 5 seconds
  setInterval(() => {
    nextSlide();
  }, 5000);

  // ======================== Sort ========================
  sortSelect.addEventListener("change", function () {
    const option = sortSelect.value;
    const movieGrid = document.querySelector(".movie-grid");
  
    if (option === "Default") {
      originalOrder.forEach((card) => movieGrid.appendChild(card)); // Restore the original order
      console.log("Sorted by Default");
      return;
    }
  
    const cards = Array.from(document.querySelectorAll(".movie-card"));
  
    if (option === "Alphabetical") {
      cards.sort((a, b) =>
        a.querySelector("h3").textContent.localeCompare(b.querySelector("h3").textContent)
      );
      console.log("Sorted Alphabetically");
    }
  
    if (option === "Genre") {
      cards.sort((a, b) =>
        (a.getAttribute("data-genre") || "unknown").localeCompare(b.getAttribute("data-genre") || "unknown")
      );
      console.log("Sorted by Genre");
    }
  
    cards.forEach((card) => movieGrid.appendChild(card)); // Append sorted cards to the grid
  });

  // ======================== Genre Filter ========================
  genreSelect.addEventListener("change", function () {
    const selectedGenre = genreSelect.value.toLowerCase();
    document.querySelectorAll(".movie-card").forEach(card => {
      const genre = card.getAttribute("data-genre") || "unknown";
      card.style.display = (selectedGenre === "all" || genre.includes(selectedGenre)) ? "block" : "none";
    });
  });
  
});

function filterMovies(query) {
  query = query.trim().toLowerCase(); // Trim and convert to lowercase
  const movieCards = document.querySelectorAll(".movie-card");

  movieCards.forEach((card) => {
    const title = card.querySelector("h3").textContent.toLowerCase();
    card.style.display = title.includes(query) ? "" : "none";
  });
}

function renderMovies(movies) {
  console.log("Movies data passed to renderMovies:", movies);

  const movieGrid = document.querySelector(".movie-grid");
  movieGrid.innerHTML = ""; // Clear the grid

  originalOrder = []; // Reset the original order

  Object.entries(movies).forEach(([key, movie]) => {
    const movieCard = document.createElement("div");
    movieCard.classList.add("movie-card");

    // Set attributes for filtering and sorting
    movieCard.setAttribute("data-movie", movie.title.toLowerCase());
    movieCard.setAttribute("data-genre", movie.genre ? movie.genre.toLowerCase() : "unknown");

    // Populate the movie card
    movieCard.innerHTML = `
      <img src="${movie.poster}" alt="Movie Poster" />
      <h3>${movie.title}</h3>
      <p>Genre: ${movie.genre || "Unknown"}</p>
      <div class="controls">
        <button class="play-button">▶ Play</button>
        <div class="like-buttons">
          <button class="like-btn">👍</button>
          <button class="dislike-btn">👎</button>
          <button class="favorite-btn">➕</button>
          <button class="clear-reaction-btn">❌</button>
        </div>
      </div>
    `;

    movieGrid.appendChild(movieCard);
    originalOrder.push(movieCard); // Store the card in the original order array

    // Attach event listeners to the buttons
    attachPlayButtonListener(movieCard);
    attachFavoriteButtonListener(movieCard);
    attachRemoveFavoriteButtonListener(movieCard);
    attachLikeDislikeButtonListeners(movieCard);
  });

  console.log("Original Order:", originalOrder.map(card => card.querySelector("h3").textContent)); // Debugging log
}