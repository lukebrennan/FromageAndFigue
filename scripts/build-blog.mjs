/* ------------------------------------------------------------------
   Builds a real page for every published blog post, so each one has a clean
   address (/blog/the-post-title/) that search engines can read.
   It reads the published posts from Supabase and writes:
     blog/<slug>/index.html   one page per post, built from post.html
     blog/index.html          the blog archive (a copy of blog.html)
     sitemap.xml              every public page, found automatically
     llms.txt                 a plain summary of the site for AI assistants
   Run by the "Build blog pages" GitHub Action. Needs: npm i sanitize-html
------------------------------------------------------------------ */
import fs from "node:fs";
import path from "node:path";
import sanitizeHtml from "sanitize-html";

const SITE = "https://fromageandfigue.co.uk";
const SB_URL = process.env.SUPABASE_URL || "https://gshowmtmibiqaytnyqkr.supabase.co";
const SB_KEY = process.env.SUPABASE_KEY || "sb_publishable_8EgFC7RJcarnTit6LlNlLw_ExSnvtXt";
const ROOT = process.cwd();
const esc = v => String(v ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const day = iso => new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/London" });
const em = s => esc(s).replace(/\*(.+?)\*/g, "<em>$1</em>");

const cleanBody = html => sanitizeHtml(html || "", {
  allowedTags: [...sanitizeHtml.defaults.allowedTags, "img", "figure", "figcaption", "h1", "h2", "h3", "h4", "iframe", "u", "s", "span", "hr", "video", "source", "table", "thead", "tbody", "tr", "th", "td", "details", "summary"],
  allowedAttributes: { "*": ["class", "id", "title", "style"], a: ["href", "name", "target", "rel"], img: ["src", "srcset", "sizes", "alt", "width", "height", "loading"], iframe: ["src", "width", "height", "allow", "allowfullscreen", "title", "loading"], video: ["src", "controls", "poster", "width", "height"], source: ["src", "type"], td: ["colspan", "rowspan"], th: ["colspan", "rowspan"] },
  allowedStyles: { "*": { "text-align": [/^(left|right|center|justify)$/], color: [/^#[0-9a-f]{3,8}$/i], "font-size": [/^\d+(\.\d+)?(px|em|rem|%)$/] } },
  allowedIframeHostnames: ["www.youtube.com", "www.youtube-nocookie.com", "youtube.com", "player.vimeo.com"],
  allowedSchemes: ["http", "https", "mailto", "tel"], allowedSchemesByTag: { img: ["http", "https", "data"] },
  transformTags: {
    a: (tag, attribs) => (/^https?:/.test(attribs.href || "") && !(attribs.href || "").includes("fromageandfigue.co.uk") ? { tagName: "a", attribs: { ...attribs, target: "_blank", rel: "noopener noreferrer" } } : { tagName: "a", attribs }),
    img: (tag, attribs) => ({ tagName: "img", attribs: { ...attribs, loading: "lazy" } }),
  },
});

const card = p => `<a class="bcard" href="/blog/${esc(p.slug)}/" data-reveal><figure>${p.featured_image ? `<img src="${esc(p.featured_image)}" alt="${esc(p.featured_alt || p.title)}" loading="lazy">` : `<span class="no-img" aria-hidden="true">F&amp;F</span>`}</figure><div class="bcard-body"><p class="bmeta">${[p.category, day(p.published_at)].filter(Boolean).map(esc).join(" &middot; ")}</p><h3>${esc(p.title)}</h3>${p.excerpt ? `<p class="bex">${esc(p.excerpt)}</p>` : ""}<span class="bmore">Read the story</span></div></a>`;


// ---------- structured data (schema.org) ----------
const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const hh = h => `${String(h).padStart(2, "0")}:00`;
const abs = u => (!u ? undefined : /^https?:/.test(u) ? u : `${SITE}/${u.replace(/^\//, "")}`);
const phoneE164 = () => { if (shop.phoneLink) return shop.phoneLink; const d = String(shop.phone || "").replace(/\D/g, ""); return d ? "+44" + d.replace(/^0/, "") : undefined; };
const openingSpec = () => {
  const groups = [];
  [1, 2, 3, 4, 5, 6, 0].forEach(i => { const h = shop.hours[i]; if (!h) return; const g = groups.find(x => x.h[0] === h[0] && x.h[1] === h[1]); if (g) g.days.push(DAYS[i]); else groups.push({ h, days: [DAYS[i]] }); });
  return groups.map(g => ({ "@type": "OpeningHoursSpecification", dayOfWeek: g.days, opens: hh(g.h[0]), closes: hh(g.h[1]) }));
};
const storeNode = () => ({
  "@type": "Store", "@id": `${SITE}/#store`, name: "Fromage & Figue", url: `${SITE}/`, logo: `${SITE}/assets/logo.png`, image: `${SITE}/assets/social.jpg`,
  description: "An artisan fromagerie and delicatessen in Liverpool. French and European cheeses, bread and pantry goods, cheese boards, gift boxes and gift vouchers.",
  slogan: "Fromagerie and delicatessen, Liverpool",
  address: { "@type": "PostalAddress", streetAddress: shop.address[0], addressLocality: "Liverpool", postalCode: (shop.address[1] || "").replace(/^Liverpool\s*/i, ""), addressCountry: "GB" },
  telephone: phoneE164(), email: shop.email, areaServed: "Liverpool", currenciesAccepted: "GBP", priceRange: "££",
  founder: { "@type": "Person", name: "Benoit Severin-Delos" },
  ...(shop.openingSoon ? {} : { openingHoursSpecification: openingSpec() }),
});
const siteNode = () => ({ "@type": "WebSite", "@id": `${SITE}/#website`, url: `${SITE}/`, name: "Fromage & Figue", inLanguage: "en-GB", publisher: { "@id": `${SITE}/#store` } });
const crumbs = items => ({ "@type": "BreadcrumbList", itemListElement: items.map(([name, url], i) => ({ "@type": "ListItem", position: i + 1, name, item: url })) });
const productNode = p => ({ "@type": "Product", name: p.name, description: p.note || undefined, image: abs(/^https?:/.test(p.img) ? p.img : `assets/products/${p.img}.webp`), category: (cats.find(c => c.id === p.category) || {}).name, brand: { "@type": "Brand", name: "Fromage & Figue" },
  offers: { "@type": "Offer", price: Number(p.price).toFixed(2), priceCurrency: "GBP", availability: "https://schema.org/InStock", url: `${SITE}/${p.category && (cats.find(c => c.id === p.category) || {}).section === "gifts" ? "gifts" : "collection"}#${p.id}` } });
const itemList = (name, section) => ({ "@type": "ItemList", name, itemListElement: prods.filter(p => p.active && (cats.find(c => c.id === p.category) || {}).section === section).map((p, i) => ({ "@type": "ListItem", position: i + 1, item: productNode(p) })) });
const ldScript = graph => `<script type="application/ld+json" id="schema">${JSON.stringify({ "@context": "https://schema.org", "@graph": graph }).replace(/</g, "\\u003c")}</script>`;
function pageGraph(pg) {
  const base = [storeNode(), siteNode()], page = { "@id": `${pg.loc}#webpage`, url: pg.loc, name: pg.title, description: pg.desc || undefined, inLanguage: "en-GB", isPartOf: { "@id": `${SITE}/#website` }, about: { "@id": `${SITE}/#store` }, primaryImageOfPage: { "@type": "ImageObject", url: `${SITE}/assets/social.jpg` } };
  if (pg.slug === "") return [...base, { "@type": "WebPage", ...page }];
  const crumb = crumbs([["Home", `${SITE}/`], [pg.title, pg.loc]]);
  if (pg.slug === "collection") return [...base, { "@type": "CollectionPage", ...page }, itemList("Main Collection", "collection"), crumb];
  if (pg.slug === "gifts") return [...base, { "@type": "CollectionPage", ...page }, itemList("Boards and gifts", "gifts"), crumb];
  if (pg.slug === "blog/") return [...base, { "@type": "Blog", ...page, blogPost: posts.map(p => ({ "@type": "BlogPosting", headline: p.title, url: `${SITE}/blog/${p.slug}/`, datePublished: p.published_at, image: abs(p.featured_image), author: { "@type": "Person", name: p.author } })) }, crumb];
  if (pg.slug === "pairing") return [...base, { "@type": "WebPage", ...page }, crumb];
  return [...base, { "@type": "WebPage", ...page }, crumb];
}
function injectSchema(html, graph) {
  const tag = ldScript(graph);
  return /<script type="application\/ld\+json" id="schema">[\s\S]*?<\/script>/.test(html) ? html.replace(/<script type="application\/ld\+json" id="schema">[\s\S]*?<\/script>/, () => tag) : html.replace("</head>", () => `  ${tag}\n</head>`);
}

function page(template, p, others) {
  const title = `${p.seo_title || p.title} | Fromage & Figue`, desc = p.seo_description || p.excerpt || "", url = `${SITE}/blog/${p.slug}/`;
  const meta = [p.category, day(p.published_at), `${p.read_minutes || 1} min read`].filter(Boolean).map(esc).join(" &middot; ");
  const article = `<article id="post">
    ${p.featured_image ? `<header class="post-cover"><div class="cover-media"><img src="${esc(p.featured_image)}" alt="${esc(p.featured_alt || p.title)}"></div><div class="cover-text wrap">
      <a class="back" href="/blog/">&lsaquo; All stories</a>
      <p class="bmeta">${meta}</p>
      <h1>${esc(p.title)}</h1>
      ${p.excerpt ? `<p class="standfirst">${esc(p.excerpt)}</p>` : ""}
      <p class="byline">By ${esc(p.author)}</p>
    </div></header>` : `<header class="post-hero"><div class="wrap narrow">
      <a class="back rise" href="/blog/" style="--i:0">&lsaquo; All stories</a>
      <p class="bmeta rise" style="--i:1">${meta}</p>
      <h1 class="rise" style="--i:2">${esc(p.title)}</h1>
      ${p.excerpt ? `<p class="standfirst rise" style="--i:3">${esc(p.excerpt)}</p>` : ""}
      <p class="byline rise" style="--i:4">By ${esc(p.author)}</p>
    </div></header>`}
    <div class="wrap narrow"><div class="prose">${cleanBody(p.content)}</div></div>
  </article>
  ${others.length ? `<section class="g-section sand" id="more-wrap"><div class="wrap"><div class="g-head" data-reveal><p class="eyebrow dark"><span>Keep reading</span></p><h2>More <em>stories.</em></h2></div><div class="blog-grid" id="more-grid">${others.map(card).join("")}</div></div></section>` : ""}`;
  const ld = JSON.stringify({ "@context": "https://schema.org", "@graph": [storeNode(), siteNode(), { "@type": "BlogPosting", "@id": `${url}#post`, headline: p.title, description: desc || undefined, image: p.featured_image || undefined, articleSection: p.category || undefined, wordCount: undefined, datePublished: p.published_at, dateModified: p.updated_at || p.published_at, inLanguage: "en-GB", author: { "@type": "Person", name: p.author }, publisher: { "@id": `${SITE}/#store` }, isPartOf: { "@id": `${SITE}/#website` }, mainEntityOfPage: url }, crumbs([["Home", `${SITE}/`], ["Blog", `${SITE}/blog/`], [p.title, url]])] }).replace(/</g, "\\u003c");
  let h = template;
  h = h.replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(title)}</title>`);
  h = h.replace(/(<meta name="description" content=")[^"]*"/, `$1${esc(desc)}"`);
  h = h.replace(/(<meta property="og:title" content=")[^"]*"/, `$1${esc(title)}"`).replace(/(<meta name="twitter:title" content=")[^"]*"/, `$1${esc(title)}"`);
  h = h.replace(/(<meta property="og:description" content=")[^"]*"/, `$1${esc(desc)}"`).replace(/(<meta name="twitter:description" content=")[^"]*"/, `$1${esc(desc)}"`);
  h = h.replace(/(<link rel="canonical" href=")[^"]*"/, `$1${url}"`).replace(/(<meta property="og:url" content=")[^"]*"/, `$1${url}"`);
  h = h.replace(/(<meta property="og:type" content=")website"/, `$1article"`);
  if (p.featured_image) h = h.replace(/(<meta property="og:image" content=")[^"]*"/, `$1${esc(p.featured_image)}"`).replace(/(<meta name="twitter:image" content=")[^"]*"/, `$1${esc(p.featured_image)}"`);
  h = h.replace('<meta charset="utf-8">', '<meta charset="utf-8">\n  <base href="/">');
  h = h.replace("</head>", `  <script type="application/ld+json" id="schema">${ld}</script>\n</head>`);
  h = h.replace(/<main id="top"[\s\S]*?<\/main>/, `<main id="top" class="cat post-page">\n    ${article}\n  </main>`);
  h = h.replace(/ data-page="post\.js"/, "");
  h = h.replace(/href="#(?!")/g, 'href="/blog/' + p.slug + '/#');   // in-page links must stay on this page now a base address is set
  return h;
}

const now = new Date().toISOString();
const res = await fetch(`${SB_URL}/rest/v1/posts?select=*&status=eq.published&published_at=lte.${now}&order=published_at.desc&limit=1000`, { headers: { apikey: SB_KEY } });
if (!res.ok && res.status !== 404) { console.error("Could not read posts:", res.status, await res.text()); process.exit(1); }
const posts = res.ok ? (await res.json()).filter(p => /^[a-z0-9-]+$/.test(p.slug)) : [];   // 404 means the blog table has not been created yet
const get = async q => { try { const r = await fetch(`${SB_URL}/rest/v1/${q}`, { headers: { apikey: SB_KEY } }); return r.ok ? await r.json() : []; } catch (e) { return []; } };
const [cats, prods, settings] = await Promise.all([get("categories?select=*&order=sort"), get("products?select=*&order=sort"), get("settings?select=*&key=eq.shop")]);
const shop = { address: ["14 Gambier Lane", "Liverpool L1 4DX"], email: "hello@fromageandfigue.co.uk", phone: "0151 496 0142", openingSoon: true, openingNote: "Spring 2027, Liverpool", hours: [null, null, [10, 18], [10, 18], [10, 18], [10, 18], [9, 17]], ...((settings[0] && settings[0].value) || {}) };
const template = fs.readFileSync(path.join(ROOT, "post.html"), "utf8");
const blogDir = path.join(ROOT, "blog");
fs.mkdirSync(blogDir, { recursive: true });

// remove pages of posts that are no longer published
const keep = new Set(posts.map(p => p.slug));
for (const d of fs.readdirSync(blogDir, { withFileTypes: true })) if (d.isDirectory() && !keep.has(d.name)) fs.rmSync(path.join(blogDir, d.name), { recursive: true, force: true });

for (const p of posts) {
  const others = posts.filter(o => o.slug !== p.slug).slice(0, 3);
  fs.mkdirSync(path.join(blogDir, p.slug), { recursive: true });
  fs.writeFileSync(path.join(blogDir, p.slug, "index.html"), page(template, p, others));
}

// ---------- every public page, found automatically ----------
const SKIP = new Set(["admin.html", "404.html", "post.html"]);
const decode = t => t.replace(/&amp;/g, "&").replace(/&middot;/g, "·").replace(/&#39;/g, "'").replace(/&quot;/g, '"');
const found = fs.readdirSync(ROOT).filter(f => f.endsWith(".html") && !SKIP.has(f)).map(f => {
  const h = fs.readFileSync(path.join(ROOT, f), "utf8");
  const slug = f === "index.html" ? "" : f === "blog.html" ? "blog/" : f.replace(/\.html$/, "");
  return { slug, loc: `${SITE}/${slug}`, title: decode((/<title>([\s\S]*?)<\/title>/.exec(h) || [, f])[1]).replace(/\s*\|.*$/, ""), desc: decode((/<meta name="description" content="([^"]*)"/.exec(h) || [, ""])[1]) };
}).sort((a, b) => (a.slug === "" ? -1 : b.slug === "" ? 1 : a.slug.localeCompare(b.slug)));

// ---------- structured data in every public page, and the archive copy ----------
for (const pg of found) {
  const file = path.join(ROOT, pg.slug === "" ? "index.html" : pg.slug === "blog/" ? "blog.html" : `${pg.slug}.html`);
  const before = fs.readFileSync(file, "utf8"), after = injectSchema(before, pageGraph(pg));
  if (after !== before) fs.writeFileSync(file, after);
}
// the archive lives at /blog/, a copy of blog.html with the base address set
const archive = fs.readFileSync(path.join(ROOT, "blog.html"), "utf8").replace('<meta charset="utf-8">', '<meta charset="utf-8">\n  <base href="/">').replace(/href="#(?!")/g, 'href="/blog/#');
fs.writeFileSync(path.join(blogDir, "index.html"), archive);

// ---------- sitemap.xml ----------
const urls = [...found.map(p => ({ loc: p.loc })), ...posts.map(p => ({ loc: `${SITE}/blog/${p.slug}/`, lastmod: (p.updated_at || p.published_at || "").slice(0, 10) }))];
fs.writeFileSync(path.join(ROOT, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(u => `  <url><loc>${u.loc}</loc>${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ""}</url>`).join("\n")}\n</urlset>\n`);

// ---------- llms.txt: a plain summary of the site for AI assistants ----------
const names = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"], clock = h => `${String(h).padStart(2, "0")}:00`;
const hoursText = (() => {
  const seq = [1, 2, 3, 4, 5, 6, 0], groups = [];
  seq.forEach(i => { const g = groups[groups.length - 1]; if (g && JSON.stringify(shop.hours[g.d[0]]) === JSON.stringify(shop.hours[i])) g.d.push(i); else groups.push({ d: [i] }); });
  const open = groups.filter(g => shop.hours[g.d[0]]).map(g => { const h = shop.hours[g.d[0]]; return `${g.d.length > 1 ? `${names[g.d[0]]} to ${names[g.d[g.d.length - 1]]}` : names[g.d[0]]} ${clock(h[0])} to ${clock(h[1])}`; });
  const shut = seq.filter(i => !shop.hours[i]).map(i => names[i]);
  return open.join("; ") + (shut.length ? `; closed ${shut.join(" and ")}` : "");
})();
const price = p => { const n = Number(p.price), t = Number.isInteger(n) ? n : n.toFixed(2); return p.price_from ? `from £${t}` : p.unit ? `£${t} per ${p.unit}` : `£${t}`; };
const catName = id => (cats.find(c => c.id === id) || {}).name || id;
const group = section => cats.filter(c => c.section === section).map(c => ({ c, items: prods.filter(p => p.category === c.id && p.active) })).filter(g => g.items.length);
const list = section => group(section).map(g => `### ${g.c.name}\n${g.items.map(p => `- ${p.name}: ${price(p)}.${p.note ? " " + p.note.replace(/\s+/g, " ") : ""}`).join("\n")}`).join("\n\n");
const llms = `# Fromage & Figue

> Fromage & Figue is an artisan fromagerie and delicatessen in Liverpool, founded by Benoit Severin-Delos. It sells French and European cheeses, bread and pantry goods, hand-composed cheese boards, gift boxes and gift vouchers, for free collection in store or delivery. ${shop.openingSoon ? `The shop has not opened yet: it is opening ${shop.openingNote}. The website is a work in progress.` : "The shop is open."}

## Key facts
- Address: ${shop.address.join(", ")}
- Contact: ${shop.email}, ${shop.phone}
- Opening hours${shop.openingSoon ? " (once open)" : ""}: ${hoursText}
- Collection from the shop is free. Delivery costs £4.99, and is free on orders over £60. Delivery takes 1 to 3 days.
- Collection times can only be booked for days and times the shop is open.

## Pages
${found.map(p => `- [${p.title}](${p.loc})${p.desc ? `: ${p.desc}` : ""}`).join("\n")}

## Main Collection
${list("collection") || "- See the Main Collection page."}

## Boards and gifts
${list("gifts") || "- See the Boards & Gifts page."}
${posts.length ? `\n## Blog posts\n${posts.map(p => `- [${p.title}](${SITE}/blog/${p.slug}/)${p.excerpt ? `: ${p.excerpt.replace(/\s+/g, " ")}` : ""}`).join("\n")}\n` : ""}
## Optional
- [Sitemap](${SITE}/sitemap.xml)
`;
fs.writeFileSync(path.join(ROOT, "llms.txt"), llms);
console.log(`Built ${posts.length} post page${posts.length === 1 ? "" : "s"}, ${urls.length} sitemap entries and llms.txt.`);
