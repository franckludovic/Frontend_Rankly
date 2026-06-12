import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from '../store/authSlice'
import AppShell from '../shared/components/AppShell.jsx'

import AuthPage from '../features/auth/AuthPage.jsx'
import DashboardPage from '../features/dashboard/DashboardPage.jsx'
import AuditDashboard from '../features/audit/AuditDashboard.jsx'
import CompetitorsPage from '../features/competitors/CompetitorsPage.jsx'
import RoadmapPage from '../features/roadmap/RoadmapPage.jsx'
import HistoryPage from '../features/history/HistoryPage.jsx'

function ProtectedRoute({ children }) {
  const { token } = useAuth()
  if (!token) return <Navigate to="/login" replace />
  return children
}

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
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
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
