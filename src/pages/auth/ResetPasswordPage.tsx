import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { isDemoMode, supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function ResetPasswordPage() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  if (isDemoMode) return <Navigate to="/dashboard" replace />

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    setSaving(true)
    setError('')
    try {
      const { error } = await supabase.auth.updateUser({ password })
      if (error) throw error
      navigate('/dashboard', { replace: true })
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Could not update your password.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen grid place-items-center bg-background bg-mesh p-4">
      <div className="w-full max-w-md space-y-5 rounded-3xl border border-border/50 bg-card p-8">
        <h1 className="text-2xl font-bold">Set a new password</h1>
        {loading ? <p role="status">Checking your reset link…</p> : user ? (
          <form className="space-y-4" onSubmit={handleSubmit}>
            <Label htmlFor="new-password">New password</Label>
            <Input id="new-password" type="password" autoComplete="new-password" minLength={6} required value={password} onChange={event => setPassword(event.target.value)} />
            <Label htmlFor="confirm-new-password">Confirm password</Label>
            <Input id="confirm-new-password" type="password" autoComplete="new-password" required value={confirmPassword} onChange={event => setConfirmPassword(event.target.value)} />
            {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
            <Button type="submit" variant="gradient" disabled={saving}>{saving ? 'Saving…' : 'Update password'}</Button>
          </form>
        ) : (
          <Link to="/forgot-password" className="text-violet-500 font-semibold">Request a new reset link</Link>
        )}
      </div>
    </div>
  )
}
