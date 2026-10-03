/* ------------------------------------------------------------------
   Shop details. Edit this block to update the whole site.
------------------------------------------------------------------ */
const SHOP = {
  name: "Fromage & Figue",
  city: "Liverpool",
  address: ["14 Gambier Lane", "Liverpool L1 4DX"],
  mapQuery: "14 Gambier Lane, Liverpool L1 4DX, UK",
  email: "hello@fromageandfigue.co.uk",
  phone: "0151 496 0142",
  phoneLink: "+441514960142",
  whatsapp: "447700900142",            // digits only with country code, for example 447700900123. Leave empty to hide.
  openingSoon: true,      // true shows "Opening soon" everywhere instead of live hours. Set false at launch.
  openingNote: "Spring 2027, Liverpool",
  openingDate: "2027-03-21",   // used for the countdown line
  countdownStart: "2026-10-01", // where the progress line starts
  owner: "Benoit Severin-Delos",
  timeZone: "Europe/London",
  // Opening hours by weekday: [open hour, close hour] in 24h time, or null when closed. Sunday first.
  hours: [null, null, [10, 18], [10, 18], [10, 18], [10, 18], [9, 17]],
};

/* Edit this list to change the counter. img is a file in assets/products/. */
const PRODUCTS = [
  { id: "brie", name: "Brie de Meaux", type: "soft", note: "Supple and creamy, with notes of mushroom and cream. Best at room temperature.", pair: "A crisp white, warm baguette", price: "£9 / 100g", img: "brie" },
  { id: "reblochon", name: "Reblochon", type: "soft", note: "Washed rind, supple and nutty, with a gentle fruit.", pair: "New potatoes, a crisp white", price: "£9 / 100g", img: "reblochon" },
  { id: "comte", name: "Comté 24 months", type: "hard", note: "Nutty and caramel sweet, with fine crystals and a long finish.", pair: "Walnut bread, a glass of white", price: "£8 / 100g", img: "comte" },
  { id: "roquefort", name: "Roquefort", type: "blue", note: "Bold and salty over a creamy blue. Superb with honey.", pair: "Honey, walnuts, a sweet wine", price: "£10 / 100g", img: "roquefort" },
  { id: "goat", name: "Fresh goat cheese", type: "soft", note: "Bright and lemony, with a delicate, soft texture.", pair: "Warm bread, olive oil", price: "£7 / 100g", img: "goat" },
  { id: "manchego", name: "Manchego", type: "hard", note: "Buttery sheep's milk cheese from La Mancha, with a gentle nuttiness.", pair: "Quince, almonds, dry sherry", price: "£7 / 100g", img: "manchego" },
  { id: "gorgonzola", name: "Gorgonzola Dolce", type: "blue", note: "Mild, spoonable and rich.", pair: "Pears, toasted bread", price: "£8 / 100g", img: "gorgonzola" },
  { id: "camembert", name: "Camembert de Normandie", type: "soft", note: "Rich and earthy, with a melting centre. Excellent baked.", pair: "Warm baguette, cider", price: "£8 / piece", img: "camembert" },
  { id: "bread", name: "Walnut bread", type: "pantry", note: "Baked daily, an excellent partner for blue cheese.", pair: "Blue cheese, honey", price: "£6 / loaf", img: "bread" },
  { id: "figs", name: "Fresh figs", type: "pantry", note: "Seasonal, and picked ripe.", pair: "Any cheese in the collection", price: "£6 / box", img: "figs" },
  { id: "jam", name: "Fig jam", type: "pantry", note: "Small batch, slowly cooked.", pair: "Comté, brie, goat cheese", price: "£9 / jar", img: "jam" },
  { id: "pantry", name: "Preserves and crackers", type: "pantry", note: "Small-batch preserves, crackers and nuts, chosen to sit alongside the cheese.", pair: "Any cheese in the collection", price: "From £5", img: "pantry" },
];
const TYPES = [["all", "All"], ["soft", "Soft"], ["hard", "Hard"], ["blue", "Blue"], ["pantry", "Pantry"]];

/* ------------------------------------------------------------------ */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const html = document.documentElement;
let lenis = null;
function lockScroll(on) { document.body.classList.toggle("locked", on); if (lenis) { if (on) lenis.stop(); else lenis.start(); } }
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = matchMedia("(hover: hover) and (pointer: fine)").matches;
const HOME = !!document.getElementById("product");   // the home page has the product dialog
const byId = Object.fromEntries(PRODUCTS.map(p => [p.id, p]));
const imgSrc = p => `assets/products/${p.img}.webp`;
const cap = s => s.charAt(0).toUpperCase() + s.slice(1);

