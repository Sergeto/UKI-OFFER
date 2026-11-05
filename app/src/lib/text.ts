/** ANAF trimite ş/ţ cu sedilă; în aplicație folosim ș/ț cu virgulă. */
export function fixDiacritics(s: string) {
  return s.replace(/ş/g, 'ș').replace(/Ş/g, 'Ș').replace(/ţ/g, 'ț').replace(/Ţ/g, 'Ț')
}

/**
 * Numele firmei, scris cum apare pe facturi: majuscule și forma juridică fără puncte.
 * „Uki Energy S.R.L.” -> „UKI ENERGY SRL”, „dante international s.a.” -> „DANTE INTERNATIONAL SA”.
 */
export function companyName(s: string) {
  return fixDiacritics(s)
    .toUpperCase()
    .replace(/\bS\.?\s?R\.?\s?L\.?\s?-?\s?D\b\.?/g, 'SRL-D')
    .replace(/\bS\.\s?R\.\s?L\.?(?=\s|$|,)/g, 'SRL')
    .replace(/\bS\.\s?A\.?(?=\s|$|,)/g, 'SA')
    .replace(/\bP\.\s?F\.\s?A\.?(?=\s|$|,)/g, 'PFA')
    .replace(/\bI\.\s?I\.?(?=\s|$|,)/g, 'II')
    .replace(/\bI\.\s?F\.?(?=\s|$|,)/g, 'IF')
    .replace(/\bS\.\s?N\.\s?C\.?(?=\s|$|,)/g, 'SNC')
    .replace(/\s+/g, ' ')
    .trim()
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
