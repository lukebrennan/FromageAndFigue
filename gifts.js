/* ------------------------------------------------------------------
   Boards & gifts page. Items live in GIFTS (script.js); the wording shown here is below.
------------------------------------------------------------------ */
const INFO_FALLBACK = {
  "board-petite": { serves: "Serves 2 to 4", includes: ["Three cheeses", "Bread and crackers", "A preserve", "On a wooden board"] },
  "board-classic": { serves: "Serves 4 to 8", includes: ["Five cheeses", "Bread, crackers and nuts", "A preserve and honey", "On a wooden board"], flag: "Most popular" },
  "board-grand": { serves: "Serves 8 to 12", includes: ["Seven cheeses", "Bread, fruit and nuts", "Preserves and honey", "On a large wooden board"] },
  "box-tasting": { serves: "A gift for one or two", includes: ["Three cheeses, 100g each", "Crackers", "A small preserve", "Ribbon and handwritten card"] },
  "box-evening": { serves: "A gift for two to four", includes: ["Four cheeses", "Fresh bread", "Honey and a preserve", "Ribbon and handwritten card"], flag: "Most popular" },
  "box-hamper": { serves: "A generous gift", includes: ["Six cheeses", "Bread, crackers and nuts", "Preserves and honey", "Ribbon and handwritten card"] },
};
const INFO = CAT ? CAT.info : INFO_FALLBACK;
/* Sections: the page has fixed blocks for boards, boxes and vouchers. Headings and intros come from the
   categories (editable in the admin). Any other gifts category gets its own section before "Something special". */
const SECTIONS = CAT ? CAT.sections : null;
const BUILT = { board: "#boards", box: "#boxes", voucher: "#vouchers" };
const hx = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])).replace(/\*(.+?)\*/g, "<em>$1</em>");
if (SECTIONS) {
  Object.entries(BUILT).forEach(([id, sel]) => {
    const sec = $(sel), c = SECTIONS.find(x => x.id === id);
    if (!sec) return;
    if (!c) { sec.remove(); $$(`.jump a[href="${sel}"]`).forEach(a => a.parentElement.remove()); return; }
    if (c.title) $("h2", sec).innerHTML = hx(c.title);
    if (c.intro) $(".section-intro", sec).textContent = c.intro;
    $$(`.jump a[href="${sel}"]`).forEach(a => (a.textContent = c.name));
  });
  const custom = $("#custom"), jump = $(".jump a[href='#custom']");
  SECTIONS.filter(c => !BUILT[c.id]).forEach((c, n) => {
    const sec = document.createElement("section");
    sec.id = c.id; sec.className = "g-section" + (n % 2 ? "" : " sand");
    sec.innerHTML = `<div class="wrap"><div class="g-head" data-reveal><p class="eyebrow dark"><span>${hx(c.name)}</span></p><h2>${hx(c.title || c.name)}</h2>${c.intro ? `<p class="section-intro">${hx(c.intro)}</p>` : ""}</div><div class="g-list" data-kind="${hx(c.id)}"></div></div>`;
    custom.before(sec); $$("[data-reveal]", sec).forEach(el => io.observe(el));
    if (jump) { const li = document.createElement("li"); li.innerHTML = `<a href="#${hx(c.id)}">${hx(c.name)}</a>`; jump.parentElement.before(li); }
  });
}
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
