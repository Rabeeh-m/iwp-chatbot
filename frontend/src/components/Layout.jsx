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
    <div className="flex h-screen bg-gray-50">
      <div className="w-72 h-screen bg-gradient-to-b from-amber-50 via-white to-gray-50 border-r border-amber-200 flex flex-col shadow-lg">
        <div className="h-[73px] px-6 flex items-center border-b border-amber-200 bg-white/80 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-gold flex items-center justify-center shadow-gold">
              <span className="text-white font-bold text-lg">IWP</span>
            </div>
            <div>
              <div className="text-lg font-bold tracking-wide text-gray-900">IWP Admin</div>
              <div className="text-xs text-gray-600">Dashboard</div>
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
                    ? 'bg-gradient-to-r from-amber-100 to-yellow-50 text-gray-900 shadow-md border border-amber-300' 
                    : 'text-gray-700 hover:bg-amber-50/80 hover:text-gray-900 border border-transparent hover:border-amber-200'
                }`}
              >
                <Icon className={`w-5 h-5 mr-3 ${isActive ? 'text-amber-700' : 'text-gray-500 group-hover:text-amber-600'}`} />
                <span className="font-medium">{item.label}</span>
              </Link>
            )
          })}
        </nav>
        <div className="p-3 border-t border-amber-200 bg-white/60">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-600 hover:bg-rose-50 hover:text-rose-600 transition-colors duration-200"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="bg-white/80 backdrop-blur-md border-b border-amber-200 px-8 h-[73px] flex items-center shadow-sm">
          <div className="flex items-center justify-between w-full">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Indian Wedding Planners</h1>
              <p className="text-sm text-gray-500">Manage conversations, leads & insights</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-gray-900">Administrator</p>
                <p className="text-xs text-gray-500">IWP Admin</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-gold flex items-center justify-center shadow-gold text-white font-bold">
                A
              </div>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-8 bg-gradient-to-br from-gray-50 to-amber-50/30">{children}</main>
      </div>
    </div>
  )
}

export default Layout
