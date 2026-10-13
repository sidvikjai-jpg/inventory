// ==========================================
// INTELLISTOCK - SALES MANAGEMENT
// ==========================================


// ==========================================
// LOGIN CHECK
// ==========================================

const isLoggedIn = localStorage.getItem("isLoggedIn");

if (isLoggedIn !== "true") {
    window.location.href = "login.html";
}


// ==========================================
// LOAD PRODUCTS
// ==========================================

let products =
    JSON.parse(localStorage.getItem("products")) || [];


// ==========================================
// LOAD SALES
// ==========================================

let sales =
    JSON.parse(localStorage.getItem("sales")) || [];


// ==========================================
// SAVE DATA
// ==========================================

function saveProducts() {

    localStorage.setItem(
        "products",
        JSON.stringify(products)
    );

}


function saveSales() {

    localStorage.setItem(
        "sales",
        JSON.stringify(sales)
    );

}


// ==========================================
// PRODUCT DROPDOWN
// ==========================================

function loadProductsIntoDropdown() {

    const productSelect =
        document.getElementById("saleProduct");

    if (!productSelect) {
        return;
    }


    productSelect.innerHTML = `
        <option value="">
            Select product
        </option>
    `;


    products.forEach(function(product) {

        const stock =
            Number(product.quantity) || 0;

        const option =
            document.createElement("option");

        option.value = product.id;

        option.textContent =
            `${product.name} - Stock: ${stock}`;

        if (stock <= 0) {

            option.disabled = true;

            option.textContent +=
                " (Out of Stock)";

        }

        productSelect.appendChild(option);

    });

}


// ==========================================
// SALE PRODUCT CHANGE
// ==========================================

const saleProduct =
    document.getElementById("saleProduct");


if (saleProduct) {

    saleProduct.addEventListener(
        "change",
        updateSalePreview
    );

}


// ==========================================
// QUANTITY CHANGE
// ==========================================

const saleQuantity =
    document.getElementById("saleQuantity");


if (saleQuantity) {

    saleQuantity.addEventListener(
        "input",
        updateSalePreview
    );

}


// ==========================================
// SALE PREVIEW
// ==========================================

function updateSalePreview() {

    const productId =
        document.getElementById(
            "saleProduct"
        ).value;


    const quantity =
        Number(
            document.getElementById(
                "saleQuantity"
            ).value
        ) || 0;


    const preview =
        document.getElementById(
            "salePreview"
        );


    if (!productId) {

        preview.innerHTML =
            "Select a product to view price.";

        return;

    }


    const product =
        products.find(function(item) {

            return String(item.id) ===
                   String(productId);

        });


    if (!product) {

        preview.innerHTML =
            "Product not found.";

        return;

    }


  
const price =
    Number(product.price) || 0;

const stock =
    Number(product.quantity) || 0;

const total =
    price * quantity;

preview.innerHTML = `

    <strong>
        ${product.name}
    </strong>

    <br>

    Available Stock:
    <strong>
        ${stock}
    </strong>

    <br>

    Unit Price:
    <strong>
        ₹${price.toFixed(2)}
    </strong>

    <br>

    Sale Total:
    <strong>
        ₹${total.toFixed(2)}
    </strong>

`; 
} 


// ==========================================
// OPEN SALE MODAL
// ==========================================

function openSaleModal() {

    document.getElementById(
        "saleForm"
    ).reset();


    document.getElementById(
        "salePreview"
    ).innerHTML =
        "Select a product to view price.";


    document.getElementById(
        "saleMessage"
    ).textContent = "";


    loadProductsIntoDropdown();


    document.getElementById(
        "saleModal"
    ).classList.add("show");

}


// ==========================================
// CLOSE SALE MODAL
// ==========================================

function closeSaleModal() {

    document.getElementById(
        "saleModal"
    ).classList.remove("show");

}


// ==========================================
// GENERATE SALE ID
// ==========================================

function generateSaleId() {

    return (
        "SALE" +
        String(sales.length + 1)
            .padStart(4, "0")
    );

}


// ==========================================
// GET CURRENT DATE
// ==========================================

function getCurrentDateTime() {

    const now = new Date();

    return now.toLocaleString(
        "en-IN",
        {
            dateStyle: "medium",
            timeStyle: "short"
        }
    );

}


// ==========================================
// SALE FORM SUBMIT
// ==========================================

const saleForm =
    document.getElementById(
        "saleForm"
    );


