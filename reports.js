
document.addEventListener("DOMContentLoaded", function () {

    // Get product data from localStorage
    let products = [];

    try {
        const storedProducts = JSON.parse(
            localStorage.getItem("products") || "[]"
        );

        products = Array.isArray(storedProducts)
            ? storedProducts
            : [];
    } catch (error) {
        console.error("Unable to load products:", error);
    }

    // Calculate report statistics
    const totalProducts = products.length;

    const totalStock = products.reduce(function (total, product) {
        return total + Math.max(0, Number(product.quantity) || 0);
    }, 0);

    const lowStock = products.filter(function (product) {
        const quantity = Number(product.quantity) || 0;
        const minimum = Number(product.minimumStock) || 0;

        return quantity > 0 && quantity <= minimum;
    }).length;

    const outOfStock = products.filter(function (product) {
        return Number(product.quantity) === 0;
    }).length;

    // Display statistics
    document.getElementById("totalProducts").textContent = totalProducts;
    document.getElementById("totalStock").textContent = totalStock;
    document.getElementById("lowStock").textContent = lowStock;
    document.getElementById("outOfStock").textContent = outOfStock;

    // Display product report table
    const tableBody = document.getElementById("reportTableBody");
    const emptyReport = document.getElementById("emptyReport");

    tableBody.innerHTML = "";

    if (products.length === 0) {
        emptyReport.hidden = false;
    } else {
        emptyReport.hidden = true;

        products.forEach(function (product) {
            const quantity = Number(product.quantity) || 0;
            const minimum = Number(product.minimumStock) || 0;

            let status;

            if (quantity === 0) {
                status = "Out of Stock";
            } else if (quantity <= minimum) {
                status = "Low Stock";
            } else {
                status = "In Stock";
            }

            const row = document.createElement("tr");

            [
                product.id || "-",
                product.name || "-",
                product.category || "-",
                quantity,
                minimum,
                "₹" + (Number(product.price) || 0).toLocaleString("en-IN"),
                status
            ].forEach(function (value) {
                const cell = document.createElement("td");
                cell.textContent = value;
                row.appendChild(cell);
            });

            tableBody.appendChild(row);
        });
    }

    // Print report
    document.getElementById("printReport").addEventListener(
        "click",
        function () {
            window.print();
        }
    );

    // Display admin name
    const adminName = document.getElementById("adminName");

    if (adminName) {
        adminName.textContent =
            localStorage.getItem("username") || "Admin";
    }

    // Logout
    const logoutBtn = document.getElementById("logoutBtn");

    if (logoutBtn) {
        logoutBtn.addEventListener("click", function () {
            localStorage.removeItem("isLoggedIn");
            localStorage.removeItem("username");
            window.location.href = "login.html";
        });
    }

});

function parseSaleDate(dateValue) {
    if (!dateValue) return null;

    // Handles ISO dates and browser-readable date strings
    const parsed = new Date(dateValue);

    if (!Number.isNaN(parsed.getTime())) {
        return parsed;
    }

    // Fallback for dates like "13 Oct 2026, 9:30 am"
    const match = String(dateValue).match(
        /^(\d{1,2})\s+([A-Za-z]{3,})\s+(\d{4})/
    );

    if (match) {
        const months = {
            jan: 0, feb: 1, mar: 2, apr: 3,
            may: 4, jun: 5, jul: 6, aug: 7,
            sep: 8, oct: 9, nov: 10, dec: 11
        };

        const month = months[match[2].slice(0, 3).toLowerCase()];

        if (month !== undefined) {
            return new Date(
                Number(match[3]),
                month,
                Number(match[1])
            );
        }
    }

    return null;
}

function formatCurrency(amount) {
    return "₹" + amount.toLocaleString("en-IN", {
        maximumFractionDigits: 2
    });
}

