/* ------------------------------------------------------------------
   The Collection page. Uses PRODUCTS, the order list and helpers from script.js.
   Edit the DETAILS block to change the text and photographs for each product.
   images: extra photographs, files in assets/ (a -800 version must exist too).
------------------------------------------------------------------ */
const DETAILS = {
  brie: {
    origin: "Ile-de-France", milk: "Cow's milk", age: "5 to 8 weeks", texture: "Soft, bloomy rind", intensity: 2,
    notes: ["Mushroom", "Fresh cream", "Hazelnut"],
    story: "The king of cheeses, made on the plains east of Paris for centuries. A thin, velvety white rind gives way to a pale, supple paste that turns glossy and rich as it ripens.",
    drink: "Champagne, or a crisp Chablis", with: "Warm baguette, pears, walnuts",
    serve: "Take it out of the fridge an hour before serving. Cut wedges from the centre so every slice has rind and paste.",
    keep: "Seven to ten days in its paper, in the coolest part of the fridge.",
    images: ["counter", "board"],
  },
  reblochon: {
    origin: "Savoie", milk: "Cow's milk", age: "5 to 8 weeks", texture: "Soft, washed rind", intensity: 3,
    notes: ["Toasted nuts", "Cream", "Gentle fruit"],
    story: "A mountain cheese from the Alps, rubbed with brine as it ages. The golden rind is mild and the paste is supple, with a sweetness the Savoyards guard jealously.",
    drink: "Dry white from Savoie, or a light red", with: "New potatoes, cured ham, crusty bread",
    serve: "Wonderful at room temperature, and the heart of a classic tartiflette when you want something hot.",
    keep: "Five to seven days. Eat the rind if you like it, or leave it.",
    images: ["lunch", "tasting"],
  },
  comte: {
    origin: "Jura", milk: "Raw cow's milk", age: "24 months", texture: "Firm, with fine crystals", intensity: 3,
    notes: ["Caramel", "Roasted nuts", "Brown butter"],
    story: "Made in village cooperatives in the Jura mountains from the milk of a single herd. Twenty-four months in the cellar gives a deep amber paste and the crunchy crystals that Comte lovers look for.",
    drink: "Vin jaune, or a rich white Burgundy", with: "Walnut bread, apple, dried apricot",
    serve: "Cut thin slices and let them warm for a few minutes. Shave over soup or eggs for a savoury finish.",
    keep: "Two to three weeks, wrapped and kept in the fridge.",
    images: ["board", "counter"],
  },
  roquefort: {
    origin: "Aveyron", milk: "Sheep's milk", age: "At least 3 months", texture: "Creamy, veined blue", intensity: 5,
    notes: ["Salt", "Cream", "Peppery spice"],
    story: "Ripened in the natural limestone caves of Combalou, where cool damp air carries the blue mould through the curd. Bold, salty and surprisingly creamy.",
    drink: "Sauternes, or a sweet Muscat", with: "Honey, walnuts, dark rye bread",
    serve: "Crumble over a salad, melt into a sauce, or serve alone with something sweet to meet the salt.",
    keep: "One to two weeks. Wrap it well, as its aroma carries.",
    images: ["tasting", "board"],
  },
  goat: {
    origin: "Loire Valley", milk: "Goat's milk", age: "A few days", texture: "Fresh and soft", intensity: 1,
    notes: ["Lemon", "Fresh cream", "Grass"],
    story: "A fresh goat cheese with a soft, fine curd and a clean, bright tang. It is at its best in the days after it is made.",
    drink: "Sancerre, or a dry cider", with: "Warm bread, olive oil, fresh herbs",
    serve: "Spread on warm toast with a little olive oil and black pepper, or crumble over roast vegetables.",
    keep: "Four to five days in the fridge. Eat it soon.",
    images: ["lunch", "counter"],
  },
  manchego: {
    origin: "La Mancha, Spain", milk: "Sheep's milk", age: "6 months", texture: "Firm and buttery", intensity: 3,
    notes: ["Toasted almond", "Butter", "Sweet grass"],
    story: "Made from the milk of Manchega sheep on the high plains of central Spain. The pale, buttery paste carries a gentle nuttiness and a clean, lingering finish.",
    drink: "Dry sherry, or a young Rioja", with: "Quince paste, almonds, cured chorizo",
    serve: "Cut in thin wedges and serve at room temperature with something sweet beside it.",
    keep: "Three to four weeks wrapped in the fridge.",
    images: ["board", "shelves"],
  },
  gorgonzola: {
    origin: "Lombardy, Italy", milk: "Cow's milk", age: "About 2 months", texture: "Soft, creamy blue", intensity: 3,
    notes: ["Cream", "Sweet and tangy", "Mild blue"],
    story: "The mild, young style of Gorgonzola. Soft enough to spoon, with a gentle blue note and a sweet, milky finish that wins over people who think they do not like blue cheese.",
    drink: "Moscato d'Asti, or a light red", with: "Pears, toasted bread, honey",
    serve: "Spread on warm bread, stir into risotto at the end, or serve with ripe pear.",
    keep: "One to two weeks, wrapped in the fridge.",
    images: ["tasting", "counter"],
  },
  camembert: {
    origin: "Normandy", milk: "Cow's milk", age: "3 to 4 weeks", texture: "Soft, bloomy rind", intensity: 3,
    notes: ["Earthy", "Buttery", "Mushroom"],
    story: "Rich and earthy, with a rind that sets it apart from its cousin Brie. The centre melts as it ripens. A natural for baking whole.",
    drink: "Normandy cider, or a light red", with: "Warm baguette, rosemary, honey",
    serve: "Score the top, tuck in rosemary and a thread of honey, and bake for about twenty minutes until molten.",
    keep: "One week. Bring to room temperature before serving.",
    images: ["camembert", "lunch"],
  },
  bread: {
    origin: "Baked daily", milk: "Contains gluten, walnuts", age: "Fresh each day", texture: "Crusty, with a soft crumb", intensity: 1,
    notes: ["Toasted walnut", "Wheat", "Sourdough tang"],
    story: "A loaf studded with walnuts, baked fresh every morning. The nuts and the gentle sourness make it the partner that blue cheese was waiting for.",
    drink: "Anything you are serving with the cheese", with: "Roquefort, Gorgonzola, honey",
    serve: "Slice it thick and toast it lightly just before serving.",
    keep: "Best on the day. Freezes well sliced.",
    images: ["lunch", "shelves"],
  },
  pantry: {
    origin: "Small producers", milk: "Contains nuts, gluten", age: "Long shelf life", texture: "Crisp, crunchy, sweet", intensity: 1,
    notes: ["Crisp", "Nutty", "Sweet and savoury"],
    story: "Preserves, crackers and nuts from small makers, chosen because they make a good cheese better. The selection changes with the seasons.",
    drink: "Ask us, we will find one that suits", with: "Any cheese in the collection",
    serve: "Put a spoonful of preserve beside each cheese, and a few crackers for the table.",
    keep: "Months, unopened. Keep jars in the fridge once open.",
    images: ["shelves", "giftbox"],
  },
  figs: {
    origin: "Seasonal", milk: "Fruit, picked ripe", age: "In season", texture: "Soft and juicy", intensity: 1,
    notes: ["Honey", "Berry", "Soft sweetness"],
    story: "Ripe figs, picked at the right moment and boxed with care. They are the classic partner for almost every cheese on the counter.",
    drink: "A glass of something sparkling", with: "Soft cheeses, blue cheese, ham",
    serve: "Halve and serve alongside the cheese, or roast for ten minutes with a little honey.",
    keep: "Two to three days. Eat them soon.",
    images: ["board", "tasting"],
  },
  jam: {
    origin: "Small batch", milk: "Fruit and sugar", age: "Shelf stable", texture: "Thick and glossy", intensity: 1,
    notes: ["Dark fruit", "Honey", "Vanilla"],
    story: "Slowly cooked in small batches so the fruit keeps its character. A spoonful beside a hard or soft cheese is all it needs.",
    drink: "A sweet or sparkling wine", with: "Comte, Brie, goat cheese",
    serve: "Spoon alongside, or warm a little and spoon over baked cheese.",
    keep: "Months, unopened. Keep in the fridge once open.",
    images: ["shelves", "giftbox"],
  },
};

