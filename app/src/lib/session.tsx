import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase, type Organization } from './supabase'

type Ctx = {
  session: Session | null
  org: Organization | null
  loading: boolean
  refreshOrg: () => Promise<Organization | null>
  setOrg: (o: Organization | null) => void
}

const SessionContext = createContext<Ctx | null>(null)

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [org, setOrg] = useState<Organization | null>(null)
  const [loading, setLoading] = useState(true)

  const refreshOrg = useCallback(async () => {
    const { data, error } = await supabase
      .from('organizations')
      .select('*')
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle()
    if (error) console.error(error)
    setOrg((data as Organization) ?? null)
    return (data as Organization) ?? null
  }, [])

  useEffect(() => {
    let active = true
    supabase.auth.getSession().then(async ({ data }) => {
      if (!active) return
      setSession(data.session)
      if (data.session) await refreshOrg()
      setLoading(false)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s)
      if (!s) setOrg(null)
      else setTimeout(() => void refreshOrg(), 0)
    })
    return () => {
      active = false
      sub.subscription.unsubscribe()
    }
  }, [refreshOrg])

  return (
    <SessionContext.Provider value={{ session, org, loading, refreshOrg, setOrg }}>
      {children}
    </SessionContext.Provider>
  )
}

export function useSession() {
  const ctx = useContext(SessionContext)
  if (!ctx) throw new Error('useSession în afara SessionProvider')
  return ctx
}
