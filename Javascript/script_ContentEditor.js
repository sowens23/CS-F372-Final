let movies = []; // Declare movies outside the try block

document.addEventListener("DOMContentLoaded", async () => {
  const bannerEmail = document.getElementById("banner-email");

  try {
    // === Fetch Session Data ===
    console.log("Fetching session data...");
    const response = await fetch("http://localhost:3000/api/account/session", {
      credentials: "include", // Ensure cookies are sent with the request
    });
    const data = await response.json();
    console.log("Session data:", data);

    if (data.success) {
      bannerEmail.textContent = `Logged in as: ${data.email}`;

      // Check if the user has "Content Editor" privileges
      if (!data.roles || !data.roles.includes("Content Editor")) {
        alert("❌ You do not have permission to access this page.");
        window.location.href = "../html/index_Home.html"; // Redirect to Home page
        return;
      }
    } else {
      bannerEmail.textContent = "Not logged in";
      alert("❌ You must be logged in to access this page.");
      window.location.href = "../html/index_Login.html"; // Redirect to Login page
      return;
    }
  } catch (error) {
    console.error("❌ Error fetching session data:", error);
    bannerEmail.textContent = "Error fetching session";
    alert("❌ Unable to verify your permissions. Please try again later.");
    window.location.href = "../html/index_Home.html"; // Redirect to Home page
    return;
  }

  const movieGrid = document.querySelector(".movie-grid");
  const addMovieButton = document.getElementById("add-movie-button");
  const modal = document.getElementById("editModal");
  const overlay = document.getElementById("modalOverlay");
  const titleInput = document.getElementById("editTitle");
  const genreInput = document.getElementById("editGenre");
  const posterInput = document.getElementById("editPoster");
  const filepathInput = document.getElementById("editFilepath");
  const saveBtn = document.getElementById("saveEdit");
  let currentCard = null;

  // === Load Movie Cards Function ===
  async function loadMovieCards() {
    try {
      // const response = await fetch("../Assets/MovieList.json");
      // const movies = await response.json();

      console.log("Fetching all movies...");
      const response = await fetch("http://localhost:3000/api/movies/getAllMovies"); //
      const movieData = await response.json();
  
      if (!response.ok || !movieData.success) {
        throw new Error(`Failed to fetch movies: ${movieData.message || response.status}`);
      }
  
      movies = movieData.movies; // Extract movies from the response
      console.log("🎥 All movies loaded:", movies);

      // Iterate through the movies and create cards
      for (const movie of movies) {
        const movieCard = document.createElement("div");
        movieCard.classList.add("movie-card");
        movieCard.setAttribute("data-movie", movie.title); // Set the title as the data-movie attribute
        movieCard.setAttribute("data-filepath", movie.filepath || ""); // Set the filepath attribute
      
        movieCard.innerHTML = `
          <img src="${movie.poster}" alt="Movie Poster" />
          <h3>${movie.title}</h3>
          <p>Genre: ${movie.genre || "Unknown"}</p>
          <div class="controls">
            <button class="edit-btn">Edit</button>
            <button class="remove-btn">Remove</button>
            <button class="comments-btn">Notes</button>
          </div>
        `;
      
        movieGrid.appendChild(movieCard);
      }

      // Attach event listeners to dynamically created buttons
      setupEditButtons();
      setupPosterButtons();
      setupRemoveButtons();
      setupNotesButtons();
    } catch (error) {
      console.error("❌ Error loading movies:", error);
    }
  }

  // Call the function to load movie cards
  loadMovieCards();
  
  // === Remove Movie ===
  function setupRemoveButtons() {
    document.querySelectorAll(".remove-btn").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const card = btn.closest(".movie-card");
        const title = card.querySelector("h3").textContent;
  
        if (confirm(`❗ Are you sure you want to delete "${title}"?`)) {
          // Optimistically remove the card from the UI
          card.remove();
  
          try {
            // Call the delete movie API
            const response = await fetch("http://localhost:3000/api/editor/delete-movie", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ title }),
            });
  
            const result = await response.json();
            if (!result.success) {
              console.error(`❌ Failed to delete movie: ${result.message}`);
              // Re-add the card if deletion fails
              document.querySelector(".movie-grid").appendChild(card);
            } else {
              console.log(`✅ Movie "${title}" deleted successfully.`);
            }
          } catch (error) {
            console.error("❌ Error deleting movie:", error);
            // Re-add the card if an error occurs
            document.querySelector(".movie-grid").appendChild(card);
          }
        }
      });
    });
  }

  // === Edit Movie Menu ===
  function setupEditButtons() {
    document.querySelectorAll(".edit-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        currentCard = e.target.closest(".movie-card");
        console.log("Data-movie attribute:", currentCard.getAttribute("data-movie")); // Debugging
  
        const title = currentCard.querySelector("h3").textContent;
        const genre = currentCard.querySelector("p").textContent.replace("Genre: ", "");
        const poster = decodeURIComponent(currentCard.querySelector("img").src.split("/").pop()); // Decode URL
        const filepath = decodeURIComponent(currentCard.getAttribute("data-filepath")?.split("/").pop() || ""); // Decode URL
  
        titleInput.value = title;
        genreInput.value = genre;
        posterInput.value = poster;
        filepathInput.value = filepath;
  
        modal.style.display = "block";
        overlay.style.display = "block";
      });
    });
  }

  // === Update Movie ===
  saveBtn.addEventListener("click", async () => {
    if (currentCard) {
      const originalTitle = currentCard.getAttribute("data-movie"); // Get the original title
      const updatedTitle = titleInput.value.trim();
      const updatedGenre = genreInput.value.trim();
  
      // Get the current values from the card
      const currentPoster = currentCard.querySelector("img").src.split("/").pop().split("?")[0]; // Get current poster file name
      const currentFilepath = currentCard.getAttribute("data-filepath").split("/").pop(); // Get current filepath
  
      // Ensure the poster includes the directory path
      let updatedPoster = posterInput.value.trim();
      if (!updatedPoster.startsWith("../Assets/posters/")) {
        updatedPoster = `../Assets/posters/${updatedPoster}`;
      }
  
      // Ensure the filepath includes the directory path
      let updatedFilepath = filepathInput.value.trim();
      if (!updatedFilepath.startsWith("../Assets/videos/")) {
        updatedFilepath = `../Assets/videos/${updatedFilepath}`;
      }
  
      // Only proceed if at least one field has changed
      if (
        updatedTitle !== originalTitle ||
        updatedGenre !== currentCard.querySelector("p").textContent.replace("Genre: ", "") ||
        updatedPoster !== currentPoster ||
        updatedFilepath !== currentFilepath
      ) {
        try {
          console.log("Updating movie with data:", {
            originalTitle,
            updatedTitle,
            updatedGenre,
            updatedPoster,
            updatedFilepath,
          });
          const response = await fetch("http://localhost:3000/api/editor/update-movie", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              originalTitle,
              updatedTitle,
              updatedGenre,
              updatedPoster,
              updatedFilepath,
            }),
          });
  
          const result = await response.json();
          if (result.success) {
            console.log(`✅ Movie "${updatedTitle}" updated successfully.`);
  
            // Update the card in the UI
            currentCard.querySelector("h3").textContent = updatedTitle;
            currentCard.querySelector("p").textContent = `Genre: ${updatedGenre}`;
            currentCard.querySelector("img").src = updatedPoster;
            currentCard.setAttribute("data-movie", updatedTitle);
            currentCard.setAttribute("data-filepath", updatedFilepath);
          } else {
            console.error(`❌ Failed to update movie: ${result.message}`);
          }
        } catch (error) {
          console.error("❌ Error updating movie:", error);
        }
      }
  
      modal.style.display = "none";
      overlay.style.display = "none";
    }
  });

  overlay.addEventListener("click", () => {
    modal.style.display = "none";
    overlay.style.display = "none";
  });

  function setupNotesButtons() {
    document.querySelectorAll(".comments-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const card = e.target.closest(".movie-card");
        const movieTitle = card.querySelector("h3").textContent; // Get the movie title
        const movie = movies.find((m) => m.title === movieTitle); // Find the movie object
  
        if (!movie) {
          console.error(`❌ Movie "${movieTitle}" not found.`);
          return;
        }
  
        // Display the note in the modal
        const notesModal = document.getElementById("notesModal");
        const notesContent = document.getElementById("notesContent");
        notesContent.textContent = movie.note || "No notes available."; // Show the note or a default message
        notesModal.style.display = "flex"; // Show the modal
      });
    });
  }

  // === Upload Poster ===
  function setupPosterButtons() {
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
  }

  // Event listener for the "Add Movie" button
  addMovieButton.addEventListener("click", async () => {
    const title = newTitle.value.trim();
    const genre = newGenre.value.trim();
    let poster = newPoster.value.trim();
    let filepath = newFile.value.trim();

    // Ensure the poster includes the directory path
    if (!poster.startsWith("../Assets/posters/")) {
      poster = `../Assets/posters/${poster}`;
    }

    // Ensure the filepath includes the directory path
    if (!filepath.startsWith("../Assets/videos/")) {
      filepath = `../Assets/videos/${filepath}`;
    }

    // Validate input fields
    if (!title || !genre || !poster || !filepath) {
      console.log("❌ All four fields are required.");
      return;
    }

    try {
      // Send the request to add the movie
      const response = await fetch("http://localhost:3000/api/editor/add-movie", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, genre, poster, filepath }),
      });

      const result = await response.json();
      if (result.success) {
        loadMovieCards();

        // Clear the input fields
        newTitle.value = "";
        newGenre.value = "";
        newPoster.value = "";
        newFile.value = "";
      } else {
        console.log(`❌ Failed to add movie: ${result.message}`);
      }
    } catch (error) {
      console.error("❌ Error adding movie:", error);
    }
  });
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
      // Update the movie cards with the search results
      const movieGrid = document.querySelector(".movie-grid");
      movieGrid.innerHTML = ""; // Clear existing cards

      data.movies.forEach((movie) => {
        const movieCard = document.createElement("div");
        movieCard.classList.add("movie-card");
        movieCard.innerHTML = `
          <h3>${movie.title}</h3>
          <img src="${movie.poster}" alt="${movie.title}" />
          <p>${movie.genre}</p>
        `;
        movieGrid.appendChild(movieCard);
      });
    } else {
      console.error("❌ Failed to fetch search results:", data.message);
    }
  } catch (error) {
    console.error("❌ Error during search:", error);
  }
});

// Close the modal when the close button is clicked
document.getElementById("closeNotesModal").addEventListener("click", () => {
  document.getElementById("notesModal").style.display = "none";
});

document.getElementById("importMoviesButton").addEventListener("click", async () => {
  if (!confirm("Are you sure you want to import MovieList.json? This will only work if the database is empty.")) {
    return;
  }

  try {
    const response = await fetch("http://localhost:3000/api/movies/import", {
      method: "POST",
    });

    const result = await response.json();
    if (result.success) {
      alert("🎉 MovieList.json imported successfully!");
      location.reload(); // Reload the page to reflect the changes
    } else {
      alert(`❌ Failed to import MovieList.json: ${result.message}`);
    }
  } catch (error) {
    console.error("❌ Error importing MovieList.json:", error);
    alert("❌ An error occurred while importing MovieList.json.");
  }
});