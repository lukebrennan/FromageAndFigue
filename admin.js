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
const cap = s => String(s).charAt(0).toUpperCase() + String(s).slice(1);
const SLABEL = { new: "New", preparing: "Preparing", ready: "Ready", completed: "Order complete", cancelled: "Cancelled" };
const sdesc = (s, o) => ({ new: "Just placed", preparing: "Being put together", ready: o.fulfilment === "delivery" ? "Out for delivery" : "Ready to collect", completed: "Handed over, all done", cancelled: "Will not go ahead" }[s]);
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
  ({ orders: viewOrders, products: viewProducts, categories: viewCategories, settings: viewSettings, signups: viewSignups, help: viewHelp })[tab]().catch(fail);
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
  const chips = ["open", ...STATUSES, "all"].map(k => `<button class="chip${f === k ? " on" : ""}" data-f="${k}">${k === "open" || k === "all" ? cap(k) : SLABEL[k]} ${n(k)}</button>`).join("");
  $("#view").innerHTML = `
    <div class="page-head"><h1>Orders</h1><div class="tools"><button class="btn sm" id="o-refresh">Refresh</button></div></div>
    ${lede("Orders placed through the website checkout appear here, newest first. Click an order to open it, then use the buttons to show where it is up to. For now these are test orders and no money is taken.")}
    <div class="chips">${chips}</div>

    ${list.length ? `<table class="tbl"><thead><tr><th>Order</th><th>Placed</th><th>Customer</th><th class="hide-s">Type</th><th class="hide-s">For</th><th class="num">Total</th><th>Status</th></tr></thead><tbody>
    ${list.map(o => `<tr class="row" data-id="${o.id}"><td>${esc(o.ref)}</td><td>${when(o.created_at)}</td><td>${esc(o.customer_name)}${o.customer_note ? ' <span class="tag note">Note</span>' : ""}</td><td class="hide-s">${esc(cap(o.fulfilment))}</td><td class="hide-s">${when(o.slot_at) || "Not set"}</td><td class="num">${gbp.format(o.total)}</td><td><span class="tag ${o.status}">${SLABEL[o.status]}</span></td></tr>${S.openOrder === o.id ? orderDetail(o) : ""}`).join("")}
    </tbody></table>` : `<p class="empty">No orders here yet. Test orders placed through the site checkout will appear in this list.</p>`}`;
}
function orderDetail(o) {
  const items = (o.items || []).map(i => `<li><span>${esc(i.qty)} x ${esc(i.name)}</span><span>${gbp.format((i.unit_price || 0) * i.qty)}</span></li>`).join("");
  return `<tr class="detail-row"><td colspan="7"><div class="od">
    <div><ul>${items}<li><span>Delivery</span><span>${o.delivery_fee > 0 ? gbp.format(o.delivery_fee) : "Free"}</span></li><li><b>Total</b><b>${gbp.format(o.total)}</b></li></ul></div>
    <div><dl><dt>Customer</dt><dd>${esc(o.customer_name)}</dd><dt>Email</dt><dd><a href="mailto:${esc(o.email)}">${esc(o.email)}</a></dd>
      <dt>${esc(cap(o.fulfilment))}</dt><dd>${o.fulfilment === "delivery" ? "Within 1 to 3 days" : when(o.slot_at) || "No time chosen"}</dd>${o.address ? `<dt>Address</dt><dd>${esc(o.address)}</dd>` : ""}<dt>Payment</dt><dd>${esc(o.payment)} (no money taken)</dd>${o.customer_note ? `<dt>Customer note</dt><dd class="cnote">${esc(o.customer_note)}</dd>` : ""}</dl>
      <label style="margin-top:1rem">Your private note<span class="hint">Only you can see this. For example "Allergic to nuts" or "Customer rang to change time".</span><textarea data-note rows="2">${esc(o.internal_note)}</textarea></label>
      <div class="actions"><button class="btn sm dark" data-save-note="${o.id}">Save note</button></div></div>
    <div class="full-w"><p class="hint" style="margin:0 0 .5rem">Where is this order up to? Click a button to update it.</p>
      <div class="steps-btns">${STATUSES.map(s => `<button type="button" class="stp${s === o.status ? " on" : ""} ${s}" data-set-status="${s}" data-oid="${o.id}" aria-pressed="${s === o.status}"><b>${SLABEL[s]}</b><small>${sdesc(s, o)}</small></button>`).join("")}</div></div>
  </div></td></tr>`;
}
$("#view").addEventListener("click", async e => {
  if (S.tab !== "orders") return;
  const chip = e.target.closest("[data-f]"); if (chip) { S.ofilter = chip.dataset.f; S.openOrder = null; return drawOrders(); }
  if (e.target.closest("#o-refresh")) return viewOrders().catch(fail);
  const st = e.target.closest("[data-set-status]");
  if (st) {
    try { await q(sb.from("orders").update({ status: st.dataset.setStatus }).eq("id", st.dataset.oid)); toast(`Marked as ${SLABEL[st.dataset.setStatus]}`); await viewOrders(); } catch (err) { fail(err); }
    return;
  }
  const sn = e.target.closest("[data-save-note]");
  if (sn) {
    const row = sn.closest(".detail-row");
    try { await q(sb.from("orders").update({ internal_note: $("[data-note]", row).value }).eq("id", sn.dataset.saveNote)); toast("Note saved"); await viewOrders(); } catch (err) { fail(err); }
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
    ${lede("Everything the shop sells. Click a product to change its name, price, photos or description. Use \"Add product\" to add a new one. Changes appear on the website within a few minutes.")}
    ${list.length ? `<table class="tbl"><thead><tr><th></th><th>Name</th><th class="hide-s">Category</th><th>Price</th><th>Shown</th></tr></thead><tbody>
    ${list.map(p => `<tr class="row" data-id="${esc(p.id)}"><td><img class="thumb" src="${esc(imgOf(p))}" alt="" loading="lazy"></td><td><b>${esc(p.name)}</b><br><small style="color:var(--muted)">${esc(p.id)}</small></td><td class="hide-s">${esc(cname(p.category))}</td><td>${esc(priceText(p))}</td><td>${p.active ? "Yes" : '<span class="tag off">Hidden</span>'}</td></tr>`).join("")}
    </tbody></table>` : `<p class="empty">No products match.</p>`}`;
  const pq = $("#p-q"); pq.addEventListener("input", () => { S.pq = pq.value; const pos = pq.selectionStart; drawProducts(); const n = $("#p-q"); n.focus(); n.setSelectionRange(pos, pos); });
  $("#p-cat").addEventListener("change", e => { S.pcat = e.target.value; drawProducts(); });
  $("#p-add").addEventListener("click", () => editProduct(null));
  $$("tr.row", $("#view")).forEach(r => r.addEventListener("click", () => editProduct(r.dataset.id)));
}
const fld = (label, name, val, extra = "", hint = "") => `<label>${label}${hint ? `<span class="hint">${hint}</span>` : ""}<input name="${name}" value="${esc(val)}" ${extra}></label>`;
const area = (label, name, val, rows = 3, hint = "", ph = "") => `<label>${label}${hint ? `<span class="hint">${hint}</span>` : ""}<textarea name="${name}" rows="${rows}" placeholder="${esc(ph)}">${esc(val)}</textarea></label>`;
const lede = t => `<p class="lede">${t}</p>`;
function editProduct(id) {
  const isNew = !id, p = isNew ? { id: "", name: "", category: (S.cats.find(c => c.section === "collection") || S.cats[0] || {}).id || "", note: "", pair: "", price: "", unit: "100g", price_from: false, img: "", images: [], origin: "", milk: "", age: "", texture: "", intensity: 3, notes: [], story: "", drink: "", serve_with: "", serve: "", keep: "", serves: "", includes: [], flag: "", sort: (S.prods.reduce((m, x) => Math.max(m, x.sort), 0) + 1), active: true } : S.prods.find(x => x.id === id);
  const body = `<form id="pform" class="drawer-body" autocomplete="off">
    <div class="pv" id="pv"><img id="pv-img" alt=""><div><small>How it looks on the site</small><b id="pv-name"></b><span id="pv-price"></span><p id="pv-note"></p></div></div>
    <p class="sec">1. The basics <span class="hint">Everything here appears on the product card.</span></p>
    ${fld("Product name", "name", p.name, 'required placeholder="Brie de Meaux"', "What customers see. Use the name you would say across the counter.")}
    <label>Which category is it in?<span class="hint">This decides where it appears: the cheese filters on Main Collection page, or a section on Boards &amp; gifts. You can manage categories on the Categories tab.</span>
      <select name="category">${S.cats.map(c => `<option value="${c.id}"${p.category === c.id ? " selected" : ""}>${esc(c.name)} (${c.section === "gifts" ? "Boards & gifts page" : "Main Collection page"})</option>`).join("")}</select></label>
    <div class="grid3">${fld("Price in pounds", "price", p.price, 'type="number" step="0.01" min="0" required placeholder="9.50"', "Just the number, for example 9 or 9.50.")}${fld("Sold by", "unit", p.unit, 'placeholder="100g"', "What the price is for: 100g, loaf, jar, box. Leave empty for a single item.")}
    <label class="check" style="align-self:center"><input type="checkbox" name="price_from"${p.price_from ? " checked" : ""}> <span>Show as "From £…"<span class="hint">Tick when the price changes depending on what you choose.</span></span></label></div>
    ${area("Short description", "note", p.note, 2, "One or two sentences. Shown on the product card.", "Supple and creamy, with notes of mushroom and cream. Best at room temperature.")}
    ${fld("Goes well with", "pair", p.pair, 'placeholder="A crisp white, warm baguette"', "A small serving suggestion shown in the pop-up.")}
    <p class="sec">2. Photographs <span class="hint">A main photo is required.</span></p>
    <div class="photo"><img class="main" id="main-img" src="${esc(p.img ? imgOf(p) : "")}" alt="">
      <div style="display:grid;gap:.6rem;flex:1;min-width:220px"><input type="hidden" name="img" value="${esc(p.img)}">
      <label class="btn sm" style="text-align:center;cursor:pointer">${isNew ? "Choose main photo" : "Change main photo"}<input type="file" accept="image/*" id="up-main" hidden></label>
      <span class="hint" style="text-transform:none;letter-spacing:0">The main photo is the one on the product card. Tall (portrait) photos look best. Any photo from your phone or camera is fine, it is shrunk automatically.</span></div></div>
    <div><span class="hint" style="display:block;margin-bottom:.4rem;text-transform:none;letter-spacing:0">More photos, shown as small pictures in the product pop-up (optional)</span><div class="gal" id="gal"></div>
    <label class="btn sm" style="display:inline-block;margin-top:.6rem;cursor:pointer">Add more photos<input type="file" accept="image/*" multiple id="up-gal" hidden></label></div>
    <p class="sec">3. Cheese details <span class="hint">Shown in the pop-up when a customer opens the product. Leave blank for bread, boards, boxes and vouchers.</span></p>
    <div class="grid2">${fld("Where it is from", "origin", p.origin, 'placeholder="Savoie"')}${fld("Type of milk", "milk", p.milk, 'placeholder="Raw cow\'s milk"')}${fld("How long it is aged", "age", p.age, 'placeholder="5 to 8 weeks"')}${fld("Texture", "texture", p.texture, 'placeholder="Soft, washed rind"')}</div>
    <label>How strong is it? (1 to 5)<span class="hint">1 is mild and gentle, 5 is bold and punchy. Shown as a small scale.</span><input name="intensity" type="number" min="1" max="5" value="${p.intensity}"></label>
    ${fld("Tasting notes", "notes", (p.notes || []).join(", "), 'placeholder="Mushroom, Fresh cream, Hazelnut"', "A few words separated by commas.")}
    ${area("The story", "story", p.story, 4, "A short paragraph about the cheese: where it is made, what makes it special.")}
    <div class="grid2">${fld("Drink with", "drink", p.drink, 'placeholder="Champagne, or a crisp Chablis"')}${fld("Serve with", "serve_with", p.serve_with, 'placeholder="Warm baguette, pears, walnuts"')}</div>
    ${area("How to serve it", "serve", p.serve, 2, "", "Take it out of the fridge an hour before serving.")}${area("How to keep it", "keep", p.keep, 2, "", "Seven to ten days in its paper, in the coolest part of the fridge.")}
    <p class="sec">4. Boards, boxes and hampers only <span class="hint">Leave blank for everything else.</span></p>
    <div class="grid2">${fld("Who it is for", "serves", p.serves, 'placeholder="Serves 4 to 8"', "Replaces the short description on the card.")}${fld("Badge", "flag", p.flag, 'placeholder="Most popular"', "A small gold label on the corner of the card.")}</div>
    ${area("What is included", "includes", (p.includes || []).join("\n"), 4, "Type one item on each line.", "Five cheeses\nBread, crackers and nuts\nA preserve and honey")}
    <p class="sec">5. On the website</p>
    <div class="grid2">${fld("Position in the list", "sort", p.sort, 'type="number"', "A lower number shows first. 1 is the very first.")}
    <label class="check" style="align-self:center"><input type="checkbox" name="active"${p.active ? " checked" : ""}> <span>Show on the website<span class="hint">Untick to hide it without deleting, for example when it is out of season.</span></span></label></div>
    ${isNew ? fld("Web address ID", "id", p.id, 'pattern="[a-z0-9\\-]+" placeholder="made from the name"', "Used behind the scenes and in links such as collection#brie. It is filled in for you from the name, and cannot be changed after saving.") : `<input type="hidden" name="id" value="${esc(p.id)}">`}
  </form>`;
  openDrawer(isNew ? "Add product" : "Edit product", body, `${isNew ? "" : '<button class="btn danger sm" id="p-del" type="button">Delete</button>'}<span class="sp"></span><button class="btn" id="p-cancel" type="button">Cancel</button><button class="btn dark" id="p-save" type="button">Save</button>`);
  const form = $("#pform"); let gallery = [...(p.images || [])];
  const pv = () => { const n = form.price.value === "" ? 0 : +form.price.value, t = Number.isInteger(n) ? n : n.toFixed(2); const pr = form.price_from.checked ? `From £${t}` : form.unit.value.trim() ? `£${t} / ${form.unit.value.trim()}` : `£${t}`;
    $("#pv-name").textContent = form.name.value || "Product name"; $("#pv-price").textContent = pr; $("#pv-note").textContent = form.note.value || form.serves.value; const im = $("#pv-img"); im.src = $("#main-img").getAttribute("src") || ""; im.style.visibility = im.src && !im.src.endsWith("/") ? "visible" : "hidden"; };
  form.addEventListener("input", pv); pv();
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
  $("#up-main").addEventListener("change", async e => { const f = e.target.files[0]; if (!f) return; try { toast("Uploading"); const u = await upload(f); form.img.value = u; $("#main-img").src = u; pv(); toast("Photo added"); } catch (err) { fail(err); } e.target.value = ""; });
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
  const card = c => `<div class="card cat" data-id="${esc(c.id)}">
    <div class="cat-top"><h2>${esc(c.name)}</h2><span class="hint">${used(c.id)} product${used(c.id) === 1 ? "" : "s"} &middot; ${c.section === "gifts" ? "Boards &amp; gifts page" : "Main Collection page"}</span></div>
    <div class="grid2">
      ${fld("Category name", "name", c.name, 'data-k="name"', c.section === "gifts" ? "Shown as the label in the quick links at the top of the page." : "Shown as a filter button, for example Soft, Hard or Blue.")}
      <label>Which page is it on?<span class="hint">The Main Collection is the cheese and pantry catalogue. Boards &amp; gifts is the gifts page.</span><select data-k="section"><option value="collection"${c.section === "collection" ? " selected" : ""}>Main Collection</option><option value="gifts"${c.section === "gifts" ? " selected" : ""}>Boards and gifts</option></select></label>
      ${c.section === "gifts" ? `${fld("Section heading", "title", c.title, 'data-k="title" placeholder="For the *table.*"', "The big heading on the page. Put a word between *stars* to make it gold and italic.")}${area("Section introduction", "intro", c.intro, 2, "A sentence or two under the heading.", "Served on a wooden board, with bread and a preserve.").replace("<textarea ", "<textarea data-k=\"intro\" ")}` : ""}
      ${fld("Position", "sort", c.sort, 'type="number" data-k="sort"', "A lower number shows first.")}
      <label class="check" style="align-self:center"><input type="checkbox" data-k="active"${c.active ? " checked" : ""}> <span>Show on the website<span class="hint">Untick to hide this category and all of its products.</span></span></label>
    </div>
    <div class="save-row"><button class="btn sm dark" data-save>Save changes</button> <button class="btn sm danger" data-del>Delete category</button></div></div>`;
  $("#view").innerHTML = `
    <div class="page-head"><h1>Categories</h1></div>
    ${lede("Categories are the groups your products sit in, such as Soft cheeses or Gift boxes. Each category appears on one of the two shop pages. Every product belongs to exactly one category.")}
    ${S.cats.map(card).join("")}
    <div class="card"><h2>Add a category</h2><p class="hint" style="margin:-.4rem 0 1rem">Example: a collection category called "Goat" for goat cheeses, or a gifts category called "Hampers". After adding it, create products in it from the Products tab.</p>
    <form id="cat-new" class="grid3" autocomplete="off">
      ${fld("Name", "name", "", 'required placeholder="Goat"')}<label>Which page is it on?<select name="section"><option value="collection">Main Collection</option><option value="gifts">Boards and gifts</option></select></label><div style="align-self:end"><button class="btn dark" type="submit">Add category</button></div></form></div>`;
}
$("#view").addEventListener("click", async e => {
  if (S.tab !== "categories") return;
  const row = e.target.closest(".cat[data-id]"); if (!row) return; const id = row.dataset.id;
  if (e.target.closest("[data-save]")) {
    const g = k => $(`[data-k=${k}]`, row), val = k => (g(k) ? g(k).value.trim() : undefined);
    const upd = { name: val("name"), section: g("section").value, sort: parseInt(g("sort").value, 10) || 0, active: g("active").checked };
    if (g("title")) { upd.title = val("title"); upd.intro = val("intro"); }
    try { await q(sb.from("categories").update(upd).eq("id", id)); clearCache(); toast("Saved"); await viewCategories(); } catch (err) { fail(err); }
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
  ${lede("The shop details that appear all over the website: the opening message, phone number, email, address and opening hours. Change them here and press Save at the bottom.")}
  <form id="shop-form" autocomplete="off">
    <div class="card"><h2>Opening</h2>
      <label class="check" style="margin-bottom:1rem"><input type="checkbox" name="openingSoon"${s.openingSoon ? " checked" : ""}> <span>The shop has not opened yet<span class="hint">While ticked, the site says "Opening soon" and shows the countdown. Untick this on opening day to show real opening hours instead.</span></span></label>
      <div class="grid2">${fld("Opening message", "openingNote", s.openingNote, 'placeholder="Spring 2027, Liverpool"', "A short line shown near the top of the site.")}${fld("Opening date", "openingDate", s.openingDate, 'type="date"', "Used for the countdown line on the home page.")}</div></div>
    <div class="card"><h2>Contact</h2><div class="grid2">${fld("Email address", "email", s.email, 'type="email"', "Where customers write to you.")}${fld("Phone number", "phone", s.phone, 'placeholder="0151 496 0142"', "Shown on the site. Customers can tap it to call.")}${fld("Address, first line", "a1", s.address[0] || "", 'placeholder="14 Gambier Lane"')}${fld("Address, second line", "a2", s.address[1] || "", 'placeholder="Liverpool L1 4DX"', "Include the postcode. It is also used for the map.")}</div></div>
    <div class="card"><h2>Opening hours</h2><p class="hint" style="margin:-.6rem 0 1rem">Use the 24 hour clock: 9 is 9am, 17 is 5pm. Tick Closed for days the shop is shut. These show on the site once the shop has opened.</p><div class="hours"><span></span><b class="hint">Opens at</b><b class="hint">Closes at</b><span></span>${hours}</div></div>
    <div class="save-bar"><button class="btn dark" type="submit">Save settings</button><span class="hint">Changes appear on the site within a few minutes.</span></div>
  </form>`;
  $$("[data-closed]").forEach(c => c.addEventListener("change", () => { $$(`[data-h^="${c.dataset.closed}-"]`).forEach(i => (i.disabled = c.checked)); }));
  $("#shop-form").addEventListener("submit", async e => {
    e.preventDefault(); const f = e.target;
    const digits = f.phone.value.replace(/\D/g, ""), link = f.phone.value.trim().startsWith("+") ? "+" + digits : "+44" + digits.replace(/^0/, "");
    const address = [f.a1.value.trim(), f.a2.value.trim()].filter(Boolean);
    const value = { openingSoon: f.openingSoon.checked, openingNote: f.openingNote.value.trim(), openingDate: f.openingDate.value || DEFAULT_SHOP.openingDate, email: f.email.value.trim(), phone: f.phone.value.trim(), phoneLink: link, address, mapQuery: address.join(", ") + ", UK",
      hours: DAYS.map((_, i) => ($(`[data-closed="${i}"]`).checked ? null : [Math.min(24, +$(`[data-h="${i}-0"]`).value || 0), Math.min(24, +$(`[data-h="${i}-1"]`).value || 0)])) };
    try { await q(sb.from("settings").upsert({ key: "shop", value })); clearCache(); toast("Settings saved"); } catch (err) { fail(err); }
  });
}

/* ---------- email list ---------- */
async function viewSignups() {
  const rows = await q(sb.from("signups").select("*").order("created_at", { ascending: false }).limit(2000));
  $("#view").innerHTML = `<div class="page-head"><h1>Email list</h1><div class="tools"><button class="btn sm" id="s-csv"${rows.length ? "" : " disabled"}>Download as spreadsheet</button></div></div>
    ${lede("People who signed up for opening news using the form in the website footer. Download the list to import it into an email tool when you are ready to write to everyone.")}
    <p class="hint" style="margin-bottom:1rem"><b>${rows.length}</b> ${rows.length === 1 ? "person" : "people"} signed up.</p>
    ${rows.length ? `<table class="tbl"><thead><tr><th>Email</th><th>Signed up</th><th></th></tr></thead><tbody>${rows.map(r => `<tr><td>${esc(r.email)}</td><td>${when(r.created_at)}</td><td class="num"><button class="link" data-del-signup="${r.id}">Remove</button></td></tr>`).join("")}</tbody></table>` : `<p class="empty">No sign-ups yet. They will appear here as soon as someone uses the footer form.</p>`}`;
  const csv = $("#s-csv"); if (csv) csv.addEventListener("click", () => {
    const text = "Email,Signed up\n" + rows.map(r => `"${r.email.replace(/"/g, '""')}",${r.created_at}`).join("\n");
    const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([text], { type: "text/csv" })); a.download = "fromage-and-figue-email-list.csv"; a.click(); URL.revokeObjectURL(a.href);
  });
  $$("[data-del-signup]").forEach(b => b.addEventListener("click", async () => {
    if (!confirm("Remove this email address from the list?")) return;
    try { await q(sb.from("signups").delete().eq("id", b.dataset.delSignup)); toast("Removed"); viewSignups().catch(fail); } catch (err) { fail(err); }
  }));
}

/* ---------- help ---------- */
async function viewHelp() {
  $("#view").innerHTML = `<div class="page-head"><h1>How this works</h1></div>
  ${lede("A short guide to running the shop website. Nothing here can break the site, and you can always change something back.")}
  <div class="help">
    <div class="card"><h2>Add a new product</h2><ol><li>Open <b>Products</b> and press <b>Add product</b>.</li><li>Fill in the name, choose a category and enter the price.</li><li>Choose a main photo. Anything from your phone works.</li><li>Press <b>Save</b>. It appears on the website within a few minutes.</li></ol></div>
    <div class="card"><h2>Change a price or description</h2><ol><li>Open <b>Products</b> and click the product.</li><li>Change what you need and press <b>Save</b>.</li></ol></div>
    <div class="card"><h2>Take something off the website for a while</h2><p>Open the product and untick <b>Show on the website</b>. It stays saved, so you can bring it back later. Use <b>Delete</b> only if you never want it again.</p></div>
    <div class="card"><h2>Deal with an order</h2><ol><li>Open <b>Orders</b>. New orders have a gold <b>New</b> tag, and the Orders tab shows how many are waiting.</li><li>Click an order to see what was bought, who by, when they want it, and any note the customer left (shown with a <b>Note</b> tag in the list).</li><li>Move it along with the buttons at the bottom: <b>Preparing</b>, then <b>Ready</b>, then <b>Order complete</b>. Each click saves straight away.</li></ol><p>Customers are not emailed automatically yet, so contact them yourself using the email shown. Delivery orders have no set time: they are promised within 1 to 3 days.</p></div>
    <div class="card"><h2>Add a category</h2><p>Open <b>Categories</b> and add one, for example "Goat" on Main Collection page. Then add products to it. Collection categories become filter buttons automatically. Gifts categories get their own section on the Boards &amp; gifts page, with the heading and introduction you write.</p></div>
    <div class="card"><h2>See who has signed up for news</h2><p>Open <b>Email list</b>. Everyone who used the footer form is listed there. Press <b>Download as spreadsheet</b> to get the addresses as a file you can open in Excel or import into an email tool. Remove anyone who asks to be taken off.</p></div>
    <div class="card"><h2>Open the shop</h2><p>When you open, go to <b>Shop settings</b> and untick <b>The shop has not opened yet</b>. Check your opening hours are right, then press <b>Save</b>.</p></div>
    <div class="card"><h2>Good to know</h2><ul><li>Changes appear on the website within about 5 minutes. If you edit on this computer, you will see them straight away.</li><li>Photos are shrunk automatically, so there is no need to resize them first.</li><li>The checkout on the site is a demo. No money is taken, and test orders appear in the list like real ones.</li><li>Sign out when you are done, especially on a shared computer.</li></ul></div>
  </div>`;
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
