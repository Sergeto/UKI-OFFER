# uki offer — reguli pentru Claude

- Repo PUBLIC: niciodată secrete, prețuri reale, marje, prețuri B2B furnizori sau date de clienți.
- Aplicație doar în browser (fără app nativă), dar telefonul întâi: o coloană, un singur buton principal jos, butoane min. 48px (principal 56px), text min. 17px (caption 14px).
- Design: tokenurile din `app/src/index.css` (din design system-ul uki). Coral `--brand` (#ff5757) nu se folosește pentru text pe alb; acțiunile folosesc `--brand-strong`.
- Text în română, cu „tu”, fără jargon („clienți”, nu „lead-uri”), diacritice cu virgulă (ș, ț). Erorile spun ce s-a întâmplat și ce faci, cu iconiță + cuvânt, niciodată doar culoare.
- Multi-firmă din prima zi: orice tabel nou are `organization_id` și politici RLS bazate pe `private.is_org_member` / `private.is_org_admin`.
- Migrațiile stau în `supabase/migrations/`; funcțiile de server în `supabase/functions/`.
- Verificare înainte de commit: `cd app && npx tsc -b && npx oxlint src && npm run build`.
