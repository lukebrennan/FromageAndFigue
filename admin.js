/* ------------------------------------------------------------------
   Shop admin. Signs in with Supabase and edits orders, products,
   categories and shop settings. Access is enforced by the database rules
   (see supabase/schema.sql), not by this page.
------------------------------------------------------------------ */
const SB_URL = "https://gshowmtmibiqaytnyqkr.supabase.co", SB_KEY = "sb_publishable_8EgFC7RJcarnTit6LlNlLw_ExSnvtXt";
const ADMIN_EMAIL = "lukebrennan03@gmail.com";
const sb = supabase.createClient(SB_URL, SB_KEY);
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = v => String(v ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const gbp = new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" });
const when = iso => (iso ? new Date(iso).toLocaleString("en-GB", { timeZone: "Europe/London", weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "");
const slug = s => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
const clearCache = () => { try { localStorage.removeItem("ff-catalog-v1"); } catch (e) {} };
const STATUSES = ["new", "preparing", "ready", "completed", "cancelled"];
const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const DEFAULT_SHOP = { openingSoon: true, openingNote: "Spring 2027, Liverpool", openingDate: "2027-03-21", email: "hello@fromageandfigue.co.uk", phone: "0151 496 0142", phoneLink: "+441514960142", whatsapp: "447700900142", address: ["14 Gambier Lane", "Liverpool L1 4DX"], mapQuery: "14 Gambier Lane, Liverpool L1 4DX, UK", hours: [null, null, [10, 18], [10, 18], [10, 18], [10, 18], [9, 17]] };

let toastT;
function toast(msg, bad) { const t = $("#toast"); t.textContent = msg; t.classList.toggle("err", !!bad); t.classList.add("show"); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove("show"), bad ? 5000 : 2400); }
const fail = e => { console.error(e); toast((e && e.message) || "Something went wrong", true); };
async function q(promise) { const { data, error } = await promise; if (error) throw error; return data; }

const S = { tab: "orders", cats: [], prods: [], orders: [], ofilter: "open", openOrder: null, pq: "", pcat: "all" };

/* ---------- sign in ---------- */
function showLogin(msg) { $("#app").hidden = true; $("#login").hidden = false; const m = $("#login-msg"); m.hidden = !msg; m.textContent = msg || ""; }
async function enter(session) {
  if (!session) return showLogin();
  if ((session.user.email || "").toLowerCase() !== ADMIN_EMAIL) { await sb.auth.signOut(); return showLogin("This account does not have access."); }
  $("#login").hidden = true; $("#app").hidden = false;
  show(S.tab);
}
$("#login-form").addEventListener("submit", async e => {
  e.preventDefault();
  const f = e.target, btn = $("button", f); btn.disabled = true;
  const { data, error } = await sb.auth.signInWithPassword({ email: f.email.value.trim(), password: f.password.value });
  btn.disabled = false;
  if (error) return showLogin(error.message === "Invalid login credentials" ? "That email or password is not right." : error.message);
  f.password.value = ""; enter(data.session);
});
$("#signout").addEventListener("click", async () => { await sb.auth.signOut(); showLogin(); });
sb.auth.getSession().then(({ data }) => enter(data.session));

/* ---------- shell ---------- */
$("#tabs").addEventListener("click", e => { const b = e.target.closest("[data-tab]"); if (b) show(b.dataset.tab); });
function show(tab) {
  S.tab = tab; closeDrawer();
  $$("#tabs button").forEach(b => b.classList.toggle("on", b.dataset.tab === tab));
  ({ orders: viewOrders, products: viewProducts, categories: viewCategories, settings: viewSettings })[tab]().catch(fail);
}
async function loadCats() { S.cats = await q(sb.from("categories").select("*").order("sort")); }
async function loadProds() { S.prods = await q(sb.from("products").select("*").order("sort")); }
async function refreshBadge() {
  try { const { count } = await sb.from("orders").select("id", { count: "exact", head: true }).eq("status", "new"); const b = $("#new-count"); b.textContent = count || 0; b.hidden = !count; } catch (e) {}
}
setInterval(() => { if (!$("#app").hidden) refreshBadge(); }, 60000);

/* ---------- orders ---------- */
async function viewOrders() {
  S.orders = await q(sb.from("orders").select("*").order("created_at", { ascending: false }).limit(300));
  refreshBadge(); drawOrders();
}
function drawOrders() {
  const open = ["new", "preparing", "ready"], f = S.ofilter;
  const list = S.orders.filter(o => (f === "all" ? true : f === "open" ? open.includes(o.status) : o.status === f));
  const n = k => S.orders.filter(o => (k === "open" ? open.includes(o.status) : k === "all" ? true : o.status === k)).length;
  const chips = ["open", ...STATUSES, "all"].map(k => `<button class="chip${f === k ? " on" : ""}" data-f="${k}">${k} ${n(k)}</button>`).join("");
  $("#view").innerHTML = `
    <div class="page-head"><h1>Orders</h1><div class="tools"><button class="btn sm" id="o-refresh">Refresh</button></div></div>
    <div class="chips">${chips}</div>
    ${list.length ? `<table class="tbl"><thead><tr><th>Order</th><th>Placed</th><th>Customer</th><th class="hide-s">Type</th><th class="hide-s">For</th><th class="num">Total</th><th>Status</th></tr></thead><tbody>
    ${list.map(o => `<tr class="row" data-id="${o.id}"><td>${esc(o.ref)}</td><td>${when(o.created_at)}</td><td>${esc(o.customer_name)}</td><td class="hide-s">${esc(o.fulfilment)}</td><td class="hide-s">${when(o.slot_at) || "Not set"}</td><td class="num">${gbp.format(o.total)}</td><td><span class="tag ${o.status}">${o.status}</span></td></tr>${S.openOrder === o.id ? orderDetail(o) : ""}`).join("")}
    </tbody></table>` : `<p class="empty">No orders here yet. Test orders placed through the site checkout will appear in this list.</p>`}`;
}
function orderDetail(o) {
  const items = (o.items || []).map(i => `<li><span>${esc(i.qty)} x ${esc(i.name)}</span><span>${gbp.format((i.unit_price || 0) * i.qty)}</span></li>`).join("");
  return `<tr class="detail-row"><td colspan="7"><div class="od">
    <div><ul>${items}<li><span>Delivery</span><span>${o.delivery_fee > 0 ? gbp.format(o.delivery_fee) : "Free"}</span></li><li><b>Total</b><b>${gbp.format(o.total)}</b></li></ul></div>
    <div><dl><dt>Customer</dt><dd>${esc(o.customer_name)}</dd><dt>Email</dt><dd><a href="mailto:${esc(o.email)}">${esc(o.email)}</a></dd>
      <dt>${esc(o.fulfilment)}</dt><dd>${when(o.slot_at) || "No time chosen"}</dd>${o.address ? `<dt>Address</dt><dd>${esc(o.address)}</dd>` : ""}<dt>Payment</dt><dd>${esc(o.payment)} (no money taken)</dd></dl>
      <label style="margin-top:1rem">Internal note<textarea data-note rows="2">${esc(o.internal_note)}</textarea></label>
      <div class="actions"><select data-status>${STATUSES.map(s => `<option${s === o.status ? " selected" : ""}>${s}</option>`).join("")}</select><button class="btn sm dark" data-save-order="${o.id}">Save</button></div></div>
  </div></td></tr>`;
}
$("#view").addEventListener("click", async e => {
  if (S.tab !== "orders") return;
  const chip = e.target.closest("[data-f]"); if (chip) { S.ofilter = chip.dataset.f; S.openOrder = null; return drawOrders(); }
  if (e.target.closest("#o-refresh")) return viewOrders().catch(fail);
  const save = e.target.closest("[data-save-order]");
  if (save) {
    const row = save.closest(".detail-row"), id = save.dataset.saveOrder;
    try { await q(sb.from("orders").update({ status: $("[data-status]", row).value, internal_note: $("[data-note]", row).value }).eq("id", id)); toast("Order updated"); await viewOrders(); } catch (err) { fail(err); }
    return;
  }
  if (e.target.closest(".detail-row")) return;
  const row = e.target.closest("tr.row"); if (row) { S.openOrder = S.openOrder === row.dataset.id ? null : row.dataset.id; drawOrders(); }
});

/* ---------- products ---------- */
const imgOf = p => (/^https?:/.test(p.img) ? p.img : `assets/products/${p.img}.webp`);
const galOf = k => (/^https?:/.test(k) ? k : `assets/${k}-800.webp`);
const priceText = p => { const n = Number(p.price), t = Number.isInteger(n) ? n : n.toFixed(2); return p.price_from ? `From £${t}` : p.unit ? `£${t} / ${p.unit}` : `£${t}`; };
async function viewProducts() { await Promise.all([loadCats(), loadProds()]); drawProducts(); }
function drawProducts() {
  const term = S.pq.trim().toLowerCase();
  const list = S.prods.filter(p => (S.pcat === "all" || p.category === S.pcat) && (!term || `${p.name} ${p.id}`.toLowerCase().includes(term)));
  const cname = id => (S.cats.find(c => c.id === id) || {}).name || id;
  $("#view").innerHTML = `
    <div class="page-head"><h1>Products</h1><div class="tools">
      <input type="search" id="p-q" placeholder="Search products" value="${esc(S.pq)}">
      <select id="p-cat"><option value="all">All categories</option>${S.cats.map(c => `<option value="${c.id}"${S.pcat === c.id ? " selected" : ""}>${esc(c.name)}</option>`).join("")}</select>
      <button class="btn dark" id="p-add">Add product</button></div></div>
    ${list.length ? `<table class="tbl"><thead><tr><th></th><th>Name</th><th class="hide-s">Category</th><th>Price</th><th>Shown</th></tr></thead><tbody>
    ${list.map(p => `<tr class="row" data-id="${esc(p.id)}"><td><img class="thumb" src="${esc(imgOf(p))}" alt="" loading="lazy"></td><td><b>${esc(p.name)}</b><br><small style="color:var(--muted)">${esc(p.id)}</small></td><td class="hide-s">${esc(cname(p.category))}</td><td>${esc(priceText(p))}</td><td>${p.active ? "Yes" : '<span class="tag off">Hidden</span>'}</td></tr>`).join("")}
    </tbody></table>` : `<p class="empty">No products match.</p>`}`;
  const pq = $("#p-q"); pq.addEventListener("input", () => { S.pq = pq.value; const pos = pq.selectionStart; drawProducts(); const n = $("#p-q"); n.focus(); n.setSelectionRange(pos, pos); });
  $("#p-cat").addEventListener("change", e => { S.pcat = e.target.value; drawProducts(); });
  $("#p-add").addEventListener("click", () => editProduct(null));
  $$("tr.row", $("#view")).forEach(r => r.addEventListener("click", () => editProduct(r.dataset.id)));
}
const fld = (label, name, val, extra = "") => `<label>${label}<input name="${name}" value="${esc(val)}" ${extra}></label>`;
const area = (label, name, val, rows = 3, hint = "") => `<label>${label}${hint ? `<span class="hint">${hint}</span>` : ""}<textarea name="${name}" rows="${rows}">${esc(val)}</textarea></label>`;
function editProduct(id) {
  const isNew = !id, p = isNew ? { id: "", name: "", category: (S.cats.find(c => c.section === "collection") || S.cats[0] || {}).id || "", note: "", pair: "", price: "", unit: "100g", price_from: false, img: "", images: [], origin: "", milk: "", age: "", texture: "", intensity: 3, notes: [], story: "", drink: "", serve_with: "", serve: "", keep: "", serves: "", includes: [], flag: "", sort: (S.prods.reduce((m, x) => Math.max(m, x.sort), 0) + 1), active: true } : S.prods.find(x => x.id === id);
  const body = `<form id="pform" class="drawer-body" autocomplete="off">
    <p class="sec">Basics</p>
    ${fld("Name", "name", p.name, "required")}
    <div class="grid2"><label>Category<select name="category">${S.cats.map(c => `<option value="${c.id}"${p.category === c.id ? " selected" : ""}>${esc(c.name)}${c.section === "gifts" ? " (gifts)" : ""}</option>`).join("")}</select></label>
    ${fld("Web address ID", "id", p.id, `${isNew ? "" : "readonly"} pattern="[a-z0-9\\-]+" placeholder="made from the name"`)}</div>
    <div class="grid3">${fld("Price (£)", "price", p.price, 'type="number" step="0.01" min="0" required')}${fld("Per (unit)", "unit", p.unit, 'placeholder="100g, loaf, board"')}
    <label class="check" style="align-self:end;padding-bottom:.7rem"><input type="checkbox" name="price_from"${p.price_from ? " checked" : ""}> Show as "From"</label></div>
    ${area("Short description", "note", p.note, 2, "Shown on the card.")}
    ${fld("Pairs with", "pair", p.pair)}
    <p class="sec">Photographs</p>
    <div class="photo"><img class="main" id="main-img" src="${esc(p.img ? imgOf(p) : "")}" alt="">
      <div style="display:grid;gap:.6rem;flex:1;min-width:220px"><input type="hidden" name="img" value="${esc(p.img)}">
      <label class="btn sm" style="text-align:center;cursor:pointer">Upload main photo<input type="file" accept="image/*" id="up-main" hidden></label>
      <span class="hint">Portrait photos (4 by 5) work best. Photos are resized and saved as WebP.</span></div></div>
    <div><span class="hint" style="display:block;margin-bottom:.4rem">Extra photos (shown in the product pop-up)</span><div class="gal" id="gal"></div>
    <label class="btn sm" style="display:inline-block;margin-top:.6rem;cursor:pointer">Add photos<input type="file" accept="image/*" multiple id="up-gal" hidden></label></div>
    <p class="sec">Details (pop-up)</p>
    <div class="grid2">${fld("Origin", "origin", p.origin)}${fld("Milk", "milk", p.milk)}${fld("Age", "age", p.age)}${fld("Texture", "texture", p.texture)}</div>
    <label>Intensity (1 mild, 5 bold)<input name="intensity" type="number" min="1" max="5" value="${p.intensity}"></label>
    ${fld("Tasting notes", "notes", (p.notes || []).join(", "), 'placeholder="Mushroom, Fresh cream, Hazelnut"')}
    ${area("Story", "story", p.story, 4)}
    <div class="grid2">${fld("Drink with", "drink", p.drink)}${fld("Serve with", "serve_with", p.serve_with)}</div>
    ${area("How to serve", "serve", p.serve, 2)}${area("Keeping", "keep", p.keep, 2)}
    <p class="sec">Boards and boxes only</p>
    <div class="grid2">${fld("Serves", "serves", p.serves, 'placeholder="Serves 4 to 8"')}${fld("Badge", "flag", p.flag, 'placeholder="Most popular"')}</div>
    ${area("What is included", "includes", (p.includes || []).join("\n"), 4, "One item per line.")}
    <p class="sec">Website</p>
    <div class="grid2">${fld("Order on page", "sort", p.sort, 'type="number"')}<label class="check" style="align-self:end;padding-bottom:.7rem"><input type="checkbox" name="active"${p.active ? " checked" : ""}> Show on the website</label></div>
  </form>`;
  openDrawer(isNew ? "Add product" : "Edit product", body, `${isNew ? "" : '<button class="btn danger sm" id="p-del" type="button">Delete</button>'}<span class="sp"></span><button class="btn" id="p-cancel" type="button">Cancel</button><button class="btn dark" id="p-save" type="button">Save</button>`);
  const form = $("#pform"); let gallery = [...(p.images || [])];
  const drawGal = () => { $("#gal").innerHTML = gallery.map((g, i) => `<figure><img src="${esc(galOf(g))}" alt=""><button type="button" data-rm="${i}" aria-label="Remove photo">&times;</button></figure>`).join("") || '<span class="hint">None yet.</span>'; };
  drawGal();
  $("#gal").addEventListener("click", e => { const b = e.target.closest("[data-rm]"); if (b) { gallery.splice(+b.dataset.rm, 1); drawGal(); } });
  if (isNew) form.name.addEventListener("input", () => { if (!form.id.dataset.touched) form.id.value = slug(form.name.value); });
  form.id.addEventListener("input", () => (form.id.dataset.touched = "1"));
  const upload = async file => {
    const blob = await toWebp(file), path = `${slug(form.name.value || "photo") || "photo"}-${Date.now().toString(36)}.webp`;
    await q(sb.storage.from("product-images").upload(path, blob, { contentType: "image/webp", cacheControl: "31536000" }));
    return sb.storage.from("product-images").getPublicUrl(path).data.publicUrl;
  };
  $("#up-main").addEventListener("change", async e => { const f = e.target.files[0]; if (!f) return; try { toast("Uploading"); const u = await upload(f); form.img.value = u; $("#main-img").src = u; toast("Photo added"); } catch (err) { fail(err); } e.target.value = ""; });
  $("#up-gal").addEventListener("change", async e => { try { toast("Uploading"); for (const f of e.target.files) gallery.push(await upload(f)); drawGal(); toast("Photos added"); } catch (err) { fail(err); } e.target.value = ""; });
  $("#p-cancel").addEventListener("click", closeDrawer);
  const del = $("#p-del"); if (del) del.addEventListener("click", async () => {
    if (!confirm(`Delete ${p.name}? This cannot be undone. To keep it but hide it, untick "Show on the website" instead.`)) return;
    try { await q(sb.from("products").delete().eq("id", p.id)); clearCache(); toast("Product deleted"); closeDrawer(); await viewProducts(); } catch (err) { fail(err); }
  });
  $("#p-save").addEventListener("click", async () => {
    const v = n => form[n].value.trim(), name = v("name"), pid = v("id") || slug(name);
    if (!name) return fail({ message: "Please enter a name." });
    if (!/^[a-z0-9-]+$/.test(pid)) return fail({ message: "The web address ID can only use lowercase letters, numbers and hyphens." });
    if (v("price") === "" || isNaN(+v("price"))) return fail({ message: "Please enter a price." });
    const row = { name, category: v("category"), price: +v("price"), unit: v("unit"), price_from: form.price_from.checked, note: v("note"), pair: v("pair"), img: v("img"), images: gallery,
      origin: v("origin"), milk: v("milk"), age: v("age"), texture: v("texture"), intensity: Math.min(5, Math.max(1, parseInt(v("intensity"), 10) || 1)),
      notes: v("notes").split(",").map(s => s.trim()).filter(Boolean), story: v("story"), drink: v("drink"), serve_with: v("serve_with"), serve: v("serve"), keep: v("keep"),
      serves: v("serves"), flag: v("flag"), includes: form.includes.value.split("\n").map(s => s.trim()).filter(Boolean), sort: parseInt(v("sort"), 10) || 0, active: form.active.checked };
    if (!row.img) return fail({ message: "Please add a main photo." });
    const btn = $("#p-save"); btn.disabled = true;
    try {
      if (isNew) await q(sb.from("products").insert({ id: pid, ...row })); else await q(sb.from("products").update(row).eq("id", p.id));
      clearCache(); toast("Saved"); closeDrawer(); await viewProducts();
    } catch (err) { btn.disabled = false; fail(err.code === "23505" ? { message: "A product with that web address ID already exists." } : err); }
  });
}
async function toWebp(file) {
  const bmp = await createImageBitmap(file), max = 1600, k = Math.min(1, max / Math.max(bmp.width, bmp.height));
  const c = document.createElement("canvas"); c.width = Math.round(bmp.width * k); c.height = Math.round(bmp.height * k);
  c.getContext("2d").drawImage(bmp, 0, 0, c.width, c.height);
  return new Promise((res, rej) => c.toBlob(b => (b ? res(b) : rej(new Error("Could not read that image."))), "image/webp", 0.86));
}

/* ---------- categories ---------- */
async function viewCategories() { await Promise.all([loadCats(), loadProds()]); drawCategories(); }
function drawCategories() {
  const used = id => S.prods.filter(p => p.category === id).length;
  $("#view").innerHTML = `
    <div class="page-head"><h1>Categories</h1></div>
    <div class="card"><table class="tbl" id="cat-table"><thead><tr><th>Name</th><th>Appears in</th><th>Order</th><th>Shown</th><th class="num">Products</th><th></th></tr></thead><tbody>
    ${S.cats.map(c => `<tr data-id="${esc(c.id)}"><td><input data-k="name" value="${esc(c.name)}"></td>
      <td><select data-k="section"><option value="collection"${c.section === "collection" ? " selected" : ""}>The collection</option><option value="gifts"${c.section === "gifts" ? " selected" : ""}>Boards and gifts</option></select></td>
      <td style="width:5rem"><input data-k="sort" type="number" value="${c.sort}"></td><td><input data-k="active" type="checkbox"${c.active ? " checked" : ""}></td><td class="num">${used(c.id)}</td>
      <td style="white-space:nowrap"><button class="btn sm dark" data-save>Save</button> <button class="btn sm danger" data-del>Delete</button></td></tr>`).join("")}
    </tbody></table>
    <p class="hint" style="margin-top:1rem">The three sections on the Boards and gifts page (boards, boxes and vouchers) are fixed, so a new gifts category will not appear there yet. New collection categories appear in the collection filters straight away.</p></div>
    <div class="card"><h2>Add a category</h2><form id="cat-new" class="grid3" autocomplete="off">
      ${fld("Name", "name", "", "required")}<label>Appears in<select name="section"><option value="collection">The collection</option><option value="gifts">Boards and gifts</option></select></label><div style="align-self:end"><button class="btn dark" type="submit">Add category</button></div></form></div>`;
}
$("#view").addEventListener("click", async e => {
  if (S.tab !== "categories") return;
  const row = e.target.closest("tr[data-id]"); if (!row) return; const id = row.dataset.id;
  if (e.target.closest("[data-save]")) {
    const g = k => $(`[data-k=${k}]`, row);
    try { await q(sb.from("categories").update({ name: g("name").value.trim(), section: g("section").value, sort: parseInt(g("sort").value, 10) || 0, active: g("active").checked }).eq("id", id)); clearCache(); toast("Saved"); await viewCategories(); } catch (err) { fail(err); }
  } else if (e.target.closest("[data-del]")) {
    if (S.prods.some(p => p.category === id)) return fail({ message: "This category still has products. Move or delete them first." });
    if (!confirm("Delete this category?")) return;
    try { await q(sb.from("categories").delete().eq("id", id)); clearCache(); toast("Deleted"); await viewCategories(); } catch (err) { fail(err); }
  }
});
$("#view").addEventListener("submit", async e => {
  if (e.target.id !== "cat-new") return; e.preventDefault();
  const f = e.target, name = f.name.value.trim(), id = slug(name);
  if (!id) return fail({ message: "Please enter a name." });
  try { await q(sb.from("categories").insert({ id, name, section: f.section.value, sort: S.cats.reduce((m, c) => Math.max(m, c.sort), 0) + 1 })); clearCache(); toast("Category added"); await viewCategories(); } catch (err) { fail(err.code === "23505" ? { message: "That category already exists." } : err); }
});

/* ---------- shop settings ---------- */
async function viewSettings() {
  const rows = await q(sb.from("settings").select("*").eq("key", "shop")), s = { ...DEFAULT_SHOP, ...((rows[0] && rows[0].value) || {}) };
  const hours = DAYS.map((d, i) => { const h = s.hours[i]; return `<span class="d">${d}</span><input type="number" min="0" max="24" data-h="${i}-0" value="${h ? h[0] : 10}"${h ? "" : " disabled"}><input type="number" min="0" max="24" data-h="${i}-1" value="${h ? h[1] : 18}"${h ? "" : " disabled"}><label class="check"><input type="checkbox" data-closed="${i}"${h ? "" : " checked"}> Closed</label>`; }).join("");
  $("#view").innerHTML = `<div class="page-head"><h1>Shop settings</h1></div>
  <form id="shop-form" autocomplete="off">
    <div class="card"><h2>Opening</h2>
      <label class="check" style="margin-bottom:1rem"><input type="checkbox" name="openingSoon"${s.openingSoon ? " checked" : ""}> Show "Opening soon" across the site (untick when you open)</label>
      <div class="grid2">${fld("Opening note", "openingNote", s.openingNote)}${fld("Opening date (countdown)", "openingDate", s.openingDate, 'type="date"')}</div></div>
    <div class="card"><h2>Contact</h2><div class="grid2">${fld("Email", "email", s.email, 'type="email"')}${fld("Phone", "phone", s.phone)}${fld("WhatsApp number", "whatsapp", s.whatsapp, 'placeholder="447700900123, digits only, blank to hide"')}<span></span>${fld("Address line 1", "a1", s.address[0] || "")}${fld("Address line 2", "a2", s.address[1] || "")}</div></div>
    <div class="card"><h2>Opening hours</h2><p class="hint" style="margin:-.6rem 0 1rem">Shown once the shop is open. 24 hour clock, for example 10 and 18.</p><div class="hours">${hours}</div></div>
    <div class="save-bar"><button class="btn dark" type="submit">Save settings</button><span class="hint">Changes appear on the site within a few minutes.</span></div>
  </form>`;
  $$("[data-closed]").forEach(c => c.addEventListener("change", () => { $$(`[data-h^="${c.dataset.closed}-"]`).forEach(i => (i.disabled = c.checked)); }));
  $("#shop-form").addEventListener("submit", async e => {
    e.preventDefault(); const f = e.target;
    const digits = f.phone.value.replace(/\D/g, ""), link = f.phone.value.trim().startsWith("+") ? "+" + digits : "+44" + digits.replace(/^0/, "");
    const address = [f.a1.value.trim(), f.a2.value.trim()].filter(Boolean);
    const value = { openingSoon: f.openingSoon.checked, openingNote: f.openingNote.value.trim(), openingDate: f.openingDate.value || DEFAULT_SHOP.openingDate, email: f.email.value.trim(), phone: f.phone.value.trim(), phoneLink: link, whatsapp: f.whatsapp.value.replace(/\D/g, ""), address, mapQuery: address.join(", ") + ", UK",
      hours: DAYS.map((_, i) => ($(`[data-closed="${i}"]`).checked ? null : [Math.min(24, +$(`[data-h="${i}-0"]`).value || 0), Math.min(24, +$(`[data-h="${i}-1"]`).value || 0)])) };
    try { await q(sb.from("settings").upsert({ key: "shop", value })); clearCache(); toast("Settings saved"); } catch (err) { fail(err); }
  });
}

/* ---------- drawer ---------- */
const drawer = $("#drawer"), scrim = $("#scrim");
function openDrawer(title, body, foot) {
  drawer.innerHTML = `<div class="drawer-head"><h2>${esc(title)}</h2><button class="link" id="d-x" aria-label="Close">Close</button></div>${body}<div class="drawer-foot">${foot || ""}</div>`;
  $("#d-x").addEventListener("click", closeDrawer);
  scrim.hidden = false; requestAnimationFrame(() => scrim.classList.add("show"));
  drawer.inert = false; drawer.setAttribute("aria-hidden", "false"); drawer.classList.add("open"); document.body.style.overflow = "hidden";
}
function closeDrawer() {
  if (!drawer.classList.contains("open")) return;
  scrim.classList.remove("show"); setTimeout(() => (scrim.hidden = true), 350);
  drawer.classList.remove("open"); drawer.inert = true; drawer.setAttribute("aria-hidden", "true"); document.body.style.overflow = "";
}
scrim.addEventListener("click", closeDrawer);
addEventListener("keydown", e => { if (e.key === "Escape") closeDrawer(); });
