# uki offer

CRM pentru firme mici și mijlocii din România: clienți, oferte, lucrări și bani, simplu de pe telefon.

Stadiu: **demo** (etapele 0 și 1 din plan). Nu folosi date reale de clienți.

## Ce merge acum

1. **Cont nou / intră în cont** cu email și parolă.
2. **Firma ta**: scrii CUI-ul, datele vin automat de la ANAF (cu completare manuală dacă ANAF nu răspunde).
3. **Logo-ul tău**: încarci logo-ul, aplicația extrage culorile; sau „Nu am logo încă” și alegi o culoare.
4. **Brandul tău**: vezi cum arată o ofertă cu logo-ul și culorile tale. Dacă o culoare e prea deschisă pentru text alb, aplicația face automat o nuanță mai închisă pentru butoane.

Fiecare firmă își vede doar datele ei (Row Level Security în Postgres).

## Structura

| Folder | Ce e |
|---|---|
| `app/` | Aplicația web (React + TypeScript + Vite) |
| `supabase/migrations/` | Baza de date: tabele, reguli de acces, bucket pentru logo-uri |
| `supabase/functions/anaf-lookup/` | Funcția de server care caută firma la ANAF după CUI |
| `.github/workflows/pages.yml` | Publică demo-ul pe GitHub Pages la fiecare modificare pe `main` |

## Rulare locală

```bash
cd app
cp .env.example .env
npm install
npm run dev
```

## Reguli pentru acest repo (e public)

Nu se pun niciodată aici: chei secrete, prețuri reale, marje, prețuri B2B de la furnizori, date de clienți. Cheia Supabase din `.env.example` este cea *publishable*, făcută să fie publică.
