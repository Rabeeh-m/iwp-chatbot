import React, { useEffect, useState } from 'react'
import { dashboardAPI } from '../services/api'
import { MessageSquare, Users, Flame, ThermometerSun, Snowflake, Calendar, Sparkles, TrendingUp } from 'lucide-react'

const qualificationStyles = {
  hot: 'bg-gradient-to-r from-champagne-100 to-champagne-200 text-champagne-800 border-champagne-300',
  warm: 'bg-gradient-to-r from-sage-100 to-sage-200 text-sage-700 border-sage-200',
  cold: 'bg-gradient-to-r from-forest-50 to-forest-100 text-forest-600 border-forest-200',
}

const Dashboard = () => {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    loadStats()
  }, [])
  
  const loadStats = async () => {
    try {
      const response = await dashboardAPI.getStats()
      setStats(response.data)
    } catch (error) {
      console.error('Error loading stats:', error)
    } finally {
      setLoading(false)
    }
  }
  
  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin" />
          <p className="text-sm text-gray-500">Loading dashboard...</p>
        </div>
      </div>
    )
  }
  if (!stats) return <div className="p-6 text-gray-600">Error loading dashboard</div>
  
  const cards = [
    { title: 'Total Conversations', value: stats.total_conversations, icon: MessageSquare, gradient: 'from-forest-500 to-forest-700', ring: 'ring-forest-100' },
    { title: 'Total Leads', value: stats.total_leads, icon: Users, gradient: 'from-sage-400 to-sage-600', ring: 'ring-sage-100' },
    { title: 'Hot Leads', value: stats.hot_leads, icon: Flame, gradient: 'from-champagne-500 to-champagne-700', ring: 'ring-champagne-100' },
    { title: 'Warm Leads', value: stats.warm_leads, icon: ThermometerSun, gradient: 'from-sage-300 to-sage-500', ring: 'ring-sage-100' },
    { title: 'Cold Leads', value: stats.cold_leads, icon: Snowflake, gradient: 'from-forest-400 to-forest-600', ring: 'ring-forest-100' },
    { title: 'New Leads Today', value: stats.new_leads_today, icon: Calendar, gradient: 'from-champagne-400 to-champagne-600', ring: 'ring-champagne-100' },
  ]
  
  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-forest-900 via-forest-800 to-forest-700 p-8 shadow-gold-lg">
        <div className="absolute -right-8 -top-8 w-48 h-48 bg-champagne-300/20 rounded-full blur-2xl" />
        <div className="absolute right-16 bottom-0 w-24 h-24 bg-sage-300/20 rounded-full blur-xl" />
        <div className="relative flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-champagne-200 text-sm font-medium mb-2">
              <Sparkles className="w-4 h-4" />
              <span>Welcome back</span>
            </div>
            <h2 className="text-3xl font-bold text-light">Dashboard Overview</h2>
            <p className="text-sage-100 mt-2 text-sm">Track your wedding planning leads and conversations at a glance.</p>
          </div>
          <div className="hidden md:flex items-center gap-3 bg-forest-700/60 backdrop-blur-sm rounded-xl px-5 py-3 border border-champagne-300/30">
            <TrendingUp className="w-5 h-5 text-champagne-200" />
            <div>
              <p className="text-xs text-sage-200">New today</p>
              <p className="text-xl font-bold text-light">{stats.new_leads_today}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {cards.map((card, index) => {
          const Icon = card.icon
          return (
            <div
              key={index}
              className="group relative bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-gold hover:-translate-y-1 transition-all duration-300"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium">{card.title}</p>
                  <p className="text-4xl font-bold text-gray-900 mt-2 tracking-tight">{card.value}</p>
                </div>
                <div className={`p-3 rounded-xl bg-gradient-to-br ${card.gradient} ring-4 ${card.ring} shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className={`mt-4 h-1 w-12 rounded-full bg-gradient-to-r ${card.gradient} opacity-70`} />
            </div>
          )
        })}
      </div>
      
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Recent Conversations</h3>
            <p className="text-sm text-gray-500 mt-0.5">Latest activity from your website widget</p>
          </div>
          <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
            {stats.recent_conversations?.length || 0} recent
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50/80">
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Session</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Qualification</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Messages</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Last Activity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {stats.recent_conversations?.map((conv, index) => (
                <tr key={index} className="hover:bg-amber-50/40 transition-colors">
                  <td className="px-6 py-4 text-sm font-mono text-gray-500">{conv.session_id.substring(0, 8)}...</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{conv.name}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-full border capitalize ${qualificationStyles[conv.qualification] || qualificationStyles.cold}`}>
                      {conv.qualification}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">{conv.message_count}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(conv.last_activity).toLocaleString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true, month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                </tr>
              ))}
              {(!stats.recent_conversations || stats.recent_conversations.length === 0) && (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-sm text-gray-400">
                    No conversations yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
