/* ==========================================================================
   COFFEE BLISS - UNIVERSAL JAVASCRIPT APPLICATION LOGIC
   ========================================================================== */

// --- Products Database ---
const PRODUCTS = [
  { id: 1, name: "Americano", price: 25.00, category: "Economy", img: "coff-deal-americano-1.webp", tag: "Popular", isDeal: false },
  { id: 2, name: "Cappucino", price: 25.00, category: "Economy", img: "coff_cappucino_1.webp", tag: "Classic", isDeal: false },
  { id: 3, name: "Cold Brew", price: 25.00, category: "Expensive", img: "coff_coldbrew_1.jpg", tag: "Premium", isDeal: false },
  { id: 4, name: "Expresso", price: 25.00, category: "Economy", img: "coff_expresso_1.webp", tag: "Strong", isDeal: false },
  { id: 5, name: "Flat White", price: 25.00, category: "Western", img: "coff_flatwhite_1.jpg", tag: "Smooth", isDeal: false },
  { id: 6, name: "Ice Coffee", price: 25.00, category: "Western", img: "coff_icecoffee_1.webp", tag: "Chilled", isDeal: false },
  { id: 7, name: "Latte", price: 25.00, category: "Economy", img: "coff_latte_1.jpg", tag: "Creamy", isDeal: false },
  { id: 8, name: "Macchiato", price: 25.00, category: "Expensive", img: "coff_Macchiato_1.jpg", tag: "Rich", isDeal: false },
  { id: 9, name: "Mocha Bliss", price: 25.00, category: "Western", img: "coff_mocha_1.jpg", tag: "Chocolate", isDeal: false },
  { id: 10, name: "Turkish Coffee", price: 25.00, category: "Eastern", img: "coff_turkish_1.jpg", tag: "Traditional", isDeal: false },
  { id: 11, name: "Americano Buy 2 Get 4", price: 55.00, category: "Economy", img: "coff-deal-americano-1.webp", tag: "Bundle Deal", isDeal: true },
  { id: 12, name: "Cappucino Buy 1 Get 2", price: 55.00, category: "Economy", img: "coff-deal-cappucino-1.jpg", tag: "Special Deal", isDeal: true },
  { id: 13, name: "Latte Buy 1 Get 2", price: 55.00, category: "Western", img: "coff-deals-latte-1.jpg", tag: "Value Deal", isDeal: true }
];

// --- Coupon Database ---
const VALID_COUPONS = {
  "BLISS10": { type: "percent", value: 10, label: "10% OFF" },
  "COFFEE20": { type: "percent", value: 20, label: "20% OFF" },
  "FIRST50": { type: "fixed", value: 5.00, label: "$5.00 OFF" }
};

// --- Cart Storage & Helpers ---
function getCart() {
  try {
    const saved = localStorage.getItem("coffee_bliss_cart");
    return saved ? JSON.parse(saved) : [];
  } catch (e) {
    return [];
  }
}

function saveCart(cart) {
  try {
    localStorage.setItem("coffee_bliss_cart", JSON.stringify(cart));
  } catch (e) {}
  updateCartBadge();
}

function updateCartBadge() {
  const cart = getCart();
  const totalCount = cart.reduce((sum, item) => sum + item.qty, 0);
  const badges = document.querySelectorAll(".cart-badge");
  badges.forEach(badge => {
    badge.textContent = totalCount;
  });
}

function addToCartItem(e, name, price, img, size = "Medium") {
  if (e && e.preventDefault) e.preventDefault();
  let cart = getCart();
  let existingIndex = cart.findIndex(item => item.name === name && item.size === size);

  if (existingIndex > -1) {
    cart[existingIndex].qty += 1;
  } else {
    cart.push({
      id: Date.now(),
      name: name,
      price: price,
      img: img,
      size: size,
      qty: 1
    });
  }

  saveCart(cart);
  showToast(`Added ${name} to your cart!`, "success");
}

