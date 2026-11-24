import { supabase, isDemoMode } from '@/lib/supabase'
import { demoStore } from '@/lib/demo-store'

export const authService = {
  async signIn(email: string, password: string) {
    if (isDemoMode) {
      return demoStore.signIn(email, password)
    }
    const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
    if (error) throw error
    return data
  },

  async signUp(email: string, password: string, fullName: string) {
    if (isDemoMode) {
      await demoStore.signUp(email, password, fullName)
      return true
    }
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { data: { full_name: fullName } },
    })
    if (error) throw error
    return Boolean(data.session)
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
