import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase, STEPS, type Organization } from '../lib/supabase'
import { useSession } from '../lib/session'
import { actionColor, contrast } from '../lib/colors'
import { Icon } from '../lib/icons'
import { Progress } from './Progress'
import { BrandMark } from './BrandMark'
import ukiLogo from '../assets/uki-logo-coral.svg'

export default function Brand() {
  const { org, setOrg } = useSession()
  const nav = useNavigate()
  const [busy, setBusy] = useState(false)
  if (!org) return null
  const brand = org.brand_primary ?? '#ff5757'
  const action = actionColor(brand)
  const adjusted = action.toLowerCase() !== brand.toLowerCase()
  const soft = brand + '1f'

  async function finish() {
    if (!org) return
    setBusy(true)
    const res = await supabase.from('organizations').update({ onboarding_step: STEPS.done }).eq('id', org.id).select().single()
    setBusy(false)
    if (!res.error) { setOrg(res.data as Organization); nav('/acasa') }
  }

  return (
    <main className="screen">
      <div className="screen__top">
        <button className="btn btn--text" onClick={() => nav('/pornire/logo')}><Icon name="back" small />Înapoi</button>
        <img className="logo" src={ukiLogo} alt="uki" />
      </div>
      <div className="screen__body">
        <Progress step={3} />
        <div style={{ display: 'grid', gap: 'var(--space-2)' }}>
          <h1 className="title-lg">Așa arată ofertele tale</h1>
          <p className="body-lg muted">Cu logo-ul și culorile tale, pe fiecare ofertă trimisă.</p>
        </div>

        <article className="preview" aria-label="Exemplu de ofertă">
          <div className="preview__band" style={{ background: brand }} />
          <div className="preview__head">
            <BrandMark org={org} />
            <span style={{ font: '600 13px/18px var(--font-sans)', color: '#6b5d5b', textAlign: 'right' }}>
              Ofertă nr. 001<br />azi
            </span>
          </div>
          <div className="preview__body">
            <div style={{ padding: '10px 12px', borderRadius: 10, background: soft }}>
              <strong>Pentru: Ion Popescu</strong><br /><span style={{ color: '#6b5d5b' }}>Focșani, Vrancea</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Produs sau serviciu 1</span><span className="num">1.000 lei</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Produs sau serviciu 2</span><span className="num">500 lei</span></div>
            <div className="preview__total"><span style={{ fontSize: 16 }}>Total{org.vat_payer ? ' cu TVA' : ''}</span>
              <span className="num" style={{ color: action }}>{org.vat_payer ? '1.815' : '1.500'} lei</span></div>
            <div className="preview__btn" style={{ background: action, color: contrast(action, '#ffffff') >= 4.5 ? '#fff' : '#241b1a' }}>
              Accept oferta
            </div>
            <div style={{ fontSize: 13, color: '#6b5d5b', paddingTop: 4 }}>
              {org.name}{org.cui ? ` · CUI ${org.cui}` : ''}{org.phone ? ` · ${org.phone}` : ''}
            </div>
          </div>
        </article>

        {adjusted && (
          <div className="alert alert--info"><Icon name="sparkle" small />
            <span>Culoarea ta e prea deschisă pentru text alb, așa că pentru butoane și sume am folosit o nuanță mai închisă (<span className="num">{action}</span>). Așa se citește bine și în soare.</span>
          </div>
        )}
        <p className="caption" style={{ margin: 0 }}>Cifrele de mai sus sunt doar un exemplu.</p>
      </div>
      <div className="screen__foot">
        <button className="btn btn--primary btn--main btn--block" disabled={busy} onClick={finish}>
          {busy ? 'Se salvează…' : 'Arată bine, mergi mai departe'}
        </button>
      </div>
    </main>
  )
}
