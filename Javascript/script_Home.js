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
    // const response = await fetch("../Assets/MovieList.json");
    // if (!response.ok) {
    //   throw new Error(`HTTP error! status: ${response.status}`);
    // }
    // const movies = await response.json();
    console.log("Fetching all movies...");
    const response = await fetch("http://localhost:3000/api/movies/getAllMovies"); // Call the new API endpoint
    const movieData = await response.json();

    if (!response.ok || !movieData.success) {
      throw new Error(`Failed to fetch movies: ${movieData.message || response.status}`);
    }

    const movies = movieData.movies; // Extract movies from the response
    console.log("🎥 All movies loaded:", movies);

    console.log("Movies fetched successfully:", movies);
    renderMovies(movies);
  } catch (error) {
    console.error("❌ Error loading movies:", error);
  }
});

// Event listener for the search bar
document.getElementById("search-bar").addEventListener("input", async (event) => {
  const query = event.target.value.trim(); // Get the search query

  try {
    // Send the search query to the backend
    const response = await fetch("http://localhost:3000/api/movies/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    });

    const data = await response.json();
    console.log("Search results:", data);

    if (data.success) {
      // Reuse the renderMovies function to display the search results
      renderMovies(data.movies);
    } else {
      console.error("❌ Failed to fetch search results:", data.message);
    }
  } catch (error) {
    console.error("❌ Error during search:", error);
  }
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
      console.log("⚠️ No movie title found for this card.");
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
  
    const movieTitle = movieCard.querySelector("h3").textContent.trim();
  
    try {
      const response = await fetch("http://localhost:3000/api/account/favorite/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: currentUserEmail, movieTitle }),
      });
  
      const data = await response.json();
      if (data.success) {
        console.log(`🎉 ${movieTitle} added to favorites!`);
        movieCard.querySelector(".favorite-btn").classList.add("selected");
      } else {
        console.error(`❌ Failed to add ${movieTitle} to favorites: ${data.message}`);
      }
    } catch (error) {
      console.error("❌ Error adding to favorites:", error);
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
        console.log(`🎉 "${movieTitle}" removed from favorites!`);
        movieCard.querySelector(".favorite-btn").classList.remove("selected");
      } else {
        console.error(`❌ Failed to remove "${movieTitle}" from favorites: ${data.message}`);
      }
    } catch (error) {
      console.error("❌ Error removing from favorites:", error);
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
        console.log(`🎉 You liked "${movieTitle}"`);
        // const moviesResponse = await fetch("../Assets/MovieList.json");
        // const movies = await moviesResponse.json();
        movieCard.querySelector(".like-btn").classList.add("selected");
        movieCard.querySelector(".dislike-btn").classList.remove("selected");
      } else {
        console.error(`❌ Failed to like "${movieTitle}": ${data.message}`);
      }
    } catch (error) {
      console.error("❌ Error liking the movie:", error);
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
        console.log(`🎉 You disliked "${movieTitle}"`);
        // Fetch updated movies and redraw the cards
        // const moviesResponse = await fetch("../Assets/MovieList.json");
        // const movies = await moviesResponse.json();
        movieCard.querySelector(".like-btn").classList.remove("selected");
        movieCard.querySelector(".dislike-btn").classList.add("selected");
      } else {
        console.error(`❌ Failed to dislike "${movieTitle}": ${data.message}`);
      }
    } catch (error) {
      console.error("❌ Error disliking the movie:", error);
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
      alert(data.message);
    } else {
      alert(data.message || "Failed to update reaction");
    }
  } catch (err) {
    console.error("❌ Request failed:", err);
  }
}

