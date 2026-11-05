/** ANAF trimite ş/ţ cu sedilă; în aplicație folosim ș/ț cu virgulă. */
export function fixDiacritics(s: string) {
  return s.replace(/ş/g, 'ș').replace(/Ş/g, 'Ș').replace(/ţ/g, 'ț').replace(/Ţ/g, 'Ț')
}

/** „DANTE INTERNATIONAL SA” -> „Dante International SA” (formele juridice rămân cu majuscule). */
export function companyCase(s: string) {
  const keep = new Set(['SRL', 'SA', 'PFA', 'II', 'IF', 'SNC', 'SCS', 'SRL-D', 'ONG', 'RA'])
  return fixDiacritics(s)
    .toLowerCase()
    .split(/(\s+)/)
    .map((w) => (keep.has(w.toUpperCase()) ? w.toUpperCase() : w.replace(/^(\p{L})/u, (c) => c.toUpperCase())))
    .join('')
}

/** CUI valid după algoritmul cu cifră de control (cheia 753217532). */
export function isValidCui(raw: string) {
  const cui = raw.toUpperCase().replace(/^RO/, '').replace(/\s/g, '')
  if (!/^\d{2,10}$/.test(cui)) return false
  const digits = cui.split('').map(Number)
  const control = digits.pop()!
  const key = [7, 5, 3, 2, 1, 7, 5, 3, 2].slice(9 - digits.length)
  const sum = digits.reduce((acc, d, i) => acc + d * key[i], 0)
  let c = (sum * 10) % 11
  if (c === 10) c = 0
  return c === control
}

export function cleanCui(raw: string) {
  return raw.toUpperCase().replace(/^RO/, '').replace(/\D/g, '')
}
