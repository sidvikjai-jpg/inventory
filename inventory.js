// ==========================================
// INTELLISTOCK INVENTORY MANAGEMENT
// ==========================================


// ==========================================
// LOGIN CHECK
// ==========================================

const isLoggedIn =
    localStorage.getItem("isLoggedIn");


if (isLoggedIn !== "true") {

    window.location.href = "login.html";

}


// ==========================================
// LOAD PRODUCTS
// ==========================================

let products =
    JSON.parse(
        localStorage.getItem("products")
    ) || [];


// ==========================================
// LOAD TRANSACTIONS
// ==========================================

let transactions =
    JSON.parse(
        localStorage.getItem("transactions")
    ) || [];


// ==========================================
// SAVE PRODUCTS
// ==========================================

function saveProducts() {

    localStorage.setItem(
        "products",
        JSON.stringify(products)
    );

}


// ==========================================
// SAVE TRANSACTIONS
// ==========================================

function saveTransactions() {

    localStorage.setItem(
        "transactions",
        JSON.stringify(transactions)
    );

}


// ==========================================
// DISPLAY INVENTORY
// ==========================================

function displayInventory(
    productList = products
) {

    const tableBody =
        document.getElementById(
            "inventoryTableBody"
        );


    const noInventory =
        document.getElementById(
            "noInventory"
        );


    if (!tableBody) {
        return;
    }


    tableBody.innerHTML = "";


    if (productList.length === 0) {

        noInventory.style.display =
            "block";

        return;

    }


    noInventory.style.display =
        "none";


    productList.forEach(function(product) {


        let status = "";

        let statusClass = "";

        let progressClass = "";

        let percentage = 0;


        if (product.quantity === 0) {

            status = "Out of Stock";

            statusClass = "empty";

            progressClass = "empty";

            percentage = 0;

        }

        else if (
            product.quantity <=
            product.minimumStock
        ) {

            status = "Low Stock";

            statusClass = "low";

            progressClass = "low";

            percentage =
                Math.min(
                    (
                        product.quantity /
                        product.minimumStock
                    ) * 100,
                    100
                );

        }

        else {

            status = "In Stock";

            statusClass = "good";

            progressClass = "";

            percentage =
                Math.min(
                    (
                        product.quantity /
                        (
                            product.minimumStock * 3
                        )
                    ) * 100,
                    100
                );

        }


        const stockClass =
            product.quantity === 0
                ? "empty"
                : product.quantity <= product.minimumStock
                    ? "low"
                    : "";


        const row =
            document.createElement("tr");


        row.innerHTML = `

            <td>
                ${product.id}
            </td>


            <td>
                <strong>
                    ${product.name}
                </strong>
            </td>


            <td>
                ${product.category}
            </td>


            <td>

                <span
                    class="stock-number ${stockClass}">

                    ${product.quantity}

                </span>

            </td>


            <td>
                ${product.minimumStock}
            </td>


            <td>

                <div class="stock-progress">

                    <div
                        class="stock-progress-bar ${progressClass}"
                        style="width:${percentage}%">

                    </div>

                </div>

            </td>


            <td>

                <span
                    class="inventory-status ${statusClass}">

                    ${status}

                </span>

            </td>


            <td>

                <button
                    class="quick-stock-btn"
                    onclick="quickStock('${product.id}')">

                    Update

                </button>

            </td>

        `;


        tableBody.appendChild(row);

    });


    updateInventoryStats();

}


// ==========================================
// INVENTORY STATISTICS
// ==========================================

function updateInventoryStats() {

    const totalProducts =
        document.getElementById(
            "totalProducts"
        );


    const totalUnits =
        document.getElementById(
            "totalUnits"
        );


    const lowStock =
        document.getElementById(
            "lowStock"
        );


    const outOfStock =
        document.getElementById(
            "outOfStock"
        );


    if (!totalProducts) {
        return;
    }


    let units = 0;

    let low = 0;

    let out = 0;


    products.forEach(function(product) {

        units += Number(
            product.quantity
        );


        if (product.quantity === 0) {

            out++;

        }

        else if (
            product.quantity <=
            product.minimumStock
        ) {

            low++;

        }

    });


    totalProducts.textContent =
        products.length;


    totalUnits.textContent =
        units;


    lowStock.textContent =
        low;


    outOfStock.textContent =
        out;

}


