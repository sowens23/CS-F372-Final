let movies = []; // Declare movies in the global scope

document.addEventListener("DOMContentLoaded", async () => {
  const bannerEmail = document.getElementById("banner-email");
  const movieTableBody = document.getElementById("movie-table").querySelector("tbody");

  try {
    // === Fetch Session Data ===
    console.log("Fetching session data...");
    const sessionResponse = await fetch("http://localhost:3000/api/account/session", {
      credentials: "include",
    });
    const sessionData = await sessionResponse.json();
    console.log("Session data:", sessionData);

    if (sessionData.success) {
      const { email, roles } = sessionData; // Extract email and roles
      bannerEmail.textContent = `Logged in as: ${email}`;
    
      // Check if the user has "Marketing Manager" privileges
      if (!roles || !roles.includes("Marketing Manager")) {
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

    // === Fetch Movie Data ===
    // console.log("Fetching movie data...");
    // const movieResponse = await fetch("../Assets/MovieList.json");
    // const movies = await movieResponse.json();

    console.log("Fetching all movies...");
    const response = await fetch("http://localhost:3000/api/movies/getAllMovies"); // Call the new API endpoint
    const movieData = await response.json();

    if (!response.ok || !movieData.success) {
      throw new Error(`Failed to fetch movies: ${movieData.message || response.status}`);
    }

    movies = movieData.movies; // Extract movies from the response
    console.log("🎥 All movies loaded:", movies);

    // if (!movieResponse.ok) {
    //   throw new Error(`HTTP error! status: ${movieResponse.status}`);
    // }

    // const movies = await movieResponse.json();
    console.log("Movie data:", movies);

    // === Fetch All User Emails ===
    console.log("Fetching all user emails...");
    let usersData = null; // Declare outside the try block
    try {
      const usersResponse = await fetch("http://localhost:3000/api/users/getAllUsers"); // Correct GET request
      if (!usersResponse.ok) {
        throw new Error(`HTTP error! status: ${usersResponse.status}`);
      }
      usersData = await usersResponse.json();
      console.log("User data:", usersData);
    } catch (error) {
      console.error("❌ Error fetching users:", error);
      return; // Exit if user data cannot be fetched
    }

    if (!usersData || !usersData.emails) {
      console.error("❌ No user data available.");
      return; // Exit if no user data is available
    }

    const userEmails = usersData.emails;
    console.log("User emails:", userEmails);

    // === Initialize Counters for Each Movie ===
    const movieStats = {};
    const movieTitleToKeyMap = {}; // Map movie titles to their keys

    movies.forEach((movie, index) => {
      movieStats[index] = {
        likes: 0,
        dislikes: 0,
        favorites: 0,
      };
      movieTitleToKeyMap[movie.title] = index; // Map the movie title to its index
    });

    // === Fetch Reactions for Each User ===
    console.log("Fetching user reactions...");
    for (const email of userEmails) {
      const reactionsResponse = await fetch("http://localhost:3000/api/account/reactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const reactionsData = await reactionsResponse.json();

      if (!reactionsData.success) {
        console.warn(`Failed to fetch reactions for user ${email}: ${reactionsData.message}`);
        continue;
      }

      const reactions = reactionsData.reactions;
      // console.log("Reactions for user:", email, reactions);
      // Increment counters for each movie based on reactions
      for (const [movieTitle, reaction] of Object.entries(reactions)) {
        const movieKey = movieTitleToKeyMap[movieTitle]; // Get the corresponding key for the movie title
        if (movieKey === undefined) {
          console.warn(`Movie title "${movieTitle}" not found in movieTitleToKeyMap.`);
          continue; // Skip if the movie title doesn't exist in the map
        }

        // Increment counters based on boolean values
        if (reaction.likedMovies) {
          movieStats[movieKey].likes++;
          // console.log("Adding like for ", movieTitle);
        }
        if (reaction.dislikedMovies) {
          movieStats[movieKey].dislikes++;
          // console.log("Adding dislike for ", movieTitle);
        }
        if (reaction.favorites) {
          movieStats[movieKey].favorites++;
          // console.log("Adding favorite for ", movieTitle);
        }
      }
    }

    console.log("Movie stats:", movieStats);

  // === Populate Table ===
  console.log("Populating table...");
  let tableRowsHTML = ""; // Initialize an empty string to hold the rows

  for (const [key, movie] of Object.entries(movies)) {
    const stats = movieStats[key] || { likes: 0, dislikes: 0, favorites: 0 };

    // Build the HTML for each row
    tableRowsHTML += `
      <tr>
        <!-- Movie Poster and Title -->
        <td>
          <img 
            src="${movie.poster || '../Assets/posters/default-poster.webp'}" 
            alt="${movie.title} Poster" 
            style="width: 100px; height: auto; display: block; margin: 0 auto;" 
          />
          <p style="text-align: center;">${movie.title}</p>
        </td>

        <!-- Play Count -->
        <td>${movie.plays || 0}</td>

        <!-- Likes -->
        <td>${stats.likes}</td>

        <!-- Dislikes -->
        <td>${stats.dislikes}</td>

        <!-- Favorites -->
        <td>${stats.favorites}</td>

        <!-- Feedback Comments -->
        <td>
          ${
            movie.feedback && movie.feedback.length > 0
              ? `<ul>${movie.feedback
                  .map(
                    (comment) =>
                      `<li>${comment.email}: ${comment.comment}</li>`
                  )
                  .join("")}</ul>`
              : "No feedback"
          }
        </td>

        <!-- Notes -->
        <td>
          <button class="notes-btn">View Notes</button>
        </td>
      </tr>
    `;
  }

  // Append the rows to the table body
  movieTableBody.innerHTML = tableRowsHTML;

  console.log("✅ Movie data loaded successfully.");
  } catch (error) {
    console.error("❌ Error loading data:", error);
    movieTableBody.innerHTML = "<tr><td colspan='3'>Error loading data</td></tr>";
  }
});

// Attach event listeners to "View Notes" buttons
document.addEventListener("click", (event) => {
  if (event.target.classList.contains("notes-btn")) {
    const movieRow = event.target.closest("tr");
    const movieTitle = movieRow.querySelector("p").textContent.trim(); // Get the movie title
    const movie = movies.find((m) => m.title === movieTitle); // Find the movie object

    if (!movie) {
      console.error(`❌ Movie "${movieTitle}" not found.`);
      return;
    }

    // Open the modal and populate the text area with the existing note
    const notesModal = document.getElementById("notesModal");
    const notesTextArea = document.getElementById("notesTextArea");
    notesTextArea.value = movie.note || ""; // Populate with the existing note or leave blank
    notesModal.style.display = "block";

    // Save the movie reference for later
    notesModal.dataset.movieTitle = movieTitle;
  }
});

// Close the modal when the close button is clicked
document.getElementById("closeNotesModal").addEventListener("click", () => {
  document.getElementById("notesModal").style.display = "none";
});

document.getElementById("saveNotesButton").addEventListener("click", async () => {
  const notesModal = document.getElementById("notesModal");
  const movieTitle = notesModal.dataset.movieTitle; // Get the movie title from the modal
  const notesTextArea = document.getElementById("notesTextArea");
  const updatedNote = notesTextArea.value.trim(); // Get the updated note

  const movie = movies.find((m) => m.title === movieTitle); // Find the movie object
  if (!movie) {
    console.error(`❌ Movie "${movieTitle}" not found.`);
    return;
  }

  // Update the movie object with the new note
  movie.note = updatedNote;

  // Send the updated note to the backend
  try {
    const response = await fetch("http://localhost:3000/api/movies/update-note", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: movieTitle, note: updatedNote }),
    });

    const result = await response.json();
    if (result.success) {
      console.log(`✅ Note for movie "${movieTitle}" updated successfully.`);
    } else {
      console.error(`❌ Failed to update note for movie "${movieTitle}": ${result.message}`);
    }
  } catch (error) {
    console.error("❌ Error updating note:", error);
  }

  // Close the modal
  notesModal.style.display = "none";
});