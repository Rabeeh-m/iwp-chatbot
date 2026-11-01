import React, { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { authAPI, clearToken } from '../services/api'
import { LayoutDashboard, MessageSquare, Users, BookOpen, Settings, LogOut, Menu, X } from 'lucide-react'

const Layout = ({ children }) => {
  const location = useLocation()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    setSidebarOpen(false)
  }, [location.pathname])

  const handleLogout = async () => {
    try {
      await authAPI.logout()
    } catch (err) {
      // Token may already be invalid; clear locally regardless
    } finally {
      clearToken()
      navigate('/login')
    }
  }
  
  const navItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/chat-logs', icon: MessageSquare, label: 'Chat Logs' },
    { path: '/leads', icon: Users, label: 'Leads' },
    { path: '/knowledge', icon: BookOpen, label: 'Knowledge Base' },
    { path: '/settings', icon: Settings, label: 'Settings' },
  ]
  
  return (
    <div className="flex h-[100dvh] bg-cream overflow-hidden">
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-forest-900/50 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] bg-gradient-to-b from-forest-900 via-forest-900 to-forest-800 border-r border-forest-700 flex flex-col shadow-lg transform transition-transform duration-300 ease-out lg:static lg:translate-x-0 lg:max-w-none ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-16 lg:h-[73px] px-4 sm:px-6 flex items-center justify-between border-b border-forest-700/70 bg-forest-900/80 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-gold flex items-center justify-center shadow-gold">
              <span className="text-forest-900 font-bold text-lg">IWP</span>
            </div>
            <div>
              <div className="text-lg font-bold tracking-wide text-light">IWP Admin</div>
              <div className="text-xs text-sage-200">Dashboard</div>
            </div>
          </div>
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 -mr-1 rounded-lg text-sage-200 hover:bg-forest-800 hover:text-light transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto mt-2 px-3 pb-4">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`group flex items-center px-3 py-3 mx-1 my-1 rounded-lg transition-all duration-200 ${
                  isActive 
                    ? 'bg-gradient-to-r from-champagne-500/20 to-sage-500/10 text-light shadow-md border border-champagne-500/40'
                    : 'text-sage-100 hover:bg-forest-800/80 hover:text-light border border-transparent hover:border-forest-600'
                }`}
              >
                <Icon className={`w-5 h-5 mr-3 ${isActive ? 'text-champagne-300' : 'text-sage-300 group-hover:text-champagne-300'}`} />
                <span className="font-medium">{item.label}</span>
              </Link>
            )
          })}
        </nav>
        <div className="p-3 border-t border-forest-700 bg-forest-900/60" style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sage-200 hover:bg-champagne-500/10 hover:text-champagne-300 transition-colors duration-200"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 h-[100dvh]">
        <header className="bg-cream-50/90 backdrop-blur-md border-b border-forest-100 px-4 sm:px-6 lg:px-8 h-16 lg:h-[73px] flex items-center shadow-sm flex-shrink-0">
          <div className="flex items-center justify-between w-full gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <button
                type="button"
                aria-label="Open menu"
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 -ml-1 rounded-lg text-forest-700 hover:bg-forest-100 transition-colors flex-shrink-0"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div className="min-w-0">
                <h1 className="text-base sm:text-xl font-bold text-forest-900 truncate">Indian Wedding Planners</h1>
                <p className="text-xs sm:text-sm text-forest-500 truncate hidden sm:block">Manage conversations, leads & insights</p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              <div className="text-right hidden md:block">
                <p className="text-sm font-semibold text-forest-900">Administrator</p>
                <p className="text-xs text-forest-500">IWP Admin</p>
              </div>
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-gold flex items-center justify-center shadow-gold text-forest-900 font-bold">
                A
              </div>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-cream via-cream to-sage-50">{children}</main>
      </div>
    </div>
  )
}

export default Layout