// ==========================================
// SEARCH
// ==========================================

const inventorySearch =
    document.getElementById(
        "inventorySearch"
    );


if (inventorySearch) {

    inventorySearch.addEventListener(
        "input",
        function() {

            const search =
                this.value
                    .toLowerCase();


            const filtered =
                products.filter(
                    function(product) {

                        return (
                            product.name
                                .toLowerCase()
                                .includes(search)
                            ||
                            product.category
                                .toLowerCase()
                                .includes(search)
                        );

                    }
                );


            displayInventory(
                filtered
            );

        }
    );

}


// ==========================================
// OPEN STOCK MODAL
// ==========================================

let currentStockType = "in";


function openStockModal(type) {

    currentStockType = type;


    const modal =
        document.getElementById(
            "stockModal"
        );


    const modalTitle =
        document.getElementById(
            "modalTitle"
        );


    const select =
        document.getElementById(
            "stockProduct"
        );


    const quantity =
        document.getElementById(
            "stockQuantity"
        );


    const message =
        document.getElementById(
            "stockMessage"
        );


    quantity.value = "";

    message.textContent = "";


    if (type === "in") {

        modalTitle.textContent =
            "↓ Stock In";

    }

    else {

        modalTitle.textContent =
            "↑ Stock Out";

    }


    loadProductOptions();


    modal.classList.add("show");

}


// ==========================================
// CLOSE MODAL
// ==========================================

function closeStockModal() {

    const modal =
        document.getElementById(
            "stockModal"
        );


    modal.classList.remove("show");


    document.getElementById(
        "stockForm"
    ).reset();


    document.getElementById(
        "stockPreview"
    ).innerHTML =
        "Select a product to view stock.";

}


// ==========================================
// LOAD PRODUCT OPTIONS
// ==========================================

function loadProductOptions() {

    const select =
        document.getElementById(
            "stockProduct"
        );


    select.innerHTML = `

        <option value="">
            Select product
        </option>

    `;


    products.forEach(function(product) {

        const option =
            document.createElement(
                "option"
            );


        option.value =
            product.id;


        option.textContent =
            `${product.name} — Current Stock: ${product.quantity}`;


        select.appendChild(option);

    });

}


// ==========================================
// PRODUCT SELECTION
// ==========================================

const stockProduct =
    document.getElementById(
        "stockProduct"
    );


if (stockProduct) {

    stockProduct.addEventListener(
        "change",
        updateStockPreview
    );

}


function updateStockPreview() {

    const productId =
        document.getElementById(
            "stockProduct"
        ).value;


    const preview =
        document.getElementById(
            "stockPreview"
        );


    const product =
        products.find(
            function(item) {

                return item.id === productId;

            }
        );


    if (!product) {

        preview.innerHTML =
            "Select a product to view stock.";

        return;

    }


    preview.innerHTML = `

        <strong>
            ${product.name}
        </strong>

        <br><br>

        Current Stock:
        <strong>
            ${product.quantity}
        </strong>

        units

        <br>

        Minimum Stock:
        <strong>
            ${product.minimumStock}
        </strong>

        units

    `;

}


// ==========================================
// STOCK FORM SUBMIT
// ==========================================

const stockForm =
    document.getElementById(
        "stockForm"
    );


