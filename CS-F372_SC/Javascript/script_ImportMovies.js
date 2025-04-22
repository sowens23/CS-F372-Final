const fs = require("fs");
const path = require("path");
const connectDB = require("./db");

async function importMovies() {
  try {
    const db = await connectDB();
    const moviesCollection = db.collection("movies");

    // Check if the movies collection is empty
    const movieCount = await moviesCollection.countDocuments();
    if (movieCount > 0) {
      console.log("❌ Movies collection is not empty. Import aborted.");
      return { success: false, message: "Movies collection is not empty." };
    }

    // Read MovieList.json
    const movieListPath = path.join(__dirname, "../Assets", "MovieList.json");
    const movieList = JSON.parse(fs.readFileSync(movieListPath, "utf-8"));

    // Insert all movies into the database
    const moviesToInsert = Object.values(movieList).map((movie) => ({
      title: movie.title,
      genre: movie.genre || "Unknown",
      poster: movie.poster || "",
      filepath: movie.filepath || "",
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    await moviesCollection.insertMany(moviesToInsert);
    console.log("🎉 All movies imported successfully!");
    return { success: true, message: "Movies imported successfully." };
  } catch (error) {
    console.error("❌ Error importing movies:", error);
    return { success: false, message: "Error importing movies." };
  }
}

module.exports = importMovies;