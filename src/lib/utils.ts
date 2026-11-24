import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { MessageSquare, Globe, FileText, type LucideIcon } from 'lucide-react'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(date))
}

export function formatRelativeTime(date: string | Date) {
  const now = new Date()
  const then = new Date(date)
  const diffMs = now.getTime() - then.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return formatDate(date)
}

export function getScoreColor(score: number | null) {
  if (score === null) return 'text-gray-400'
  if (score >= 80) return 'text-red-500'
  if (score >= 50) return 'text-yellow-500'
  return 'text-blue-500'
}

export function getTemperatureColor(temp: string | null) {
  switch (temp) {
    case 'hot': return 'bg-red-500/10 text-red-500 border-red-500/20'
    case 'warm': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
    case 'cold': return 'bg-blue-500/10 text-blue-500 border-blue-500/20'
    default: return 'bg-gray-500/10 text-gray-500 border-gray-500/20'
  }
}

export function getStatusColor(status: string) {
  switch (status) {
    case 'new': return 'bg-blue-500/10 text-blue-500 border-blue-500/20'
    case 'viewed': return 'bg-gray-500/10 text-gray-500 border-gray-500/20'
    case 'saved': return 'bg-purple-500/10 text-purple-500 border-purple-500/20'
    case 'contacted': return 'bg-orange-500/10 text-orange-500 border-orange-500/20'
    case 'replied': return 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20'
    case 'qualified': return 'bg-green-500/10 text-green-500 border-green-500/20'
    case 'converted': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
    case 'rejected': return 'bg-red-500/10 text-red-500 border-red-500/20'
    default: return 'bg-gray-500/10 text-gray-500 border-gray-500/20'
  }
}

export function getSourceIcon(source: string): LucideIcon {
  switch (source) {
    case 'reddit': return MessageSquare
    case 'web_search': return Globe
    case 'upwork': return Globe
    case 'freelancer': return Globe
    case 'linkedin': return MessageSquare
    case 'indeed': return FileText
    case 'glassdoor': return FileText
    case 'stackoverflow': return MessageSquare
    case 'github': return Globe
    case 'remote_board': return Globe
    case 'remoteok': return Globe
    case 'weworkremotely': return Globe
    case 'remotive': return Globe
    case 'wellfound': return Globe
    case 'ycjobs': return Globe
    case 'flexjobs': return FileText
    case 'remoteco': return Globe
    case 'workingnomads': return Globe
    case 'justremote': return Globe
    case 'skipthedrive': return Globe
    case 'remoterocketship': return Globe
    case 'careervault': return FileText
    case 'remotehub': return Globe
    case 'findasync': return Globe
    case 'remotefront': return Globe
    case 'topstartups': return Globe
    case 'toptal': return Globe
    case 'gunio': return Globe
    case 'arcdev': return Globe
    case 'vuejobs': return Globe
    case 'reactjobs': return Globe
    case 'manual_import': return FileText
    default: return Globe
  }
}

export function getSourceLabel(source: string) {
  switch (source) {
    case 'reddit': return 'Reddit'
    case 'web_search': return 'Web Search'
    case 'upwork': return 'Upwork'
    case 'freelancer': return 'Freelancer'
    case 'linkedin': return 'LinkedIn'
    case 'indeed': return 'Indeed'
    case 'glassdoor': return 'Glassdoor'
    case 'stackoverflow': return 'StackOverflow'
    case 'github': return 'GitHub'
    case 'remote_board': return 'Remote Board'
    case 'remoteok': return 'RemoteOK'
    case 'weworkremotely': return 'We Work Remotely'
    case 'remotive': return 'Remotive'
    case 'wellfound': return 'Wellfound'
    case 'ycjobs': return 'Y Combinator'
    case 'flexjobs': return 'FlexJobs'
    case 'remoteco': return 'Remote.co'
    case 'workingnomads': return 'Working Nomads'
    case 'justremote': return 'JustRemote'
    case 'skipthedrive': return 'Skip The Drive'
    case 'remoterocketship': return 'Remote Rocketship'
    case 'careervault': return 'CareerVault'
    case 'remotehub': return 'RemoteHub'
    case 'findasync': return 'FindAsync'
    case 'remotefront': return 'RemoteFront'
    case 'topstartups': return 'TopStartups'
    case 'toptal': return 'Toptal'
    case 'gunio': return 'Gun.io'
    case 'arcdev': return 'Arc.dev'
    case 'vuejobs': return 'VueJobs'
    case 'reactjobs': return 'ReactJobs'
    case 'manual_import': return 'Manual Import'
    default: return source || 'Unknown'
  }
}