/* ---------- loader ---------- */
(function loader() {
  let seen = false;
  try { seen = sessionStorage.getItem("ff-seen") === "1"; } catch (e) {}
  const go = () => { html.classList.add("ready"); try { sessionStorage.setItem("ff-seen", "1"); } catch (e) {} };
  if (!$("#loader") || seen || reduce) { if ($("#loader")) $("#loader").style.display = "none"; html.classList.add("ready"); return; }
  const min = new Promise(r => setTimeout(r, 1300));
  const loaded = new Promise(r => (document.readyState === "complete" ? r() : addEventListener("load", r, { once: true })));
  Promise.all([min, loaded]).then(go);
  setTimeout(go, 4000);
})();

/* ---------- opening hours ---------- */
const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const fmt = h => { const hh = Math.floor(h), mm = Math.round((h - hh) * 60); return `${hh}:${String(mm).padStart(2, "0")}`; };
function shopNow() {
  const d = new Date();
  if (!SHOP.timeZone) return { day: d.getDay(), t: d.getHours() + d.getMinutes() / 60 };
  const parts = new Intl.DateTimeFormat("en-GB", { timeZone: SHOP.timeZone, weekday: "long", hour: "numeric", minute: "numeric", hour12: false }).formatToParts(d);
  const get = k => parts.find(p => p.type === k).value;
  return { day: DAYS.indexOf(get("weekday")), t: (+get("hour") % 24) + +get("minute") / 60 };
}
function openStatus() {
  const { day, t } = shopNow(), today = SHOP.hours[day];
  if (today && t >= today[0] && t < today[1]) return { open: true, short: "Open now", long: `Open now, until ${fmt(today[1])}` };
  if (today && t < today[0]) return { open: false, short: "Opens today", long: `Closed, opens today at ${fmt(today[0])}` };
  for (let i = 1; i <= 7; i++) {
    const d = (day + i) % 7, h = SHOP.hours[d];
    if (h) return { open: false, short: "Closed", long: `Closed, opens ${i === 1 ? "tomorrow" : DAYS[d]} at ${fmt(h[0])}` };
  }
  return { open: false, short: "Closed", long: "Closed" };
}
const setText = (sel, t) => { const e = $(sel); if (e) e.textContent = t; };
function renderHours() {
  if (SHOP.openingSoon) {
    setText("#status-text", "Opening soon");
    setText("#open-line", `Opening soon, ${SHOP.openingNote}`);
    $$(".status .dot, .open-line .dot").forEach(d => { d.classList.remove("open"); d.classList.add("soon"); });
    if ($("#hours")) $("#hours").innerHTML = `<li><span>Opening hours</span><span>To be announced</span></li>`;
    return;
  }
  const s = openStatus(), { day } = shopNow();
  setText("#status-text", s.short);
  setText("#open-line", s.long);
  $$(".status .dot, .open-line .dot").forEach(d => d.classList.toggle("open", s.open));
  if ($("#hours")) $("#hours").innerHTML = [1, 2, 3, 4, 5, 6, 0].map(d => {
    const h = SHOP.hours[d];
    return `<li class="${d === day ? "today" : ""}"><span>${DAYS[d]}</span><span>${h ? `${fmt(h[0])} to ${fmt(h[1])}` : "Closed"}</span></li>`;
  }).join("");
}

