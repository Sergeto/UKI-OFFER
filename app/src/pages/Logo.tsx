import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { logoUrl, supabase, STEPS, type Organization } from '../lib/supabase'
import { useSession } from '../lib/session'
import { extractColors, FALLBACK_COLORS } from '../lib/colors'
import { Icon } from '../lib/icons'
import { Progress } from './Progress'
import ukiLogo from '../assets/uki-logo-coral.svg'

const TYPES: Record<string, string> = { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/svg+xml': 'svg', 'image/webp': 'webp' }

export default function Logo() {
  const { org, setOrg } = useSession()
  const nav = useNavigate()
  const input = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(logoUrl(org?.logo_path ?? null))
  const [colors, setColors] = useState<string[]>(org?.brand_primary ? [org.brand_primary] : [])
  const [primary, setPrimary] = useState<string | null>(org?.brand_primary ?? null)
  const [noLogo, setNoLogo] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => () => { if (file && preview?.startsWith('blob:')) URL.revokeObjectURL(preview) }, [file, preview])

  async function pick(f: File | undefined) {
    setError(null)
    if (!f) return
    if (!TYPES[f.type]) return setError('Fișierul trebuie să fie imagine: PNG, JPG, SVG sau WEBP.')
    if (f.size > 5 * 1024 * 1024) return setError('Fișierul are peste 5 MB. Trimite o variantă mai mică a logo-ului.')
    setNoLogo(false)
    setFile(f)
    setPreview(URL.createObjectURL(f))
    try {
      const found = await extractColors(f)
      const list = found.length ? found : FALLBACK_COLORS.slice(0, 4)
      setColors(list)
      setPrimary(list[0])
    } catch {
      setColors(FALLBACK_COLORS.slice(0, 4))
      setPrimary(FALLBACK_COLORS[0])
    }
  }

  function chooseNoLogo() {
    setNoLogo(true); setFile(null); setPreview(null); setError(null)
    setColors(FALLBACK_COLORS); setPrimary(FALLBACK_COLORS[0])
  }

  async function save() {
    if (!org || !primary) return
    setBusy(true); setError(null)
    let logo_path = noLogo ? null : org.logo_path
    if (file) {
      const path = `${org.id}/logo-${Date.now()}.${TYPES[file.type]}`
      const up = await supabase.storage.from('logos').upload(path, file, { contentType: file.type, upsert: true })
      if (up.error) { setBusy(false); return setError('Nu am putut încărca logo-ul. Încearcă din nou.') }
      logo_path = path
    }
    const secondary = colors.find((c) => c !== primary) ?? null
    const res = await supabase.from('organizations')
      .update({ logo_path, brand_primary: primary, brand_secondary: secondary, onboarding_step: Math.max(org.onboarding_step, STEPS.brand) })
      .eq('id', org.id).select().single()
    setBusy(false)
    if (res.error) return setError('Nu am putut salva. Încearcă din nou.')
    setOrg(res.data as Organization)
    nav('/pornire/brand')
  }

  return (
    <main className="screen">
      <div className="screen__top">
        <button className="btn btn--text" onClick={() => nav('/pornire/firma')}><Icon name="back" small />Înapoi</button>
        <img className="logo" src={ukiLogo} alt="uki" />
      </div>
      <div className="screen__body">
        <Progress step={2} />
        <div style={{ display: 'grid', gap: 'var(--space-2)' }}>
          <h1 className="title-lg">Logo-ul tău</h1>
          <p className="body-lg muted">Îl punem pe oferte și luăm culorile din el.</p>
        </div>

        <button className="drop" onClick={() => input.current?.click()} type="button">
          {preview ? <img src={preview} alt="Logo-ul firmei" /> : (
            <>
              <Icon name="upload" />
              <span className="field__label">Alege logo-ul din telefon</span>
              <span className="caption">PNG, JPG, SVG sau WEBP, până la 5 MB</span>
            </>
          )}
        </button>
        <input ref={input} type="file" accept="image/png,image/jpeg,image/svg+xml,image/webp" hidden
          onChange={(e) => pick(e.target.files?.[0])} />
        {preview && <button className="btn btn--text" onClick={() => input.current?.click()}>Schimbă logo-ul</button>}

        {!preview && !noLogo && (
          <button className="btn btn--secondary btn--block" onClick={chooseNoLogo}>Nu am logo încă</button>
        )}
        {noLogo && (
          <div className="alert alert--info"><Icon name="sparkle" small />
            Până faci un logo, scriem numele firmei cu culoarea aleasă. Generatorul de logo vine în versiunea următoare.
          </div>
        )}

        {colors.length > 0 && (
          <div className="field">
            <span className="field__label">{noLogo ? 'Alege culoarea firmei' : 'Culoarea principală, luată din logo'}</span>
            <div className="swatches">
              {colors.map((c) => (
                <button key={c} className="swatch" aria-pressed={primary === c} onClick={() => setPrimary(c)} type="button">
                  <span style={{ background: c }} />{c}
                </button>
              ))}
              <label className="swatch" title="Altă culoare">
                <span style={{ background: 'conic-gradient(#ff5757,#e08a00,#1d7347,#1f56b0,#6d3fc0,#ff5757)' }} />
                Alta
                <input type="color" hidden value={primary ?? '#ff5757'} onChange={(e) => {
                  setPrimary(e.target.value); if (!colors.includes(e.target.value)) setColors((cs) => [...cs, e.target.value])
                }} />
              </label>
            </div>
          </div>
        )}
        {error && <div className="alert alert--error" role="alert"><Icon name="alert" small />{error}</div>}
      </div>
      <div className="screen__foot">
        <button className="btn btn--primary btn--main btn--block" disabled={!primary || busy} onClick={save}>
          {busy ? 'Se salvează…' : 'Vezi brandul tău'}
        </button>
      </div>
    </main>
  )
}