function addToCartDirect(name, price, img, size = "Medium") {
  let cart = getCart();
  let existingIndex = cart.findIndex(item => item.name === name && item.size === size);

  if (existingIndex > -1) {
    cart[existingIndex].qty += 1;
  } else {
    cart.push({
      id: Date.now(),
      name: name,
      price: price,
      img: img,
      size: size,
      qty: 1
    });
  }

  saveCart(cart);
}

function removeFromCart(index) {
  let cart = getCart();
  if (index >= 0 && index < cart.length) {
    const removedName = cart[index].name;
    cart.splice(index, 1);
    saveCart(cart);
    showToast(`Removed ${removedName} from cart.`, "info");
    if (window.location.pathname.includes("order.html")) {
      renderOrderPage();
    }
  }
}

function updateCartQty(index, newQty) {
  let cart = getCart();
  if (index >= 0 && index < cart.length) {
    if (newQty <= 0) {
      removeFromCart(index);
    } else {
      cart[index].qty = newQty;
      saveCart(cart);
      if (window.location.pathname.includes("order.html")) {
        renderOrderPage();
      }
    }
  }
}

function updateCartItemSize(index, newSize) {
  let cart = getCart();
  if (index >= 0 && index < cart.length) {
    cart[index].size = newSize;
    saveCart(cart);
    if (window.location.pathname.includes("order.html")) {
      renderOrderPage();
    }
  }
}

function clearCart() {
  localStorage.removeItem("coffee_bliss_cart");
  sessionStorage.removeItem("coffee_bliss_applied_coupon");
  saveCart([]);
}

// --- Coupon Logic ---
function getAppliedCoupon() {
  try {
    const saved = sessionStorage.getItem("coffee_bliss_applied_coupon");
    return saved ? JSON.parse(saved) : null;
  } catch (e) {
    return null;
  }
}

function applyCouponCode(codeStr) {
  const code = codeStr.trim().toUpperCase();
  if (!code) {
    showToast("Please enter a coupon code.", "info");
    return false;
  }

  if (VALID_COUPONS[code]) {
    const couponData = { code: code, ...VALID_COUPONS[code] };
    sessionStorage.setItem("coffee_bliss_applied_coupon", JSON.stringify(couponData));
    showToast(`Coupon '${code}' applied successfully! (${couponData.label})`, "success");
    if (window.location.pathname.includes("order.html")) {
      renderOrderPage();
    }
    return true;
  } else {
    showToast("Invalid Coupon Code. Try BLISS10, COFFEE20, or FIRST50", "error");
    return false;
  }
}

function removeAppliedCoupon() {
  sessionStorage.removeItem("coffee_bliss_applied_coupon");
  showToast("Coupon removed.", "info");
  if (window.location.pathname.includes("order.html")) {
    renderOrderPage();
  }
}

function copyCoupon(code) {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(code).then(() => {
      showToast(`Copied coupon '${code}'! Use it at checkout.`, "success");
    }).catch(() => {
      showToast(`Coupon code: ${code}`, "info");
    });
  } else {
    showToast(`Coupon code: ${code}`, "info");
  }
}

