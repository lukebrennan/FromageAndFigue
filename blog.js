/* ------------------------------------------------------------------
   Blog archive. Reads published posts from Supabase (see supabase/update-blog.sql).
------------------------------------------------------------------ */
(() => {
const esc = v => String(v ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const fmtDate = iso => new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/London" });
const PAGE = 9;
let posts = [], filter = "all", shown = PAGE;
const grid = $("#blog-grid"), feature = $("#blog-feature"), filters = $("#blog-filters"), more = $("#blog-more"), empty = $("#blog-empty");

const img = p => (p.featured_image ? `<img src="${esc(p.featured_image)}" alt="${esc(p.featured_alt || p.title)}" loading="lazy">` : `<span class="no-img" aria-hidden="true">F&amp;F</span>`);
const meta = p => [p.category, fmtDate(p.published_at)].filter(Boolean).map(esc).join(" &middot; ");
const href = p => `/blog/${encodeURIComponent(p.slug)}/`;
const card = p => `<a class="bcard" href="${href(p)}" data-reveal><figure>${img(p)}</figure><div class="bcard-body"><p class="bmeta">${meta(p)}</p><h3>${esc(p.title)}</h3>${p.excerpt ? `<p class="bex">${esc(p.excerpt)}</p>` : ""}<span class="bmore">Read the story</span></div></a>`;
const lead = p => `<a class="bfeature" href="${href(p)}" data-reveal><figure>${img(p)}</figure><div class="bf-body"><p class="bmeta">Latest &middot; ${meta(p)}</p><h2>${esc(p.title)}</h2>${p.excerpt ? `<p class="bex">${esc(p.excerpt)}</p>` : ""}<span class="bmore">Read the story</span></div></a>`;

function draw() {
  const list = posts.filter(p => filter === "all" || p.category === filter), [first, ...rest] = list;
  feature.innerHTML = first ? lead(first) : "";
  grid.innerHTML = rest.slice(0, shown).map(card).join("");
  more.hidden = rest.length <= shown;
  $$("[data-reveal]", $(".blog-section")).forEach((el, n) => { el.style.setProperty("--d", `${(n % 3) * 0.08}s`); io.observe(el); });
}
function drawFilters() {
  const cats = [...new Set(posts.map(p => p.category).filter(Boolean))];
  filters.hidden = cats.length < 2;
  filters.innerHTML = ["all", ...cats].map(c => `<button type="button" class="chip${c === filter ? " on" : ""}" data-cat="${esc(c)}">${c === "all" ? "All stories" : esc(c)}</button>`).join("");
}
filters.addEventListener("click", e => { const b = e.target.closest("[data-cat]"); if (!b) return; filter = b.dataset.cat; shown = PAGE; drawFilters(); draw(); });
more.addEventListener("click", () => { shown += PAGE; draw(); });

(async () => {
  try {
    const now = new Date().toISOString();
    const r = await fetch(`${FF_SB.url}/rest/v1/posts?select=id,slug,title,excerpt,featured_image,featured_alt,category,published_at&status=eq.published&published_at=lte.${now}&order=published_at.desc&limit=200`, { headers: { apikey: FF_SB.key } });
    if (!r.ok) throw new Error(r.status);
    posts = await r.json();
  } catch (e) { posts = []; }
  empty.hidden = posts.length > 0;
  $(".blog-section .blog-body").hidden = posts.length === 0;
  if (posts.length) { drawFilters(); draw(); }
})();
$$(".hero-in").forEach(el => el.classList.add("go"));
})();