const sortFns = {
  featured: () => 0,
  name: (a, b) => a.name.localeCompare(b.name),
  low: (a, b) => unitPrice(a) - unitPrice(b),
  high: (a, b) => unitPrice(b) - unitPrice(a),
};
const gridEl = $("#grid"), emptyEl = $("#empty"), countEl = $("#count"), barEl = $("#cat-bar");
let f = "all", q = "", sortKey = "featured", openId = null;
const unitOf = p => { const m = p.price.split("/")[1]; return m ? m.trim() : "item"; };
const list = () => {
  const t = q.trim().toLowerCase();
  return PRODUCTS
    .map((p, i) => ({ p, i }))
    .filter(({ p }) => (f === "all" || p.type === f) && (!t || `${p.name} ${p.note} ${p.type} ${(DETAILS[p.id] || {}).origin || ""} ${(DETAILS[p.id] || {}).notes || ""}`.toLowerCase().includes(t)))
    .sort((a, b) => sortFns[sortKey](a.p, b.p) || a.i - b.i)
    .map(x => x.p);
};
const cols = () => (getComputedStyle(gridEl).gridTemplateColumns.split(" ").length || 1);

function drawFilters() {
  $("#filters").innerHTML = TYPES.map(([k, label]) => {
    const n = k === "all" ? PRODUCTS.length : PRODUCTS.filter(p => p.type === k).length;
    return `<button class="filter${k === f ? " active" : ""}" type="button" data-filter="${k}" aria-pressed="${k === f}">${label}<small>${n}</small></button>`;
  }).join("");
}

