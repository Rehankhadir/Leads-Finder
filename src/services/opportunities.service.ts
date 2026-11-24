const hnApi = 'https://hn.algolia.com/api/v1/'
const maxAgeDays = 62

export type OpportunityKind = 'leads' | 'projects' | 'jobs'
export type Opportunity = {
  id: number
  title: string
  summary: string
  postedAt: string
  kind: 'projects' | 'jobs'
}

type Thread = { objectID: string; title: string }
type Comment = { id: number; text: string | null; created_at: string }

async function getJson<T>(url: URL, signal: AbortSignal): Promise<T> {
  const response = await fetch(url, { signal: AbortSignal.any([signal, AbortSignal.timeout(12000)]) })
  if (!response.ok) throw new Error('Could not load Hacker News listings.')
  return await response.json() as T
}

function plainText(html: string) {
  const entities: Record<string, string> = { amp: '&', apos: "'", quot: '"', lt: '<', gt: '>', nbsp: ' ' }
  return html
    .replace(/<(?:p|br|\/p)\s*\/?\s*>/gi, '\n')
    .replace(/<[^>]*>/g, '')
    .replace(/&(#x[\da-f]+|#\d+|amp|apos|quot|lt|gt|nbsp);/gi, (match, entity: string) => {
      if (!entity.startsWith('#')) return entities[entity.toLowerCase()] ?? match
      const code = entity[1].toLowerCase() === 'x' ? parseInt(entity.slice(2), 16) : Number(entity.slice(1))
      return code <= 0x10ffff ? String.fromCodePoint(code) : match
    })
    .replace(/[\w.+-]+@[\w.-]+\.\w+/g, '[email in original post]')
    .trim()
}

async function fetchThreadListings(kind: Opportunity['kind'], signal: AbortSignal) {
  const threadName = kind === 'jobs' ? 'Who is hiring?' : 'Freelancer? Seeking freelancer?'
  const after = Date.now() - maxAgeDays * 86400000
  const url = new URL('search_by_date', hnApi)
  url.search = new URLSearchParams({
    query: threadName,
    tags: 'story,author_whoishiring',
    numericFilters: 'created_at_i>' + Math.floor(after / 1000),
    hitsPerPage: '5',
  }).toString()
  const { hits } = await getJson<{ hits: Thread[] }>(url, signal)
  const recentThreads = hits
    .filter(thread => typeof thread.title === 'string' && thread.title.toLowerCase().startsWith(('Ask HN: ' + threadName).toLowerCase()) && /^\d+$/.test(thread.objectID))
    .slice(0, 2)
  const threadRequests = await Promise.allSettled(recentThreads.map(({ objectID }) =>
    getJson<{ children: Comment[] }>(new URL('items/' + objectID, hnApi), signal),
  ))
  const threads = threadRequests.flatMap(result => result.status === 'fulfilled' ? [result.value] : [])
  if (!threads.length && threadRequests.length) throw new Error('Could not load Hacker News threads.')

  // Top-level replies are listings. In freelance threads, only show posts seeking hires.
  const listings = new Map<number, Opportunity>()
  for (const { children } of threads) {
    for (const comment of children) {
      if (!Number.isSafeInteger(comment.id) || !comment.text || !(Date.parse(comment.created_at) >= after)) continue
      const text = plainText(comment.text)
      if (!text || (kind === 'projects' && !/^seeking\s+freelancers?\b/i.test(text))) continue
      const lines = text.split(/\n+/).map(line => line.trim()).filter(Boolean)
      if (kind === 'projects') lines[0] = lines[0].replace(/^seeking\s+freelancers?\s*[:|–-]?\s*/i, '')
      const [headline, ...rest] = lines.filter(Boolean)
      if (!headline) continue
      const body = rest.join(' ').replace(/\s+/g, ' ').trim()
      listings.set(comment.id, {
        id: comment.id,
        title: headline.slice(0, 125),
        summary: (headline.length > 125 ? text : body || text).replace(/\s+/g, ' ').slice(0, 500),
        postedAt: comment.created_at,
        kind,
      })
    }
  }
  return [...listings.values()].sort((a, b) => Date.parse(b.postedAt) - Date.parse(a.postedAt))
}

function mentionsContractWork({ title, summary }: Opportunity) {
  const text = title + ' ' + summary
  return /\b(?:freelance|contract(?:or|ors)?)\s*(?:role|position|opportunity|work|\||\/)|\|\s*contract\b|\b\d{1,2}[- ]month contract\b|\b(?:hiring|seeking|looking for)\b[^.]{0,55}\b(?:freelancers?|contractors?)\b/i.test(text)
    && !/\b(?:no|not hiring) (?:freelancers?|contractors?)\b/i.test(text)
}

export async function fetchOpportunities(kind: Opportunity['kind'], signal: AbortSignal) {
  if (kind === 'jobs') return fetchThreadListings('jobs', signal)

  const [projects, jobs] = await Promise.allSettled([
    fetchThreadListings('projects', signal),
    fetchThreadListings('jobs', signal),
  ])
  if (projects.status === 'rejected' && jobs.status === 'rejected') throw projects.reason

  const directRequests = projects.status === 'fulfilled' ? projects.value : []
  const contracts = jobs.status === 'fulfilled' ? jobs.value.filter(mentionsContractWork) : []
  return [...directRequests, ...contracts].sort((a, b) => Date.parse(b.postedAt) - Date.parse(a.postedAt))
}

export function opportunityUrl(id: number) {
  return 'https://news.ycombinator.com/item?id=' + id
}