/* ---------- shop details into the page ---------- */
function renderDetails() {
  $$("[data-shop-address]").forEach(e => (e.innerHTML = SHOP.address.join("<br>")));
  $$("[data-shop-email-text]").forEach(e => { e.href = `mailto:${SHOP.email}`; e.textContent = SHOP.email; });
  $$("[data-shop-phone-text]").forEach(e => { e.href = `tel:${SHOP.phoneLink}`; e.textContent = SHOP.phone; });
  if ($("#address")) {
    $("#address").innerHTML = SHOP.address.join("<br>");
    const em = $("#email-link"); em.href = `mailto:${SHOP.email}`; em.textContent = SHOP.email;
    const ph = $("#phone-link"); ph.href = `tel:${SHOP.phoneLink}`; ph.textContent = SHOP.phone;
    $("#call").href = `tel:${SHOP.phoneLink}`;
    $("#directions").href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(SHOP.mapQuery)}`;
  }
  $$("[data-shop-email]").forEach(a => (a.href = `mailto:${SHOP.email}?subject=${encodeURIComponent("Boards and gift boxes")}`));
  $("#year").textContent = new Date().getFullYear();
}

/* ---------- counter: filters, search, grid ---------- */
let filter = "all", query = "";
const grid = $("#grid"), empty = $("#empty");
function renderFilters() {
  $("#filters").innerHTML = TYPES.map(([k, label]) => {
    const n = k === "all" ? PRODUCTS.length : PRODUCTS.filter(p => p.type === k).length;
    return `<button class="filter${k === filter ? " active" : ""}" type="button" data-filter="${k}" aria-pressed="${k === filter}">${label}<small>${n}</small></button>`;
  }).join("");
}
function visible() {
  const q = query.trim().toLowerCase();
  return PRODUCTS.filter(p => (filter === "all" || p.type === filter) && (!q || `${p.name} ${p.note} ${p.type} ${p.pair}`.toLowerCase().includes(q)));
}
function renderGrid(initial = false) {
  const items = visible();
  const cols = getComputedStyle(grid).gridTemplateColumns.split(" ").length || 1;
  const draw = () => {
    grid.innerHTML = items.map((p, i) => `
      <li class="card${initial ? " pre" : ""}" style="--c:${i % cols};view-transition-name:card-${p.id}">
        <button class="quick-add" type="button" data-add="${p.id}" aria-label="Add ${p.name} to your order list">+</button>
        <button class="card-btn" type="button" data-open="${p.id}" aria-label="View ${p.name}">
          <div class="thumb"><img loading="lazy" src="${imgSrc(p)}" alt="${p.name}" width="800" height="1000"></div>
          <div class="card-body">
            <div class="card-top"><span class="tag">${p.type}</span><span class="price">${p.price}</span></div>
            <h3>${p.name}</h3>
            <p>${p.note}</p>
          </div>
        </button>
      </li>`).join("");
    empty.hidden = items.length > 0;
    if (initial) $$(".card", grid).forEach(c => io.observe(c));
  };
  // Cards glide to their new positions where View Transitions are supported.
  if (!initial && !reduce && document.startViewTransition) document.startViewTransition(draw);
  else draw();
}
if (HOME) $("#filters").addEventListener("click", e => {
  const b = e.target.closest("[data-filter]"); if (!b) return;
  filter = b.dataset.filter; renderFilters(); renderGrid();
});
let st; if (HOME) $("#search").addEventListener("input", e => { query = e.target.value; clearTimeout(st); st = setTimeout(() => renderGrid(), 120); });
if (HOME) grid.addEventListener("click", e => {
  const add = e.target.closest("[data-add]");
  if (add) { addToOrder(add.dataset.add); return; }
  const open = e.target.closest("[data-open]");
  if (open) openProduct(open.dataset.open, open);
});

/* ---------- product dialog ---------- */
const dlg = $("#product");
let lastFocus = null;
function openProduct(id, trigger) {
  const p = byId[id]; if (!p) return;
  lastFocus = trigger || document.activeElement;
  dlg.innerHTML = `
    <button class="icon-btn p-close" type="button" data-close aria-label="Close">&times;</button>
    <div class="p-img"><img src="${imgSrc(p)}" alt="${p.name}" width="800" height="1000"></div>
    <div class="p-body">
      <span class="tag">${cap(p.type)}</span>
      <h2 id="p-name">${p.name}</h2>
      <p class="note">${p.note}</p>
      <dl>
        <div><dt>Pairs with</dt><dd>${p.pair}</dd></div>
        <div><dt>Serve</dt><dd>${p.type === "pantry" ? "Alongside the cheese" : "At room temperature"}</dd></div>
        <div><dt>Collection</dt><dd>Free in store, cut to order</dd></div>
        <div><dt>Delivery</dt><dd>£4.99, free over £60</dd></div>
      </dl>
      <div class="p-actions">
        <span class="p-price">${p.price}</span>
        <button class="btn btn-dark" type="button" data-add-close="${p.id}">Add to order list</button>
      </div>
    </div>`;
  dlg.showModal(); lockScroll(true);
}
dlg && dlg.addEventListener("click", e => {
  if (e.target === dlg || e.target.closest("[data-close]")) dlg.close();
  const a = e.target.closest("[data-add-close]");
  if (a) { addToOrder(a.dataset.addClose); dlg.close(); }
});
dlg && dlg.addEventListener("close", () => { lockScroll(false); if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true }); });

/* ---------- order list ---------- */
let order = {};
try { order = JSON.parse(localStorage.getItem("ff-order") || "{}"); } catch (e) {}
order = Object.fromEntries(Object.entries(order).filter(([id, q]) => byId[id] && q > 0));
const save = () => { try { localStorage.setItem("ff-order", JSON.stringify(order)); } catch (e) {} };
const total = () => Object.values(order).reduce((a, b) => a + b, 0);
const drawer = $("#order"), scrim = $("#scrim");
const fmtWhen = v => {
  if (!v) return "";
  const d = new Date(v);
  return isNaN(d) ? v : new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(d).replace(",", "");
};
const localNow = () => { const d = new Date(Date.now() + 60 * 60 * 1000); d.setMinutes(Math.ceil(d.getMinutes() / 15) * 15, 0, 0); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0, 16); };
const gbp = new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" });
const unitPrice = p => parseFloat((p.price.match(/[\d.]+/) || [0])[0]);
const orderTotal = () => Object.entries(order).reduce((s, [id, q]) => s + unitPrice(byId[id]) * q, 0);
const DELIVERY_FEE = 4.99, FREE_DELIVERY_FROM = 60;
let method = "collect";
const shipping = () => (method === "delivery" && orderTotal() > 0 && orderTotal() < FREE_DELIVERY_FROM ? DELIVERY_FEE : 0);
const grandTotal = () => orderTotal() + shipping();
const shipText = () => (shipping() ? gbp.format(shipping()) : "Free");
const shipLabel = () => (method === "delivery" ? "Delivery" : "Collection in store");
const whenWord = () => (method === "delivery" ? "Delivery" : "Collection");
let toastT;
function toast(msg) { const t = $("#toast"); t.textContent = msg; t.classList.add("show"); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove("show"), 2200); }
function addToOrder(id) {
  order[id] = (order[id] || 0) + 1; save(); renderOrder(true);
  toast(`${byId[id].name} added to your list`);
}
function renderOrder(bump) {
  const ids = Object.keys(order), n = total();
  $$("[data-count]").forEach(c => { c.textContent = n; if (bump) { c.classList.add("bump"); setTimeout(() => c.classList.remove("bump"), 350); } });
  $("#order-empty").hidden = ids.length > 0;
  $("#order-items").innerHTML = ids.map(id => {
    const p = byId[id];
    return `<li data-id="${id}">
      <img src="${imgSrc(p)}" alt="" width="64" height="80">
      <div><h3>${p.name}</h3><small>${p.price}</small>
        <div class="qty"><button type="button" data-dec aria-label="Fewer ${p.name}">&minus;</button><b>${order[id]}</b><button type="button" data-inc aria-label="More ${p.name}">+</button></div></div>
      <button class="remove" type="button" data-remove aria-label="Remove ${p.name}">Remove</button>
    </li>`;
  }).join("");
  $(".order-actions").toggleAttribute("data-empty", ids.length === 0);
  $("#order-total").hidden = ids.length === 0;
  $("#sub-amount").textContent = gbp.format(orderTotal());
  $("#ship-label").textContent = shipLabel(); $("#ship-amount").textContent = shipText();
  $("#total-amount").textContent = gbp.format(grandTotal());
  const hint = $("#ship-hint"), left = FREE_DELIVERY_FROM - orderTotal();
  hint.hidden = !(method === "delivery" && ids.length && left > 0);
  if (!hint.hidden) hint.textContent = `Add ${gbp.format(left)} more for free delivery.`;
  $("#addr-wrap").hidden = method !== "delivery";
  $("#when-label").textContent = `${whenWord()} date and time`;
  updateLinks();
}
function message() {
  const f = new FormData($("#order-form"));
  const lines = Object.keys(order).map(id => `- ${order[id]} x ${byId[id].name} (${byId[id].price})`);
  let m = `Hello ${SHOP.name},\n\nI would like to put together an order:\n\n${lines.join("\n")}\n\nSubtotal: ${gbp.format(orderTotal())}\n${shipLabel()}: ${shipText()}\nEstimated total: ${gbp.format(grandTotal())}\n`;
  if (f.get("name")) m += `\nName: ${f.get("name")}`;
  if (method === "delivery" && f.get("address")) m += `\nDelivery address: ${String(f.get("address")).replace(/\s*\n\s*/g, ", ")}`;
  if (f.get("when")) m += `\n${whenWord()}: ${fmtWhen(f.get("when"))}`;
  return m + "\n\nThank you!";
}
function updateLinks() {
  const m = message();
  $("#send-email").href = `mailto:${SHOP.email}?subject=${encodeURIComponent("Order list")}&body=${encodeURIComponent(m)}`;
  const wa = $("#send-wa");
  wa.hidden = !SHOP.whatsapp;
  if (SHOP.whatsapp) wa.href = `https://wa.me/${SHOP.whatsapp}?text=${encodeURIComponent(m)}`;
}
$$("input[name=method]").forEach(r => r.addEventListener("change", () => { method = r.value; renderOrder(); }));
$("#order-form").addEventListener("input", updateLinks);
$("#order-form").addEventListener("submit", e => e.preventDefault());
$("#order-items").addEventListener("click", e => {
  const li = e.target.closest("li"); if (!li) return; const id = li.dataset.id;
  if (e.target.closest("[data-inc]")) order[id]++;
  else if (e.target.closest("[data-dec]")) order[id] = Math.max(0, order[id] - 1);
  else if (e.target.closest("[data-remove]")) order[id] = 0;
  else return;
  if (!order[id]) delete order[id];
  save(); renderOrder();
});
$("#clear-order").addEventListener("click", () => { order = {}; save(); renderOrder(); });
function setWhenMin() { $$("#when-list, #when-pay").forEach(i => (i.min = localNow())); }
function openOrder() {
  setWhenMin();
  $("#toast").classList.remove("show");
  if (view === "done") showView("list");
  scrim.hidden = false; requestAnimationFrame(() => scrim.classList.add("show"));
  drawer.inert = false; drawer.setAttribute("aria-hidden", "false"); drawer.classList.add("open"); lockScroll(true);
  setTimeout(() => $(".icon-btn", drawer).focus({ preventScroll: true }), 50);
}
function closeOrder() {
  scrim.classList.remove("show"); setTimeout(() => (scrim.hidden = true), 500);
  drawer.classList.remove("open"); drawer.inert = true; drawer.setAttribute("aria-hidden", "true"); lockScroll(false);
}
$$("[data-open-order]").forEach(b => b.addEventListener("click", openOrder));
$("[data-close-order]").addEventListener("click", closeOrder);
scrim.addEventListener("click", closeOrder);
addEventListener("keydown", e => { if (e.key === "Escape" && drawer.classList.contains("open")) closeOrder(); });

