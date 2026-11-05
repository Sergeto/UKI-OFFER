import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useSession } from '../lib/session'
import { Icon } from '../lib/icons'
import { BrandMark } from './BrandMark'
import ukiLogo from '../assets/uki-logo-coral.svg'

export default function Home() {
  const { org } = useSession()
  const nav = useNavigate()
  if (!org) return null
  return (
    <main className="screen">
      <div className="screen__top">
        <img className="logo" src={ukiLogo} alt="uki" />
        <button className="btn btn--text" onClick={() => supabase.auth.signOut()}><Icon name="logout" small />Ieși</button>
      </div>
      <div className="screen__body">
        <h1 className="display">Gata, {org.name.split(' ')[0]}!</h1>
        <p className="body-lg muted" style={{ marginTop: -12 }}>Firma ta e în uki. Mai jos vezi ce vine.</p>

        <section className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <BrandMark org={org} height={36} />
            <button className="btn btn--text" onClick={() => nav('/pornire/firma')}>Modifică</button>
          </div>
          <dl className="dl">
            <dt>Firma</dt><dd>{org.name}</dd>
            {org.cui && <><dt>CUI</dt><dd className="num">{org.cui}</dd></>}
            {org.reg_com && <><dt>Reg. Com.</dt><dd className="num">{org.reg_com}</dd></>}
            {org.address && <><dt>Sediu</dt><dd>{org.address}</dd></>}
            <dt>TVA</dt><dd>{org.vat_payer ? 'Plătitor de TVA' : 'Neplătitor de TVA'}</dd>
          </dl>
        </section>

        <section className="card">
          <h2 className="title">Ce urmează în aplicație</h2>
          <ul className="list">
            <li><Icon name="check" small /><span><strong>Cont, firmă, logo și brand</strong><br /><span className="caption">Gata, le-ai făcut acum.</span></span></li>
            <li><Icon name="sparkle" small /><span><strong>Cum lucrezi</strong><br /><span className="caption">5 întrebări care aleg modulele potrivite.</span></span></li>
            <li><Icon name="building" small /><span><strong>Clienți și oferte PDF</strong><br /><span className="caption">Prima ofertă trimisă pe WhatsApp în 5 minute.</span></span></li>
          </ul>
        </section>
      </div>
    </main>
  )
}
