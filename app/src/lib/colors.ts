/** Extrage culorile dominante dintr-un logo și verifică contrastul pentru text. */

type RGB = [number, number, number]

const hex = ([r, g, b]: RGB) => '#' + [r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('')
export const toRgb = (h: string): RGB => {
  const n = parseInt(h.slice(1), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

function luminance([r, g, b]: RGB) {
  const f = (v: number) => {
    v /= 255
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
  }
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b)
}

export function contrast(a: string, b: string) {
  const la = luminance(toRgb(a))
  const lb = luminance(toRgb(b))
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05)
}

function saturation([r, g, b]: RGB) {
  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  return max === 0 ? 0 : (max - min) / max
}

/**
 * Culoarea pentru butoane: dacă brandul nu are contrast 4,5:1 cu textul alb,
 * o închidem treptat până ajunge (ca la uki: #ff5757 -> #c42b2b).
 */
export function actionColor(brand: string) {
  let [r, g, b] = toRgb(brand)
  for (let i = 0; i < 40 && contrast(hex([r, g, b]), '#ffffff') < 4.5; i++) {
    r = Math.round(r * 0.93); g = Math.round(g * 0.93); b = Math.round(b * 0.93)
  }
  return hex([r, g, b])
}

/** Citește imaginea într-un canvas mic și grupează pixelii pe culori apropiate. */
export async function extractColors(file: Blob, max = 4): Promise<string[]> {
  const url = URL.createObjectURL(file)
  try {
    const img = new Image()
    img.decoding = 'async'
    img.src = url
    await img.decode()
    const size = 96
    const scale = Math.min(1, size / Math.max(img.naturalWidth || size, img.naturalHeight || size))
    const w = Math.max(1, Math.round((img.naturalWidth || size) * scale))
    const h = Math.max(1, Math.round((img.naturalHeight || size) * scale))
    const canvas = document.createElement('canvas')
    canvas.width = w; canvas.height = h
    const ctx = canvas.getContext('2d', { willReadFrequently: true })!
    ctx.drawImage(img, 0, 0, w, h)
    const { data } = ctx.getImageData(0, 0, w, h)
    const buckets = new Map<string, { n: number; sum: [number, number, number] }>()
    for (let i = 0; i < data.length; i += 4) {
      const a = data[i + 3]
      if (a < 128) continue
      const rgb: RGB = [data[i], data[i + 1], data[i + 2]]
      const lum = luminance(rgb)
      if (lum > 0.9 && saturation(rgb) < 0.12) continue // fundal alb
      const k = rgb.map((v) => v >> 5).join(',')
      const bkt = buckets.get(k) ?? { n: 0, sum: [0, 0, 0] }
      bkt.n++; bkt.sum[0] += rgb[0]; bkt.sum[1] += rgb[1]; bkt.sum[2] += rgb[2]
      buckets.set(k, bkt)
    }
    const sorted = [...buckets.values()]
      .filter((b) => b.n >= 3)
      .map((b) => ({ rgb: b.sum.map((s) => Math.round(s / b.n)) as RGB, n: b.n }))
      // culorile vii au prioritate în fața griurilor, la aceeași frecvență
      .sort((a, b) => b.n * (0.4 + saturation(b.rgb)) - a.n * (0.4 + saturation(a.rgb)))
    const out: string[] = []
    for (const { rgb } of sorted) {
      const h = hex(rgb)
      if (out.every((o) => distance(toRgb(o), rgb) > 60)) out.push(h)
      if (out.length >= max) break
    }
    return out
  } finally {
    URL.revokeObjectURL(url)
  }
}

function distance(a: RGB, b: RGB) {
  return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2])
}

export const FALLBACK_COLORS = ['#ff5757', '#1f56b0', '#1d7347', '#e08a00', '#6d3fc0', '#241b1a']