/* ---------- demo checkout (nothing is sent or stored) ---------- */
let view = "list";
const payForm = $("#pay-form"), payError = $("#pay-error"), payBtn = $("#pay-btn");
const titles = { list: "Your order list", pay: "Checkout (demo)", done: "Order confirmed" };
function showView(v) {
  view = v;
  $("#view-list").hidden = v !== "list"; payForm.hidden = v !== "pay"; $("#view-done").hidden = v !== "done";
  $("#order-title").textContent = titles[v]; $("#pay-back").hidden = v !== "pay";
  $(".order-body", v === "list" ? $("#view-list") : v === "pay" ? payForm : $("#view-done")).scrollTop = 0;
}
const lineItems = () => Object.keys(order).map(id => `<li><span>${order[id]} x ${byId[id].name}</span><span>${gbp.format(unitPrice(byId[id]) * order[id])}</span></li>`).join("") + `<li><span>${shipLabel()}</span><span>${shipText()}</span></li>`;
$("#go-checkout").addEventListener("click", () => {
  if (!total()) return;
  $("#pay-summary").innerHTML = lineItems();
  const t = gbp.format(grandTotal());
  $("#pay-total").textContent = t; $(".label", payBtn).textContent = `Pay ${t}`;
  payError.hidden = true; payForm.reset(); showView("pay");
  const nm = $("input[name=name]", $("#order-form")).value; if (nm) payForm.elements["demo-name"].value = nm;
  payForm.elements["demo-when"].value = $("#when-list").value;
  payForm.elements["demo-address"].value = $("#order-form").elements.address.value;
  $("#pay-addr-wrap").hidden = method !== "delivery"; $("#pay-when-label").textContent = `${whenWord()} date and time`;
  payForm.elements["demo-name"].focus({ preventScroll: true });
});
$("#pay-back").addEventListener("click", () => showView("list"));
const digits = s => s.replace(/\D/g, "");
$("#card-number").addEventListener("input", e => { e.target.value = digits(e.target.value).slice(0, 16).replace(/(.{4})/g, "$1 ").trim(); });
$("#card-exp").addEventListener("input", e => { const d = digits(e.target.value).slice(0, 4); e.target.value = d.length > 2 ? `${d.slice(0, 2)} / ${d.slice(2)}` : d; });
$("#card-cvc").addEventListener("input", e => { e.target.value = digits(e.target.value).slice(0, 3); });
$("#fill-test").addEventListener("click", () => {
  const nm = payForm.elements["demo-name"], em = payForm.elements["demo-email"];
  if (!nm.value) nm.value = "Test Customer"; if (!em.value) em.value = "test@example.com";
  $("#card-number").value = "4242 4242 4242 4242"; $("#card-exp").value = "12 / 34"; $("#card-cvc").value = "123";
});
function fail(msg, field) {
  payError.textContent = msg; payError.hidden = false;
  $$("input", payForm).forEach(i => i.removeAttribute("aria-invalid")); if (field) { field.setAttribute("aria-invalid", "true"); field.focus(); }
}
payForm.addEventListener("submit", e => {
  e.preventDefault();
  const name = payForm.elements["demo-name"], email = payForm.elements["demo-email"], num = digits($("#card-number").value), exp = digits($("#card-exp").value), cvc = $("#card-cvc");
  if (!name.value.trim()) return fail("Please enter your name.", name);
  if (!/^\S+@\S+\.\S+$/.test(email.value)) return fail("Please enter a valid email address.", email);
  if (method === "delivery" && !payForm.elements["demo-address"].value.trim()) return fail("Please enter a delivery address.", payForm.elements["demo-address"]);
  if (num !== "4242424242424242" && num !== "4000000000000002") return fail("This is a demo. Please use the test card 4242 4242 4242 4242.", $("#card-number"));
  const mm = +exp.slice(0, 2), yy = 2000 + +exp.slice(2, 4), now = new Date();
  if (exp.length < 4 || mm < 1 || mm > 12 || yy < now.getFullYear() || (yy === now.getFullYear() && mm < now.getMonth() + 1)) return fail("Please enter a future expiry date, for example 12 / 34.", $("#card-exp"));
  if (cvc.value.length !== 3) return fail("Please enter a three digit CVC.", cvc);
  fail("", null); payError.hidden = true;
  payBtn.classList.add("busy"); $(".label", payBtn).textContent = "Processing";
  setTimeout(() => {
    payBtn.classList.remove("busy");
    if (num === "4000000000000002") { $(".label", payBtn).textContent = `Pay ${gbp.format(grandTotal())}`; return fail("Your card was declined. This is the demo decline card, try 4242 4242 4242 4242.", $("#card-number")); }
    const ref = "FF-" + Math.random().toString(36).slice(2, 8).toUpperCase();
    const when = fmtWhen(payForm.elements["demo-when"].value);
    $("#done-ref").textContent = ref; $("#done-summary").innerHTML = lineItems() + (when ? `<li><span>${whenWord()} time</span><span>${when}</span></li>` : "") + (method === "delivery" ? `<li><span>Deliver to</span><span>${payForm.elements["demo-address"].value.trim().replace(/\s*\n\s*/g, ", ")}</span></li>` : ""); $("#done-total").textContent = gbp.format(grandTotal());
    $("#done-name").textContent = name.value.trim() ? `, ${name.value.trim().split(" ")[0]}` : "";
    order = {}; save(); renderOrder(); payForm.reset(); showView("done");
  }, reduce ? 300 : 1800);
});
$("#done-close").addEventListener("click", () => { closeOrder(); setTimeout(() => showView("list"), 700); });

