import { supabase, isDemoMode } from '@/lib/supabase'
import { demoStore } from '@/lib/demo-store'
import type { Keyword } from '@/types'

export const keywordsService = {
  async getKeywords() {
    if (isDemoMode) return demoStore.getKeywords()
    const { data, error } = await supabase.from('keywords').select('*').order('created_at', { ascending: false })
    if (error) throw error
    return data as Keyword[]
  },

  async addKeyword(keyword: string, category?: string) {
    if (isDemoMode) return demoStore.addKeyword(keyword, category)
    const { data, error } = await supabase.from('keywords').insert({ keyword, category: category || null, workspace_id: 'current' }).select().single()
    if (error) throw error
    return data as Keyword
  },

  async updateKeyword(id: string, updates: Partial<Keyword>) {
    if (isDemoMode) return demoStore.updateKeyword(id, updates)
    const { data, error } = await supabase.from('keywords').update(updates).eq('id', id).select().single()
    if (error) throw error
    return data as Keyword
  },

  async deleteKeyword(id: string) {
    if (isDemoMode) { demoStore.deleteKeyword(id); return }
    const { error } = await supabase.from('keywords').delete().eq('id', id)
    if (error) throw error
  },
}
