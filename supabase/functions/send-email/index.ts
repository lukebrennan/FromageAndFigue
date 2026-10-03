// Fromage & Figue: sends email through Resend.
// Deploy in Supabase > Edge Functions. Needs the secret RESEND_API_KEY.
// For now it only does a test email, triggered from the admin (Shop settings > Emails).
import { createClient } from "npm:@supabase/supabase-js@2";

const FROM = "Fromage & Figue <hello@fromageandfigue.co.uk>";
const REPLY_TO = "lukebrennan03@gmail.com";   // replies go here until the shop has its own inbox
const ADMIN = "lukebrennan03@gmail.com";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

const wrap = (inner: string) => `<!doctype html><html><body style="margin:0;padding:0;background:#f7f3ec">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f7f3ec"><tr><td align="center" style="padding:32px 16px">
<table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:#fffdf9;border:1px solid #e3dccd">
<tr><td style="padding:32px 36px 8px;font-family:Georgia,serif;font-size:28px;color:#141312">Fromage &amp; Figue</td></tr>
<tr><td style="padding:8px 36px 36px;font-family:Helvetica,Arial,sans-serif;font-size:15px;line-height:1.6;color:#141312">${inner}</td></tr>
<tr><td style="padding:18px 36px;background:#141312;font-family:Helvetica,Arial,sans-serif;font-size:12px;color:#d6c291">Fromage &amp; Figue &middot; Liverpool</td></tr>
</table></td></tr></table></body></html>`;

async function send(to: string, subject: string, html: string) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${Deno.env.get("RESEND_API_KEY")}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: FROM, to: [to], reply_to: REPLY_TO, subject, html }),
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  // only the shop admin may call this
  const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
    global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } },
  });
  const { data: { user } } = await sb.auth.getUser();
  if (!user || (user.email ?? "").toLowerCase() !== ADMIN) return json({ error: "Not allowed." }, 403);
  if (!Deno.env.get("RESEND_API_KEY")) return json({ error: "The RESEND_API_KEY secret has not been added in Supabase yet." }, 500);

  const body = await req.json().catch(() => ({}));
  if (body.action === "test") {
    const r = await send(
      ADMIN,
      "Test email from Fromage & Figue",
      wrap(`<p style="font-size:20px;margin:0 0 12px;font-family:Georgia,serif">It works.</p>
<p style="margin:0">This is a test email from your shop website. If you can read this, the shop can send emails to customers.</p>`),
    );
    if (!r.ok) return json({ error: r.data?.message ?? `Resend returned ${r.status}` }, 502);
    return json({ ok: true, id: r.data?.id });
  }
  return json({ error: "Unknown action." }, 400);
});