/* ---------- scroll: progress, header, reveals, parallax, statement, spy ---------- */
const header = $(".site-header"), bar = $(".progress"), hero = $(".hero");
let ticking = false, lastY = 0;
const tabbar = $(".tabbar");
const small = matchMedia("(max-width: 800px)");
const scrubs = [$("#statement"), $(".quote .scrub")].filter(Boolean).map(el => {
  const parts = el.textContent.trim().split(/\s+/);
  el.setAttribute("aria-label", el.textContent.trim());
  el.innerHTML = parts.map(w => `<span class="w" aria-hidden="true">${w}</span>`).join(" ");
  return { el, words: $$(".w", el) };
});
const supportsScrollAnim = CSS.supports("animation-timeline: view()");
const pars = supportsScrollAnim || !finePointer ? [] : $$("[data-parallax]");

function onScroll() {
  const y = scrollY, vh = innerHeight, doc = document.documentElement.scrollHeight - vh;
  bar.style.transform = `scaleX(${doc > 0 ? y / doc : 0})`;
  header.classList.toggle("scrolled", y > 40);
  if (hero) header.classList.toggle("on-hero", y < hero.offsetHeight - header.offsetHeight);
  if (y > lastY + 6 && y > 240) tabbar.classList.add("away");
  else if (y < lastY - 6 || y < 240) tabbar.classList.remove("away");
  lastY = y;
  if (!reduce) {
    pars.forEach(img => {
      if (small.matches && img.closest(".hero")) return;
      const wrap = img.parentElement, r = wrap.getBoundingClientRect();
      if (r.bottom < -100 || r.top > vh + 100) return;
      const s = parseFloat(img.dataset.parallax);
      const off = img.closest(".hero") ? y * s : (r.top + r.height / 2 - vh / 2) * -s;
      img.style.transform = `translate3d(0, ${off.toFixed(1)}px, 0)`;
    });
  }
  scrubs.forEach(({ el, words }) => {
    const r = el.getBoundingClientRect();
    if (r.bottom < -50 || r.top > vh + 50) return;
    const prog = Math.min(1, Math.max(0, (vh * 0.8 - r.top) / (r.height + vh * 0.25)));
    const on = Math.round(prog * words.length);
    words.forEach((w, i) => w.classList.toggle("on", i < on));
  });
  ticking = false;
}
addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
addEventListener("resize", onScroll);

