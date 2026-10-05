/* =====================================================
   TECHSPARK
   COMPLETE JAVASCRIPT
===================================================== */


/* =====================================================
   PRODUCT DATA
===================================================== */


const products = [

    {
        id: 1,
        name: "TechSpark ProBook X1",
        category: "Laptops",
        price: 69999,
        oldPrice: 79999,
        rating: 4.8,
        reviews: 324,
        image: "laptop.jpg",
        newArrival: false
    },

    {
        id: 2,
        name: "TechSpark UltraPhone 5G",
        category: "Smartphones",
        price: 45999,
        oldPrice: 52999,
        rating: 4.7,
        reviews: 512,
        image: "smartphone.jpg",
        newArrival: true
    },

    {
        id: 3,
        name: "TechSpark AirPods Pro",
        category: "Audio",
        price: 8999,
        oldPrice: 11999,
        rating: 4.6,
        reviews: 287,
        image: "headphones.jpg",
        newArrival: false
    },

    {
        id: 4,
        name: "TechSpark SmartWatch X",
        category: "Accessories",
        price: 6999,
        oldPrice: 8999,
        rating: 4.5,
        reviews: 193,
        image: "smartwatch.jpg",
        newArrival: true
    },

    {
        id: 5,
        name: "TechSpark Mechanical Keyboard",
        category: "Accessories",
        price: 4499,
        oldPrice: 5999,
        rating: 4.7,
        reviews: 418,
        image: "keyboard.jpg",
        newArrival: true
    },

    {
        id: 6,
        name: "TechSpark Precision Mouse",
        category: "Accessories",
        price: 1999,
        oldPrice: 2499,
        rating: 4.6,
        reviews: 235,
        image: "mouse.jpg",
        newArrival: false
    },

    {
        id: 7,
        name: "TechSpark UltraView Monitor",
        category: "Accessories",
        price: 18999,
        oldPrice: 22999,
        rating: 4.8,
        reviews: 154,
        image: "monitor.jpg",
        newArrival: true
    },

    {
        id: 8,
        name: "TechSpark Tab Pro",
        category: "Smartphones",
        price: 29999,
        oldPrice: 34999,
        rating: 4.5,
        reviews: 126,
        image: "tablet.jpg",
        newArrival: true
    }

];


/* =====================================================
   CART
===================================================== */


let cart = [];


/* =====================================================
   DISPLAY PRODUCTS
===================================================== */


function displayProducts(productList = products) {


    const grid =
        document.getElementById("productGrid");


    grid.innerHTML = "";


    if (productList.length === 0) {

        grid.innerHTML = `

            <div style="
                grid-column:1/-1;
                text-align:center;
                padding:70px 20px;
            ">

                <div style="
                    font-size:45px;
                    margin-bottom:15px;
                ">
                    🔎
                </div>

                <h3>
                    No products found
                </h3>

                <p style="
                    color:#777;
                    margin-top:10px;
                ">
                    Try another search or category.
                </p>

            </div>

        `;

        return;

    }


    productList.forEach(product => {


        const card =
            document.createElement("div");


        card.className =
            "product-card";


        card.innerHTML = `

            <div class="product-image">

                <img
                    src="${product.image}"
                    alt="${product.name}"
                    onerror="
                        this.onerror=null;
                        this.src=
                        'data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22300%22><rect width=%22100%25%22 height=%22100%25%22 fill=%22%23eef1f7%22/><text x=%2250%25%22 y=%2250%25%22 fill=%22%23667085%22 font-family=%22Arial%22 font-size=%2224%22 text-anchor=%22middle%22>TechSpark</text></svg>';
                    "
                >

            </div>


            <div class="product-info">


                <div class="product-category">
                    ${product.category}
                </div>


                <h3>
                    ${product.name}
                </h3>


                <div class="rating">

                    ⭐ ${product.rating}

                    <span>
                        (${product.reviews})
                    </span>

                </div>


                <div class="price">

                    ₹${product.price.toLocaleString("en-IN")}

                    <span class="old-price">

                        ₹${product.oldPrice.toLocaleString("en-IN")}

                    </span>

                </div>


                <button
                    class="add-cart"
                    onclick="addToCart(${product.id})"
                >
                    🛒 Add to Cart
                </button>


            </div>

        `;


        grid.appendChild(card);


        /* =================================================
           REAL MOUSE FOLLOW 3D EFFECT
        ================================================= */


        card.addEventListener(
            "mousemove",
            function(event) {


                const rect =
                    card.getBoundingClientRect();


                const x =
                    event.clientX - rect.left;


                const y =
                    event.clientY - rect.top;


                const centerX =
                    rect.width / 2;


                const centerY =
                    rect.height / 2;


                const rotateX =
                    ((y - centerY) / centerY) * -5;


                const rotateY =
                    ((x - centerX) / centerX) * 5;


                card.style.transform = `

                    perspective(1000px)

                    rotateX(${rotateX}deg)

                    rotateY(${rotateY}deg)

                    translateY(-8px)

                    scale(1.02)

                `;


            }

        );


        /* =================================================
           MOUSE LEAVE
        ================================================= */


        card.addEventListener(
            "mouseleave",
            function() {

                card.style.transform =
                    "";

            }
        );


    });

}


