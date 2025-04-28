document.addEventListener("DOMContentLoaded", async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const movieTitle = urlParams.get("title"); // Get the movie title from the URL

  if (!movieTitle) {
    alert("⚠️ No movie title provided.");
    return;
  }

  let userEmail = null;

  // Fetch the user's email from the session first
  try {
    const sessionResponse = await fetch("http://localhost:3000/api/account/session", {
      credentials: "include",
    });
    const sessionData = await sessionResponse.json();

    if (!sessionData.success || !sessionData.email) {
      console.error("❌ User is not logged in.");
      alert("⚠️ You must be logged in to watch movies.");
      return;
    }

    userEmail = sessionData.email;
    console.log(`✅ Logged in as: ${userEmail}`);
    const bannerEmail = document.getElementById("banner-email");
    if (bannerEmail) {
      bannerEmail.textContent = `Logged in as: ${userEmail}`;
    }
  } catch (error) {
    console.error("❌ Error fetching session data:", error);
    alert("❌ Failed to fetch session data. Please try again later.");
    return;
  }

  // Fetch the movie data and load the player
  try {
    // const response = await fetch("../Assets/MovieList.json");
    // const movies = await response.json();

    console.log("Fetching all movies...");
    const response = await fetch("http://localhost:3000/api/movies/getAllMovies"); // Call the new API endpoint
    const movieData = await response.json();

    if (!response.ok || !movieData.success) {
      throw new Error(`Failed to fetch movies: ${movieData.message || response.status}`);
    }

    const movies = movieData.movies; // Extract movies from the response
    console.log("🎥 All movies loaded:", movies);

    // Find the movie object by title
    const movie = Object.values(movies).find((m) => m.title === movieTitle);

    if (!movie) {
      alert(`⚠️ Movie "${movieTitle}" not found.`);
      return;
    }

    // Set the movie title and video source
    const movieTitleElement = document.getElementById("movie-title");
    const videoPlayer = document.getElementById("movie-player");

    movieTitleElement.textContent = `🎬 Now Playing: ${movie.title}`;
    videoPlayer.src = movie.filepath; // Set the video source dynamically
    videoPlayer.load(); // Load the video

    console.log(`✅ Loaded movie: ${movie.title}`);
  } catch (error) {
    console.error("❌ Error loading movie data:", error);
    alert("❌ Failed to load movie data. Please try again later.");
    return;
  }

  // Update the watch history for the movie
  try {
    const watchHistoryRes = await fetch("http://localhost:3000/api/account/watchHistory", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: movieTitle, email: userEmail }),
    });

    const watchHistoryData = await watchHistoryRes.json();
    if (watchHistoryData.success) {
      console.log(`✅ Watch history recorded for "${movieTitle}"`);
    } else {
      console.error(`❌ Failed to record watch history for "${movieTitle}":`, watchHistoryData.message);
    }
  } catch (err) {
    console.error("❌ Error recording watch history:", err);
  }

  // Update the play count for the movie
  try {
    const playCountRes = await fetch("http://localhost:3000/api/marketing/play-count", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: movieTitle }),
    });

    const playCountData = await playCountRes.json();
    if (playCountData.success) {
      console.log(`✅ Play count updated for "${movieTitle}"`);
    } else {
      console.error(`❌ Failed to update play count for "${movieTitle}":`, playCountData.message);
    }
  } catch (err) {
    console.error("❌ Error updating play count:", err);
  }
});