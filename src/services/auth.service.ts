import { supabase, isDemoMode } from '@/lib/supabase'
import { demoStore } from '@/lib/demo-store'

export const authService = {
  async signIn(email: string, password: string) {
    if (isDemoMode) {
      return demoStore.signIn(email, password)
    }
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    // Ensure session is persisted
    if (data.session) {
      await supabase.auth.setSession(data.session)
    }
    return data
  },

  async signUp(email: string, password: string, fullName: string) {
    if (isDemoMode) {
      return demoStore.signUp(email, password, fullName)
    }
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    })
    if (error) throw error
    // Auto sign-in after signup
    if (data.user && !data.session) {
      const signInResult = await supabase.auth.signInWithPassword({ email, password })
      if (signInResult.data.session) {
        return signInResult.data
      }
    }
    return data
  },

  async signOut() {
    if (isDemoMode) {
      return demoStore.signOut()
    }
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  async getUser() {
    if (isDemoMode) {
      return demoStore.getUser()
    }
    const { data: { user } } = await supabase.auth.getUser()
    return user
  },

  async getSession() {
    if (isDemoMode) {
      const user = await demoStore.getUser()
      return user ? { user } : null
    }
    const { data: { session } } = await supabase.auth.getSession()
    return session
  },

  async resetPassword(email: string) {
    if (isDemoMode) {
      return { message: 'Demo mode: Password reset email would be sent' }
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    if (error) throw error
  },
}
