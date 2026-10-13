// ==========================================
// INTELLISTOCK SUPPLIER MANAGEMENT
// ==========================================


// LOGIN CHECK

const isLoggedIn =
    localStorage.getItem("isLoggedIn");


if (isLoggedIn !== "true") {

    window.location.href = "login.html";

}


// ==========================================
// LOAD SUPPLIERS
// ==========================================

let suppliers =
    JSON.parse(
        localStorage.getItem("suppliers")
    ) || [];


// ==========================================
// SAMPLE SUPPLIERS
// ==========================================

if (suppliers.length === 0) {

    suppliers = [

        {
            id: "S001",
            name: "Tech World",
            phone: "9876543210",
            email: "techworld@gmail.com",
            category: "Electronics",
            status: "Active"
        },

        {
            id: "S002",
            name: "ABC Suppliers",
            phone: "9876501234",
            email: "abcsuppliers@gmail.com",
            category: "Accessories",
            status: "Active"
        },

        {
            id: "S003",
            name: "Office Mart",
            phone: "9845012345",
            email: "officemart@gmail.com",
            category: "Office",
            status: "Active"
        }

    ];


    saveSuppliers();

}


// ==========================================
// SAVE
// ==========================================

function saveSuppliers() {

    localStorage.setItem(
        "suppliers",
        JSON.stringify(suppliers)
    );

}


// ==========================================
// DISPLAY SUPPLIERS
// ==========================================

