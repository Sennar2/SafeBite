// src/App.tsx
import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Checklist from './pages/Checklist'
import Temperatures from './pages/Temperatures'
import Admin from './pages/Admin'
import Progress from './pages/Progress'
import Export from './pages/Export'
import TempTrends from './pages/TempTrends'
import UserActivity from './pages/UserActivity'
import AdminChecklistManager from './pages/AdminChecklistManager'
import ChecklistCalendar from './pages/ChecklistCalendar'
import SuperAdmin from './pages/SuperAdmin'
import AppLayout from './layouts/AppLayout'
import { AuthProvider } from './context/AuthContext'
import { MultiTenancyProvider } from './context/MultiTenancyContext'
import ProtectedRoute from './auth/ProtectedRoute'

export default function App() {
  return (
    <AuthProvider>
      <MultiTenancyProvider>
        <Router>
          <Routes>
            {/* Public */}
            <Route path="/login" element={<Login />} />

            {/* Protected area */}
            <Route
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/" element={<Dashboard />} />
              <Route path="/checklist" element={<Checklist />} />
              <Route path="/temperatures" element={<Temperatures />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/user-activity" element={<UserActivity />} />
              <Route path="/export" element={<Export />} />
              <Route path="/temperature-trends" element={<TempTrends />} />
              <Route path="/progress" element={<Progress />} />
              <Route path="/checklist-admin" element={<AdminChecklistManager />} />
              <Route path="/checklist-calendar" element={<ChecklistCalendar />} />
              <Route path="/super-admin" element={<SuperAdmin />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </MultiTenancyProvider>
    </AuthProvider>
  )
}
