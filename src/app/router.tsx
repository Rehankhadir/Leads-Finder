import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { Layout } from '@/components/layout/Layout'
import LoginPage from '@/pages/auth/LoginPage'
import SignupPage from '@/pages/auth/SignupPage'
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage'
import DashboardPage from '@/pages/dashboard/DashboardPage'
import DiscoverPage from '@/pages/discover/DiscoverPage'
import JobsPage from '@/pages/jobs/JobsPage'
import FreelancePage from '@/pages/freelance/FreelancePage'
import LeadsPage from '@/pages/leads/LeadsPage'
import LeadDetailPage from '@/pages/leads/LeadDetailPage'
import KeywordsPage from '@/pages/keywords/KeywordsPage'
import SavedSearchesPage from '@/pages/saved-searches/SavedSearchesPage'
import SourcesPage from '@/pages/sources/SourcesPage'
import AnalyticsPage from '@/pages/analytics/AnalyticsPage'
import SettingsPage from '@/pages/settings/SettingsPage'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <Layout>{children}</Layout>
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500" />
      </div>
    )
  }

  if (user) {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/signup" element={<PublicRoute><SignupPage /></PublicRoute>} />
        <Route path="/forgot-password" element={<PublicRoute><ForgotPasswordPage /></PublicRoute>} />

        <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/jobs" element={<ProtectedRoute><JobsPage /></ProtectedRoute>} />
        <Route path="/freelance" element={<ProtectedRoute><FreelancePage /></ProtectedRoute>} />
        <Route path="/discover" element={<ProtectedRoute><DiscoverPage /></ProtectedRoute>} />
        <Route path="/leads" element={<ProtectedRoute><LeadsPage /></ProtectedRoute>} />
        <Route path="/leads/:id" element={<ProtectedRoute><LeadDetailPage /></ProtectedRoute>} />
        <Route path="/keywords" element={<ProtectedRoute><KeywordsPage /></ProtectedRoute>} />
        <Route path="/saved-searches" element={<ProtectedRoute><SavedSearchesPage /></ProtectedRoute>} />
        <Route path="/sources" element={<ProtectedRoute><SourcesPage /></ProtectedRoute>} />
        <Route path="/analytics" element={<ProtectedRoute><AnalyticsPage /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
