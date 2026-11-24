import type { LeadSourceProvider, NormalizedPost } from '@/types'
import { supabase } from '@/lib/supabase'

export class WebSearchProvider implements LeadSourceProvider {
  name = 'web_search'

  async search(params: {
    keywords: string[]
    location?: string
    fromDate?: Date
    toDate?: Date
  }): Promise<NormalizedPost[]> {
    const { data, error } = await supabase.functions.invoke('search-web', {
      body: {
        keywords: params.keywords,
        location: params.location,
        dateRange: params.fromDate ? '30days' : '7days',
      },
    })

    if (error) throw new Error(`Web search failed: ${error.message}`)
    return data.posts || []
  }
}
