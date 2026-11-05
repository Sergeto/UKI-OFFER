import { TOTAL_STEPS } from '../lib/supabase'

export function Progress({ step }: { step: number }) {
  return (
    <div className="progress" aria-label={`Pasul ${step} din ${TOTAL_STEPS}`}>
      <span className="caption">Pasul {step} din {TOTAL_STEPS}</span>
      <div className="progress__bar"><span style={{ width: `${(step / TOTAL_STEPS) * 100}%` }} /></div>
    </div>
  )
}