const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
$$("[data-reveal]").forEach(el => io.observe(el));

const spy = new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting) $$("[data-spy]").forEach(a => a.classList.toggle("active", a.dataset.spy === e.target.id));
}), { rootMargin: "-45% 0px -50% 0px" });
["cheese", "gifts", "about", "visit"].forEach(id => { const el = $("#" + id); if (el) spy.observe(el); });
if (hero) new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) $$("[data-spy]").forEach(a => a.classList.remove("active")); }), { threshold: 0.4 }).observe(hero);

/* ---------- magnetic buttons (desktop only) ---------- */
if (finePointer && !reduce) {
  $$(".btn").forEach(b => {
    b.addEventListener("pointermove", e => { const r = b.getBoundingClientRect(); b.style.transform = `translate(${((e.clientX - r.left) / r.width - .5) * 10}px, ${((e.clientY - r.top) / r.height - .5) * 8}px)`; });
    b.addEventListener("pointerleave", () => (b.style.transform = ""));
  });
}

/* ---------- headline words fade in one by one ---------- */
function splitWords(root, counter) {
  [...root.childNodes].forEach(n => {
    if (n.nodeType === 3) {
      const frag = document.createDocumentFragment();
      n.textContent.split(/(\s+)/).forEach(part => {
        if (!part) return;
        if (/^\s+$/.test(part)) { frag.append(" "); return; }
        const s = document.createElement("span"); s.className = "word"; s.setAttribute("aria-hidden", "true");
        s.style.setProperty("--wd", counter.i++); s.textContent = part; frag.append(s);
      });
      n.replaceWith(frag);
    } else if (n.nodeType === 1 && n.tagName !== "BR") splitWords(n, counter);
  });
}
$$(".section h2").forEach(h => { h.setAttribute("aria-label", h.textContent.replace(/\s+/g, " ").trim()); splitWords(h, { i: 0 }); });

