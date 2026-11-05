import { useState, type FormEvent } from 'react'
import { supabase } from '../lib/supabase'
import { Icon } from '../lib/icons'
import logo from '../assets/uki-logo-coral.svg'

type Mode = 'login' | 'signup'

function translate(msg: string) {
  if (/invalid login/i.test(msg)) return 'Emailul sau parola nu se potrivesc. Verifică-le și încearcă din nou.'
  if (/email not confirmed/i.test(msg)) return 'Încă nu ai confirmat emailul. Deschide linkul primit pe email, apoi intră.'
  if (/already registered|already exists/i.test(msg)) return 'Există deja un cont cu emailul ăsta. Alege „Intră în cont”.'
  if (/password.*(6|characters)/i.test(msg)) return 'Parola trebuie să aibă cel puțin 8 caractere.'
  if (/rate limit/i.test(msg)) return 'Prea multe încercări într-un timp scurt. Mai încearcă peste câteva minute.'
  return 'Nu a mers. Verifică internetul și încearcă din nou.'
}

export default function Login() {
  const [mode, setMode] = useState<Mode>('signup')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)

  async function submit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    if (!/^\S+@\S+\.\S+$/.test(email)) return setError('Emailul nu pare complet. Exemplu: nume@firma.ro')
    if (password.length < 8) return setError('Parola trebuie să aibă cel puțin 8 caractere.')
    setBusy(true)
    if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setError(translate(error.message))
    } else {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: window.location.origin + window.location.pathname },
      })
      if (error) setError(translate(error.message))
      else if (!data.session) setSent(true)
    }
    setBusy(false)
  }

  if (sent) {
    return (
      <main className="screen">
        <div className="screen__top"><img className="logo" src={logo} alt="uki" /></div>
        <div className="screen__body">
          <h1 className="title-lg">Verifică emailul</h1>
          <p className="body-lg">Ți-am trimis un link la <strong>{email}</strong>. Apasă pe el și contul e gata.</p>
          <p className="caption">Nu găsești emailul? Uită-te și în Spam sau Promoții.</p>
        </div>
        <div className="screen__foot">
          <button className="btn btn--secondary btn--main btn--block" onClick={() => { setSent(false); setMode('login') }}>
            Am confirmat, intră în cont
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="screen">
      <div className="screen__body" style={{ paddingTop: 'var(--space-7)' }}>
        <img className="logo logo--lg" src={logo} alt="uki" />
        <div style={{ display: 'grid', gap: 'var(--space-2)' }}>
          <h1 className="display">{mode === 'signup' ? 'Oferte gata în 5 minute' : 'Bine ai revenit'}</h1>
          <p className="body-lg muted">Clienți, oferte și lucrări, simplu de pe telefon.</p>
        </div>

        <div className="tabs" role="tablist">
          <button role="tab" aria-selected={mode === 'signup'} onClick={() => { setMode('signup'); setError(null) }}>Cont nou</button>
          <button role="tab" aria-selected={mode === 'login'} onClick={() => { setMode('login'); setError(null) }}>Intră în cont</button>
        </div>

        <form id="auth" onSubmit={submit} style={{ display: 'grid', gap: 'var(--space-5)' }} noValidate>
          <label className="field">
            <span className="field__label">Email</span>
            <input className="field__input" type="email" inputMode="email" autoComplete="email"
              placeholder="nume@firma.ro" value={email} onChange={(e) => setEmail(e.target.value.trim())} />
          </label>
          <label className="field">
            <span className="field__label">Parolă</span>
            <input className="field__input" type="password" autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
              placeholder="Cel puțin 8 caractere" value={password} onChange={(e) => setPassword(e.target.value)} />
          </label>
          {error && <div className="alert alert--error" role="alert"><Icon name="alert" small />{error}</div>}
        </form>
      </div>
      <div className="screen__foot">
        <button form="auth" className="btn btn--primary btn--main btn--block" disabled={busy}>
          {busy ? 'Așteaptă puțin…' : mode === 'signup' ? 'Creează contul' : 'Intră în cont'}
        </button>
        <p className="caption" style={{ textAlign: 'center', margin: 0 }}>Demo. Nu folosi date reale de clienți.</p>
      </div>
    </main>
  )
}
