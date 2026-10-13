// ==========================================
// INTELLISTOCK LOGIN
// ==========================================

const loginForm = document.getElementById("loginForm");

const loginMessage =
    document.getElementById("loginMessage");


loginForm.addEventListener("submit", function(event) {

    // Prevent page refresh
    event.preventDefault();


    // Get input values
    const username =
        document.getElementById("username").value.trim();

    const password =
        document.getElementById("password").value.trim();


    // Demo credentials
    const correctUsername = "admin";

    const correctPassword = "admin123";


    // Check login
    if (
        username === correctUsername &&
        password === correctPassword
    ) {

        loginMessage.textContent =
            "Login successful! Redirecting...";

        loginMessage.style.color = "#16a34a";


        // Save login status
        localStorage.setItem(
            "isLoggedIn",
            "true"
        );

        localStorage.setItem(
            "username",
            username
        );


        // Redirect to dashboard
        setTimeout(function() {

            window.location.href =
                "dashboard.html";

        }, 1000);

    }

    else {

        loginMessage.textContent =
            "Invalid username or password.";

        loginMessage.style.color =
            "#dc2626";

    }

});