function cardHTML(p, i, c, initial) {
  return `<li class="card${initial ? " pre" : ""}" data-id="${p.id}" style="--c:${i % c};view-transition-name:card-${p.id}">
    <button class="quick-add" type="button" data-add="${p.id}" aria-label="Add ${p.name} to your order list">+</button>
    <button class="card-btn" type="button" data-open="${p.id}" aria-expanded="false" aria-controls="detail-${p.id}" aria-label="${p.name}, view details">
      <div class="thumb"><img loading="lazy" src="${imgSrc(p)}" alt="${p.name}" width="800" height="800"></div>
      <div class="card-body">
        <div class="card-top"><span class="tag">${p.type}</span><span class="price">${p.price}</span></div>
        <h3>${p.name}</h3>
        <p>${p.note}</p>
      </div>
    </button>
  </li>`;
}

function draw(initial = false) {
  const items = list(), c = cols();
  closeDetail(true);
  gridEl.innerHTML = items.map((p, i) => cardHTML(p, i, c, initial)).join("");
  emptyEl.hidden = items.length > 0;
  countEl.textContent = items.length === PRODUCTS.length ? `${items.length} items` : `${items.length} of ${PRODUCTS.length} items`;
  if (initial) $$(".card", gridEl).forEach(el => io.observe(el));
}
function redraw() {
  if (!reduce && document.startViewTransition) document.startViewTransition(() => draw(false));
  else draw(false);
}

