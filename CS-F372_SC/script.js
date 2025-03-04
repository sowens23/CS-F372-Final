function updateAccount() {
    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    if (name && email && password) {
        alert("Account information updated successfully!");
    } else {
        alert("Please fill in all fields.");
    }
}

