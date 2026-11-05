import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase, STEPS, type Organization } from '../lib/supabase'
import { useSession } from '../lib/session'
import { cleanCui, companyCase, fixDiacritics, isValidCui } from '../lib/text'
import { Icon } from '../lib/icons'
import { Progress } from './Progress'
import logo from '../assets/uki-logo-coral.svg'

type Form = { name: string; cui: string; reg_com: string; address: string; county: string; city: string; phone: string; vat_payer: boolean }
const empty: Form = { name: '', cui: '', reg_com: '', address: '', county: '', city: '', phone: '', vat_payer: false }

export default function Company() {
  const { org, setOrg, session } = useSession()
  const nav = useNavigate()
  const [cui, setCui] = useState(org?.cui ?? '')
  const [form, setForm] = useState<Form | null>(org ? {
    name: org.name, cui: org.cui ?? '', reg_com: org.reg_com ?? '', address: org.address ?? '',
    county: org.county ?? '', city: org.city ?? '', phone: org.phone ?? '', vat_payer: !!org.vat_payer,
  } : null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [note, setNote] = useState<string | null>(null)

  async function lookup(e?: FormEvent) {
    e?.preventDefault()
    setError(null); setNote(null)
    const c = cleanCui(cui)
    if (!isValidCui(c)) return setError('CUI-ul nu e corect. Verifică cifrele; îl găsești pe orice factură a firmei.')
    setBusy(true)
    const { data, error } = await supabase.functions.invoke('anaf-lookup', { body: { cui: c } })
    setBusy(false)
    if (error || !data || data.error) {
      const status = (error as { context?: Response } | null)?.context?.status
      if (status === 404) setError('ANAF nu are o firmă cu acest CUI. Verifică cifrele.')
      else { setNote('ANAF nu răspunde acum. Completează tu datele, durează un minut.'); setForm({ ...empty, cui: c }) }
      return
    }
    setForm({
      name: companyCase(data.name), cui: data.cui, reg_com: data.reg_com, address: fixDiacritics(data.address),
      county: fixDiacritics(data.county), city: fixDiacritics(data.city), phone: data.phone ?? '', vat_payer: !!data.vat_payer,
    })
    setNote('Am găsit firma la ANAF. Verifică datele și corectează dacă e nevoie.')
  }

  async function save() {
    if (!form) return
    if (!form.name.trim()) return setError('Lipsește numele firmei.')
    setBusy(true); setError(null)
    const row = { ...form, name: form.name.trim(), email: session?.user.email ?? null }
    const res = org
      ? await supabase.from('organizations').update({ ...row, onboarding_step: Math.max(org.onboarding_step, STEPS.logo) }).eq('id', org.id).select().single()
      : await supabase.from('organizations').insert({ ...row, onboarding_step: STEPS.logo }).select().single()
    setBusy(false)
    if (res.error) return setError('Nu am putut salva firma. Încearcă din nou.')
    setOrg(res.data as Organization)
    nav('/pornire/logo')
  }

  const set = (k: keyof Form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => f && { ...f, [k]: k === 'vat_payer' ? e.target.checked : e.target.value })

  return (
    <main className="screen">
      <div className="screen__top">
        <img className="logo" src={logo} alt="uki" />
        <button className="btn btn--text" onClick={() => supabase.auth.signOut()}>Ieși</button>
      </div>
      <div className="screen__body">
        <Progress step={1} />
        <div style={{ display: 'grid', gap: 'var(--space-2)' }}>
          <h1 className="title-lg">Firma ta</h1>
          <p className="body-lg muted">Scrie CUI-ul și luăm restul datelor de la ANAF.</p>
        </div>

        <form onSubmit={lookup} className="field" noValidate>
          <label className="field__label" htmlFor="cui">CUI</label>
          <div className="field__row">
            <input id="cui" className="field__input num" inputMode="numeric" autoComplete="off"
              placeholder="ex. RO12345678" value={cui} onChange={(e) => setCui(e.target.value)} />
            <button className="btn btn--secondary" style={{ minHeight: 'var(--tap-main)' }} disabled={busy || cui.length < 2}>
              <Icon name="search" small />Caută
            </button>
          </div>
          <span className="field__hint">Cu sau fără „RO” în față.</span>
        </form>

        {error && <div className="alert alert--error" role="alert"><Icon name="alert" small />{error}</div>}
        {note && <div className={'alert ' + (note.startsWith('Am găsit') ? 'alert--success' : 'alert--info')}><Icon name={note.startsWith('Am găsit') ? 'check' : 'alert'} small />{note}</div>}

        {form && (
          <div className="card" style={{ gap: 'var(--space-5)' }}>
            <label className="field"><span className="field__label">Numele firmei</span>
              <input className="field__input" value={form.name} onChange={set('name')} /></label>
            <label className="field"><span className="field__label">Nr. Registrul Comerțului</span>
              <input className="field__input" value={form.reg_com} onChange={set('reg_com')} placeholder="J39/123/2020" /></label>
            <label className="field"><span className="field__label">Adresa sediului</span>
              <input className="field__input" value={form.address} onChange={set('address')} /></label>
            <label className="field"><span className="field__label">Telefon</span>
              <input className="field__input" type="tel" inputMode="tel" value={form.phone} onChange={set('phone')} placeholder="07XX XXX XXX" />
              <span className="field__hint">Apare pe oferte, ca să te poată suna clientul.</span></label>
            <label className="check"><input type="checkbox" checked={form.vat_payer} onChange={set('vat_payer')} />Firma e plătitoare de TVA</label>
          </div>
        )}
      </div>
      <div className="screen__foot">
        <button className="btn btn--primary btn--main btn--block" disabled={!form || busy} onClick={save}>
          {busy && form ? 'Se salvează…' : 'Salvează firma'}
        </button>
        {!form && (
          <button className="btn btn--text btn--block" onClick={() => setForm({ ...empty, cui: cleanCui(cui) })}>
            Nu am CUI încă, completez manual
          </button>
        )}
      </div>
    </main>
  )
}