if (saleForm) {

    saleForm.addEventListener(
        "submit",
        function(event) {

            event.preventDefault();


            const productId =
                document.getElementById(
                    "saleProduct"
                ).value;


            const quantity =
                Number(
                    document.getElementById(
                        "saleQuantity"
                    ).value
                );


            const customer =
                document.getElementById(
                    "customerName"
                ).value.trim()
                || "Walk-in Customer";


            const message =
                document.getElementById(
                    "saleMessage"
                );


            // ------------------------------
            // VALIDATION
            // ------------------------------

            if (!productId) {

                showSaleMessage(
                    "Please select a product.",
                    "error"
                );

                return;

            }


            if (
                !quantity ||
                quantity <= 0
            ) {

                showSaleMessage(
                    "Please enter a valid quantity.",
                    "error"
                );

                return;

            }


            // ------------------------------
            // FIND PRODUCT
            // ------------------------------

            const product =
                products.find(
                    function(item) {

                        return String(item.id) ===
                               String(productId);

                    }
                );


            if (!product) {

                showSaleMessage(
                    "Product not found.",
                    "error"
                );

                return;

            }


            // ------------------------------
            // CHECK STOCK
            // ------------------------------

            const availableStock =
                Number(product.quantity) || 0;


            if (quantity > availableStock) {

                showSaleMessage(
                    `Only ${availableStock} units available.`,
                    "error"
                );

                return;

            }


            // ------------------------------
            // PRICE
            // ------------------------------

            const price =
                Number(product.price) || 0;


            const total =
                price * quantity;


            // ------------------------------
            // REDUCE STOCK
            // ------------------------------

            product.quantity=
                availableStock - quantity;


            // ------------------------------
            // CREATE SALE
            // ------------------------------

            const newSale = {

                id: generateSaleId(),

                date:
                    getCurrentDateTime(),

                productId:
                    product.id,

                productName:
                    product.name,

                quantity:
                    quantity,

                unitPrice:
                    price,

                total:
                    total,

                customer:
                    customer

            };


            sales.unshift(newSale);


            // ------------------------------
            // SAVE
            // ------------------------------

            saveProducts();

            saveSales();


            // ------------------------------
            // UPDATE UI
            // ------------------------------

            displaySales();

            updateSalesStatistics();


            showSaleMessage(
                "✓ Sale completed successfully. Stock updated!",
                "success"
            );


            // ------------------------------
            // CLOSE MODAL
            // ------------------------------

            setTimeout(
                function() {

                    closeSaleModal();

                },
                800
            );

        }
    );

}


// ==========================================
// SHOW MESSAGE
// ==========================================

function showSaleMessage(
    text,
    type
) {

    const message =
        document.getElementById(
            "saleMessage"
        );


    message.textContent =
        text;


    if (type === "success") {

        message.style.color =
            "#16a34a";

    } else {

        message.style.color =
            "#dc2626";

    }

}


// ==========================================
// DISPLAY SALES
// ==========================================

function displaySales(
    list = sales
) {

    const tableBody =
        document.getElementById(
            "salesTableBody"
        );


    const noSales =
        document.getElementById(
            "noSales"
        );


    if (!tableBody) {
        return;
    }


    tableBody.innerHTML = "";


    if (list.length === 0) {

        noSales.style.display =
            "block";

        return;

    }


    noSales.style.display =
        "none";


    list.forEach(function(sale) {

        const row =
            document.createElement("tr");


        row.innerHTML = `

            <td>

                <span class="sale-id">
                    ${sale.id}
                </span>

            </td>


            <td>
                ${sale.date}
            </td>


            <td>

                <span class="sale-product">
                    ${sale.productName}
                </span>

            </td>


            <td>
                ${sale.quantity}
            </td>


            <td>
                ₹${Number(
                    sale.unitPrice
                ).toFixed(2)}
            </td>


            <td>

                <span class="sale-total">
                    ₹${Number(
                        sale.total
                    ).toFixed(2)}
                </span>

            </td>


            <td>

                <span class="sale-customer">
                    ${sale.customer}
                </span>

            </td>

        `;


        tableBody.appendChild(row);

    });

}


// ==========================================
// SALES STATISTICS
// ==========================================

function updateSalesStatistics() {

    let totalSalesAmount = 0;

    let todaySalesAmount = 0;

    let totalItems = 0;


    const today =
        new Date().toLocaleDateString(
            "en-IN"
        );


    sales.forEach(function(sale) {

        const saleTotal =
            Number(sale.total) || 0;


        const saleQuantity =
            Number(sale.quantity) || 0;


        totalSalesAmount +=
            saleTotal;


        totalItems +=
            saleQuantity;


        const saleDate =
            new Date(
                sale.date
            ).toLocaleDateString(
                "en-IN"
            );


        if (saleDate === today) {

            todaySalesAmount +=
                saleTotal;

        }

    });


    const totalSales =
        document.getElementById(
            "totalSales"
        );


    const todaySales =
        document.getElementById(
            "todaySales"
        );


    const itemsSold =
        document.getElementById(
            "itemsSold"
        );


    const transactionCount =
        document.getElementById(
            "transactionCount"
        );


    if (totalSales) {

        totalSales.textContent =
            "₹" +
            totalSalesAmount.toFixed(2);

    }


    if (todaySales) {

        todaySales.textContent =
            "₹" +
            todaySalesAmount.toFixed(2);

    }


    if (itemsSold) {

        itemsSold.textContent =
            totalItems;

    }


    if (transactionCount) {

        transactionCount.textContent =
            sales.length;

    }

}


// ==========================================
// SEARCH SALES
// ==========================================

const salesSearch =
    document.getElementById(
        "salesSearch"
    );


if (salesSearch) {

    salesSearch.addEventListener(
        "input",
        function() {

            const search =
                this.value
                    .toLowerCase()
                    .trim();


            const filtered =
                sales.filter(
                    function(sale) {

                        return (

                            sale.id
                                .toLowerCase()
                                .includes(search)

                            ||

                            sale.productName
                                .toLowerCase()
                                .includes(search)

                            ||

                            sale.customer
                                .toLowerCase()
                                .includes(search)

                        );

                    }
                );


            displaySales(
                filtered
            );

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

displaySales();

updateSalesStatistics();

