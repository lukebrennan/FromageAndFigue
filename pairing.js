/* ------------------------------------------------------------------
   Pairing page. Cheeses come from the live catalogue (PRODUCTS in script.js);
   the pairings below are written for each cheese by its id.
   Wine links go to Wikipedia, recipe links to a BBC Good Food search.
------------------------------------------------------------------ */
const WIKI = p => `https://en.wikipedia.org/wiki/${p}`;
const RECIPE = q => `https://www.bbcgoodfood.com/search?q=${encodeURIComponent(q)}`;
const PAIRINGS = {
  brie: {
    tip: "Cut wedges from the centre so every slice has rind and paste, and serve it an hour out of the fridge. Pour the Champagne a little colder than you think.",
    wines: [
      { n: "Brut Champagne", t: "Fine bubbles lift the cream and clean the palate", u: WIKI("Champagne") },
      { n: "Chablis", t: "Chalky, mineral Chardonnay from northern Burgundy", u: WIKI("Chablis_wine") },
      { n: "Normandy cider", t: "Apple and a little funk, a natural neighbour", u: WIKI("Cider") },
    ],
    dishes: [
      { n: "Baked brie with honey and walnuts", t: "Ten minutes in the oven, then dip", u: RECIPE("baked brie") },
      { n: "Brie and ham baguette", t: "The simplest lunch in France", u: RECIPE("brie baguette") },
    ],
    board: ["Walnuts", "Sliced pear", "Honey", "Warm baguette"],
  },
  reblochon: {
    tip: "Warm it gently and it turns silky without splitting. The rind is washed, so it is a little stronger than it looks. Eat it, or leave it.",
    wines: [
      { n: "Roussette de Savoie", t: "A floral white from the cheese's own mountains", u: WIKI("Savoie_(wine)") },
      { n: "Alsace Riesling", t: "Dry, bright and sharp enough to cut the richness", u: WIKI("Riesling") },
      { n: "Light Pinot Noir", t: "Soft red fruit that never overpowers", u: WIKI("Pinot_noir") },
    ],
    dishes: [
      { n: "Tartiflette", t: "Potatoes, lardons, onion and a whole melted Reblochon", u: RECIPE("tartiflette") },
      { n: "Potato gratin", t: "Layer thin slices and let the cheese melt through", u: RECIPE("potato gratin") },
    ],
    board: ["New potatoes", "Cornichons", "Cured ham", "Crusty bread"],
  },
  comte: {
    tip: "Cut thin and let the slices warm for a few minutes, then the caramel and brown butter come forward. Shave it over soup or eggs for a savoury finish.",
    wines: [
      { n: "Vin jaune", t: "The classic partner, nutty and deeply savoury, from the Jura", u: WIKI("Vin_jaune") },
      { n: "White Burgundy", t: "Rich Chardonnay with a little oak", u: WIKI("Chardonnay") },
      { n: "Amontillado sherry", t: "Roasted nuts meet roasted nuts", u: WIKI("Amontillado") },
    ],
    dishes: [
      { n: "French onion soup", t: "Toasted bread and a thick, golden Comté crust", u: RECIPE("french onion soup") },
      { n: "Croque monsieur", t: "Ham, béchamel and plenty of grated Comté", u: RECIPE("croque monsieur") },
      { n: "Cheese gougères", t: "Light choux puffs for the first glass", u: RECIPE("gougères") },
    ],
    board: ["Apple slices", "Walnut bread", "Dried apricot", "Cured ham"],
  },
  roquefort: {
    tip: "Salt wants sweetness. Drizzle a little honey over it and let it sit for a minute before you taste. Keep the cheese at room temperature so it stays creamy.",
    wines: [
      { n: "Sauternes", t: "Honeyed and luscious, the great Roquefort match", u: WIKI("Sauternes_(wine)") },
      { n: "Tawny Port", t: "Dried fruit and caramel against the blue", u: WIKI("Tawny_port") },
      { n: "Gewürztraminer", t: "Perfumed and slightly sweet", u: WIKI("Gew%C3%BCrztraminer") },
    ],
    dishes: [
      { n: "Roquefort, pear and walnut salad", t: "Bitter leaves, sweet pear, a sharp dressing", u: RECIPE("roquefort pear walnut salad") },
      { n: "Steak with blue cheese sauce", t: "Stir a spoonful into the pan juices", u: RECIPE("steak blue cheese sauce") },
    ],
    board: ["Honey", "Walnuts", "Ripe pear", "Fruit loaf"],
  },
  goat: {
    tip: "Young goat's cheese loves acidity and fresh herbs. A little olive oil and black pepper is all it needs. Serve it cool, not cold.",
    wines: [
      { n: "Sancerre", t: "Grassy, zesty Sauvignon from the Loire, the local favourite", u: WIKI("Sancerre_AOC") },
      { n: "Sauvignon Blanc", t: "Citrus and green herbs echo the tang", u: WIKI("Sauvignon_blanc") },
      { n: "Dry rosé", t: "Summer fruit and a clean finish", u: WIKI("Ros%C3%A9_wine") },
    ],
    dishes: [
      { n: "Warm goat's cheese salad", t: "Grilled rounds on toast over dressed leaves", u: RECIPE("goat's cheese salad") },
      { n: "Beetroot and goat's cheese tart", t: "Earthy, sweet and tangy together", u: RECIPE("beetroot goat's cheese tart") },
    ],
    board: ["Olive oil", "Honey", "Fresh thyme", "Warm bread"],
  },
  manchego: {
    tip: "Cut it in thin triangles and add quince paste. The sweetness softens the salt and brings out the sheep's milk. Serve it at room temperature.",
    wines: [
      { n: "Dry sherry", t: "Salty, nutty and bone dry, the Spanish way", u: WIKI("Sherry") },
      { n: "Rioja", t: "Smooth, spiced Tempranillo", u: WIKI("Rioja_(wine)") },
      { n: "Cava", t: "Crisp bubbles for a lighter touch", u: WIKI("Cava") },
    ],
    dishes: [
      { n: "A tapas spread", t: "Manchego, olives, jamón and good bread", u: RECIPE("tapas") },
      { n: "Spanish tortilla", t: "Serve with a few shavings alongside", u: RECIPE("spanish tortilla") },
    ],
    board: ["Quince paste", "Marcona almonds", "Chorizo", "Green olives"],
  },
  gorgonzola: {
    tip: "Dolce is gentle and spoonable, so treat it as a spread. Fold it through warm pasta or gnocchi, or serve it on toast with a pear.",
    wines: [
      { n: "Moscato d'Asti", t: "Lightly sweet, softly sparkling", u: WIKI("Moscato_d%27Asti") },
      { n: "Barolo", t: "Powerful Italian red for a bolder match", u: WIKI("Barolo_DOCG") },
      { n: "Passito", t: "Sweet wine from dried grapes", u: WIKI("Passito") },
    ],
    dishes: [
      { n: "Gorgonzola gnocchi", t: "A quick, creamy sauce with walnuts", u: RECIPE("gorgonzola gnocchi") },
      { n: "Pear and gorgonzola pizza", t: "Sweet, salty and a little bitter", u: RECIPE("pear gorgonzola pizza") },
    ],
    board: ["Ripe pear", "Toasted bread", "Honey", "Walnuts"],
  },
  camembert: {
    tip: "Pierce the top, tuck in garlic and a sprig of rosemary, and bake it in its box. Serve it with a warm baguette and plenty of cider.",
    wines: [
      { n: "Normandy cider", t: "The cheese and the cider grow up side by side", u: WIKI("Cider") },
      { n: "Beaujolais", t: "Juicy, light red, served slightly cool", u: WIKI("Beaujolais") },
      { n: "Pinot Noir", t: "Earthy red fruit to match the rind", u: WIKI("Pinot_noir") },
    ],
    dishes: [
      { n: "Baked camembert", t: "Garlic, rosemary and a warm baguette to dip", u: RECIPE("baked camembert") },
      { n: "Camembert and apple tart", t: "Thin pastry, sliced apple, a little thyme", u: RECIPE("camembert tart") },
    ],
    board: ["Warm baguette", "Roasted garlic", "Crisp apple", "Cornichons"],
  },
};
const GLASSES = [
  { n: "Champagne and sparkling", t: "Bubbles and acidity cut through cream and refresh the palate.", c: ["brie", "camembert", "comte"] },
  { n: "Crisp whites", t: "Zesty, mineral wines for fresh, tangy cheeses.", c: ["goat", "reblochon", "brie"] },
  { n: "Rich whites", t: "Textured, nutty wines that match a firm, savoury paste.", c: ["comte", "reblochon", "camembert"] },
  { n: "Light reds", t: "Soft red fruit that never overwhelms a delicate rind.", c: ["reblochon", "camembert", "brie"] },
  { n: "Bold reds", t: "Structure and spice for aged and sheep's milk cheeses.", c: ["manchego", "comte", "gorgonzola"] },
  { n: "Sweet and fortified", t: "Honeyed wines and port, the great partners of blue cheese.", c: ["roquefort", "gorgonzola", "comte"] },
  { n: "Cider and beer", t: "Apple and malt are old friends of rustic, washed rinds.", c: ["camembert", "reblochon", "manchego"] },
];
const DISHES = [
  { n: "Tartiflette", c: "reblochon", m: "Savoie, 50 minutes", t: "Potatoes, lardons and onion under a blanket of melted Reblochon. A mountain classic.", q: "tartiflette" },
  { n: "French onion soup", c: "comte", m: "Classic, 1 hour", t: "Slow-cooked onions, a splash of white wine and a crust of grilled Comté.", q: "french onion soup" },
  { n: "Baked camembert", c: "camembert", m: "Sharing, 20 minutes", t: "Garlic, rosemary and a warm baguette for dipping. Ready while the wine is poured.", q: "baked camembert" },
  { n: "Warm goat's cheese salad", c: "goat", m: "Lunch, 15 minutes", t: "Grilled rounds on toast, bitter leaves and a sharp mustard dressing.", q: "goat's cheese salad" },
  { n: "Roquefort, pear and walnut salad", c: "roquefort", m: "Starter, 10 minutes", t: "Sweet pear and crunchy walnuts keep the blue in check.", q: "roquefort pear walnut salad" },
  { n: "Gorgonzola gnocchi", c: "gorgonzola", m: "Supper, 20 minutes", t: "A quick creamy sauce with toasted walnuts and a little black pepper.", q: "gorgonzola gnocchi" },
];

