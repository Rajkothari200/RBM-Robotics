document.addEventListener("DOMContentLoaded", function () {
    let cart = [];
    let discountAmount = 0;
    const promoCodes = [
        { code: "SAVE10", discount: 10 },
        { code: "RBM15", discount: 15 },
        { code: "TECH20", discount: 20 }
    ];

    // Display promo codes in the list
    const promoList = document.getElementById("promo-list");
    promoCodes.forEach(promo => {
        const listItem = document.createElement("li");
        listItem.classList.add("list-group-item", "d-flex", "justify-content-between", "align-items-center");
        listItem.innerHTML = `
            ${promo.code} - ${promo.discount}% off 
            <button class="btn btn-sm btn-primary apply-promo" data-code="${promo.code}" data-discount="${promo.discount}">Apply</button>
            <small class="text-success promo-saved" style="display:none;">You saved ₹0</small>
        `;
        promoList.appendChild(listItem);
    });

    // Select all "ADD TO CART" buttons and attach event listeners
    document.querySelectorAll(".btn-add").forEach(button => {
        button.addEventListener("click", function () {
            const productCard = this.closest(".card");
            const title = productCard.querySelector(".card-title").innerText;
            const priceText = productCard.querySelector(".card-price").innerText;
            const price = parseInt(priceText.replace("₹", "").trim()); // Extract numeric price
            addToCart({ title, price });
        });
    });

    function addToCart(product) {
        cart.push(product);
        updateCart();
    }

    function updateCart() {
        const cartItems = document.getElementById("cart-items");
        const totalPriceEl = document.getElementById("total-price");
        cartItems.innerHTML = "";
        let total = cart.reduce((sum, item) => sum + item.price, 0);
    
        if (cart.length === 0) {
            discountAmount = 0; 
            document.getElementById("discount-msg").textContent = ""; // Hide discount message
        }
    
        total -= discountAmount; // Apply discount properly
    
        cart.forEach((item, index) => {
            cartItems.innerHTML += `
                <li class="list-group-item">${item.title} - ₹${item.price} 
                    <button class="btn btn-danger btn-sm float-right btn-remove" data-index="${index}">Remove</button>
                </li>`;
        });
    
        totalPriceEl.textContent = `₹${total}`;
    
        document.querySelectorAll(".btn-remove").forEach(button => {
            button.addEventListener("click", function () {
                const index = parseInt(this.getAttribute("data-index")); // Ensure integer
                removeFromCart(index);
            });
        });
    }
    

    function removeFromCart(index) {
        cart.splice(index, 1);
        updateCart();
    }

    // Apply promo code when user clicks "Apply" button
    document.querySelectorAll(".apply-promo").forEach(button => {
        button.addEventListener("click", function () {
            const promoCode = this.getAttribute("data-code");
            const discountPercent = parseInt(this.getAttribute("data-discount"));
            applyPromoCode(promoCode, discountPercent, this);
        });
    });

    let currentPromo = null;

function applyPromoCode(code, discountPercent, buttonElement) {
    if (cart.length === 0) {
        alert("Add items to your cart before applying a promo code!");
        return;
    }

    // Reset previous promo code button and message
    document.querySelectorAll(".apply-promo").forEach(btn => {
        btn.disabled = false;
        const msg = btn.parentElement.querySelector(".promo-saved");
        if (msg) {
            msg.style.display = "none";
        }
    });

    currentPromo = { code, discountPercent };

    const totalBeforeDiscount = cart.reduce((sum, item) => sum + item.price, 0);
    discountAmount = Math.round((discountPercent / 100) * totalBeforeDiscount);
    document.getElementById("total-price").textContent = `₹${totalBeforeDiscount - discountAmount}`;

    // Update savings message & disable button
    const savingsMessage = buttonElement.nextElementSibling;
    savingsMessage.textContent = `You saved ₹${discountAmount}`;
    savingsMessage.style.display = "inline";
    buttonElement.disabled = true;

    // Update discount message
    document.getElementById("discount-msg").textContent = `Applied ${code} for ₹${discountAmount} off`;
}
    


    window.proceedToCheckout = function () {
        if (cart.length === 0) {
            return alert("Your cart is empty!");
        }
    
        const email = prompt("Enter your email:");
        if (!email) return alert("Email is required!");
    
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return alert("Invalid email format! Please enter a valid email.");
        }
    
        const orderDetails = cart.map(item => `${item.title} - ₹${item.price}`).join("\n");
        const total = document.getElementById("total-price").textContent;
        const message = `Thank you for your order!\n\nYour Order Details:\n${orderDetails}\n\nTotal: ${total}\n\nRBM Robotics Team`;
    
        const cartItems = cart.map(item => `${item.title} - ₹${item.price}`);
    
        fetch("http://localhost:3000/send-email", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, message, cartItems, total })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert("Email sent and cart saved successfully!");
            } else {
                alert("Failed to send email: " + data.message);
            }
        })
        .catch(error => {
            console.error("Fetch error:", error);
            alert("Error sending email! Check the console for details.");
        });
    };        
    
});
