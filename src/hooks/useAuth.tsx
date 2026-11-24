import { useState, useEffect, createContext, useContext, useCallback, type ReactNode } from 'react'
import { supabase, isDemoMode } from '@/lib/supabase'
import { authService } from '@/services/auth.service'
import { demoStore } from '@/lib/demo-store'

interface AuthUser {
  id: string
  email: string
}

interface AuthContextType {
  user: AuthUser | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, fullName: string) => Promise<void>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => isDemoMode
    ? { id: demoStore.getProfile().id, email: 'demo@example.com' }
    : null)
  const [loading, setLoading] = useState(!isDemoMode)

  useEffect(() => {
    if (isDemoMode) return

    const init = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user) {
          setUser({ id: session.user.id, email: session.user.email || '' })
        }
      } catch {
        // ignore
      } finally {
        setLoading(false)
      }
    }
    init()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user) {
          setUser({ id: session.user.id, email: session.user.email || '' })
        } else {
          setUser(null)
        }
      }
    )
    return () => subscription.unsubscribe()
  }, [])

  const signIn = useCallback(async (email: string, password: string) => {
    const data = await authService.signIn(email, password)
    if (data && typeof data === 'object' && 'user' in data) {
      setUser(data.user as AuthUser)
    }
  }, [])

  const signUp = useCallback(async (email: string, password: string, fullName: string) => {
    const data = await authService.signUp(email, password, fullName)
    if (data && typeof data === 'object' && 'user' in data) {
      setUser(data.user as AuthUser)
    }
  }, [])

  const signOut = useCallback(async () => {
    await authService.signOut()
    setUser(null)
  }, [])

  const resetPassword = useCallback(async (email: string) => {
    await authService.resetPassword(email)
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut, resetPassword }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