/* ---------- go ---------- */
setWhenMin(); renderDetails(); renderHours(); setInterval(renderHours, 60000);
if (HOME) { renderFilters(); renderGrid(true); }
renderOrder();
onScroll();

/* ---------- scroll effects: GSAP + ScrollTrigger + Lenis (all self-hosted in assets/vendor) ---------- */
if (window.gsap && window.ScrollTrigger && window.Lenis && !reduce) {
  gsap.registerPlugin(ScrollTrigger);
  html.classList.add("gsap");

  // inertia scrolling, kept in step with ScrollTrigger
  lenis = new Lenis({ lerp: 0.16, wheelMultiplier: 1.15, smoothWheel: true });
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add(t => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);

  // in-page links glide instead of jumping
  document.addEventListener("click", e => {
    const a = e.target.closest('a[href^="#"]'); if (!a) return;
    const id = a.getAttribute("href"); if (id.length < 2) return;
    const target = $(id); if (!target) return;
    e.preventDefault();
    lenis.scrollTo(id === "#top" ? 0 : target, { offset: id === "#top" ? 0 : -(header.offsetHeight - 1), duration: 1.05, easing: x => 1 - Math.pow(1 - x, 4) });
  });

  const mm = gsap.matchMedia();

  // wide photos open up from inset frames as they arrive
  $$(".band").forEach(b => gsap.fromTo(b,
    { clipPath: "inset(9% 6% 9% 6% round 14px)" },
    { clipPath: "inset(0% 0% 0% 0% round 0px)", ease: "none", scrollTrigger: { trigger: b, start: "top 92%", end: "top 24%", scrub: true } }));

  // the ticker speeds up with your scroll, and reverses when you scroll back up
  const ticker = $(".marquee-track");
  if (ticker) {
    const loop = gsap.to(ticker, { xPercent: -50, ease: "none", duration: 38, repeat: -1 });
    ScrollTrigger.create({ start: 0, end: "max", onUpdate: self => {
      const dir = self.direction || 1;
      gsap.timeline()
        .to(loop, { timeScale: dir * (1 + Math.min(Math.abs(self.getVelocity()) / 220, 7)), duration: 0.2, overwrite: true })
        .to(loop, { timeScale: dir, duration: 1.2 });
    } });
  }

  addEventListener("load", () => ScrollTrigger.refresh());
}

