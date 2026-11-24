import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Zap, ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { resetPassword } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await resetPassword(email)
      setSent(true)
    } catch (err: any) {
      setError(err.message || 'Failed to send reset email')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background bg-mesh p-4">
      <div className="w-full max-w-md fade-in">
        <div className="flex items-center justify-center gap-3 mb-10">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-xl shadow-violet-500/30">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold gradient-text">
            Social Lead Finder
          </span>
        </div>

        <div className="bg-card rounded-3xl border border-border/50 shadow-2xl shadow-black/5 p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold tracking-tight">Reset password</h1>
            <p className="text-muted-foreground mt-2">Enter your email to receive a reset link</p>
          </div>

          {sent ? (
            <div className="text-center space-y-6">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8 text-emerald-500" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Check your email</h3>
                <p className="text-sm text-muted-foreground">
                  If an account exists with that email, you'll receive a password reset link shortly.
                </p>
              </div>
              <Link to="/login">
                <Button variant="outline" className="w-full h-11">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to sign in
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="p-4 text-sm text-red-600 bg-red-500/10 border border-red-500/20 rounded-xl font-medium">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Email</Label>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-11"
                />
              </div>

              <Button type="submit" variant="gradient" className="w-full h-11" disabled={loading}>
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Sending...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Send reset link
                    <ArrowRight className="w-4 h-4" />
                  </span>
                )}
              </Button>

              <div className="text-center pt-4 border-t border-border/40">
                <Link to="/login" className="text-sm text-violet-500 hover:text-violet-600 font-semibold inline-flex items-center gap-1.5 transition-colors">
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Back to sign in
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
