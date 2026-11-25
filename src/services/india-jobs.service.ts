const boards = [
  { token: 'razorpaysoftwareprivatelimited', company: 'Razorpay' },
  { token: 'coinbase', company: 'Coinbase' },
  { token: 'rubrik', company: 'Rubrik' },
]

const indiaLocation = /\b(?:India|Bengaluru|Bangalore|Mumbai|Hyderabad|Pune|Chennai|Delhi|Gurgaon|Gurugram|Noida|Kolkata|Ahmedabad|Kochi|Coimbatore|Jaipur|Chandigarh|Indore|Nagpur|Visakhapatnam|Vadodara|Thiruvananthapuram)\b/i

type BoardJob = {
  id: number
  title: string
  absolute_url: string
  location?: { name?: string }
  updated_at: string
}

async function readBoard(board: typeof boards[number], signal: AbortSignal) {
  const response = await fetch('https://boards-api.greenhouse.io/v1/boards/' + board.token + '/jobs', {
    signal: AbortSignal.any([signal, AbortSignal.timeout(10000)]),
  })
  if (!response.ok) throw new Error('The employer feed is unavailable.')
  const { jobs } = await response.json() as { jobs: BoardJob[] }
  return jobs.flatMap(job => {
    const location = job.location?.name
    if (!location || !indiaLocation.test(location) || !job.title) return []
    try {
      const url = new URL(job.absolute_url)
      if (url.protocol !== 'https:') return []
      return [{ id: board.token + ':' + job.id, company: board.company, title: job.title, location, url: url.href, updatedAt: job.updated_at }]
    } catch {
      return []
    }
  })
}

export async function fetchIndiaJobs(signal: AbortSignal) {
  const results = await Promise.allSettled(boards.map(board => readBoard(board, signal)))
  const feeds = results.flatMap(result => result.status === 'fulfilled' ? [result.value] : [])
  if (!feeds.length) throw new Error('The employer feeds are unavailable.')
  const jobs = new Map(feeds.flat().map(job => [job.id, job]))
  return {
    jobs: [...jobs.values()].sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt)),
    unavailableFeeds: results.length - feeds.length,
  }
}
