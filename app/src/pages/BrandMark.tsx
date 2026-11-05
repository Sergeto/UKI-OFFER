import { logoUrl, type Organization } from '../lib/supabase'

/** Logo-ul firmei sau, dacă nu are, numele scris cu culoarea ei. */
export function BrandMark({ org, height = 40 }: { org: Organization; height?: number }) {
  const url = logoUrl(org.logo_path)
  if (url) return <img src={url} alt={org.name} style={{ maxHeight: height, maxWidth: '55%', objectFit: 'contain' }} />
  const short = org.name.replace(/\s+(SRL|SA|PFA|II|IF|SRL-D)$/i, '')
  return (
    <span style={{ font: `800 ${Math.round(height * 0.6)}px/1 var(--font-display)`, color: org.brand_primary ?? '#241b1a', letterSpacing: '-0.5px' }}>
      {short.toLowerCase()}
    </span>
  )
}
