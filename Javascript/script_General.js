document.getElementById("sign-out-button").addEventListener("click", async () => {
  try {
    const response = await fetch("http://localhost:3000/api/account/logout", {
      method: "POST",
      credentials: "include", // Ensure cookies are sent with the request
    });

    const data = await response.json();
    if (data.success) {
      // alert("✅ You have been signed out.");
      window.location.href = "../html/index_Login.html"; // Redirect to login page
    } else {
      alert(`❌ ${data.message}`);
    }
  } catch (error) {
    console.error("❌ Error during sign out:", error);
    // alert("❌ An error occurred while signing out. Please try again.");
  }
});