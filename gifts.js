/* ------------------------------------------------------------------
   Boards & gifts page. Items live in GIFTS (script.js); the wording shown here is below.
------------------------------------------------------------------ */
const INFO = {
  "board-petite": { serves: "Serves 2 to 4", includes: ["Three cheeses", "Bread and crackers", "A preserve", "On a wooden board"] },
  "board-classic": { serves: "Serves 4 to 8", includes: ["Five cheeses", "Bread, crackers and nuts", "A preserve and honey", "On a wooden board"], flag: "Most popular" },
  "board-grand": { serves: "Serves 8 to 12", includes: ["Seven cheeses", "Bread, fruit and nuts", "Preserves and honey", "On a large wooden board"] },
  "box-tasting": { serves: "A gift for one or two", includes: ["Three cheeses, 100g each", "Crackers", "A small preserve", "Ribbon and handwritten card"] },
  "box-evening": { serves: "A gift for two to four", includes: ["Four cheeses", "Fresh bread", "Honey and a preserve", "Ribbon and handwritten card"], flag: "Most popular" },
  "box-hamper": { serves: "A generous gift", includes: ["Six cheeses", "Bread, crackers and nuts", "Preserves and honey", "Ribbon and handwritten card"] },
};
const g = $$(".g-list");
const itemHTML = p => {
  const i = INFO[p.id] || {};
  return `<article class="g-card" data-reveal>
    ${i.flag ? `<span class="g-flag">${i.flag}</span>` : ""}
    <div class="g-img"><img loading="lazy" src="${imgSrc(p)}" alt="${p.name}" width="800" height="1000"></div>
    <div class="g-body">
      <h3>${p.name}</h3>
      <p class="g-serves">${i.serves || p.note}</p>
      <ul>${(i.includes || []).map(x => `<li>${x}</li>`).join("")}</ul>
      <div class="g-buy"><span class="g-price">${p.price.split("/")[0].trim()}</span><button class="btn btn-gold" type="button" data-add="${p.id}">Add to order list</button></div>
    </div>
  </article>`;
};
const voucherHTML = p => `<div class="g-voucher" data-reveal><span class="g-price">${p.price.split("/")[0].trim()}</span><button class="btn btn-dark" type="button" data-add="${p.id}">Add to order list</button></div>`;
g.forEach(box => {
  const kind = box.dataset.kind, items = GIFTS.filter(p => p.type === kind);
  box.innerHTML = items.map((p, n) => (kind === "voucher" ? voucherHTML(p) : itemHTML(p))).join("");
  $$("[data-reveal]", box).forEach((el, n) => { el.style.setProperty("--d", `${n * 0.1}s`); io.observe(el); });
});
document.addEventListener("click", e => {
  const b = e.target.closest("[data-add]"); if (!b || !b.closest(".g-list")) return;
  addToOrder(b.dataset.add);
  b.classList.add("added"); const t = b.textContent; b.textContent = "Added"; setTimeout(() => { b.classList.remove("added"); b.textContent = t; }, 1400);
});
$$(".hero-in").forEach(el => el.classList.add("go"));
