import React from 'react'
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

function PrivateRoute({ children }) {
  const token = localStorage.getItem('admin_token')
  // For session auth, check if logged in via API
  return children
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Layout><Dashboard /></Layout>} />
        <Route path="/chat-logs" element={<Layout><ChatLogs /></Layout>} />
        <Route path="/chat-logs/:sessionId" element={<Layout><ChatLogDetail /></Layout>} />
        <Route path="/leads" element={<Layout><Leads /></Layout>} />
        <Route path="/leads/:leadId" element={<Layout><LeadDetail /></Layout>} />
        <Route path="/knowledge" element={<Layout><Knowledge /></Layout>} />
        <Route path="/settings" element={<Layout><Settings /></Layout>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