const esc = v => String(v).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const CHEESES = PRODUCTS.filter(p => PAIRINGS[p.id]);
const nameOf = id => (byId[id] || {}).name || id;
const ext = (u, label) => `<a class="ext" href="${esc(u)}" target="_blank" rel="noopener noreferrer">${esc(label)}</a>`;
let cur = (CHEESES[0] || {}).id;

const tabs = $("#pe-tabs"), stage = $("#pe-stage");
function drawTabs() {
  tabs.innerHTML = CHEESES.map(p => `<button type="button" role="tab" class="pe-tab${p.id === cur ? " on" : ""}" aria-selected="${p.id === cur}" data-pick="${p.id}"><b>${esc(p.name)}</b><small>${esc(cap(p.type))}</small></button>`).join("");
}
function drawStage(animate) {
  const p = byId[cur], d = PAIRINGS[cur]; if (!p || !d) return;
  stage.innerHTML = `<div class="pe-grid">
    <figure class="pe-photo"><img src="${esc(imgSrc(p))}" alt="${esc(p.name)}" width="800" height="1000"><figcaption>${esc(cap(p.type))} cheese</figcaption></figure>
    <div class="pe-info">
      <h3 class="pe-name">${esc(p.name)}</h3>
      <p class="pe-note">${esc(p.note)}</p>
      <div class="pe-buy"><span class="pe-price">${esc(p.price)}</span><button class="btn btn-dark" type="button" data-add="${esc(p.id)}">Add to order list</button></div>
      <div class="pe-cols">
        <div class="pe-col"><h4>In the glass</h4><ul>${d.wines.map(w => `<li>${ext(w.u, w.n)}<span>${esc(w.t)}</span></li>`).join("")}</ul></div>
        <div class="pe-col"><h4>On the plate</h4><ul>${d.dishes.map(x => `<li>${ext(x.u, x.n)}<span>${esc(x.t)}</span></li>`).join("")}</ul></div>
      </div>
      <div class="pe-board"><h4>On the board</h4><ul>${d.board.map(b => `<li>${esc(b)}</li>`).join("")}</ul></div>
      <blockquote class="pe-tip"><p>${esc(d.tip)}</p><cite>Benoit's tip</cite></blockquote>
    </div></div>`;
  if (animate && !reduce) { stage.classList.remove("swap"); void stage.offsetWidth; stage.classList.add("swap"); }
}
function pick(id, scroll) {
  if (!PAIRINGS[id]) return;
  cur = id; drawTabs(); drawStage(true);
  const on = $(".pe-tab.on", tabs); if (on && on.scrollIntoView) on.scrollIntoView({ block: "nearest", inline: "center", behavior: reduce ? "auto" : "smooth" });
  const y = tabs.getBoundingClientRect().top + scrollY - header.offsetHeight - 16;   // glide so the tabs sit under the header and the pairing is in view
  if (Math.abs(scrollY - y) > 8) { if (lenis) lenis.scrollTo(y, { duration: 1 }); else window.scrollTo({ top: y, behavior: reduce ? "auto" : "smooth" }); }
}
tabs.addEventListener("click", e => { const b = e.target.closest("[data-pick]"); if (b) pick(b.dataset.pick); });
document.addEventListener("click", e => {
  const g = e.target.closest(".glass-grid [data-pick]"); if (g) return pick(g.dataset.pick, true);
  const a = e.target.closest("#pe-stage [data-add]"); if (a) {
    addToOrder(a.dataset.add);
    const t = a.textContent; a.textContent = "Added to your list"; a.classList.add("added"); setTimeout(() => { a.textContent = t; a.classList.remove("added"); }, 1800);
  }
});

