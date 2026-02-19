const ENDPOINTS = {
  users: "/users",
  products: "/products",
  orders: "/orders",
};

const SWATCHES = [
  ["#22c55e", "#06b6d4"],
  ["#f59e0b", "#ef4444"],
  ["#0ea5e9", "#14b8a6"],
  ["#8b5cf6", "#ec4899"],
  ["#10b981", "#3b82f6"],
];

function setStatus(key, text, cls) {
  const el = document.getElementById(`${key}Status`);
  el.textContent = text;
  el.className = `chip ${cls || ""}`.trim();
}

function hashCode(str) {
  let h = 0;
  for (let i = 0; i < str.length; i += 1) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

function gradientFor(seed) {
  const pair = SWATCHES[hashCode(seed) % SWATCHES.length];
  return `linear-gradient(135deg, ${pair[0]}, ${pair[1]})`;
}

function initials(input) {
  const words = String(input || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (!words.length) return "?";
  if (words.length === 1) return words[0][0].toUpperCase();
  return `${words[0][0]}${words[1][0]}`.toUpperCase();
}

function makeCard(title, subtitle, seed, icon) {
  return `
    <article class="data-card">
      <div class="thumb" style="background:${gradientFor(seed)}">
        <span>${icon || initials(seed)}</span>
      </div>
      <div class="meta">
        <p class="title">${title}</p>
        <p class="sub">${subtitle}</p>
      </div>
    </article>
  `;
}

function renderUsers(users) {
  if (!Array.isArray(users) || !users.length) {
    return `<p class="empty-msg">No users found.</p>`;
  }
  return users
    .map((u) => makeCard(u.name || "Unknown User", `User ID: ${u.id ?? "-"}`, u.name, "U"))
    .join("");
}

function renderProducts(products) {
  if (!Array.isArray(products) || !products.length) {
    return `<p class="empty-msg">No products found.</p>`;
  }
  return products
    .map((p) =>
      makeCard(p.name || "Unknown Product", `Product ID: ${p.id ?? "-"}`, p.name, "P"),
    )
    .join("");
}

function renderOrders(order) {
  if (!order || typeof order !== "object") {
    return `<p class="empty-msg">No order data found.</p>`;
  }
  const main = makeCard(
    `Order #${order.order_id ?? "-"}`,
    "Latest order overview",
    `order-${order.order_id ?? "x"}`,
    "O",
  );
  const user = order.user
    ? makeCard(
        `User: ${order.user.name ?? "-"}`,
        `User ID: ${order.user.id ?? "-"}`,
        `user-${order.user.id ?? order.user.name ?? "x"}`,
        "U",
      )
    : "";
  const product = order.product
    ? makeCard(
        `Product: ${order.product.name ?? "-"}`,
        `Product ID: ${order.product.id ?? "-"}`,
        `product-${order.product.id ?? order.product.name ?? "x"}`,
        "P",
      )
    : "";
  return `${main}${user}${product}`;
}

function renderHtml(key, data) {
  if (key === "users") return renderUsers(data);
  if (key === "products") return renderProducts(data);
  if (key === "orders") return renderOrders(data);
  return `<p class="empty-msg">No renderer available.</p>`;
}

function setData(key, data) {
  const el = document.getElementById(`${key}Data`);
  el.innerHTML = renderHtml(key, data);
}

function setError(key, err, endpoint) {
  const el = document.getElementById(`${key}Data`);
  el.innerHTML = `
    <div class="error-box">
      <p class="error-title">Could not load section</p>
      <p class="error-sub">${err}</p>
      <p class="error-endpoint">${endpoint}</p>
    </div>
  `;
}

async function fetchSection(key, url) {
  setStatus(key, "Loading...", "warn");
  try {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    const payload = await res.json();
    setData(key, payload);
    setStatus(key, "Connected", "ok");
  } catch (err) {
    setError(key, err.message, url);
    setStatus(key, "Unavailable", "error");
  }
}

async function loadAll() {
  await Promise.all(
    Object.entries(ENDPOINTS).map(([key, url]) => fetchSection(key, url)),
  );
}

document.getElementById("refreshBtn").addEventListener("click", loadAll);
loadAll();
