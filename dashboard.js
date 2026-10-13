// ==========================================
// INTELLISTOCK DASHBOARD
// ==========================================


// Check login status

const isLoggedIn =
    localStorage.getItem("isLoggedIn");


if (isLoggedIn !== "true") {

    window.location.href = "login.html";

}



// ==========================================
// GET USERNAME
// ==========================================

const username =
    localStorage.getItem("username") || "Admin";


document.getElementById("adminName")
    .textContent = username;


document.getElementById("welcomeName")
    .textContent = username;



// ==========================================
// CURRENT DATE
// ==========================================

const dateElement =
    document.getElementById("currentDate");


const today = new Date();


const options = {
    day: "2-digit",
    month: "short",
    year: "numeric"
};


dateElement.textContent =
    today.toLocaleDateString(
        "en-IN",
        options
);



// ==========================================
// LOGOUT
// ==========================================

const logoutBtn =
    document.getElementById("logoutBtn");


logoutBtn.addEventListener(
    "click",
    function() {

        // Remove login information

        localStorage.removeItem(
            "isLoggedIn"
        );

        localStorage.removeItem(
            "username"
        );


        // Go back to login

        window.location.href =
            "login.html";

    }
);



// ==========================================
// CHART PERIOD
// ==========================================

const chartPeriod =
    document.getElementById("chartPeriod");


chartPeriod.addEventListener(
    "change",
    function() {

        if (this.value === "30") {

            alert(
                "30-day sales data will be loaded from the database."
            );

        }

        else {

            alert(
                "Showing last 7 days sales data."
            );

        }

    }
);