if (stockForm) {

    stockForm.addEventListener(
        "submit",
        function(event) {

            event.preventDefault();


            const productId =
                document.getElementById(
                    "stockProduct"
                ).value;


            const quantity =
                Number(
                    document.getElementById(
                        "stockQuantity"
                    ).value
                );


            const message =
                document.getElementById(
                    "stockMessage"
                );


            if (!productId) {

                message.textContent =
                    "Please select a product.";

                message.style.color =
                    "#dc2626";

                return;

            }


            if (
                !quantity ||
                quantity <= 0
            ) {

                message.textContent =
                    "Enter a valid quantity.";

                message.style.color =
                    "#dc2626";

                return;

            }


            const product =
                products.find(
                    function(item) {

                        return (
                            item.id ===
                            productId
                        );

                    }
                );


            if (!product) {
                return;
            }


            const previousStock =
                product.quantity;


            // ==================================
            // STOCK IN
            // ==================================

            if (
                currentStockType === "in"
            ) {

                product.quantity +=
                    quantity;

            }


            // ==================================
            // STOCK OUT
            // ==================================

            else {

                if (
                    quantity >
                    product.quantity
                ) {

                    message.textContent =
                        `Only ${product.quantity} units available.`;

                    message.style.color =
                        "#dc2626";

                    return;

                }


                product.quantity -=
                    quantity;

            }


            const newStock =
                product.quantity;


            // ==================================
            // TRANSACTION
            // ==================================

            const transaction = {

                id:
                    "T" +
                    Date.now(),

                date:
                    new Date()
                        .toLocaleString(
                            "en-IN"
                        ),

                productId:
                    product.id,

                productName:
                    product.name,

                type:
                    currentStockType,

                quantity:
                    quantity,

                previousStock:
                    previousStock,

                newStock:
                    newStock

            };


            transactions.unshift(
                transaction
            );


            // Keep latest 50 transactions

            transactions =
                transactions.slice(
                    0,
                    50
                );


            saveProducts();

            saveTransactions();


            message.textContent =
                currentStockType === "in"
                    ? "✓ Stock added successfully!"
                    : "✓ Stock removed successfully!";


            message.style.color =
                "#16a34a";


            displayInventory();

            displayTransactions();


            setTimeout(
                function() {

                    closeStockModal();

                },
                700
            );

        }
    );

}


// ==========================================
// QUICK STOCK UPDATE
// ==========================================

function quickStock(id) {

    const product =
        products.find(
            function(item) {

                return item.id === id;

            }
        );


    if (!product) {
        return;
    }


    openStockModal("in");


    setTimeout(
        function() {

            const select =
                document.getElementById(
                    "stockProduct"
                );


            select.value =
                product.id;


            updateStockPreview();

        },
        50
    );

}


// ==========================================
// TRANSACTION HISTORY
// ==========================================

function displayTransactions() {

    const tableBody =
        document.getElementById(
            "transactionTableBody"
        );


    const noTransactions =
        document.getElementById(
            "noTransactions"
        );


    if (!tableBody) {
        return;
    }


    tableBody.innerHTML = "";


    if (transactions.length === 0) {

        noTransactions.style.display =
            "block";

        return;

    }


    noTransactions.style.display =
        "none";


    transactions.forEach(
        function(transaction) {


            const row =
                document.createElement(
                    "tr"
                );


            const typeText =
                transaction.type === "in"
                    ? "Stock In"
                    : "Stock Out";


            const quantitySign =
                transaction.type === "in"
                    ? "+"
                    : "-";


            row.innerHTML = `

                <td>
                    ${transaction.date}
                </td>


                <td>
                    <strong>
                        ${transaction.productName}
                    </strong>
                </td>


                <td>

                    <span
                        class="transaction-type ${transaction.type}">

                        ${typeText}

                    </span>

                </td>


                <td>

                    <span
                        class="transaction-quantity ${transaction.type}">

                        ${quantitySign}
                        ${transaction.quantity}

                    </span>

                </td>


                <td>
                    ${transaction.previousStock}
                </td>


                <td>
                    <strong>
                        ${transaction.newStock}
                    </strong>
                </td>

            `;


            tableBody.appendChild(row);

        }
    );

}


// ==========================================
// LOGOUT
// ==========================================

const logoutBtn =
    document.getElementById(
        "logoutBtn"
    );


if (logoutBtn) {

    logoutBtn.addEventListener(
        "click",
        function() {

            localStorage.removeItem(
                "isLoggedIn"
            );

            localStorage.removeItem(
                "username"
            );

            window.location.href =
                "login.html";

        }
    );

}


// ==========================================
// ADMIN NAME
// ==========================================

const adminName =
    document.getElementById(
        "adminName"
    );


if (adminName) {

    adminName.textContent =
        localStorage.getItem(
            "username"
        ) || "Admin";

}


// ==========================================
// INITIAL LOAD
// ==========================================

displayInventory();

displayTransactions();