/* ---------- the expanding detail panel ---------- */
function detailHTML(p, items) {
  const d = DETAILS[p.id] || {};
  const unit = unitOf(p), gallery = [`assets/products/${p.img}.webp`, ...(d.images || []).map(k => `assets/${k}-800.webp`)];
  const idx = items.findIndex(x => x.id === p.id);
  const prev = items[(idx - 1 + items.length) % items.length], next = items[(idx + 1) % items.length];
  const related = items.filter(x => x.type === p.type && x.id !== p.id).slice(0, 3);
  const bars = Array.from({ length: 5 }, (_, n) => `<i${n < (d.intensity || 1) ? ' class="on"' : ""}></i>`).join("");
  return `
    <div class="d-inner">
      <button class="d-close" type="button" data-close aria-label="Close details">&times;</button>
      <div class="d-gallery">
        <div class="d-main">${gallery.map((src, n) => `<img src="${src}" alt="${n === 0 ? p.name : p.name + ", view " + (n + 1)}" width="800" height="800"${n === 0 ? ' class="is-on"' : ' loading="lazy"'}>`).join("")}</div>
        <div class="d-thumbs" role="tablist" aria-label="Photographs of ${p.name}">
          ${gallery.map((src, n) => `<button type="button" role="tab" aria-selected="${n === 0}" aria-label="Photograph ${n + 1}" data-img="${n}"${n === 0 ? ' class="on"' : ""}><img src="${src}" alt="" width="160" height="160" loading="lazy"></button>`).join("")}
        </div>
      </div>
      <div class="d-info">
        <p class="eyebrow dark"><span>${cap(p.type)}</span></p>
        <h2>${p.name}</h2>
        <p class="d-price">${p.price}</p>
        <p class="d-story">${d.story || p.note}</p>
        <dl class="d-specs">
          <div><dt>Origin</dt><dd>${d.origin || ""}</dd></div>
          <div><dt>Milk</dt><dd>${d.milk || ""}</dd></div>
          <div><dt>Age</dt><dd>${d.age || ""}</dd></div>
          <div><dt>Texture</dt><dd>${d.texture || ""}</dd></div>
        </dl>
        <div class="d-intensity"><span>Mild</span><div class="bars" role="img" aria-label="Intensity ${d.intensity || 1} out of 5">${bars}</div><span>Bold</span></div>
        <div class="d-block"><h3>Tasting notes</h3><p class="d-notes">${(d.notes || []).join(" &middot; ")}</p></div>
        <div class="d-two">
          <div class="d-block"><h3>Drink with</h3><p>${d.drink || ""}</p></div>
          <div class="d-block"><h3>Serve with</h3><p>${d.with || ""}</p></div>
        </div>
        <div class="d-block"><h3>How to serve</h3><p>${d.serve || ""}</p></div>
        <div class="d-block"><h3>Keeping</h3><p>${d.keep || ""}</p></div>
        <div class="d-buy">
          <div class="qty" aria-label="Quantity"><button type="button" data-q="-1" aria-label="Fewer">&minus;</button><b id="d-qty">1</b><button type="button" data-q="1" aria-label="More">+</button></div>
          <span class="d-unit">x ${unit}</span>
          <button class="btn btn-gold" type="button" data-add-detail="${p.id}">Add to order list</button>
        </div>
        <p class="d-ship">Free collection from store. Delivery &pound;4.99, free over &pound;60.</p>
        ${related.length ? `<div class="d-block d-related"><h3>Also in ${p.type === "pantry" ? "the pantry" : p.type}</h3><p>${related.map(r => `<button type="button" data-open="${r.id}">${r.name}</button>`).join("")}</p></div>` : ""}
        <div class="d-nav"><button type="button" data-open="${prev.id}"><span aria-hidden="true">&larr;</span> ${prev.name}</button><button type="button" data-open="${next.id}">${next.name} <span aria-hidden="true">&rarr;</span></button></div>
      </div>
    </div>`;
}

let detailEl = null;
function placeAfter(cardEl, items) {
  const c = cols(), cards = $$(".card", gridEl), i = cards.indexOf(cardEl);
  const end = Math.min(cards.length - 1, (Math.floor(i / c) + 1) * c - 1);
  cards[end].after(detailEl);
}
function scrollToCard(cardEl) {
  const y = cardEl.getBoundingClientRect().top + scrollY - (header.offsetHeight + barEl.offsetHeight + 16);
  if (lenis) lenis.scrollTo(y, { duration: 1.1, easing: x => 1 - Math.pow(1 - x, 4) });
  else window.scrollTo({ top: y, behavior: reduce ? "auto" : "smooth" });
}
function openDetail(id, fromHash) {
  const items = list(), p = byId[id]; if (!p) return;
  let cardEl = $(`.card[data-id="${id}"]`, gridEl);
  if (!cardEl) { f = "all"; q = ""; $("#search").value = ""; drawFilters(); draw(false); cardEl = $(`.card[data-id="${id}"]`, gridEl); }
  const same = openId === id; if (same) return;
  const wasOpen = !!detailEl;
  if (wasOpen) closeDetail(true);
  const live = list();
  detailEl = document.createElement("li");
  detailEl.className = "detail"; detailEl.id = `detail-${id}`; detailEl.dataset.id = id;
  detailEl.setAttribute("role", "region"); detailEl.setAttribute("aria-label", `${p.name} details`);
  detailEl.innerHTML = `<div class="d-wrap">${detailHTML(p, live)}</div>`;
  placeAfter(cardEl, live);
  openId = id;
  $$(".card", gridEl).forEach(c => { const on = c.dataset.id === id; c.classList.toggle("is-open", on); $(".card-btn", c).setAttribute("aria-expanded", on); });
  requestAnimationFrame(() => requestAnimationFrame(() => { detailEl.classList.add("open"); }));
  setTimeout(() => scrollToCard(cardEl), wasOpen ? 60 : 120);
  if (!fromHash) { try { history.replaceState(null, "", `#${id}`); } catch (e) {} }
  if (lenis) setTimeout(() => lenis.resize && lenis.resize(), 900);
}
function closeDetail(instant) {
  if (!detailEl) return;
  const el = detailEl, id = openId;
  detailEl = null; openId = null;
  $$(".card.is-open", gridEl).forEach(c => { c.classList.remove("is-open"); $(".card-btn", c).setAttribute("aria-expanded", "false"); });
  if (instant || reduce) el.remove(); else { el.classList.remove("open"); setTimeout(() => el.remove(), 700); }
  try { if (location.hash) history.replaceState(null, "", location.pathname + location.search); } catch (e) {}
  const cardEl = $(`.card[data-id="${id}"]`, gridEl);
  return cardEl;
}