/* =====================================================
   ADD TO CART
===================================================== */


function addToCart(productId) {


    const product =
        products.find(
            p => p.id === productId
        );


    if (!product) return;


    cart.push(product);


    updateCartCount();


    showNotification(
        `${product.name} added to cart 🛒`
    );


}


/* =====================================================
   UPDATE CART COUNT
===================================================== */


function updateCartCount() {


    document.getElementById(
        "cartCount"
    ).textContent =
        cart.length;

}


/* =====================================================
   OPEN CART
===================================================== */


function openCart() {


    document
        .getElementById("cartOverlay")
        .classList
        .add("active");


    renderCart();

}


/* =====================================================
   CLOSE CART
===================================================== */


function closeCart() {


    document
        .getElementById("cartOverlay")
        .classList
        .remove("active");

}


/* =====================================================
   CART CONTENT
===================================================== */


function renderCart() {


    const container =
        document.getElementById("cartItems");


    const totalElement =
        document.getElementById("cartTotal");


    container.innerHTML = "";


    let total = 0;


    if (cart.length === 0) {


        container.innerHTML = `

            <div style="
                text-align:center;
                padding:50px 10px;
                color:#777;
            ">

                <div style="
                    font-size:45px;
                    margin-bottom:12px;
                ">
                    🛒
                </div>

                <p>
                    Your cart is empty.
                </p>

            </div>

        `;


        totalElement.textContent =
            "₹0";


        return;

    }


    cart.forEach(
        (product, index) => {


            total +=
                product.price;


            const item =
                document.createElement("div");


            item.className =
                "cart-item";


            item.innerHTML = `

                <div>

                    <strong>
                        ${product.name}
                    </strong>

                    <p style="
                        color:#777;
                        margin-top:5px;
                    ">

                        ₹${product.price.toLocaleString("en-IN")}

                    </p>

                </div>


                <button
                    onclick="removeFromCart(${index})"
                    style="
                        border:none;
                        background:none;
                        color:#e63946;
                        cursor:pointer;
                        font-weight:600;
                    "
                >
                    Remove
                </button>

            `;


            container.appendChild(item);


        }
    );


    totalElement.textContent =
        "₹" + total.toLocaleString("en-IN");

}


/* =====================================================
   REMOVE FROM CART
===================================================== */


function removeFromCart(index) {


    cart.splice(index, 1);


    updateCartCount();


    renderCart();

}


/* =====================================================
   SEARCH
===================================================== */


function searchProducts() {


    const query =
        document
            .getElementById("searchInput")
            .value
            .toLowerCase()
            .trim();


    const category =
        document
            .getElementById("category")
            .value;


    const filtered =
        products.filter(
            product => {


                const matchesSearch =

                    product.name
                        .toLowerCase()
                        .includes(query)

                    ||

                    product.category
                        .toLowerCase()
                        .includes(query);


                const matchesCategory =

                    category === "All"

                    ||

                    product.category ===
                    category;


                return (
                    matchesSearch &&
                    matchesCategory
                );

            }
        );


    displayProducts(filtered);


    scrollToSection("products");


}


/* =====================================================
   ALL PRODUCTS
===================================================== */


function showAllProducts() {


    displayProducts(products);


    scrollToSection("products");


}


/* =====================================================
   TODAY'S DEALS
===================================================== */


function showDeals() {


    const deals =
        products.filter(
            product => {


                const discount =

                    (
                        (
                            product.oldPrice -
                            product.price
                        )

                        /

                        product.oldPrice
                    )

                    * 100;


                return discount >= 10;

            }
        );


    displayProducts(deals);


    scrollToSection("products");


    showNotification(
        "Showing TechSpark deals 🏷️"
    );

}


/* =====================================================
   ELECTRONICS
===================================================== */


function showElectronics() {


    const electronics =
        products.filter(
            product =>

                [
                    "Laptops",
                    "Smartphones",
                    "Audio",
                    "Accessories"
                ].includes(
                    product.category
                )
        );


    displayProducts(electronics);


    scrollToSection("products");


}


/* =====================================================
   NEW ARRIVALS
===================================================== */


function showNewArrivals() {


    const newProducts =
        products.filter(
            product =>
                product.newArrival
        );


    displayProducts(newProducts);


    scrollToSection("products");


    showNotification(
        "Showing new arrivals ✨"
    );

}


/* =====================================================
   CATEGORY
===================================================== */


