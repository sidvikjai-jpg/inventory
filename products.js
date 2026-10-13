// ==========================================
// INTELLISTOCK PRODUCT MANAGEMENT
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
// PRODUCT STORAGE
// ==========================================
let products = [];

try {
    const storedProducts = JSON.parse(
        localStorage.getItem("products") || "[]"
    );

    products = Array.isArray(storedProducts)
        ? storedProducts
        : [];
} catch (error) {
    products = [];
}

// ==========================================
// SAMPLE PRODUCTS
// ==========================================

if (products.length === 0) {

    products = [

        {
            id: "P001",
            name: "Laptop",
            category: "Electronics",
            supplier: "Tech World",
            price: 55000,
            quantity: 5,
            minimumStock: 15
        },

        {
            id: "P002",
            name: "Wireless Mouse",
            category: "Accessories",
            supplier: "ABC Suppliers",
            price: 850,
            quantity: 8,
            minimumStock: 20
        },

        {
            id: "P003",
            name: "Keyboard",
            category: "Accessories",
            supplier: "ABC Suppliers",
            price: 1200,
            quantity: 25,
            minimumStock: 10
        },

        {
            id: "P004",
            name: "Headphones",
            category: "Electronics",
            supplier: "Sound Store",
            price: 2500,
            quantity: 7,
            minimumStock: 15
        }

    ];


    saveProducts();

}


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
// DISPLAY PRODUCTS
// ==========================================

function displayProducts(productList = products) {

    const tableBody =
        document.getElementById(
            "productTableBody"
        );

    const noProducts =
        document.getElementById(
            "noProducts"
        );


    // If page is not products page
    if (!tableBody) {
        return;
    }


    tableBody.innerHTML = "";


    if (productList.length === 0) {

        noProducts.style.display = "block";

        return;

    }


    noProducts.style.display = "none";


    productList.forEach(function(product) {


        let status = "";

        let statusClass = "";


        if (product.quantity === 0) {

            status = "Out of Stock";

            statusClass = "out-stock";

        }

        else if (
            product.quantity <=
            product.minimumStock
        ) {

            status = "Low Stock";

            statusClass = "low-stock";

        }

        else {

            status = "In Stock";

            statusClass = "in-stock";

        }


        const row =
            document.createElement("tr");


        row.innerHTML = `

            <td>
                ${product.id}
            </td>

            <td>
                <span class="product-name">
                    ${product.name}
                </span>
            </td>

            <td>
                <span class="product-category">
                    ${product.category}
                </span>
            </td>

            <td>
                ${product.supplier}
            </td>

            <td>
                ₹${Number(product.price).toLocaleString("en-IN")}
            </td>

            <td>
                <strong>
                    ${product.quantity}
                </strong>
            </td>

            <td>
                ${product.minimumStock}
            </td>

            <td>
                <span class="product-status ${statusClass}">
                    ${status}
                </span>
            </td>

            <td>

                <button
                    class="action-btn edit-btn"
                    onclick="editProduct('${product.id}')">

                    ✏️

                </button>


                <button
                    class="action-btn delete-btn"
                    onclick="deleteProduct('${product.id}')">

                    🗑️

                </button>

            </td>

        `;


        tableBody.appendChild(row);

    });


    updateStatistics();

}


// ==========================================
// STATISTICS
// ==========================================

function updateStatistics() {

    const productCount =
        document.getElementById(
            "productCount"
        );

    const inStockCount =
        document.getElementById(
            "inStockCount"
        );

    const lowStockCount =
        document.getElementById(
            "lowStockCount"
        );

    const outStockCount =
        document.getElementById(
            "outStockCount"
        );


    if (!productCount) {
        return;
    }


    let inStock = 0;

    let lowStock = 0;

    let outStock = 0;


    products.forEach(function(product) {

        if (product.quantity === 0) {

            outStock++;

        }

        else if (
            product.quantity <=
            product.minimumStock
        ) {

            lowStock++;

        }

        else {

            inStock++;

        }

    });


    productCount.textContent =
        products.length;

    inStockCount.textContent =
        inStock;

    lowStockCount.textContent =
        lowStock;

    outStockCount.textContent =
        outStock;

}