/* ---------- events ---------- */
$("#filters").addEventListener("click", e => { const b = e.target.closest("[data-filter]"); if (!b) return; f = b.dataset.filter; drawFilters(); redraw(); });
let stT; $("#search").addEventListener("input", e => { q = e.target.value; clearTimeout(stT); stT = setTimeout(redraw, 140); });
$("#sort").addEventListener("change", e => { sortKey = e.target.value; redraw(); });

gridEl.addEventListener("click", e => {
  const add = e.target.closest("[data-add]"); if (add) { addToOrder(add.dataset.add); return; }
  const addD = e.target.closest("[data-add-detail]");
  if (addD) {
    const n = parseInt($("#d-qty").textContent, 10) || 1, id = addD.dataset.addDetail;
    order[id] = (order[id] || 0) + n; save(); renderOrder(true);
    toast(`${n} x ${byId[id].name} added to your list`); return;
  }
  const qb = e.target.closest("[data-q]");
  if (qb) { const el = $("#d-qty"); el.textContent = Math.min(20, Math.max(1, (parseInt(el.textContent, 10) || 1) + parseInt(qb.dataset.q, 10))); return; }
  const th = e.target.closest("[data-img]");
  if (th) {
    const n = +th.dataset.img, d = th.closest(".d-gallery");
    $$(".d-main img", d).forEach((im, i) => im.classList.toggle("is-on", i === n));
    $$(".d-thumbs button", d).forEach((b, i) => { b.classList.toggle("on", i === n); b.setAttribute("aria-selected", i === n); });
    return;
  }
  if (e.target.closest("[data-close]")) { const c = closeDetail(); if (c) $(".card-btn", c).focus({ preventScroll: true }); return; }
  const open = e.target.closest("[data-open]");
  if (open) { const id = open.dataset.open; if (id === openId) { closeDetail(); } else openDetail(id); }
});
addEventListener("keydown", e => {
  if (!openId || document.body.classList.contains("locked")) return;
  if (e.key === "Escape") { const c = closeDetail(); if (c) $(".card-btn", c).focus({ preventScroll: true }); }
  else if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
    if (/input|select|textarea/i.test(document.activeElement.tagName)) return;
    const items = list(), i = items.findIndex(x => x.id === openId), n = items[(i + (e.key === "ArrowRight" ? 1 : items.length - 1)) % items.length];
    if (n) openDetail(n.id);
  }
});
let rz, lastCols = cols();
addEventListener("resize", () => { clearTimeout(rz); rz = setTimeout(() => { const c = cols(); if (c !== lastCols && detailEl) { const cardEl = $(`.card[data-id="${openId}"]`, gridEl); if (cardEl) placeAfter(cardEl); } lastCols = c; }, 160); });

/* ---------- go ---------- */
drawFilters(); draw(true);
$$(".hero-in").forEach(el => el.classList.add("go"));
requestAnimationFrame(() => document.documentElement.classList.contains("ready") && $$(".hero-in").forEach(el => el.classList.add("go")));
{
  const id = decodeURIComponent((location.hash || "").slice(1));
  if (id && byId[id]) setTimeout(() => openDetail(id, true), 700);
}
