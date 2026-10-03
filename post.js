/* ------------------------------------------------------------------
   A single blog post: /post?slug=the-post-slug
------------------------------------------------------------------ */
(() => {
const esc = v => String(v ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const fmtDate = iso => new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/London" });
const root = $("#post");

/* The article body is written by the shop in the admin. It is still cleaned before it is shown. */
function clean(html) {
  const doc = new DOMParser().parseFromString(`<div>${html}</div>`, "text/html"), box = doc.body.firstChild;
  box.querySelectorAll("script, style, object, embed, link, meta, base, form, noscript").forEach(n => n.remove());
  box.querySelectorAll("iframe").forEach(f => { if (!/^https:\/\/(www\.)?(youtube\.com|youtube-nocookie\.com|player\.vimeo\.com)\//.test(f.getAttribute("src") || "")) f.remove(); else { f.removeAttribute("srcdoc"); f.setAttribute("loading", "lazy"); } });
  box.querySelectorAll("*").forEach(n => {
    [...n.attributes].forEach(a => {
      const v = a.value.trim().toLowerCase();
      if (/^on/i.test(a.name) || ((a.name === "href" || a.name === "src" || a.name === "xlink:href") && /^(javascript|data):/.test(v) && !(a.name === "src" && /^data:image\//.test(v)))) n.removeAttribute(a.name);
    });
    if (n.tagName === "A" && n.getAttribute("href") && /^https?:/.test(n.getAttribute("href")) && !n.getAttribute("href").includes(location.host)) { n.setAttribute("target", "_blank"); n.setAttribute("rel", "noopener noreferrer"); }
    if (n.tagName === "IMG") n.setAttribute("loading", "lazy");
  });
  return box.innerHTML;
}
function setMeta(p) {
  const title = `${p.seo_title || p.title} | Fromage & Figue`, desc = p.seo_description || p.excerpt || "";
  document.title = title;
  const set = (sel, v) => { const el = $(sel); if (el) el.setAttribute("content", v); };
  set('meta[name="description"]', desc); set('meta[property="og:title"]', title); set('meta[property="og:description"]', desc);
  set('meta[name="twitter:title"]', title); set('meta[name="twitter:description"]', desc);
  const url = `https://fromageandfigue.co.uk/blog/${encodeURIComponent(p.slug)}/`;
  set('meta[property="og:url"]', url); const c = $('link[rel="canonical"]'); if (c) c.href = url;
  if (p.featured_image) { set('meta[property="og:image"]', p.featured_image); set('meta[name="twitter:image"]', p.featured_image); }
}
function notFound() {
  root.innerHTML = `<header class="post-hero"><div class="wrap narrow"><a class="back" href="blog">&lsaquo; All stories</a><h1>We could not find <em>that story.</em></h1><p class="standfirst">It may have been moved or taken down. Head back to the blog to see everything we have written.</p></div></header>`;
  document.title = "Story not found | Fromage & Figue";
}
const card = p => `<a class="bcard" href="/blog/${encodeURIComponent(p.slug)}/" data-reveal><figure>${p.featured_image ? `<img src="${esc(p.featured_image)}" alt="${esc(p.featured_alt || p.title)}" loading="lazy">` : `<span class="no-img" aria-hidden="true">F&amp;F</span>`}</figure><div class="bcard-body"><p class="bmeta">${[p.category, fmtDate(p.published_at)].filter(Boolean).map(esc).join(" &middot; ")}</p><h3>${esc(p.title)}</h3>${p.excerpt ? `<p class="bex">${esc(p.excerpt)}</p>` : ""}<span class="bmore">Read the story</span></div></a>`;

(async () => {
  const slug = (new URLSearchParams(location.search).get("slug") || "").trim().toLowerCase();
  if (!slug) return notFound();
  let p = null;
  try {
    const now = new Date().toISOString();
    const r = await fetch(`${FF_SB.url}/rest/v1/posts?select=*&slug=eq.${encodeURIComponent(slug)}&status=eq.published&published_at=lte.${now}&limit=1`, { headers: { apikey: FF_SB.key } });
    if (r.ok) p = (await r.json())[0];
  } catch (e) {}
  if (!p) return notFound();
  setMeta(p);
  root.innerHTML = `<header class="post-hero"><div class="wrap narrow">
      <a class="back" href="blog">&lsaquo; All stories</a>
      <p class="bmeta">${[p.category, fmtDate(p.published_at), `${p.read_minutes || 1} min read`].filter(Boolean).map(esc).join(" &middot; ")}</p>
      <h1>${esc(p.title)}</h1>
      ${p.excerpt ? `<p class="standfirst">${esc(p.excerpt)}</p>` : ""}
      <p class="byline">By ${esc(p.author)}</p>
    </div></header>
    ${p.featured_image ? `<figure class="post-image"><img src="${esc(p.featured_image)}" alt="${esc(p.featured_alt || p.title)}"></figure>` : ""}
    <div class="wrap narrow"><div class="prose">${clean(p.content)}</div></div>`;
  $$("#post .back, #post h1, #post .bmeta, #post .standfirst, #post .byline, #post .post-image").forEach((el, i) => { el.style.setProperty("--i", i); el.classList.add("rise"); });
  try {
    const r = await fetch(`${FF_SB.url}/rest/v1/posts?select=slug,title,excerpt,featured_image,featured_alt,category,published_at&status=eq.published&published_at=lte.${new Date().toISOString()}&slug=neq.${encodeURIComponent(p.slug)}&order=published_at.desc&limit=3`, { headers: { apikey: FF_SB.key } });
    const others = r.ok ? await r.json() : [];
    if (others.length) { $("#more-grid").innerHTML = others.map(card).join(""); $("#more-wrap").hidden = false; $$("#more-grid [data-reveal]").forEach((el, n) => { el.style.setProperty("--d", `${n * 0.08}s`); io.observe(el); }); }
  } catch (e) {}
})();
})();
