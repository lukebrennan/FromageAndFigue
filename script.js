// Placeholder products. Edit this list to change the counter.
const products = [
  { name: "Brie de Meaux", type: "soft", note: "Creamy, mushroomy, best at room temperature.", price: "$9 / 100g" },
  { name: "Comte 24 months", type: "hard", note: "Nutty and caramel sweet with crunchy crystals.", price: "$8 / 100g" },
  { name: "Roquefort", type: "blue", note: "Sharp, salty, and beautiful with honey.", price: "$10 / 100g" },
  { name: "Fresh goat cheese", type: "soft", note: "Bright, lemony, and soft.", price: "$7 / 100g" },
  { name: "Manchego", type: "hard", note: "Buttery sheep's milk cheese from La Mancha.", price: "$7 / 100g" },
  { name: "Gorgonzola Dolce", type: "blue", note: "Mild, spoonable, and rich.", price: "$8 / 100g" },
  { name: "Fresh figs", type: "pairing", note: "Seasonal, picked ripe.", price: "$6 / box" },
  { name: "Fig jam", type: "pairing", note: "Small batch, slow cooked.", price: "$9 / jar" },
  { name: "Walnut bread", type: "pairing", note: "Baked daily, ideal with blue cheese.", price: "$6 / loaf" },
];

const grid = document.getElementById("grid");

function render(filter) {
  grid.innerHTML = "";
  products
    .filter(p => filter === "all" || p.type === filter)
    .forEach(p => {
      const li = document.createElement("li");
      li.className = "card";
      li.innerHTML = `<span class="tag"></span><h3></h3><p></p><span class="price"></span>`;
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
