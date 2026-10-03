/* ------------------------------------------------------------------
   Loads the shop catalogue from Supabase, then starts the site scripts.
   If Supabase cannot be reached, the products written in script.js are used.
   The key below is the public "publishable" key. It is safe in a web page:
   the database rules decide what visitors can read or write.
------------------------------------------------------------------ */
window.FF_SB = { url: "https://gshowmtmibiqaytnyqkr.supabase.co", key: "sb_publishable_8EgFC7RJcarnTit6LlNlLw_ExSnvtXt" };
(() => {
  const { url, key } = window.FF_SB, CK = "ff-catalog-v1", FRESH = 5 * 60 * 1000;
  const tag = document.currentScript, scripts = ["script.js", tag && tag.dataset.page].filter(Boolean);
  const price = r => {
    const n = Number(r.price), t = Number.isInteger(n) ? String(n) : n.toFixed(2);
    return r.price_from ? `From £${t}` : r.unit ? `£${t} / ${r.unit}` : `£${t}`;
  };
  const shape = d => {
    const cats = d.categories || [], rows = d.products || [], section = id => (cats.find(c => c.id === id) || {}).section;
    const item = r => ({ id: r.id, name: r.name, type: r.category, note: r.note, pair: r.pair, price: price(r), img: r.img });
    const out = { products: [], gifts: [], details: {}, info: {}, types: [["all", "All"], ...cats.filter(c => c.section === "collection").map(c => [c.id, c.name])], shop: null };
    rows.forEach(r => {
      (section(r.category) === "gifts" ? out.gifts : out.products).push(item(r));
      out.details[r.id] = { origin: r.origin, milk: r.milk, age: r.age, texture: r.texture, intensity: r.intensity, notes: r.notes || [], story: r.story, drink: r.drink, with: r.serve_with, serve: r.serve, keep: r.keep, images: r.images || [] };
      out.info[r.id] = { serves: r.serves, includes: r.includes || [], flag: r.flag };
    });
    const s = (d.settings || []).find(x => x.key === "shop"); if (s) out.shop = s.value;
    return out;
  };
  const get = (path, ms) => {
    const ctl = new AbortController(), t = setTimeout(() => ctl.abort(), ms);
    return fetch(`${url}/rest/v1/${path}`, { headers: { apikey: key }, signal: ctl.signal }).then(r => { if (!r.ok) throw new Error(r.status); return r.json(); }).finally(() => clearTimeout(t));
  };
  const fetchAll = ms => Promise.all([
    get("categories?select=*&order=sort", ms), get("products?select=*&order=sort", ms), get("settings?select=*", ms),
  ]).then(([categories, products, settings]) => {
    const d = { categories, products, settings };
    try { localStorage.setItem(CK, JSON.stringify({ t: Date.now(), d })); } catch (e) {}
    return d;
  });
  const start = d => {
    try { if (d && d.products && d.products.length) window.FF_CATALOG = shape(d); } catch (e) {}
    scripts.forEach(src => { const s = document.createElement("script"); s.src = src; s.async = false; document.body.appendChild(s); });
  };
  let cached = null;
  try { cached = JSON.parse(localStorage.getItem(CK) || "null"); } catch (e) {}
  if (cached && Date.now() - cached.t < FRESH) { start(cached.d); fetchAll(8000).catch(() => {}); }
  else fetchAll(2500).then(start, () => start(cached && cached.d));
  window.ffClearCatalog = () => { try { localStorage.removeItem(CK); } catch (e) {} };
})();
