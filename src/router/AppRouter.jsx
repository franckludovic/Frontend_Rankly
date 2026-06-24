import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from '../store/authSlice'
import AppShell from '../shared/components/AppShell.jsx'

import AuthPage from '../features/auth/AuthPage.jsx'
import LandingPage from '../features/landing/LandingPage.jsx'
import DashboardPage from '../features/dashboard/DashboardPage.jsx'
import AuditDashboard from '../features/audit/AuditDashboard.jsx'
import CompetitorsPage from '../features/competitors/CompetitorsPage.jsx'
import RoadmapPage from '../features/roadmap/RoadmapPage.jsx'
import HistoryPage from '../features/history/HistoryPage.jsx'
import BulkAuditPage from '../features/bulk/BulkAuditPage.jsx'
import DeveloperPage from '../features/developer/DeveloperPage.jsx'
import BillingPage from '../features/billing/BillingPage.jsx'
import CheckoutSuccess from '../features/billing/CheckoutSuccess.jsx'

function ProtectedRoute({ children }) {
  const { token } = useAuth()
  if (!token) return <Navigate to="/" replace />
  return children
}

function HomeRoute() {
  const { token } = useAuth()
  return token ? <Navigate to="/dashboard" replace /> : <LandingPage />
}

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<HomeRoute />} />
      <Route path="/login" element={<AuthPage mode="login" />} />
      <Route path="/register" element={<AuthPage mode="register" />} />

      {/* AppShell wraps all protected pages as a layout route */}
      <Route
        element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/audit/:id" element={<AuditDashboard />} />
        <Route path="/audit/:id/competitors" element={<CompetitorsPage />} />
        <Route path="/audit/:id/roadmap" element={<RoadmapPage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/bulk"              element={<BulkAuditPage />} />
        <Route path="/developer"         element={<DeveloperPage />} />
        <Route path="/billing"           element={<BillingPage />} />
        <Route path="/billing/success"   element={<CheckoutSuccess />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