function getLocalDateKey(date) {
    if (!date) return "";

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function loadSalesReport() {
    let sales = [];

    try {
        const storedSales = JSON.parse(
            localStorage.getItem("sales") || "[]"
        );

        sales = Array.isArray(storedSales) ? storedSales : [];
    } catch (error) {
        console.error("Unable to load sales:", error);
    }

    const startInput = document.getElementById("startDate");
    const endInput = document.getElementById("endDate");
    const applyButton = document.getElementById("applySalesFilter");
    const resetButton = document.getElementById("resetSalesFilter");
    const filterMessage = document.getElementById("salesFilterMessage");

    const totalSalesElement = document.getElementById("totalSales");
    const totalRevenueElement = document.getElementById("totalRevenue");
    const bestSellingElement = document.getElementById("bestSellingProduct");

    const salesTable = document.getElementById("salesReportBody");
    const emptySales = document.getElementById("emptySalesReport");

    const monthlyBody = document.getElementById("monthlyRevenueBody");
    const emptyMonthly = document.getElementById("emptyMonthlyRevenue");

    const topProductsBody = document.getElementById("topProductsBody");
    const emptyTopProducts = document.getElementById("emptyTopProducts");

    const canvas = document.getElementById("monthlySalesChart");
    const emptyChart = document.getElementById("emptySalesChart");

    if (!salesTable) return;

    function addCell(row, value) {
        const cell = document.createElement("td");
        cell.textContent = value;
        row.appendChild(cell);
    }

    function showEmpty(element, isEmpty) {
        if (element) element.hidden = !isEmpty;
    }

    function renderReports() {
        const startDate = startInput ? startInput.value : "";
        const endDate = endInput ? endInput.value : "";

        // Validate date range
        if (startDate && endDate && startDate > endDate) {
            if (filterMessage) {
                filterMessage.textContent =
                    "Start date must be before or equal to end date.";
            }
            return;
        }

        if (filterMessage) {
            filterMessage.textContent = "";
        }

        // Filter transactions by selected dates
        const filteredSales = sales.filter(function (sale) {
            const date = parseSaleDate(sale.date);

            // Keep undated sales only when no date filter is selected
            if (!date) return !startDate && !endDate;

            const dateKey = getLocalDateKey(date);

            if (startDate && dateKey < startDate) return false;
            if (endDate && dateKey > endDate) return false;

            return true;
        });

        let totalRevenue = 0;
        const productSales = {};
        const monthlyData = {};

        // Prepare sales details
        salesTable.innerHTML = "";

        filteredSales.forEach(function (sale) {
            const quantity = Math.max(0, Number(sale.quantity) || 0);
            const unitPrice = Number(sale.unitPrice) || 0;
            const amount = Number(sale.total) || 0;
            const productName = sale.productName || "Unknown";

            totalRevenue += amount;

            productSales[productName] =
                (productSales[productName] || 0) + quantity;

            const row = document.createElement("tr");

            [
                sale.id || "N/A",
                productName,
                quantity,
                formatCurrency(unitPrice),
                formatCurrency(amount),
                sale.date || "N/A"
            ].forEach(function (value) {
                addCell(row, value);
            });

            salesTable.appendChild(row);

            // Monthly grouping
            const date = parseSaleDate(sale.date);

            if (date) {
                const monthKey =
                    date.getFullYear() + "-" +
                    String(date.getMonth() + 1).padStart(2, "0");

                if (!monthlyData[monthKey]) {
                    monthlyData[monthKey] = {
                        transactions: 0,
                        revenue: 0
                    };
                }

                monthlyData[monthKey].transactions += 1;
                monthlyData[monthKey].revenue += amount;
            }
        });

        // Summary cards
        if (totalSalesElement) {
            totalSalesElement.textContent = filteredSales.length;
        }

        if (totalRevenueElement) {
            totalRevenueElement.textContent =
                formatCurrency(totalRevenue);
        }

        const sortedProducts = Object.entries(productSales)
            .sort(function (a, b) {
                return b[1] - a[1];
            });

        if (bestSellingElement) {
            bestSellingElement.textContent =
                sortedProducts.length ? sortedProducts[0][0] : "N/A";
        }

        showEmpty(emptySales, filteredSales.length === 0);

        // Monthly revenue table
        if (monthlyBody) {
            monthlyBody.innerHTML = "";

            Object.keys(monthlyData).sort().forEach(function (key) {
                const data = monthlyData[key];
                const parts = key.split("-");
                const date = new Date(
                    Number(parts[0]),
                    Number(parts[1]) - 1,
                    1
                );

                const monthName = date.toLocaleDateString("en-IN", {
                    month: "long",
                    year: "numeric"
                });

                const row = document.createElement("tr");

                [
                    monthName,
                    data.transactions,
                    formatCurrency(data.revenue)
                ].forEach(function (value) {
                    addCell(row, value);
                });

                monthlyBody.appendChild(row);
            });
        }

        showEmpty(
            emptyMonthly,
            Object.keys(monthlyData).length === 0
        );

        // Top 5 products
        if (topProductsBody) {
            topProductsBody.innerHTML = "";

            sortedProducts.slice(0, 5).forEach(function (item, index) {
                const row = document.createElement("tr");

                [
                    index + 1,
                    item[0],
                    item[1]
                ].forEach(function (value) {
                    addCell(row, value);
                });

                topProductsBody.appendChild(row);
            });
        }

        showEmpty(emptyTopProducts, sortedProducts.length === 0);

        // Draw the monthly revenue chart
        drawMonthlyChart(monthlyData);
    }

    function drawMonthlyChart(monthlyData) {
        if (!canvas) return;

        const entries = Object.keys(monthlyData)
            .sort()
            .map(function (key) {
                const parts = key.split("-");
                const date = new Date(
                    Number(parts[0]),
                    Number(parts[1]) - 1,
                    1
                );

                return {
                    label: date.toLocaleDateString("en-IN", {
                        month: "short",
                        year: "2-digit"
                    }),
                    revenue: monthlyData[key].revenue
                };
            });

        const container = canvas.parentElement;
        const width = Math.max(
            300,
            container ? container.clientWidth : 600
        );

        const height = 320;
        const ratio = window.devicePixelRatio || 1;

        canvas.style.width = "100%";
        canvas.style.height = height + "px";
        canvas.width = width * ratio;
        canvas.height = height * ratio;

        const ctx = canvas.getContext("2d");

        ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
        ctx.clearRect(0, 0, width, height);

        showEmpty(emptyChart, entries.length === 0);

        if (entries.length === 0) {
            canvas.hidden = true;
            return;
        }

        canvas.hidden = false;

        const left = 65;
        const right = 20;
        const top = 25;
        const bottom = 55;

        const chartWidth = width - left - right;
        const chartHeight = height - top - bottom;

        const maxRevenue = Math.max(
            ...entries.map(function (item) {
                return item.revenue;
            }),
            1
        );

        // Chart title
        ctx.fillStyle = "#172554";
        ctx.font = "bold 14px Arial";
        ctx.textAlign = "left";
        ctx.fillText("Revenue (₹)", left, 16);

        // Grid lines and Y-axis labels
        for (let i = 0; i <= 4; i++) {
            const y = top + chartHeight - (chartHeight * i / 4);
            const value = maxRevenue * i / 4;

            ctx.strokeStyle = "#e2e8f0";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(left, y);
            ctx.lineTo(width - right, y);
            ctx.stroke();

            ctx.fillStyle = "#64748b";
            ctx.font = "11px Arial";
            ctx.textAlign = "right";
            ctx.fillText(
                Math.round(value).toLocaleString("en-IN"),
                left - 8,
                y + 4
            );
        }

        const slotWidth = chartWidth / entries.length;
        const barWidth = Math.min(48, slotWidth * 0.6);

        entries.forEach(function (item, index) {
            const barHeight =
                (item.revenue / maxRevenue) * chartHeight;

            const x =
                left + index * slotWidth + (slotWidth - barWidth) / 2;

            const y = top + chartHeight - barHeight;

            ctx.fillStyle = "#2563eb";
            ctx.fillRect(x, y, barWidth, barHeight);

            ctx.fillStyle = "#334155";
            ctx.font = "11px Arial";
            ctx.textAlign = "center";
            ctx.fillText(
                item.label,
                x + barWidth / 2,
                top + chartHeight + 20
            );
        });
    }

    // Prevent duplicate event listeners if the function is called again
    if (applyButton && !applyButton.dataset.bound) {
        applyButton.addEventListener("click", renderReports);
        applyButton.dataset.bound = "true";
    }

    if (resetButton && !resetButton.dataset.bound) {
        resetButton.addEventListener("click", function () {
            if (startInput) startInput.value = "";
            if (endInput) endInput.value = "";

            renderReports();
        });

        resetButton.dataset.bound = "true";
    }

    // Redraw the chart when the browser is resized
    if (!window.reportsChartResizeBound) {
        window.addEventListener("resize", function () {
            renderReports();
        });

        window.reportsChartResizeBound = true;
    }

    renderReports();
}

document.addEventListener("DOMContentLoaded", function () {
    loadSalesReport();
});
