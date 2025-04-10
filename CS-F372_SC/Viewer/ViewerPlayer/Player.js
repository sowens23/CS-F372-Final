document.addEventListener("DOMContentLoaded", () => {
    const query = new URLSearchParams(window.location.search);
    const movie = query.get("movie");
    const title = movie || "Unknown";
    const videoSrc = `../../Assets/Videos/${movie}.mp4`;
  
    const player = document.getElementById("movie-player");
    const source = document.getElementById("video-source");
  
    if (movie) {
      document.title = `Now Playing: ${title}`;
      source.src = videoSrc;
  
      // 加载并尝试播放
      player.load();
      player.play().then(() => {
        console.log("✅ 播放成功！");
      }).catch(err => {
        console.error("⚠️ 播放失败：", err);
      });
    }
  });
  