// ==========================================
// SEARCH
// ==========================================

const searchInput =
    document.getElementById(
        "searchProduct"
    );


if (searchInput) {

    searchInput.addEventListener(
        "input",
        filterProducts
    );

}


// ==========================================
// CATEGORY FILTER
// ==========================================

const categoryFilter =
    document.getElementById(
        "categoryFilter"
    );


if (categoryFilter) {

    categoryFilter.addEventListener(
        "change",
        filterProducts
    );

}


// ==========================================
// FILTER FUNCTION
// ==========================================

function filterProducts() {

    const search =
        document.getElementById(
            "searchProduct"
        ).value
        .toLowerCase();


    const category =
        document.getElementById(
            "categoryFilter"
        ).value;


    const filtered =
        products.filter(function(product) {


            const matchesSearch =
                product.name
                    .toLowerCase()
                    .includes(search);


            const matchesCategory =
                category === "all" ||
                product.category === category;


            return (
                matchesSearch &&
                matchesCategory
            );

        });


    displayProducts(filtered);

}


// ==========================================
// ADD PRODUCT
// ==========================================


const productForm = document.getElementById("productForm");

if (productForm) {
    productForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const name = document.getElementById("productName").value.trim();
        const category = document.getElementById("category").value;
        const supplier = document.getElementById("supplier").value.trim();
        const price = Number(document.getElementById("price").value);
        const quantity = Number(document.getElementById("quantity").value);
        const minimumStock = Number(document.getElementById("minimumStock").value);
        const message = document.getElementById("formMessage");
        if (
    !name ||
    !category ||
    !supplier ||
    !Number.isFinite(price) ||
    !Number.isFinite(quantity) ||
    !Number.isFinite(minimumStock) ||
    price < 0 ||
    quantity < 0 ||
    minimumStock < 0
) {
    message.textContent = "Please enter valid product details.";
    message.style.color = "red";
    return;
}

        // Generate a unique product ID
        const existingNumbers = products.map(function (product) {
            return parseInt(String(product.id).replace("P", ""), 10) || 0;
        });

        const nextNumber = Math.max(0, ...existingNumbers) + 1;
        const newId = "P" + String(nextNumber).padStart(3, "0");

        const newProduct = {
            id: newId,
            name: name,
            category: category,
            supplier: supplier,
            price: price,
            quantity: quantity,
            minimumStock: minimumStock
        };

        products.push(newProduct);
        saveProducts();

        message.textContent = "✓ Product added successfully!";
        message.style.color = "#16a34a";

        productForm.reset();

        setTimeout(function () {
            window.location.href = "products.html";
        }, 800);
    });
}



// ==========================================
// DELETE PRODUCT
// ==========================================

function deleteProduct(id) {

    const product =
        products.find(
            function(item) {

                return item.id === id;

            }
        );


    if (!product) {
        return;
    }


    const confirmDelete =
        confirm(
            `Delete ${product.name}?`
        );


    if (!confirmDelete) {
        return;
    }


    products =
        products.filter(
            function(item) {

                return item.id !== id;

            }
        );


    saveProducts();

    displayProducts();

}


// ==========================================
// EDIT PRODUCT
// ==========================================

function editProduct(id) {

    const product =
        products.find(
            function(item) {

                return item.id === id;

            }
        );


    if (!product) {
        return;
    }


    const newQuantity =
        prompt(
            `Update quantity for ${product.name}:`,
            product.quantity
        );


    if (
        newQuantity !== null &&
        newQuantity !== "" &&
        !isNaN(newQuantity)
    ) {

        product.quantity =
            Number(newQuantity);


        saveProducts();

        displayProducts();

    }

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
// INITIAL DISPLAY
// ==========================================

displayProducts();