document.addEventListener("DOMContentLoaded", function () {
  const sortSelect = document.getElementById("sort");
  const genreSelect = document.getElementById("genre-filter");
  const watchButtons = document.querySelectorAll(".watch-btn");

  // Play button for Banner "Watch Now" button
  watchButtons.forEach((button) => {
    button.addEventListener("click", async (event) => {
      const movieCard = button.closest(".banner-slide"); // Get the parent slide
      const movieTitle = movieCard.querySelector(".hero-title").textContent.trim(); // Get the movie title

      if (movieTitle) {
        try {
          // Fetch the file path for the movie from the backend
          const response = await fetch("http://localhost:3000/api/movies/getFilePath", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title: movieTitle }),
          });

          const data = await response.json();

          if (data.success && data.filePath) {
            // Redirect to the video player page with the file path as a query parameter
            window.location.href = `../html/VideoPlayer.html?filePath=${encodeURIComponent(data.filePath)}`;
          } else {
            console.error(`❌ Failed to fetch file path for "${movieTitle}": ${data.message}`);
            alert(`Failed to play the movie: ${data.message || "Unknown error"}`);
          }
        } catch (error) {
          console.error("❌ Error fetching movie file path:", error);
          alert("An error occurred while trying to play the movie.");
        }
      } else {
        console.error("⚠️ Movie title not found for this slide.");
      }
    });
  });

  // ======================== Banner ========================
  let currentIndex = 0;
  const track = document.getElementById("banner-track");
  const slides = document.querySelectorAll(".banner-slide");
  const totalSlides = slides.length;
  let bannerTimer;

  // Function to reset the banner timer
  function resetBannerTimer() {
    clearInterval(bannerTimer); // Clear the existing timer
    bannerTimer = setInterval(() => {
      nextSlide();
    }, 5000); // Restart the timer
  }

  function updateSlidePosition(animate = true) {
    if (!animate) {
      track.classList.add("no-transition");
    } else {
      track.classList.remove("no-transition");
    }

    track.style.transform = `translateX(-${currentIndex * 100}%)`;
  }

  // Update the nextSlide function
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
    resetBannerTimer(); // Reset the timer
  };

  // Update the prevSlide function
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
    resetBannerTimer(); // Reset the timer
  };

  // Initialize the banner timer
  bannerTimer = setInterval(() => {
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

async function renderMovies(movies) {
  console.log("Movies data passed to renderMovies:", movies);

  const movieGrid = document.querySelector(".movie-grid");
  movieGrid.innerHTML = ""; // Clear the grid

  originalOrder = []; // Reset the original order

  // Fetch the user's reactions (liked, disliked, favorites) from the backend
  let userReactions = {};
  if (currentUserEmail) {
    try {
      const response = await fetch("http://localhost:3000/api/account/reactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: currentUserEmail }),
      });
      const data = await response.json();
      if (data.success) {
        userReactions = data.reactions; // Example: { "Movie Title": { liked: true, disliked: false } }
        console.log("✅ User reactions fetched:", userReactions);
      } else {
        console.warn("⚠ Failed to fetch user reactions:", data.message);
      }
    } catch (error) {
      console.error("❌ Error fetching user reactions:", error);
    }
  }

  // Generate movie cards
  Object.entries(movies).forEach(([key, movie]) => {
    const reactions = userReactions[movie.title] || { likedMovies: false, dislikedMovies: false, favorites: false }; // Default to false for all reactions
    // Generate the movie card with the appropriate classes
    const movieCard = document.createElement("div");
    movieCard.classList.add("movie-card");

    // Set attributes for filtering and sorting
    movieCard.setAttribute("data-movie", movie.title.toLowerCase());
    movieCard.setAttribute("data-genre", movie.genre ? movie.genre.toLowerCase() : "unknown");

    // Populate the movie card with the "selected" class applied directly
    movieCard.innerHTML = `
      <img src="${movie.poster}" alt="Movie Poster" />
      <h3>${movie.title}</h3>
      <p>Genre: ${movie.genre || "Unknown"}</p>
      <div class="controls">
        <button class="play-button">▶ Play</button>
        <div class="like-buttons">
          <button class="like-btn ${reactions.likedMovies ? "selected" : ""}">👍</button>
          <button class="dislike-btn ${reactions.dislikedMovies ? "selected" : ""}">👎</button>
          <button class="favorite-btn ${reactions.favorites ? "selected" : ""}">➕</button>
          <button class="clear-reaction-btn">❌</button>
        </div>
      </div>
    `;

    // Debugging: Log the generated HTML
    // console.log(movieCard.innerHTML);

    movieGrid.appendChild(movieCard);
    originalOrder.push(movieCard); // Store the card in the original order array

    // Attach event listeners to the buttons
    attachPlayButtonListener(movieCard);
    attachFavoriteButtonListener(movieCard);
    attachRemoveFavoriteButtonListener(movieCard);
    attachLikeDislikeButtonListeners(movieCard);
  });

  // console.log("Original Order:", originalOrder.map(card => card.querySelector("h3").textContent)); // Debugging log
}