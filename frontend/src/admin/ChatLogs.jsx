import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { chatLogsAPI } from '../services/api'
import { Search } from 'lucide-react'

const qualificationStyles = {
  hot: 'bg-gradient-to-r from-rose-100 to-orange-100 text-rose-700 border-rose-200',
  warm: 'bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-700 border-amber-200',
  cold: 'bg-gradient-to-r from-sky-100 to-slate-100 text-sky-700 border-sky-200',
}

const statusStyles = {
  active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  ended: 'bg-gray-50 text-gray-600 border-gray-200',
  completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  abandoned: 'bg-rose-50 text-rose-700 border-rose-200',
}

const ChatLogs = () => {
  const navigate = useNavigate()
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [qualification, setQualification] = useState('')
  
  useEffect(() => {
    loadLogs()
  }, [search, qualification])
  
  const loadLogs = async () => {
    try {
      const params = {}
      if (search) params.search = search
      if (qualification) params.qualification = qualification
      const response = await chatLogsAPI.getAll(params)
      setLogs(response.data.results || response.data)
    } catch (error) {
      console.error('Error loading chat logs:', error)
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Chat Logs</h2>
        <p className="text-sm text-gray-500 mt-1">Review every conversation captured by your chatbot</p>
      </div>
      
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex flex-col sm:flex-row gap-3">
        <div className="flex-1 flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 focus-within:ring-2 focus-within:ring-amber-400 transition-all">
          <Search className="w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, phone, or session ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent py-2.5 text-sm outline-none"
          />
        </div>
        <select
          value={qualification}
          onChange={(e) => setQualification(e.target.value)}
          className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
        >
          <option value="">All Qualifications</option>
          <option value="hot">Hot</option>
          <option value="warm">Warm</option>
          <option value="cold">Cold</option>
        </select>
      </div>
      
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50/80">
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Session</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Visitor</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Phone</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Location</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Score</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Qualification</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Messages</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Last Activity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan="9" className="text-center py-12 text-gray-400">Loading chat logs...</td></tr>
              ) : logs.length === 0 ? (
                <tr><td colSpan="9" className="text-center py-12 text-gray-400">No chat logs found</td></tr>
              ) : (
                logs.map((log) => (
                  <tr
                    key={log.session_id}
                    onClick={() => navigate(`/chat-logs/${log.session_id}`)}
                    className="hover:bg-amber-50/60 transition-colors cursor-pointer"
                  >
                    <td className="px-6 py-4 text-sm font-mono text-gray-500">{log.session_id.substring(0, 8)}...</td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">{log.visitor_name || 'Anonymous'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{log.mobile_number || '—'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{log.wedding_location || '—'}</td>
                    <td className="px-6 py-4 text-sm font-bold text-gray-900">{log.lead_score}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-full border capitalize ${qualificationStyles[(log.qualification_level || '').toLowerCase()] || qualificationStyles.cold}`}>
                        {log.qualification_level || 'cold'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-full border capitalize ${statusStyles[(log.conversation_status || '').toLowerCase()] || statusStyles.ended}`}>
                        {log.conversation_status || 'ended'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">{log.message_count}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{new Date(log.last_activity).toLocaleString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true, month: 'short', day: 'numeric', year: 'numeric' })}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default ChatLogs
