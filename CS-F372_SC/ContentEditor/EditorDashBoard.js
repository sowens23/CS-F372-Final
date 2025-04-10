function showPanel(id) {
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('active-panel'));
    document.getElementById(id).classList.add('active-panel');
  
    document.querySelectorAll('.sidebar-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
  }
  
  // ✅ Add movies Logic
  document.addEventListener('DOMContentLoaded', () => {
    const movieForm = document.getElementById('movieForm');
    const movieList = document.getElementById('movieList');
  
    movieForm.addEventListener('submit', (e) => {
      e.preventDefault();
  
      // Get Input
      const title = document.getElementById('titleInput').value.trim();
      const genre = document.getElementById('genreInput').value.trim();
      const path = document.getElementById('pathInput').value.trim();
  
      // Create New Movie 
      const movieItem = document.createElement('div');
      movieItem.className = 'movie-entry';
      movieItem.innerHTML = `
        <p>
          🎬 Movie: <strong>${title}</strong><br>  
          🧩 Genre: (${genre})<br>  
          🎞 Path: <em>${path}</em>
        </p>
      
        <button class="remove-btn">Remove</button>
      `;      
  
      // ❌ Delete Function
      movieItem.querySelector('.remove-btn').addEventListener('click', () => {
        movieItem.remove();
      });

       // 🙈 Hidden Function
    const hideBtn = movieItem.querySelector('.hide-btn');
    hideBtn.addEventListener('click', () => {
      movieItem.classList.toggle('hidden-movie');
      if (movieItem.classList.contains('hidden-movie')) {
        hideBtn.textContent = 'Unhide';
      } else {
        hideBtn.textContent = 'Hide';
      }
    });

    movieList.appendChild(movieItem);
    movieForm.reset();
  
      // Add MovieList Display 
      movieList.appendChild(movieItem);
  
      // Clean Input
      movieForm.reset();
    });
  });
  