function filterCategory(category) {


    const filtered =
        products.filter(
            product =>
                product.category ===
                category
        );


    displayProducts(filtered);


    scrollToSection("products");


}


/* =====================================================
   SCROLL
===================================================== */


function scrollToSection(id) {


    const section =
        document.getElementById(id);


    if (section) {


        section.scrollIntoView({

            behavior: "smooth",

            block: "start"

        });


    }

}


/* =====================================================
   GO HOME
===================================================== */


function goHome() {


    window.scrollTo({

        top: 0,

        behavior: "smooth"

    });


    displayProducts(products);

}


/* =====================================================
   SAAS
===================================================== */


function showSaaSMessage() {


    showNotification(
        "TechSpark SaaS solutions are coming soon! ☁️"
    );

}


/* =====================================================
   CHECKOUT
===================================================== */


function checkout() {


    if (cart.length === 0) {


        showNotification(
            "Your cart is empty."
        );


        return;

    }


    showNotification(
        "Checkout functionality will be connected soon! 🚀"
    );

}


/* =====================================================
   NOTIFICATION
===================================================== */


function showNotification(message) {


    const existing =
        document.querySelector(
            ".notification"
        );


    if (existing) {

        existing.remove();

    }


    const notification =
        document.createElement("div");


    notification.className =
        "notification";


    notification.textContent =
        message;


    document.body.appendChild(
        notification
    );


    setTimeout(
        () => {

            notification.style.opacity =
                "0";

            notification.style.transform =
                "translateY(20px)";

            notification.style.transition =
                "0.3s";


            setTimeout(
                () => {

                    notification.remove();

                },
                300
            );


        },
        2200
    );

}


/* =====================================================
   SEARCH ENTER KEY
===================================================== */


document
    .getElementById("searchInput")
    .addEventListener(
        "keydown",
        function(event) {


            if (
                event.key === "Enter"
            ) {

                searchProducts();

            }

        }
    );


/* =====================================================
   CATEGORY CHANGE
===================================================== */


document
    .getElementById("category")
    .addEventListener(
        "change",
        function() {

            searchProducts();

        }
    );


/* =====================================================
   CLOSE CART WHEN CLICKING OUTSIDE
===================================================== */


document
    .getElementById("cartOverlay")
    .addEventListener(
        "click",
        function(event) {


            if (
                event.target ===
                this
            ) {

                closeCart();

            }

        }
    );


/* =====================================================
   INITIALIZE WEBSITE
===================================================== */


displayProducts();

updateCartCount();


/* =====================================================
   CURSOR STAR TRAIL
===================================================== */

(function () {

    var css = document.createElement("style");
    css.textContent =
        "@keyframes ts-star{" +
        "0%{opacity:1;transform:translate(-50%,-50%) scale(1) translate(0px,0px)}" +
        "100%{opacity:0;transform:translate(-50%,-50%) scale(0) translate(var(--tx),var(--ty))}" +
        "}" +
        ".ts-star{position:fixed;pointer-events:none;user-select:none;line-height:1;z-index:99999;" +
        "animation:ts-star var(--dur) ease-out forwards;}";
    document.head.appendChild(css);

    var COLORS = ["#ff4e50","#fc913a","#f9d423","#a8ff78","#00c9ff",
                  "#da22ff","#ff6fd8","#3de5ff","#ffe66d","#ff85a1","#06d6a0","#fffa65"];
    var GLYPHS  = ["★","✦","✧","✸","✺","⋆","✷","✵","✹"];

    function rand(a, b) { return a + Math.random() * (b - a); }

    function spawn(x, y) {
        var el    = document.createElement("span");
        var color = COLORS[Math.floor(Math.random() * COLORS.length)];
        var angle = rand(0, Math.PI * 2);
        var dist  = rand(40, 85);
        var dur   = rand(550, 950);
        var size  = rand(11, 22);

        el.className   = "ts-star";
        el.textContent = GLYPHS[Math.floor(Math.random() * GLYPHS.length)];

        el.style.left       = x + "px";
        el.style.top        = y + "px";
        el.style.fontSize   = size + "px";
        el.style.color      = color;
        el.style.textShadow = "0 0 8px " + color + ",0 0 16px " + color;
        el.style.setProperty("--tx", (Math.cos(angle) * dist) + "px");
        el.style.setProperty("--ty", (Math.sin(angle) * dist) + "px");
        el.style.setProperty("--dur", dur + "ms");

        document.body.appendChild(el);
        setTimeout(function() { el.remove(); }, dur + 50);
    }

    var lx = -999, ly = -999;

    document.addEventListener("mousemove", function(e) {
        var dx = e.clientX - lx, dy = e.clientY - ly;
        if (dx * dx + dy * dy < 64) return;
        lx = e.clientX;
        ly = e.clientY;
        var n = Math.floor(rand(2, 4));
        for (var i = 0; i < n; i++) spawn(e.clientX, e.clientY);
    });

}());
