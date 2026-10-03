// Fromage & Figue: sends the shop's emails through Resend.
//   1. New order: a confirmation to the customer, and an alert to the shop owner
//   2. Order marked Ready: "ready to collect" or "on its way" (delivery)
//   3. Order cancelled: with the reason typed in the admin
// Deploy in Supabase > Edge Functions as "send-email", with "Verify JWT" switched OFF
// (the database triggers call it, and it checks everything against the database itself).
// Needs the secret RESEND_API_KEY.
import { createClient } from "npm:@supabase/supabase-js@2";

const SITE = "https://fromageandfigue.co.uk";
const FROM = "Fromage & Figue <hello@fromageandfigue.co.uk>";
const REPLY_TO = "lukebrennan03@gmail.com";   // customer replies land here until the shop has its own inbox
const ADMIN = "lukebrennan03@gmail.com";
const DEFAULT_SHOP = { email: "hello@fromageandfigue.co.uk", phone: "0151 496 0142", address: ["14 Gambier Lane", "Liverpool L1 4DX"] };

// ---------------------------------------------------------------- templates
const esc = (v: unknown) => String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] as string));
const gbp = (n: number) => new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(Number(n) || 0);
const when = (iso: string) => new Date(iso).toLocaleString("en-GB", { timeZone: "Europe/London", weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" });
const em = (s: string) => esc(s).replace(/\*(.+?)\*/g, '<em style="color:#b79a5d;font-style:italic">$1</em>');   // *word* becomes gold italic
const firstName = (n: string) => String(n || "").trim().split(/\s+/)[0] || "there";
const SERIF = "Georgia,'Times New Roman',serif", SANS = "Helvetica,Arial,sans-serif";

function layout(o: { preheader: string; eyebrow: string; title: string; excerpt: string; body?: string; shop: any; demo?: boolean }) {
  const addr = (o.shop.address || []).map(esc).join(", ");
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><title>${esc(o.eyebrow)}</title></head>
<body style="margin:0;padding:0;background:#ece4d6;-webkit-text-size-adjust:100%">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:#ece4d6">${esc(o.preheader)}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#ece4d6"><tr><td align="center" style="padding:28px 12px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#fffdf9">
<tr><td style="height:4px;background:#b79a5d;font-size:0;line-height:0">&nbsp;</td></tr>
<tr><td align="center" style="padding:38px 32px 6px"><a href="${SITE}" style="text-decoration:none"><img src="${SITE}/assets/logo.png" width="200" alt="Fromage &amp; Figue" style="display:block;width:200px;max-width:70%;height:auto;border:0"></a></td></tr>
<tr><td style="padding:34px 40px 0"><p style="margin:0 0 14px;font:500 11px ${SANS};letter-spacing:.28em;text-transform:uppercase;color:#8a6d33">${esc(o.eyebrow)}</p>
<h1 style="margin:0;font:400 40px/1.08 ${SERIF};color:#141312;letter-spacing:-.01em">${em(o.title)}</h1>
<div style="width:48px;height:1px;background:#b79a5d;margin:22px 0 20px;font-size:0;line-height:0">&nbsp;</div>
<p style="margin:0;font:400 17px/1.7 ${SANS};color:#4a463f">${o.excerpt}</p></td></tr>
${o.body ? `<tr><td style="padding:30px 40px 0">${o.body}</td></tr>` : ""}
<tr><td style="padding:34px 40px 40px"><p style="margin:0;font:400 14px/1.7 ${SANS};color:#6f6a61">Questions about your order? Just reply to this email, or call us on ${esc(o.shop.phone)}.${o.demo ? "<br><br><i>This was a demonstration order. No payment was taken.</i>" : ""}</p></td></tr>
<tr><td style="background:#141312;padding:30px 40px"><p style="margin:0 0 6px;font:400 22px ${SERIF};color:#f7f3ec">Fromage &amp; Figue</p>
<p style="margin:0;font:400 12px/1.8 ${SANS};letter-spacing:.04em;color:#d6c291">${addr}<br>An artisan fromagerie and delicatessen, opening Spring 2027</p></td></tr>
</table></td></tr></table></body></html>`;
}

const row = (k: string, v: string) => `<tr><td style="padding:7px 16px 7px 0;font:500 11px ${SANS};letter-spacing:.18em;text-transform:uppercase;color:#8a6d33;vertical-align:top;white-space:nowrap">${k}</td><td style="padding:7px 0;font:400 15px/1.5 ${SANS};color:#141312">${v}</td></tr>`;
const panel = (inner: string) => `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f3ede1;border-left:3px solid #b79a5d"><tr><td style="padding:16px 20px">${inner}</td></tr></table>`;

function items(o: any) {
  const lines = (o.items || []).map((i: any) => `<tr><td style="padding:12px 0;border-bottom:1px solid #e6dfd0;font:400 15px/1.4 ${SANS};color:#141312">${esc(i.name)}<br><span style="font-size:13px;color:#6f6a61">${esc(i.qty)} x ${esc(i.price)}</span></td><td align="right" style="padding:12px 0;border-bottom:1px solid #e6dfd0;font:400 15px ${SANS};color:#141312;white-space:nowrap">${gbp((i.unit_price || 0) * i.qty)}</td></tr>`).join("");
  const tot = (k: string, v: string, strong = false) => `<tr><td style="padding:${strong ? "14px" : "8px"} 0 ${strong ? "0" : "0"};font:${strong ? "400 22px" : "400 14px"} ${strong ? SERIF : SANS};color:${strong ? "#141312" : "#6f6a61"}">${k}</td><td align="right" style="padding:${strong ? "14px" : "8px"} 0 0;font:${strong ? "400 22px" : "400 14px"} ${strong ? SERIF : SANS};color:#141312">${v}</td></tr>`;
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td colspan="2" style="padding-bottom:8px;border-bottom:1px solid #141312;font:500 11px ${SANS};letter-spacing:.2em;text-transform:uppercase;color:#6f6a61">Your order</td></tr>${lines}
${tot("Subtotal", gbp(o.subtotal))}${tot(o.fulfilment === "delivery" ? "Delivery" : "Collection in store", o.delivery_fee > 0 ? gbp(o.delivery_fee) : "Free")}${tot("Total", gbp(o.total), true)}</table>`;
}

const delivery = (o: any) => o.fulfilment === "delivery";
const whenText = (o: any) => (delivery(o) ? "Within 1 to 3 days" : o.slot_at ? when(o.slot_at) : "We will confirm a time with you");
const shopAddr = (shop: any) => (shop.address || []).map(esc).join("<br>");

const T = {
  confirmation(o: any, shop: any) {
    const d = delivery(o);
    const details = row("Order", esc(o.ref)) + row(d ? "Delivery" : "Collection", esc(whenText(o))) + (d ? row("Delivering to", esc(o.address).replace(/\n/g, "<br>")) : row("Collect from", shopAddr(shop))) + (o.customer_note ? row("Your note", esc(o.customer_note).replace(/\n/g, "<br>")) : "");
    return {
      subject: `Your Fromage & Figue order ${o.ref} is confirmed`,
      html: layout({
        shop, demo: o.payment === "demo", preheader: `Thank you, ${firstName(o.customer_name)}. We have your order and will start preparing it.`,
        eyebrow: "Order confirmed", title: `Thank you, *${firstName(o.customer_name)}.*`,
        excerpt: d ? "Your order is with us and we are putting it together with care. It will be delivered to you within one to three days, and we will write again the moment it is on its way."
          : "Your order is with us and we are putting it together with care. Everything will be wrapped and waiting for you at the time below.",
        body: panel(`<table role="presentation" cellpadding="0" cellspacing="0">${details}</table>`) + `<div style="height:26px;line-height:26px;font-size:0">&nbsp;</div>` + items(o),
      }),
    };
  },
  alert(o: any, shop: any) {
    const d = delivery(o);
    const details = row("Customer", esc(o.customer_name)) + row("Email", `<a href="mailto:${esc(o.email)}" style="color:#141312">${esc(o.email)}</a>`) + row(d ? "Delivery" : "Collection", esc(whenText(o))) + (d ? row("Address", esc(o.address).replace(/\n/g, "<br>")) : "") + (o.customer_note ? row("Note", `<b>${esc(o.customer_note).replace(/\n/g, "<br>")}</b>`) : "");
    return {
      subject: `New order ${o.ref}: ${gbp(o.total)} (${d ? "Delivery" : "Collection"})`,
      html: layout({
        shop, preheader: `${o.customer_name} placed a ${d ? "delivery" : "collection"} order for ${gbp(o.total)}.`,
        eyebrow: "New order", title: `Order *${esc(o.ref)}*`,
        excerpt: `${esc(o.customer_name)} has placed a ${d ? "delivery" : "collection"} order for <b>${gbp(o.total)}</b>.${o.customer_note ? " They left a note, shown below." : ""}`,
        body: panel(`<table role="presentation" cellpadding="0" cellspacing="0">${details}</table>`) + `<div style="height:26px;line-height:26px;font-size:0">&nbsp;</div>` + items(o) +
          `<table role="presentation" cellpadding="0" cellspacing="0" style="margin-top:28px"><tr><td style="background:#141312"><a href="${SITE}/admin" style="display:inline-block;padding:15px 28px;font:500 12px ${SANS};letter-spacing:.2em;text-transform:uppercase;color:#f7f3ec;text-decoration:none">Open in the admin</a></td></tr></table>`,
      }),
    };
  },
  ready(o: any, shop: any) {
    const d = delivery(o);
    return {
      subject: d ? `Your order ${o.ref} is on its way` : `Your order ${o.ref} is ready to collect`,
      html: layout({
        shop, demo: o.payment === "demo", preheader: d ? "Your order has left us and will reach you within one to three days." : "Everything is wrapped and waiting for you.",
        eyebrow: d ? "On its way" : "Ready to collect", title: d ? "Your order is on *its way.*" : "Your order is *ready.*",
        excerpt: d ? `Good news, ${esc(firstName(o.customer_name))}. Your order has left us and should reach you within one to three days. We hope you enjoy every bite.`
          : `Good news, ${esc(firstName(o.customer_name))}. Everything is wrapped and waiting for you. Come by whenever you are ready, and bring this email if you like.`,
        body: panel(`<table role="presentation" cellpadding="0" cellspacing="0">${row("Order", esc(o.ref))}${d ? row("Delivering to", esc(o.address).replace(/\n/g, "<br>")) : row("Collect from", shopAddr(shop)) + (o.slot_at ? row("Your time", esc(when(o.slot_at))) : "")}</table>`),
      }),
    };
  },
  cancelled(o: any, shop: any) {
    const reason = String(o.cancel_reason || "").trim();
    return {
      subject: `Your order ${o.ref} has been cancelled`,
      html: layout({
        shop, demo: o.payment === "demo", preheader: reason ? `Reason: ${reason}` : "We are sorry, your order has been cancelled.",
        eyebrow: "Order cancelled", title: "Your order has been *cancelled.*",
        excerpt: `We are sorry, ${esc(firstName(o.customer_name))}. Order ${esc(o.ref)} will not be going ahead.${o.payment === "demo" ? "" : " Any payment taken will be refunded to your original method."} If this is a surprise, or you would like to order again, please just reply to this email and we will help.`,
        body: panel(`<table role="presentation" cellpadding="0" cellspacing="0">${row("Order", esc(o.ref))}${reason ? row("Reason", esc(reason).replace(/\n/g, "<br>")) : ""}</table>`) + `<div style="height:26px;line-height:26px;font-size:0">&nbsp;</div>` + items(o),
      }),
    };
  },
};
// ---- templates end ----

// ---------------------------------------------------------------- sending
const cors = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function send(to: string, subject: string, html: string, replyTo = REPLY_TO) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${Deno.env.get("RESEND_API_KEY")}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: FROM, to: [to], reply_to: replyTo, subject, html }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) console.error("Resend error", res.status, JSON.stringify(data));
  return { ok: res.ok, status: res.status, data };
}

const sample = (kind: string) => ({
  id: "sample", ref: "FF-SAMPLE", status: "new", customer_name: "Camille Dubois", email: ADMIN, fulfilment: kind.includes("delivery") ? "delivery" : "collection",
  slot_at: new Date(Date.now() + 2 * 86400000).toISOString(), address: "12 Bold Street\nLiverpool L1 4DS",
  items: [{ name: "Comté 24 months", qty: 2, price: "£8 / 100g", unit_price: 8 }, { name: "Walnut bread", qty: 1, price: "£6 / loaf", unit_price: 6 }, { name: "The Classic Board", qty: 1, price: "£85 / board", unit_price: 85 }],
  subtotal: 107, delivery_fee: kind.includes("delivery") ? 4.99 : 0, total: kind.includes("delivery") ? 111.99 : 107, payment: "demo",
  customer_note: "A gift for my mother, could you leave out the blue cheese? Thank you!", cancel_reason: "One of the cheeses is out of stock until next week, so we could not complete the order in time.",
});

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  const body = await req.json().catch(() => ({}));
  const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false } });
  const { data: shopRow } = await db.from("settings").select("value").eq("key", "shop").maybeSingle();
  const shop = { ...DEFAULT_SHOP, ...(shopRow?.value ?? {}) };

  // 1. samples, only for the signed-in shop admin (button in Shop settings > Emails)
  if (body.action === "test") {
    const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, { global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } } });
    const { data: { user } } = await sb.auth.getUser();
    if (!user || (user.email ?? "").toLowerCase() !== ADMIN) return json({ error: "Not allowed." }, 403);
    if (!Deno.env.get("RESEND_API_KEY")) return json({ error: "The RESEND_API_KEY secret has not been added in Supabase yet." }, 500);
    const kind = String(body.template || "plain");
    const o = sample(kind) as any;
    const mail = kind === "plain" ? { subject: "Test email from Fromage & Figue", html: layout({ shop, preheader: "It works.", eyebrow: "Test email", title: "It *works.*", excerpt: "This is a test email from your shop website. If you can read this, the shop can send emails to customers." }) }
      : kind === "confirmation" ? T.confirmation(o, shop) : kind === "alert" ? T.alert(o, shop)
      : kind.startsWith("ready") ? T.ready(o, shop) : kind === "cancelled" ? T.cancelled(o, shop) : null;
    if (!mail) return json({ error: "Unknown sample." }, 400);
    const r = await send(ADMIN, "[Sample] " + mail.subject, mail.html);
    return r.ok ? json({ ok: true }) : json({ error: r.data?.message ?? `Resend returned ${r.status}` }, 502);
  }

  // 2. real orders: called by the database whenever an order is placed or its status changes
  if (body.order_id && (body.type === "INSERT" || body.type === "UPDATE")) {
    const { data: o } = await db.from("orders").select("*").eq("id", body.order_id).maybeSingle();
    if (!o) return json({ ok: false, reason: "no such order" });
    const tag = body.type === "INSERT" ? "confirmation" : o.status === "ready" ? "ready" : o.status === "cancelled" ? "cancelled" : "";
    if (!tag) return json({ ok: true, skipped: "no email for this status" });
    // claim it first, so the same email can never go out twice
    const sent: string[] = o.emails_sent ?? [];
    if (sent.includes(tag)) return json({ ok: true, skipped: "already sent" });
    const { data: claimed } = await db.from("orders").update({ emails_sent: [...sent, tag] }).eq("id", o.id).not("emails_sent", "cs", `{${tag}}`).select("id");
    if (!claimed?.length) return json({ ok: true, skipped: "already sent" });
    let ok = true;
    if (tag === "confirmation") {
      const c = T.confirmation(o, shop), a = T.alert(o, shop);
      ok = (await send(o.email, c.subject, c.html)).ok;
      await sleep(700);
      ok = (await send(ADMIN, a.subject, a.html, o.email)).ok && ok;
    } else {
      const m = tag === "ready" ? T.ready(o, shop) : T.cancelled(o, shop);
      ok = (await send(o.email, m.subject, m.html)).ok;
    }
    if (!ok) await db.from("orders").update({ emails_sent: sent }).eq("id", o.id);   // let a later change try again
    return json({ ok });
  }
  return json({ error: "Unknown request." }, 400);
});