function displaySuppliers(
    list = suppliers
) {

    const tableBody =
        document.getElementById(
            "supplierTableBody"
        );


    const noSuppliers =
        document.getElementById(
            "noSuppliers"
        );


    if (!tableBody) {
        return;
    }


    tableBody.innerHTML = "";


    if (list.length === 0) {

        noSuppliers.style.display =
            "block";

        updateStatistics();

        return;

    }


    noSuppliers.style.display =
        "none";


    list.forEach(function(supplier) {


        // Count products from current inventory

        const products =
            JSON.parse(
                localStorage.getItem("products")
            ) || [];


        const productCount =
            products.filter(
                function(product) {

                    return (
                        product.supplier
                            .toLowerCase() ===
                        supplier.name
                            .toLowerCase()
                    );

                }
            ).length;


        const statusClass =
            supplier.status === "Active"
                ? "active"
                : "inactive";


        const row =
            document.createElement("tr");


        row.innerHTML = `

            <td>

                <span class="supplier-id">
                    ${supplier.id}
                </span>

            </td>


            <td>

                <span class="supplier-name">
                    ${supplier.name}
                </span>

            </td>


            <td>
                ${supplier.phone}
            </td>


            <td>
                ${supplier.email}
            </td>


            <td>
                ${supplier.category}
            </td>


            <td>
                ${productCount}
            </td>


            <td>

                <span
                    class="supplier-status ${statusClass}">

                    ${supplier.status}

                </span>

            </td>


            <td>

                <button
                    class="supplier-action supplier-edit"
                    onclick="editSupplier('${supplier.id}')">

                    ✏️

                </button>


                <button
                    class="supplier-action supplier-delete"
                    onclick="deleteSupplier('${supplier.id}')">

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

    const total =
        document.getElementById(
            "totalSuppliers"
        );


    const active =
        document.getElementById(
            "activeSuppliers"
        );


    const categories =
        document.getElementById(
            "supplierCategories"
        );


    const supplied =
        document.getElementById(
            "suppliedProducts"
        );


    if (!total) {
        return;
    }


    const activeCount =
        suppliers.filter(
            function(supplier) {

                return supplier.status === "Active";

            }
        ).length;


    const categoryList =
        [
            ...new Set(
                suppliers.map(
                    function(supplier) {

                        return supplier.category;

                    }
                )
            )
        ];


    const products =
        JSON.parse(
            localStorage.getItem("products")
        ) || [];


    const supplierNames =
        suppliers.map(
            function(supplier) {

                return supplier.name
                    .toLowerCase();

            }
        );


    const suppliedProductCount =
        products.filter(
            function(product) {

                return supplierNames.includes(
                    product.supplier.toLowerCase()
                );

            }
        ).length;


    total.textContent =
        suppliers.length;


    active.textContent =
        activeCount;


    categories.textContent =
        categoryList.length;


    supplied.textContent =
        suppliedProductCount;

}


// ==========================================
// OPEN ADD MODAL
// ==========================================

let editingSupplierId = null;


function openSupplierModal() {

    editingSupplierId = null;


    document.getElementById(
        "supplierModalTitle"
    ).textContent =
        "Add Supplier";


    document.getElementById(
        "supplierForm"
    ).reset();


    document.getElementById(
        "supplierMessage"
    ).textContent = "";


    document.getElementById(
        "supplierModal"
    ).classList.add("show");

}


// ==========================================
// CLOSE MODAL
// ==========================================

function closeSupplierModal() {

    document.getElementById(
        "supplierModal"
    ).classList.remove("show");

}


// ==========================================
// FORM SUBMIT
// ==========================================

const supplierForm =
    document.getElementById(
        "supplierForm"
    );


if (supplierForm) {

    supplierForm.addEventListener(
        "submit",
        function(event) {

            event.preventDefault();


            const name =
                document.getElementById(
                    "supplierName"
                ).value.trim();


            const phone =
                document.getElementById(
                    "supplierPhone"
                ).value.trim();


            const email =
                document.getElementById(
                    "supplierEmail"
                ).value.trim();


            const category =
                document.getElementById(
                    "supplierCategory"
                ).value;


            const status =
                document.getElementById(
                    "supplierStatus"
                ).value;


            const message =
                document.getElementById(
                    "supplierMessage"
                );


            // EDIT

            if (editingSupplierId) {

                const supplier =
                    suppliers.find(
                        function(item) {

                            return (
                                item.id ===
                                editingSupplierId
                            );

                        }
                    );


                if (supplier) {

                    supplier.name =
                        name;

                    supplier.phone =
                        phone;

                    supplier.email =
                        email;

                    supplier.category =
                        category;

                    supplier.status =
                        status;

                }


                message.textContent =
                    "✓ Supplier updated successfully!";

            }


            // ADD

            else {

                const newId =
                    "S" +
                    String(
                        suppliers.length + 1
                    ).padStart(3, "0");


                suppliers.push({

                    id: newId,

                    name: name,

                    phone: phone,

                    email: email,

                    category: category,

                    status: status

                });


                message.textContent =
                    "✓ Supplier added successfully!";

            }


            message.style.color =
                "#16a34a";


            saveSuppliers();

            displaySuppliers();


            setTimeout(
                function() {

                    closeSupplierModal();

                },
                700
            );

        }
    );

}


// ==========================================
// EDIT SUPPLIER
// ==========================================

function editSupplier(id) {

    const supplier =
        suppliers.find(
            function(item) {

                return item.id === id;

            }
        );


    if (!supplier) {
        return;
    }


    editingSupplierId =
        id;


    document.getElementById(
        "supplierModalTitle"
    ).textContent =
        "Edit Supplier";


    document.getElementById(
        "supplierName"
    ).value =
        supplier.name;


    document.getElementById(
        "supplierPhone"
    ).value =
        supplier.phone;


    document.getElementById(
        "supplierEmail"
    ).value =
        supplier.email;


    document.getElementById(
        "supplierCategory"
    ).value =
        supplier.category;


    document.getElementById(
        "supplierStatus"
    ).value =
        supplier.status;


    document.getElementById(
        "supplierMessage"
    ).textContent = "";


    document.getElementById(
        "supplierModal"
    ).classList.add("show");

}


// ==========================================
// DELETE SUPPLIER
// ==========================================

function deleteSupplier(id) {

    const supplier =
        suppliers.find(
            function(item) {

                return item.id === id;

            }
        );


    if (!supplier) {
        return;
    }


    // Check whether products use this supplier

    const products =
        JSON.parse(
            localStorage.getItem("products")
        ) || [];


    const usedByProducts =
        products.some(
            function(product) {

                return (
                    product.supplier
                        .toLowerCase() ===
                    supplier.name
                        .toLowerCase()
                );

            }
        );


    if (usedByProducts) {

        alert(
            "This supplier is currently linked with products. You cannot delete it."
        );

        return;

    }


    const confirmDelete =
        confirm(
            `Delete ${supplier.name}?`
        );


    if (!confirmDelete) {
        return;
    }


    suppliers =
        suppliers.filter(
            function(item) {

                return item.id !== id;

            }
        );


    saveSuppliers();

    displaySuppliers();

}


// ==========================================
// SEARCH
// ==========================================

const supplierSearch =
    document.getElementById(
        "supplierSearch"
    );


if (supplierSearch) {

    supplierSearch.addEventListener(
        "input",
        filterSuppliers
    );

}


// ==========================================
// STATUS FILTER
// ==========================================

const statusFilter =
    document.getElementById(
        "supplierStatusFilter"
    );


if (statusFilter) {

    statusFilter.addEventListener(
        "change",
        filterSuppliers
    );

}


// ==========================================
// FILTER
// ==========================================

function filterSuppliers() {

    const search =
        document.getElementById(
            "supplierSearch"
        ).value
        .toLowerCase();


    const status =
        document.getElementById(
            "supplierStatusFilter"
        ).value;


    const filtered =
        suppliers.filter(
            function(supplier) {


                const matchesSearch =
                    supplier.name
                        .toLowerCase()
                        .includes(search)
                    ||
                    supplier.email
                        .toLowerCase()
                        .includes(search)
                    ||
                    supplier.category
                        .toLowerCase()
                        .includes(search);


                const matchesStatus =
                    status === "all" ||
                    supplier.status === status;


                return (
                    matchesSearch &&
                    matchesStatus
                );

            }
        );


    displaySuppliers(
        filtered
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

displaySuppliers();
