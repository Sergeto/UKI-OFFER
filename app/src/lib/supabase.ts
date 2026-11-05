import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined

if (!url || !key) {
  throw new Error('Lipsesc VITE_SUPABASE_URL sau VITE_SUPABASE_PUBLISHABLE_KEY. Copiază .env.example în .env.')
}

export const supabase = createClient(url, key)

export type Organization = {
  id: string
  name: string
  cui: string | null
  reg_com: string | null
  address: string | null
  county: string | null
  city: string | null
  vat_payer: boolean | null
  phone: string | null
  email: string | null
  logo_path: string | null
  brand_primary: string | null
  brand_secondary: string | null
  onboarding_step: number
}

/** Pașii onboarding-ului. Valoarea din organizations.onboarding_step = următorul pas de făcut. */
export const STEPS = { company: 2, logo: 3, brand: 4, done: 5 } as const
export const TOTAL_STEPS = 3

export function logoUrl(path: string | null) {
  if (!path) return null
  return supabase.storage.from('logos').getPublicUrl(path).data.publicUrl
}