// --- Toast Notifications ---
function showToast(message, type = "info") {
  let container = document.querySelector(".toast-container");
  if (!container) {
    container = document.createElement("div");
    container.className = "toast-container";
    document.body.appendChild(container);
  }

  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  let iconClass = "fa-solid fa-circle-check";
  if (type === "error") iconClass = "fa-solid fa-triangle-exclamation";
  if (type === "info") iconClass = "fa-solid fa-circle-info";

  toast.innerHTML = `<i class="${iconClass}"></i> <span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateX(100%)";
    setTimeout(() => toast.remove(), 300);
  }, 3200);
}

// --- Home Page Interactive Product Grid & Search/Filter Logic ---
function createProductCardHTML(product) {
  return `
    <div class="product-card" data-category="${product.category}">
      <div class="card-img-wrap">
        <img src="${product.img}" alt="${product.name}" loading="lazy">
        <span class="card-tag">${product.tag}</span>
      </div>
      <div class="card-body">
        <h3 class="card-title">${product.name}</h3>
        <span class="card-category"><i class="fa-solid fa-tag"></i> ${product.category}</span>
        <div class="card-price">$${product.price.toFixed(2)}</div>
        <div class="card-actions">
          <button class="btn-card-add" onclick="addToCartItem(event, '${product.name}', ${product.price}, '${product.img}')">
            <i class="fa-solid fa-cart-plus"></i> ADD TO CART
          </button>
          <a href="order.html" class="btn-card-buy" onclick="addToCartDirect('${product.name}', ${product.price}, '${product.img}')">
            <i class="fa-solid fa-bolt"></i> BUY NOW
          </a>
        </div>
      </div>
    </div>
  `;
}

function initHomePageProducts() {
  const collectionContainer = document.getElementById("coffee-collection-grid");
  const dealsContainer = document.getElementById("special-deals-grid");
  
  if (!collectionContainer) return; // Not on home page

  function filterAndRender() {
    const searchInput = document.querySelector(".input-search-field, .input-search");
    const categorySelect = document.querySelector(".search-category-select, .category");
    
    const query = searchInput ? searchInput.value.toLowerCase().trim() : "";
    const selectedCategory = categorySelect ? categorySelect.value : "All";

    const filtered = PRODUCTS.filter(product => {
      const matchesCategory = (selectedCategory === "All") || (product.category.toLowerCase() === selectedCategory.toLowerCase());
      const matchesSearch = !query || product.name.toLowerCase().includes(query) || product.category.toLowerCase().includes(query) || product.tag.toLowerCase().includes(query);
      return matchesCategory && matchesSearch;
    });

    const regularProducts = filtered.filter(p => !p.isDeal);
    const dealProducts = filtered.filter(p => p.isDeal);

    if (regularProducts.length === 0) {
      collectionContainer.innerHTML = `
        <div class="no-products-msg">
          <i class="fa-solid fa-mug-hot"></i>
          <h3>No Brews Found</h3>
          <p>Try searching for another coffee or select "All" categories.</p>
        </div>
      `;
    } else {
      collectionContainer.innerHTML = regularProducts.map(createProductCardHTML).join("");
    }

    if (dealsContainer) {
      if (dealProducts.length === 0) {
        dealsContainer.innerHTML = `
          <div class="no-products-msg">
            <i class="fa-solid fa-ticket"></i>
            <h3>No Deals Found Matching Search</h3>
          </div>
        `;
      } else {
        dealsContainer.innerHTML = dealProducts.map(createProductCardHTML).join("");
      }
    }
  }

  // Initial render
  filterAndRender();

  // Attach real-time search & filter input listeners
  const searchInput = document.querySelector(".input-search-field, .input-search");
  const categorySelect = document.querySelector(".search-category-select, .category");
  const searchBtn = document.querySelector(".search-btn-icon, .icon");

  if (searchInput) {
    searchInput.addEventListener("input", filterAndRender);
  }
  if (categorySelect) {
    categorySelect.addEventListener("change", filterAndRender);
  }
  if (searchBtn) {
    searchBtn.addEventListener("click", filterAndRender);
  }
}

// --- Order Page Rendering ---
function renderOrderPage() {
  const cartListContainer = document.getElementById("order-cart-items");
  if (!cartListContainer) return;

  const cart = getCart();
  const appliedCoupon = getAppliedCoupon();

  if (cart.length === 0) {
    cartListContainer.innerHTML = `
      <div class="empty-cart-msg">
        <i class="fa-solid fa-mug-hot"></i>
        <h3>Your Coffee Cart is Empty</h3>
        <p>Explore our coffee collection and add your favorite brews!</p>
        <br>
        <a href="index.html" class="btn-card-buy" style="display: inline-flex; width: auto; padding: 0.75rem 1.8rem; text-decoration: none;">
          <i class="fa-solid fa-arrow-left"></i> Browse Coffee Menu
        </a>
      </div>
    `;

    document.getElementById("summary-subtotal").textContent = "$0.00";
    document.getElementById("summary-delivery").textContent = "$0.00";
    document.getElementById("summary-discount").textContent = "-$0.00";
    document.getElementById("summary-total").textContent = "$0.00";
    const appliedCouponContainer = document.getElementById("applied-coupon-container");
    if (appliedCouponContainer) appliedCouponContainer.innerHTML = "";
    return;
  }

  let subtotal = 0;
  let html = "";

  cart.forEach((item, index) => {
    let sizeExtra = 0;
    if (item.size === "Medium") sizeExtra = 1.00;
    if (item.size === "Large") sizeExtra = 2.00;

    const unitPrice = item.price + sizeExtra;
    const itemTotal = unitPrice * item.qty;
    subtotal += itemTotal;

    html += `
      <div class="cart-item-row">
        <div class="cart-item-info">
          <img src="${item.img}" alt="${item.name}" class="cart-item-img">
          <div class="cart-item-details">
            <h4>${item.name}</h4>
            <div class="item-unit-price">$${unitPrice.toFixed(2)} each</div>
          </div>
        </div>

        <div style="display: flex; align-items: center; gap: 0.8rem; flex-wrap: wrap;">
          <select class="size-select" onchange="updateCartItemSize(${index}, this.value)">
            <option value="Small" ${item.size === "Small" ? "selected" : ""}>Small</option>
            <option value="Medium" ${item.size === "Medium" ? "selected" : ""}>Medium (+$1.00)</option>
            <option value="Large" ${item.size === "Large" ? "selected" : ""}>Large (+$2.00)</option>
          </select>

          <div class="quantity-controls">
            <button class="btn-qty" onclick="updateCartQty(${index}, ${item.qty - 1})">-</button>
            <span class="qty-val">${item.qty}</span>
            <button class="btn-qty" onclick="updateCartQty(${index}, ${item.qty + 1})">+</button>
          </div>

          <div class="cart-item-total">$${itemTotal.toFixed(2)}</div>

          <button class="btn-remove-item" onclick="removeFromCart(${index})" title="Remove item">
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </div>
      </div>
    `;
  });

  cartListContainer.innerHTML = html;

  let deliveryFee = 3.00;
  let discountAmount = 0;

  if (appliedCoupon) {
    if (appliedCoupon.type === "percent") {
      discountAmount = (subtotal * appliedCoupon.value) / 100;
    } else if (appliedCoupon.type === "fixed") {
      discountAmount = appliedCoupon.value;
    }
  }

  if (discountAmount > subtotal) discountAmount = subtotal;
  const finalTotal = Math.max(0, subtotal - discountAmount + deliveryFee);

  document.getElementById("summary-subtotal").textContent = `$${subtotal.toFixed(2)}`;
  document.getElementById("summary-delivery").textContent = `$${deliveryFee.toFixed(2)}`;
  document.getElementById("summary-discount").textContent = `-$${discountAmount.toFixed(2)}`;
  document.getElementById("summary-total").textContent = `$${finalTotal.toFixed(2)}`;

  const appliedCouponContainer = document.getElementById("applied-coupon-container");
  if (appliedCouponContainer) {
    if (appliedCoupon) {
      appliedCouponContainer.innerHTML = `
        <div class="applied-coupon-tag">
          <i class="fa-solid fa-ticket"></i>
          <span>${appliedCoupon.code} (${appliedCoupon.label})</span>
          <button onclick="removeAppliedCoupon()" title="Remove Coupon">&times;</button>
        </div>
      `;
    } else {
      appliedCouponContainer.innerHTML = "";
    }
  }
}

// --- Checkout Form Handler ---
function handleCheckoutFormSubmit(e) {
  e.preventDefault();
  const cart = getCart();

  if (cart.length === 0) {
    showToast("Your cart is empty. Add items before placing order!", "error");
    return;
  }

  const name = document.getElementById("cust-name")?.value;
  const phone = document.getElementById("cust-phone")?.value;
  const city = document.getElementById("cust-city")?.value;
  const address = document.getElementById("cust-address")?.value;

  if (!name || !phone || !address) {
    showToast("Please fill out all required delivery fields.", "error");
    return;
  }

  const orderId = "CB-" + Math.floor(100000 + Math.random() * 900000);
  const totalAmount = document.getElementById("summary-total")?.textContent || "$0.00";

  const modalOverlay = document.getElementById("order-success-modal");
  if (modalOverlay) {
    document.getElementById("modal-order-id").textContent = orderId;
    document.getElementById("modal-order-name").textContent = name;
    document.getElementById("modal-order-city").textContent = city;
    document.getElementById("modal-order-total").textContent = totalAmount;

    modalOverlay.classList.add("active");
  }

  clearCart();
}

// --- Universal DOM Initializer ---
document.addEventListener("DOMContentLoaded", () => {
  updateCartBadge();

  // Initialize Home Page dynamic coffee listing if present
  initHomePageProducts();

  // Mobile Menu Drawer Handler
  const mobileToggleBtn = document.querySelector(".mobile-toggle");
  const navMenu = document.querySelector(".nav-menu");
  if (mobileToggleBtn && navMenu) {
    mobileToggleBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const isActive = navMenu.classList.toggle("active");
      const icon = mobileToggleBtn.querySelector("i");
      if (icon) {
        if (isActive) {
          icon.classList.remove("fa-bars");
          icon.classList.add("fa-xmark");
        } else {
          icon.classList.remove("fa-xmark");
          icon.classList.add("fa-bars");
        }
      }
    });

    // Close menu when clicking outside
    document.addEventListener("click", (e) => {
      if (!navMenu.contains(e.target) && !mobileToggleBtn.contains(e.target)) {
        navMenu.classList.remove("active");
        const icon = mobileToggleBtn.querySelector("i");
        if (icon) {
          icon.classList.remove("fa-xmark");
          icon.classList.add("fa-bars");
        }
      }
    });

    // Close menu when clicking any nav link
    navMenu.querySelectorAll("a").forEach(link => {
      link.addEventListener("click", () => {
        navMenu.classList.remove("active");
        const icon = mobileToggleBtn.querySelector("i");
        if (icon) {
          icon.classList.remove("fa-xmark");
          icon.classList.add("fa-bars");
        }
      });
    });
  }

  // Universal Feedback Modal Handler
  const feedbackBtns = document.querySelectorAll(".feedback, .btn-feedback");
  const feedbackModal = document.getElementById("feedback-modal");
  const closeFeedbackBtn = document.getElementById("close-feedback-modal");
  const feedbackForm = document.getElementById("feedback-form");

  if (feedbackBtns && feedbackModal) {
    feedbackBtns.forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        feedbackModal.classList.add("active");
      });
    });
  }

  if (closeFeedbackBtn && feedbackModal) {
    closeFeedbackBtn.addEventListener("click", () => {
      feedbackModal.classList.remove("active");
    });
  }

  if (feedbackForm) {
    feedbackForm.addEventListener("submit", (e) => {
      e.preventDefault();
      showToast("Thank you for your feedback! We appreciate your input.", "success");
      if (feedbackModal) feedbackModal.classList.remove("active");
      feedbackForm.reset();
    });
  }

  // Order Page Specific Setup
  if (window.location.pathname.includes("order.html")) {
    renderOrderPage();

    const applyCouponBtn = document.getElementById("btn-apply-coupon");
    const couponInput = document.getElementById("coupon-code-input");
    if (applyCouponBtn && couponInput) {
      applyCouponBtn.addEventListener("click", () => {
        applyCouponCode(couponInput.value);
        couponInput.value = "";
      });
    }

    const checkoutForm = document.getElementById("checkout-form");
    if (checkoutForm) {
      checkoutForm.addEventListener("submit", handleCheckoutFormSubmit);
    }

    const closeModalBtn = document.getElementById("close-order-modal");
    const orderModal = document.getElementById("order-success-modal");
    if (closeModalBtn && orderModal) {
      closeModalBtn.addEventListener("click", () => {
        orderModal.classList.remove("active");
        window.location.href = "index.html";
      });
    }
  }
});
