import React from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { LayoutDashboard, MessageSquare, Users, BookOpen, Settings, LogOut } from 'lucide-react'

const Layout = ({ children }) => {
  const location = useLocation()
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem('admin_token')
    navigate('/login')
  }
  
  const navItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/chat-logs', icon: MessageSquare, label: 'Chat Logs' },
    { path: '/leads', icon: Users, label: 'Leads' },
    { path: '/knowledge', icon: BookOpen, label: 'Knowledge Base' },
    { path: '/settings', icon: Settings, label: 'Settings' },
  ]
  
  return (
    <div className="flex h-screen bg-cream">
      <div className="w-72 h-screen bg-gradient-to-b from-forest-900 via-forest-900 to-forest-800 border-r border-forest-700 flex flex-col shadow-lg">
        <div className="h-[73px] px-6 flex items-center border-b border-forest-700/70 bg-forest-900/80 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-gold flex items-center justify-center shadow-gold">
              <span className="text-forest-900 font-bold text-lg">IWP</span>
            </div>
            <div>
              <div className="text-lg font-bold tracking-wide text-light">IWP Admin</div>
              <div className="text-xs text-sage-200">Dashboard</div>
            </div>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto mt-2 px-3 pb-4">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`group flex items-center px-3 py-2.5 mx-1 my-1 rounded-lg transition-all duration-200 ${
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
        <div className="p-3 border-t border-forest-700 bg-forest-900/60">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sage-200 hover:bg-champagne-500/10 hover:text-champagne-300 transition-colors duration-200"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="bg-cream-50/90 backdrop-blur-md border-b border-forest-100 px-8 h-[73px] flex items-center shadow-sm">
          <div className="flex items-center justify-between w-full">
            <div>
              <h1 className="text-xl font-bold text-forest-900">Indian Wedding Planners</h1>
              <p className="text-sm text-forest-500">Manage conversations, leads & insights</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-forest-900">Administrator</p>
                <p className="text-xs text-forest-500">IWP Admin</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-gold flex items-center justify-center shadow-gold text-forest-900 font-bold">
                A
              </div>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-8 bg-gradient-to-br from-cream via-cream to-sage-50">{children}</main>
      </div>
    </div>
  )
}

export default Layout
