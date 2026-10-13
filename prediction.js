
"use strict";

// ==========================================
// INTELLISTOCK - STOCK PREDICTION
// ==========================================

// LOGIN CHECK
if (localStorage.getItem("isLoggedIn") !== "true") {
    window.location.href = "login.html";
}

// GET PAGE ELEMENTS
const refreshButton = document.getElementById("refreshPrediction");
const searchInput = document.getElementById("predictionSearch");
const tableBody = document.getElementById("predictionTableBody");
const emptyMessage = document.getElementById("predictionEmpty");
const predictionMessage = document.getElementById("predictionMessage");

// READ PRODUCTS FRESHLY FROM LOCAL STORAGE
function getLatestProducts() {
    try {
        const storedData = localStorage.getItem("products");

        if (!storedData) {
            return [];
        }

        const products = JSON.parse(storedData);

        return Array.isArray(products) ? products : [];
    } catch (error) {
        console.error("Unable to read products:", error);
        return [];
    }
}

// SAFE NUMBER CONVERSION
function getNumber(value) {
    const number = Number(value);
    return Number.isFinite(number) ? Math.max(0, number) : 0;
}

// LOAD AND UPDATE PREDICTIONS
function loadPredictions() {
    try {
        // Always get the latest saved inventory
        const products = getLatestProducts();

        const search = searchInput.value.toLowerCase().trim();

        let lowCount = 0;
        let outCount = 0;
        let restockCount = 0;

        // CALCULATE SUMMARY COUNTS
        products.forEach(function (product) {
            const stock = getNumber(product.quantity);
            const minimum = getNumber(product.minimumStock);

            if (stock === 0) {
                outCount++;
            }

            if (stock > 0 && stock <= minimum) {
                lowCount++;
            }

            if (stock <= minimum) {
                restockCount++;
            }
        });

        document.getElementById("totalProducts").textContent =
            products.length;

        document.getElementById("lowStockCount").textContent =
            lowCount;

        document.getElementById("outStockCount").textContent =
            outCount;

        document.getElementById("restockCount").textContent =
            restockCount;

        // CLEAR OLD TABLE ROWS
        tableBody.innerHTML = "";

        // FILTER PRODUCTS
        const filteredProducts = products.filter(function (product) {
            return String(product.name || "")
                .toLowerCase()
                .includes(search);
        });

        // SHOW EMPTY MESSAGE WHEN NEEDED
        emptyMessage.hidden = filteredProducts.length !== 0;

        if (products.length === 0) {
            emptyMessage.textContent =
                "No products available. Add products first.";
        } else {
            emptyMessage.textContent = "No matching products found.";
        }

        // BUILD TABLE
        filteredProducts.forEach(function (product) {
            const stock = getNumber(product.quantity);
            const minimum = getNumber(product.minimumStock);

            // Suggested amount to bring stock up to twice minimum
            const suggestedRestock = Math.max(
                0,
                (minimum * 2) - stock
            );

            let status = "Good Stock";
            let statusClass = "status-good";

            if (stock === 0) {
                status = "Out of Stock";
                statusClass = "status-out";
            } else if (stock <= minimum) {
                status = "Low Stock";
                statusClass = "status-low";
            }

            const row = document.createElement("tr");

            // PRODUCT NAME
            const nameCell = document.createElement("td");
            nameCell.textContent = product.name || "Unnamed Product";
            row.appendChild(nameCell);

            // CURRENT STOCK
            const stockCell = document.createElement("td");
            stockCell.textContent = stock;
            row.appendChild(stockCell);

            // MINIMUM STOCK
            const minimumCell = document.createElement("td");
            minimumCell.textContent = minimum;
            row.appendChild(minimumCell);

            // STATUS
            const statusCell = document.createElement("td");
            const statusBadge = document.createElement("span");

            statusBadge.className =
                "prediction-status " + statusClass;

            statusBadge.textContent = status;

            statusCell.appendChild(statusBadge);
            row.appendChild(statusCell);

            // RESTOCK SUGGESTION
            const restockCell = document.createElement("td");
            restockCell.textContent = suggestedRestock;
            row.appendChild(restockCell);

            tableBody.appendChild(row);
        });

        predictionMessage.textContent =
            "Prediction updated successfully.";

    } catch (error) {
        console.error("Prediction error:", error);

        predictionMessage.textContent =
            "Unable to update prediction. Check the browser console.";
    }
}

// REFRESH BUTTON
refreshButton.addEventListener("click", function () {
    refreshButton.disabled = true;
    refreshButton.textContent = "Refreshing...";

    try {
        loadPredictions();
    } finally {
        refreshButton.disabled = false;
        refreshButton.textContent = "↻ Refresh Prediction";
    }
});

// SEARCH
searchInput.addEventListener("input", function () {
    loadPredictions();
});

// UPDATE WHEN THE PAGE BECOMES ACTIVE AGAIN
window.addEventListener("focus", function () {
    loadPredictions();
});

// LOGOUT
const logoutButton = document.getElementById("logoutBtn");

if (logoutButton) {
    logoutButton.addEventListener("click", function () {
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
loadPredictions();