$("#glass-grid").innerHTML = GLASSES.map(g => `<div class="glass-card" data-reveal><h3>${esc(g.n)}</h3><p>${esc(g.t)}</p><ul>${g.c.filter(id => byId[id]).map(id => `<li><button type="button" data-pick="${id}">${esc(nameOf(id))}</button></li>`).join("")}</ul></div>`).join("");
$("#dish-grid").innerHTML = DISHES.filter(x => byId[x.c]).map(x => `<article class="dish" data-reveal><p class="dish-meta">${esc(x.m)}</p><h3>${esc(x.n)}</h3><p>${esc(x.t)}</p><p class="dish-with">With <button type="button" class="link-btn" data-dish-cheese="${x.c}">${esc(nameOf(x.c))}</button></p>${ext(RECIPE(x.q), "Find a recipe")}</article>`).join("");
$("#dish-grid").addEventListener("click", e => { const b = e.target.closest("[data-dish-cheese]"); if (b) pick(b.dataset.dishCheese, true); });
$$("[data-reveal]").forEach((el, n) => { if (!el.closest("#explore") || true) { el.style.setProperty("--d", `${(n % 3) * 0.08}s`); io.observe(el); } });

drawTabs(); drawStage(false);
$$(".hero-in").forEach(el => el.classList.add("go"));
