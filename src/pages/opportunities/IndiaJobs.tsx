import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ArrowUpRight, MapPin } from 'lucide-react'
import { fetchIndiaJobs } from '@/services/india-jobs.service'

export default function IndiaJobs({ query }: { query: string }) {
  const [limit, setLimit] = useState(8)
  const feed = useQuery({
    queryKey: ['india-employer-jobs'],
    queryFn: ({ signal }) => fetchIndiaJobs(signal),
    staleTime: 10 * 60 * 1000,
    retry: false,
  })
  const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean)
  const matches = (feed.data?.jobs ?? []).filter(job => {
    const text = [job.title, job.company, job.location].join(' ').toLowerCase()
    return words.every(word => text.includes(word))
  })
  return (
    <section className="dashboard-panel" aria-labelledby="india-jobs-heading">
      <div className="dashboard-panel-heading">
        <div>
          <h2 id="india-jobs-heading">Jobs in India</h2>
          <p>Open roles from employer career feeds. Filter by role, company, or city above.</p>
        </div>
      </div>

      {feed.isPending ? <p className="dashboard-empty" role="status">Loading India job listings…</p>
        : feed.isError ? (
          <div role="alert" className="dashboard-empty flex flex-wrap items-center gap-3">
            Employer feeds are temporarily unavailable. <button type="button" className="workspace-search" onClick={() => feed.refetch()}>Try again</button>
          </div>
        ) : (
          <>
            <p className="dashboard-empty py-3" role="status">
              {matches.length} matching employer listings{feed.data.unavailableFeeds > 0 && ' · Some feeds are temporarily unavailable'}
              {!matches.length && '. Try a different role or city.'}
            </p>
            {matches.slice(0, limit).map(job => (
              <article key={job.id} className="border-t border-border px-4 py-3">
                <a href={job.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-start gap-2 text-sm font-semibold hover:text-primary">
                  {job.title}<ArrowUpRight size={15} className="mt-0.5 shrink-0" aria-hidden="true" />
                </a>
                <p className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground"><strong>{job.company}</strong><span aria-hidden="true">·</span><MapPin size={13} aria-hidden="true" />{job.location}</p>
              </article>
            ))}
            {matches.length > limit && (
              <div className="border-t border-border p-4">
                <button type="button" className="workspace-search text-sm" onClick={() => setLimit(current => current + 8)}>Show more ({matches.length - limit})</button>
              </div>
            )}
          </>
        )}
    </section>
  )
}
