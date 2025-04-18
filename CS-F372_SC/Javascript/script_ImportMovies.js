const fs = require("fs");
const path = require("path");
const connectDB = require("./db");

async function importMovies() {
  try {
    const db = await connectDB();
    const moviesCollection = db.collection("movies");

    // Read MovieList.json
    const movieListPath = path.join(__dirname, "../Assets", "MovieList.json");
    const movieList = JSON.parse(fs.readFileSync(movieListPath, "utf-8"));

    for (const [key, movie] of Object.entries(movieList)) {
      // Fetch the existing movie from the database
      const existingMovie = await moviesCollection.findOne({ title: movie.title });

      // Determine if any fields have changed
      const fieldsToUpdate = {};
      if (!existingMovie || existingMovie.genre !== movie.genre) {
        fieldsToUpdate.genre = movie.genre || "Unknown";
      }
      if (!existingMovie || existingMovie.poster !== movie.poster) {
        // Construct the poster path dynamically by removing spaces from the title
        const sanitizedTitle = movie.title.replace(/\s+/g, ""); // Remove spaces from the title
        fieldsToUpdate.poster = movie.poster || `../Assets/posters/${sanitizedTitle}.webp`;
      }
      if (!existingMovie || existingMovie.filepath !== movie.filepath) {
        fieldsToUpdate.filepath = movie.filepath || "";
      }

      // Update the database only if there are changes
      if (Object.keys(fieldsToUpdate).length > 0) {
        fieldsToUpdate.updatedAt = new Date(); // Track when the movie was last updated

        await moviesCollection.updateOne(
          { title: movie.title }, // Match by title
          {
            $set: fieldsToUpdate,
            $setOnInsert: {
              createdAt: new Date(), // Set createdAt only if the movie is newly inserted
            },
          },
          { upsert: true } // Insert a new document if no match is found
        );

        console.log(`🔄 Updated movie: ${movie.title}`);
      } else {
        console.log(`✅ No changes for movie: ${movie.title}`);
      }
    }

    console.log("🎉 Movie import and update process completed!");
  } catch (error) {
    console.error("❌ Error importing movies:", error);
  }
}

module.exports = importMovies;