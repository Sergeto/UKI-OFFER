// Caută o firmă după CUI în serviciul public ANAF (Registrul plătitorilor de TVA).
// Rulează pe server pentru că ANAF nu permite apeluri direct din browser (CORS).
const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } });

const ENDPOINTS = [
  'https://webservicesp.anaf.ro/api/PlatitorTvaRest/v9/tva',
  'https://webservicesp.anaf.ro/PlatitorTvaRest/api/v8/ws/tva',
];

function title(s: string) {
  return s.toLowerCase().replace(/(^|[\s\-.])(\p{L})/gu, (_m, p, c) => p + c.toUpperCase());
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  let cui = '';
  try { cui = String((await req.json()).cui ?? ''); } catch { /* ignore */ }
  cui = cui.toUpperCase().replace(/^RO/, '').replace(/\D/g, '');
  if (cui.length < 2 || cui.length > 10) return json({ error: 'invalid_cui' }, 400);

  const today = new Date().toISOString().slice(0, 10);
  const body = JSON.stringify([{ cui: Number(cui), data: today }]);
  let lastErr = '';
  for (const url of ENDPOINTS) {
    try {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 8000);
      const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body, signal: ctrl.signal });
      clearTimeout(t);
      if (!r.ok) { lastErr = `http_${r.status}`; continue; }
      const data = await r.json();
      const f = data?.found?.[0];
      if (!f) return json({ error: 'not_found' }, 404);
      const g = f.date_generale ?? f;
      const s = f.adresa_sediu_social ?? {};
      const tva = f.inregistrare_scop_Tva ?? {};
      return json({
        cui: String(g.cui ?? cui),
        name: g.denumire ?? '',
        reg_com: g.nrRegCom ?? '',
        address: g.adresa ?? '',
        county: s.sdenumire_Judet ? title(s.sdenumire_Judet) : '',
        city: s.sdenumire_Localitate ? title(s.sdenumire_Localitate) : '',
        phone: g.telefon ?? '',
        vat_payer: Boolean(tva.scpTVA ?? g.scpTVA),
        source: url.includes('v9') ? 'anaf_v9' : 'anaf_v8',
      });
    } catch (e) { lastErr = String(e); }
  }
  return json({ error: 'anaf_unavailable', detail: lastErr }, 502);
});
