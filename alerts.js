
"use strict";

// ==========================================
// INTELLISTOCK - ALERT MANAGEMENT
// ==========================================

// LOGIN CHECK
if (localStorage.getItem("isLoggedIn") !== "true") {
    window.location.href = "login.html";
}

// PAGE ELEMENTS
const alertsTableBody = document.getElementById("alertsTableBody");
const alertFilter = document.getElementById("alertFilter");
const refreshAlertsButton = document.getElementById("refreshAlerts");
const noAlertsMessage = document.getElementById("noAlerts");
const alertMessage = document.getElementById("alertMessage");

// READ LATEST PRODUCT DATA
function getProductsForAlerts() {
    try {
        const data = JSON.parse(localStorage.getItem("products")) || [];
        return Array.isArray(data) ? data : [];
    } catch (error) {
        console.error("Unable to read products:", error);
        return [];
    }
}

// SAFE NUMBER CONVERSION
function safeNumber(value) {
    const number = Number(value);
    return Number.isFinite(number) ? Math.max(0, number) : 0;
}

// LOAD ALERTS
function loadAlerts() {
    const products = getProductsForAlerts();
    const selectedFilter = alertFilter.value;

    let lowCount = 0;
    let outCount = 0;
    const alerts = [];

    products.forEach(function (product) {
        const stock = safeNumber(product.quantity);
        const minimum = safeNumber(product.minimumStock);

        if (stock === 0) {
            outCount++;

            alerts.push({
                product: product,
                stock: stock,
                minimum: minimum,
                type: "Out of Stock",
                category: "out",
                suggested: Math.max(0, (minimum * 2) - stock)
            });
        } else if (stock <= minimum) {
            lowCount++;

            alerts.push({
                product: product,
                stock: stock,
                minimum: minimum,
                type: "Low Stock",
                category: "low",
                suggested: Math.max(0, (minimum * 2) - stock)
            });
        }
    });

    // SUMMARY CARDS
    document.getElementById("totalAlerts").textContent = alerts.length;
    document.getElementById("lowStockAlerts").textContent = lowCount;
    document.getElementById("outOfStockAlerts").textContent = outCount;

    // SIDEBAR ALERT COUNT
    const sidebarCount = document.getElementById("sidebarAlertCount");

    if (sidebarCount) {
        sidebarCount.textContent = alerts.length;
    }

    // FILTER ALERTS
    const filteredAlerts = alerts.filter(function (alert) {
        return selectedFilter === "all" ||
               alert.category === selectedFilter;
    });

    // CLEAR OLD TABLE
    alertsTableBody.innerHTML = "";

    // EMPTY MESSAGE
    noAlertsMessage.hidden = filteredAlerts.length > 0;

    if (filteredAlerts.length === 0) {
        noAlertsMessage.textContent = alerts.length === 0
            ? "No stock alerts. All products have sufficient stock."
            : "No alerts match the selected filter.";
    }

    // DISPLAY ALERT ROWS
    filteredAlerts.forEach(function (alert) {
        const product = alert.product;
        const row = document.createElement("tr");

        const values = [
            product.id ?? "N/A",
            product.name || "Unnamed Product",
            alert.stock,
            alert.minimum
        ];

        values.forEach(function (value) {
            const cell = document.createElement("td");
            cell.textContent = value;
            row.appendChild(cell);
        });

        const typeCell = document.createElement("td");
        const badge = document.createElement("span");

        badge.className = alert.category === "out"
            ? "alert-badge alert-out"
            : "alert-badge alert-low";

        badge.textContent = alert.type;
        typeCell.appendChild(badge);
        row.appendChild(typeCell);

        const restockCell = document.createElement("td");
        restockCell.className = "restock-value";
        restockCell.textContent = alert.suggested;
        row.appendChild(restockCell);

        alertsTableBody.appendChild(row);
    });

    alertMessage.textContent =
        "Alerts updated successfully. Total products checked: " +
        products.length + ".";
}

// REFRESH BUTTON
refreshAlertsButton.addEventListener("click", function () {
    refreshAlertsButton.disabled = true;
    refreshAlertsButton.textContent = "Refreshing...";

    try {
        loadAlerts();
    } catch (error) {
        console.error("Alert refresh failed:", error);
        alertMessage.textContent =
            "Unable to refresh alerts. Check the browser console.";
    } finally {
        refreshAlertsButton.disabled = false;
        refreshAlertsButton.textContent = "↻ Refresh Alerts";
    }
});

// FILTER
alertFilter.addEventListener("change", loadAlerts);

// UPDATE WHEN PAGE BECOMES ACTIVE
window.addEventListener("focus", loadAlerts);

// LOGOUT
const logoutBtn = document.getElementById("logoutBtn");

if (logoutBtn) {
    logoutBtn.addEventListener("click", function () {
        localStorage.removeItem("isLoggedIn");
        localStorage.removeItem("username");
        window.location.href = "login.html";
    });
}

// ADMIN NAME
const adminName = document.getElementById("adminName");

if (adminName) {
    adminName.textContent =
        localStorage.getItem("username") || "Admin";
}

// INITIAL LOAD
loadAlerts();
