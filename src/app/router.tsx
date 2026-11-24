import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
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

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout><Outlet /></Layout>}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/jobs" element={<JobsPage />} />
          <Route path="/freelance" element={<FreelancePage />} />
          <Route path="/discover" element={<DiscoverPage />} />
          <Route path="/leads" element={<LeadsPage />} />
          <Route path="/leads/:id" element={<LeadDetailPage />} />
          <Route path="/keywords" element={<KeywordsPage />} />
          <Route path="/saved-searches" element={<SavedSearchesPage />} />
          <Route path="/sources" element={<SourcesPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
