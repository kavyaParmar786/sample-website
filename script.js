// =======================
// GLOBAL CART (STAFF SIDE)
// =======================
let cart = [];

// =======================
// ADD ITEM TO CART
// =======================
function addToCart(name, price) {
  cart.push({ name, price });
  renderCart();
}

// =======================
// REMOVE ITEM FROM CART
// =======================
function removeFromCart(index) {
  cart.splice(index, 1);
  renderCart();
}

// =======================
// RENDER CART UI
// =======================
function renderCart() {
  const cartContainer = document.getElementById("cart");

  if (!cartContainer) return;

  cartContainer.innerHTML = "";

  let total = 0;

  cart.forEach((item, index) => {
    total += item.price;

    cartContainer.innerHTML += `
      <div>
        ${item.name} - ₹${item.price}
        <button onclick="removeFromCart(${index})">❌</button>
      </div>
    `;
  });

  cartContainer.innerHTML += `<h3>Total: ₹${total}</h3>`;
}

// =======================
// PLACE ORDER (STAFF)
// =======================
function placeOrder(table = "Table 1") {
  if (cart.length === 0) {
    alert("Cart is empty!");
    return;
  }

  const order = {
    table: table,
    items: cart,
    status: "New",
    time: new Date().toLocaleTimeString()
  };

  push(ref(db, "orders"), order);

  alert("Order sent to kitchen!");

  cart = [];
  renderCart();
}

// =======================
// LOAD ORDERS (KITCHEN)
// =======================
function loadOrders() {
  const container = document.getElementById("orders");
  if (!container) return;

  const orders = JSON.parse(localStorage.getItem("orders")) || [];

  container.innerHTML = "";

  orders.forEach((order, index) => {
    let color = "white";

    if (order.status === "Preparing") color = "orange";
    if (order.status === "Ready") color = "green";
    if (order.status === "Completed") color = "gray";

    const div = document.createElement("div");

    div.style.border = "1px solid white";
    div.style.margin = "10px";
    div.style.padding = "10px";

    div.innerHTML = `
      <h2>${order.table}</h2>
      <p>${order.items.map(i => i.name).join(", ")}</p>
      <p style="color:${color}">Status: ${order.status}</p>

      <button onclick="updateStatus(${index}, 'Preparing')">Preparing</button>
      <button onclick="updateStatus(${index}, 'Ready')">Ready</button>
      <button onclick="updateStatus(${index}, 'Completed')">Done</button>
    `;

    container.appendChild(div);
  });
}

// =======================
// UPDATE ORDER STATUS
// =======================
function updateStatus(index, status) {
  let orders = JSON.parse(localStorage.getItem("orders")) || [];

  orders[index].status = status;

  localStorage.setItem("orders", JSON.stringify(orders));

  loadOrders();
}

// =======================
// BELL NOTIFICATION
// =======================
let lastOrderCount = 0;

function checkNewOrders() {
  const orders = JSON.parse(localStorage.getItem("orders")) || [];

  if (orders.length > lastOrderCount) {
    playBell();
  }

  lastOrderCount = orders.length;
}

// =======================
// PLAY BELL SOUND
// =======================
function playBell() {
  const audio = new Audio("bell.mp3"); // add bell file in project
  audio.play();
}

function loadOrdersRealtime() {
  const container = document.getElementById("orders");

  onValue(ref(db, "orders"), (snapshot) => {
    const data = snapshot.val();

    container.innerHTML = "";

    for (let id in data) {
      const order = data[id];

      container.innerHTML += `
        <div>
          <h2>${order.table}</h2>
          <p>${order.items.map(i => i.name).join(", ")}</p>
          <p>Status: ${order.status}</p>
        </div>
      `;
    }
  });
}
// =======================
// AUTO REFRESH SYSTEM
// =======================
setInterval(() => {
  loadOrders();
  checkNewOrders();
}, 2000);