/* ---------- opening-news form (demo: nothing is sent or stored) ---------- */
(() => {
  const f = $("#news-form"), msg = $("#news-msg"); if (!f) return;
  f.addEventListener("submit", e => {
    e.preventDefault();
    const v = $("#news-email").value.trim();
    msg.classList.remove("ok");
    if (!/^\S+@\S+\.\S+$/.test(v)) { msg.textContent = "Please enter a valid email address."; return; }
    msg.textContent = "Thank you. We will write when the doors open. (Demo: nothing was saved.)"; msg.classList.add("ok"); f.reset();
  });
})();

/* ---------- "Simply served": hover or tap a row to change the photograph ---------- */
(() => {
  const items = $$(".serve-item"), imgs = $$(".serve-media img"); if (!items.length) return;
  const set = i => { items.forEach((it, n) => it.classList.toggle("is-active", n === i)); imgs.forEach((im, n) => im.classList.toggle("is-on", n === i)); };
  items.forEach((it, i) => {
    it.addEventListener("mouseenter", () => { if (finePointer) set(i); });
    it.addEventListener("focus", () => set(i));
    it.addEventListener("click", () => set(i));
  });
})();

/* ---------- opening countdown line ---------- */
(() => {
  const els = $$("[data-countdown]"); if (!els.length) return;
  if (!SHOP.openingSoon) { els.forEach(e => (e.hidden = true)); return; }
  const start = new Date(SHOP.countdownStart).getTime(), end = new Date(SHOP.openingDate).getTime(), now = Date.now();
  const left = Math.max(0, Math.ceil((end - now) / 86400000));
  const pct = Math.min(1, Math.max(0.02, (now - start) / (end - start)));
  els.forEach(e => {
    $("[data-cd-days]", e).textContent = left > 1 ? `${left} days to go` : left === 1 ? "1 day to go" : "Opening now";
    e.style.setProperty("--p", pct);
    new IntersectionObserver((es, ob) => es.forEach(x => { if (x.isIntersecting) { e.classList.add("go"); ob.disconnect(); } }), { threshold: 0.4 }).observe(e);
  });
})();

/* ---------- fade between pages ---------- */
document.addEventListener("click", e => {
  const a = e.target.closest("a[href]");
  if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button) return;
  if (a.target && a.target !== "_self") return;
  const u = new URL(a.href, location.href);
  if (u.origin !== location.origin || !/\.html$|\/$/.test(u.pathname)) return;
  if (u.pathname === location.pathname && u.hash) return;     // same page: normal anchor
  if (reduce) return;
  e.preventDefault();
  try { sessionStorage.setItem("ff-nav", "1"); } catch (err) {}
  html.classList.add("leaving");
  setTimeout(() => (location.href = u.href), 260);
});
addEventListener("pageshow", ev => { if (ev.persisted) html.classList.remove("leaving"); });
