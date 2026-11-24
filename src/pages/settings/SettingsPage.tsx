import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { useTheme } from '@/hooks/useTheme'
import { useAuth } from '@/hooks/useAuth'
import { demoStore } from '@/lib/demo-store'
import { isDemoMode } from '@/lib/supabase'
import { User, Building2, Palette, Search, CheckCircle2 } from 'lucide-react'

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const { user } = useAuth()
  const profile = isDemoMode ? demoStore.getProfile() : null
  const workspace = isDemoMode ? demoStore.getWorkspace() : null

  const [fullName, setFullName] = useState(profile?.full_name || '')
  const [workspaceName, setWorkspaceName] = useState(workspace?.name || '')
  const [minScore, setMinScore] = useState('50')
  const [autoSave, setAutoSave] = useState('true')
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const sections = [
    { icon: User, title: 'Profile', color: 'from-violet-500/10 to-violet-500/5' },
    { icon: Building2, title: 'Workspace', color: 'from-blue-500/10 to-blue-500/5' },
    { icon: Palette, title: 'Theme', color: 'from-pink-500/10 to-pink-500/5' },
    { icon: Search, title: 'Discovery Preferences', color: 'from-emerald-500/10 to-emerald-500/5' },
  ]

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage your account and application preferences</p>
      </div>

      <Card className="border-border/50">
        <div className="p-6 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500/10 to-violet-500/5 flex items-center justify-center">
              <User className="w-4 h-4 text-violet-500" />
            </div>
            <h3 className="font-semibold text-sm">Profile</h3>
          </div>
        </div>
        <CardContent className="space-y-4 pt-0">
          <div className="space-y-2">
            <Label className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/70">Email</Label>
            <Input value={user?.email || 'demo@example.com'} disabled className="h-11 bg-muted/30" />
          </div>
          <div className="space-y-2">
            <Label className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/70">Full Name</Label>
            <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Your name" className="h-11" />
          </div>
          <div className="space-y-2">
            <Label className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/70">Avatar</Label>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-lg shadow-violet-500/25">
                {fullName?.charAt(0) || 'U'}
              </div>
              <Button variant="outline" size="sm" className="h-9">Change Avatar</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/50">
        <div className="p-6 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-500/5 flex items-center justify-center">
              <Building2 className="w-4 h-4 text-blue-500" />
            </div>
            <h3 className="font-semibold text-sm">Workspace</h3>
          </div>
        </div>
        <CardContent className="pt-0">
          <div className="space-y-2">
            <Label className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/70">Workspace Name</Label>
            <Input value={workspaceName} onChange={(e) => setWorkspaceName(e.target.value)} className="h-11" />
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/50">
        <div className="p-6 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-pink-500/10 to-pink-500/5 flex items-center justify-center">
              <Palette className="w-4 h-4 text-pink-500" />
            </div>
            <h3 className="font-semibold text-sm">Theme</h3>
          </div>
          <p className="text-xs text-muted-foreground mt-1 ml-[46px]">Choose your preferred color scheme</p>
        </div>
        <CardContent className="pt-0">
          <Select value={theme} onChange={(e) => setTheme(e.target.value as any)} className="w-[200px] h-11">
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="system">System</option>
          </Select>
        </CardContent>
      </Card>

      <Card className="border-border/50">
        <div className="p-6 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 flex items-center justify-center">
              <Search className="w-4 h-4 text-emerald-500" />
            </div>
            <h3 className="font-semibold text-sm">Discovery Preferences</h3>
          </div>
        </div>
        <CardContent className="space-y-4 pt-0">
          <div className="space-y-2">
            <Label className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/70">Minimum Lead Score</Label>
            <Input type="number" value={minScore} onChange={(e) => setMinScore(e.target.value)} min="0" max="100" className="w-[120px] h-11" />
            <p className="text-xs text-muted-foreground/60">Leads below this score will be marked as cold</p>
          </div>
          <div className="space-y-2">
            <Label className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/70">Auto-save Qualified Leads</Label>
            <Select value={autoSave} onChange={(e) => setAutoSave(e.target.value)} className="w-[200px] h-11">
              <option value="true">Yes, auto-save</option>
              <option value="false">No, manual only</option>
            </Select>
            <p className="text-xs text-muted-foreground/60">Automatically save leads that meet the qualification threshold</p>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} variant="gradient" className="h-11 px-8">
          {saved ? (
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Saved!
            </span>
          ) : 'Save Changes'}
        </Button>
      </div>
    </div>
  )
}
