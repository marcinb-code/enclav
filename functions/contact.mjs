// ENCLAV — transport formularzy kontaktowych przez Resend (D-021).
// Cloudflare Pages Function: POST /contact  (katalog functions/ w root repo).
// Sekrety/konfiguracja w dashboard CF Pages (NIE w repo):
//   RESEND_API_KEY  — klucz API Resend (secret)
//   FORM_TO         — odbiorca (domyślnie contact@enclav.cc)
//   FORM_FROM       — nadawca, zweryfikowana domena (domyślnie ENCLAV <contact@enclav.cc>)
//   FORM_SUBJECT    — temat (domyślnie "ENCLAV — <sekcja> (<lang>)")
// Bez RESEND_API_KEY -> 503 (fail closed, strona nie udaje sukcesu).
// _hp = honeypot (pole ukryte CSS-em w formularzu): bot -> 200 bez wysyłki.

function json(body, status) {
  return new Response(JSON.stringify(body), {
    status: status,
    headers: { 'Content-Type': 'application/json' }
  });
}

export const onRequestPost = async (context) => {
  const { request, env } = context;
  try {
    const data = await request.json();
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      return json({ ok: false, error: 'bad_payload' }, 400);
    }
    if (data._hp) {
      return json({ ok: true, honeypot: true }, 200);
    }
    const fields = Object.keys(data)
      .filter(function (k) { return k !== '_hp' && k !== '_section' && k !== '_lang' && String(data[k] || '').trim() !== ''; })
      .map(function (k) { return [k, String(data[k])]; });
    if (!fields.length) {
      return json({ ok: false, error: 'empty_form' }, 400);
    }
    const apiKey = env.RESEND_API_KEY;
    if (!apiKey) {
      return json({ ok: false, error: 'transport_not_configured' }, 503);
    }
    const to = env.FORM_TO || 'contact@enclav.cc';
    const from = env.FORM_FROM || 'ENCLAV <contact@enclav.cc>';
    const section = data._section || 'contact';
    const lang = data._lang || 'en';
    const subject = env.FORM_SUBJECT || ('ENCLAV — ' + section + ' (' + lang + ')');
    const text = fields.map(function (pair) { return pair[0] + ':\n' + pair[1]; }).join('\n\n');
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ from: from, to: to, subject: subject, text: text })
    });
    if (!res.ok) {
      return json({ ok: false, error: 'send_failed' }, 502);
    }
    return json({ ok: true }, 200);
  } catch (e) {
    return json({ ok: false, error: 'bad_request' }, 400);
  }
};
