import React, { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './admin/Dashboard'
import ChatLogs from './admin/ChatLogs'
import ChatLogDetail from './admin/ChatLogDetail'
import Leads from './admin/Leads'
import LeadDetail from './admin/LeadDetail'
import Settings from './admin/Settings'
import Knowledge from './admin/Knowledge'
import Layout from './components/Layout'
import { authAPI } from './services/api'

function PrivateRoute({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(null)

  useEffect(() => {
    authAPI.me()
      .then(() => setIsAuthenticated(true))
      .catch(() => setIsAuthenticated(false))
  }, [])

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin" />
          <p className="text-sm text-gray-500">Checking authentication...</p>
        </div>
      </div>
    )
  }

  if (isAuthenticated === false) {
    return <Navigate to="/login" replace />
  }

  return children
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<PrivateRoute><Layout><Dashboard /></Layout></PrivateRoute>} />
        <Route path="/chat-logs" element={<PrivateRoute><Layout><ChatLogs /></Layout></PrivateRoute>} />
        <Route path="/chat-logs/:sessionId" element={<PrivateRoute><Layout><ChatLogDetail /></Layout></PrivateRoute>} />
        <Route path="/leads" element={<PrivateRoute><Layout><Leads /></Layout></PrivateRoute>} />
        <Route path="/leads/:leadId" element={<PrivateRoute><Layout><LeadDetail /></Layout></PrivateRoute>} />
        <Route path="/knowledge" element={<PrivateRoute><Layout><Knowledge /></Layout></PrivateRoute>} />
        <Route path="/settings" element={<PrivateRoute><Layout><Settings /></Layout></PrivateRoute>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
