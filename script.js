// Placeholder products. Edit this list to change the counter.
const products = [
  { name: "Brie de Meaux", type: "soft", note: "Creamy, mushroomy, best at room temperature.", price: "$9 / 100g", img: "brie" },
  { name: "Comte 24 months", type: "hard", note: "Nutty and caramel sweet with crunchy crystals.", price: "$8 / 100g", img: "comte" },
  { name: "Roquefort", type: "blue", note: "Sharp, salty, and beautiful with honey.", price: "$10 / 100g", img: "roquefort" },
  { name: "Fresh goat cheese", type: "soft", note: "Bright, lemony, and soft.", price: "$7 / 100g", img: "goat" },
  { name: "Manchego", type: "hard", note: "Buttery sheep's milk cheese from La Mancha.", price: "$7 / 100g", img: "manchego" },
  { name: "Gorgonzola Dolce", type: "blue", note: "Mild, spoonable, and rich.", price: "$8 / 100g", img: "gorgonzola" },
  { name: "Fresh figs", type: "pairing", note: "Seasonal, picked ripe.", price: "$6 / box", img: "figs" },
  { name: "Fig jam", type: "pairing", note: "Small batch, slow cooked.", price: "$9 / jar", img: "jam" },
  { name: "Walnut bread", type: "pairing", note: "Baked daily, ideal with blue cheese.", price: "$6 / loaf", img: "bread" },
];

const grid = document.getElementById("grid");

function render(filter) {
  grid.innerHTML = "";
  products
    .filter(p => filter === "all" || p.type === filter)
    .forEach(p => {
      const li = document.createElement("li");
      li.className = "card";
      li.innerHTML = `<div class="thumb"><img loading="lazy" alt="" width="800" height="1000"></div><div class="body"><span class="tag"></span><h3></h3><p></p><span class="price"></span></div>`;
      const img = li.querySelector("img");
      img.src = `assets/products/${p.img}.jpg`;
      img.alt = p.name;
      li.querySelector(".tag").textContent = p.type;
      li.querySelector("h3").textContent = p.name;
      li.querySelector("p").textContent = p.note;
      li.querySelector(".price").textContent = p.price;
      grid.appendChild(li);
    });
}

document.querySelectorAll(".filter").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".filter").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    render(btn.dataset.filter);
  });
});

const toggle = document.querySelector(".menu-toggle");
const nav = document.getElementById("nav");
toggle.addEventListener("click", () => {
  const open = nav.classList.toggle("open");
  toggle.setAttribute("aria-expanded", open);
});
nav.addEventListener("click", () => {
  nav.classList.remove("open");
  toggle.setAttribute("aria-expanded", false);
});

document.getElementById("year").textContent = new Date().getFullYear();
render("all");
