import type { AIAnalysis } from '@/types'

export function deterministicScore(content: string, title: string): { score: number; reasons: string[] } {
  let score = 50
  const reasons: string[] = []
  const text = `${title} ${content}`.toLowerCase()

  if (text.includes('need a website') || text.includes('need website') || text.includes('looking for a website')) {
    score += 30; reasons.push('Explicitly says "need a website"')
  }
  if (text.includes('need a developer') || text.includes('looking for a developer') || text.includes('need someone to build')) {
    score += 25; reasons.push('Explicitly looking for a developer')
  }
  if (text.includes('ecommerce') || text.includes('e-commerce') || text.includes('online store') || text.includes('shopify')) {
    score += 20; reasons.push('Specific e-commerce requirement')
  }
  if (text.includes('web application') || text.includes('saas') || text.includes('web app')) {
    score += 20; reasons.push('Web application development needed')
  }
  if (text.includes('react') && (text.includes('developer') || text.includes('needed') || text.includes('hire'))) {
    score += 15; reasons.push('React development needed')
  }
  if (text.includes('angular') && (text.includes('developer') || text.includes('needed'))) {
    score += 15; reasons.push('Angular development needed')
  }
  if (text.includes('redesign') || text.includes('redesign')) {
    score += 15; reasons.push('Website redesign needed')
  }
  if (text.includes('custom software') || text.includes('custom application')) {
    score += 15; reasons.push('Custom software needed')
  }
  if (text.includes('budget') || text.includes('price') || text.includes('cost') || text.includes('how much')) {
    score += 10; reasons.push('Budget discussed')
  }
  if (text.includes('company') || text.includes('business') || text.includes('agency') || text.includes('firm') || text.includes('startup')) {
    score += 10; reasons.push('Business/company identified')
  }
  if (text.includes('urgent') || text.includes('asap') || text.includes('quickly') || text.includes('immediately')) {
    score += 10; reasons.push('Urgency indicated')
  }
  if (text.includes('@') || text.includes('email') || text.includes('contact')) {
    score += 5, reasons.push('Contact method provided')
  }

  // Negative signals
  if (text.includes('how much should i charge') || text.includes('pricing advice') || text.includes('freelancer asking')) {
    score -= 30; reasons.push('Developer asking for pricing advice')
  }
  if (text.includes('looking for a job') || text.includes('hire me') || text.includes('my portfolio')) {
    score -= 50; reasons.push('Looking for a job, not a client')
  }
  if (text.includes('free advice') || text.includes('free consultation')) {
    score -= 20; reasons.push('Asking for free advice')
  }

  score = Math.max(0, Math.min(100, score))
  return { score, reasons }
}

export function hybridScore(deterministic: number, aiAnalysis: AIAnalysis | null) {
  if (!aiAnalysis) return deterministic
  const aiAdjustment = (aiAnalysis.confidence - 0.5) * 20
  const final = Math.max(0, Math.min(100, Math.round(deterministic + aiAdjustment)))
  return final
}

export function getTemperature(score: number): 'hot' | 'warm' | 'cold' {
  if (score >= 80) return 'hot'
  if (score >= 50) return 'warm'
  return 'cold'
}
