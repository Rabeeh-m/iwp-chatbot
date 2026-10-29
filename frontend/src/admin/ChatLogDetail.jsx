import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { chatLogsAPI } from '../services/api'
import { ArrowLeft, User, Bot, Phone, MapPin, Calendar, Users, Wallet, Sparkles } from 'lucide-react'

const qualificationStyles = {
  hot: 'bg-gradient-to-r from-champagne-100 to-champagne-200 text-champagne-800 border-champagne-300',
  warm: 'bg-gradient-to-r from-sage-100 to-sage-200 text-sage-700 border-sage-200',
  cold: 'bg-gradient-to-r from-forest-50 to-forest-100 text-forest-600 border-forest-200',
}

const InfoRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-3 py-2.5">
    <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">
      <Icon className="w-4 h-4 text-amber-600" />
    </div>
    <div className="min-w-0">
      <p className="text-xs text-gray-400 font-medium">{label}</p>
      <p className="text-sm font-semibold text-gray-900 truncate">{value || '—'}</p>
    </div>
  </div>
)

const ChatLogDetail = () => {
  const { sessionId } = useParams()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    loadDetail()
  }, [sessionId])
  
  const loadDetail = async () => {
    try {
      const response = await chatLogsAPI.getDetail(sessionId)
      setData(response.data)
    } catch (error) {
      console.error('Error loading detail:', error)
    } finally {
      setLoading(false)
    }
  }
  
  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin" />
          <p className="text-sm text-gray-500">Loading conversation...</p>
        </div>
      </div>
    )
  }
  if (!data) return <div className="p-6 text-gray-600">Error loading conversation</div>
  
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          to="/chat-logs"
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-amber-50 hover:border-amber-300 transition-all"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Conversation Details</h2>
          <p className="text-xs text-gray-500 font-mono">Session: {sessionId}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Chat Transcript</h3>
                <p className="text-sm text-gray-500">{data.messages?.length || 0} messages</p>
              </div>
              <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                {sessionId.substring(0, 8)}...
              </span>
            </div>
            <div className="p-6 max-h-[640px] overflow-y-auto space-y-4 bg-gradient-to-b from-gray-50/50 to-white">
              {data.messages?.map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[75%] rounded-2xl px-4 py-3 shadow-sm ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-br from-amber-400 to-yellow-500 text-gray-900 rounded-br-sm'
                      : 'bg-white border border-gray-200 text-gray-900 rounded-bl-sm'
                  }`}>
                    <div className={`flex items-center gap-1.5 mb-1 ${msg.role === 'user' ? 'text-amber-900' : 'text-gray-500'}`}>
                      {msg.role === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                      <span className="text-xs font-bold">{msg.role === 'user' ? 'Visitor' : 'Assistant'}</span>
                    </div>
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                    <p className={`text-[11px] mt-1.5 ${msg.role === 'user' ? 'text-amber-900/70' : 'text-gray-400'}`}>
                      {new Date(msg.created_at).toLocaleString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true, month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                </div>
              ))}
              {(!data.messages || data.messages.length === 0) && (
                <p className="text-center text-sm text-gray-400 py-8">No messages in this conversation.</p>
              )}
            </div>
          </div>
        </div>
        
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <h3 className="text-lg font-bold text-gray-900">Lead Information</h3>
            </div>
            <div className="px-5 py-3 divide-y divide-gray-50">
              <InfoRow icon={User} label="Full Name" value={data.lead?.full_name} />
              <InfoRow icon={Phone} label="Phone" value={data.lead?.phone_number} />
              <InfoRow icon={MapPin} label="Location" value={data.lead?.wedding_location} />
              <InfoRow icon={Calendar} label="Wedding Date" value={data.lead?.wedding_date} />
              <InfoRow icon={Users} label="Guest Count" value={data.lead?.guest_count} />
              <InfoRow icon={Wallet} label="Budget" value={data.lead?.budget_range_text} />
            </div>
            <div className="px-5 pb-5 pt-2 space-y-3">
              <div>
                <p className="text-xs text-gray-400 font-medium mb-1">Services</p>
                <div className="flex flex-wrap gap-1.5">
                  {data.lead?.required_services?.length ? data.lead.required_services.map((s, i) => (
                    <span key={i} className="text-xs font-medium px-2 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">{s}</span>
                  )) : <span className="text-sm text-gray-500">—</span>}
                </div>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-gray-50 to-amber-50 border border-gray-100">
                <div>
                  <p className="text-xs text-gray-400 font-medium">Lead Score</p>
                  <p className="text-2xl font-bold text-gray-900">{data.lead?.lead_score || 0}<span className="text-sm text-gray-400 font-medium">/100</span></p>
                </div>
                <span className={`inline-flex px-3 py-1.5 text-xs font-bold rounded-full border capitalize ${qualificationStyles[(data.lead?.qualification_level || '').toLowerCase()] || qualificationStyles.cold}`}>
                  {data.lead?.qualification_level || 'cold'}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Consultation Requested</span>
                <span className={`font-semibold ${data.lead?.consultation_requested ? 'text-sage-700' : 'text-gray-400'}`}>
                  {data.lead?.consultation_requested ? 'Yes' : 'No'}
                </span>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">Conversation Summary</h3>
            </div>
            <div className="p-5">
              <p className="text-sm text-gray-600 whitespace-pre-wrap leading-relaxed">{data.summary?.summary_text || 'No summary generated yet.'}</p>
            </div>
          </div>
          
          {data.score_events?.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100">
                <h3 className="text-lg font-bold text-gray-900">Score Breakdown</h3>
              </div>
              <div className="p-5 space-y-2.5">
                {[...data.score_events]
                  .sort((a, b) => b.points - a.points)
                  .map((event, idx) => (
                    <div key={idx} className="flex justify-between items-center gap-3 text-sm">
                      <span className="text-gray-600">{event.explanation}</span>
                      <span className="font-bold text-sage-700 whitespace-nowrap">+{event.points}</span>
                    </div>
                  ))}
                <div className="flex justify-between items-center gap-3 text-sm pt-3 mt-1 border-t border-gray-100">
                  <span className="font-bold text-gray-900">Total</span>
                  <span className="font-bold text-gray-900 whitespace-nowrap">
                    {data.lead?.lead_score || 0}<span className="text-gray-400 font-medium">/100</span>
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ChatLogDetail
