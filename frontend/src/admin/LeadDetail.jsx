import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { leadsAPI } from '../services/api'
import { ArrowLeft, User, Phone, Mail, MapPin, Calendar, Users, Wallet, StickyNote, MessageSquare } from 'lucide-react'

const qualificationStyles = {
  hot: 'bg-gradient-to-r from-rose-100 to-orange-100 text-rose-700 border-rose-200',
  warm: 'bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-700 border-amber-200',
  cold: 'bg-gradient-to-r from-sky-100 to-slate-100 text-sky-700 border-sky-200',
}

const InfoRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-3 py-2.5">
    <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">
      <Icon className="w-4 h-4 text-amber-600" />
    </div>
    <div className="min-w-0">
      <p className="text-xs text-gray-400 font-medium">{label}</p>
      <p className="text-sm font-semibold text-gray-900 break-words">{value || '—'}</p>
    </div>
  </div>
)

const LeadDetail = () => {
  const { leadId } = useParams()
  const [lead, setLead] = useState(null)
  const [loading, setLoading] = useState(true)
  const [note, setNote] = useState('')
  
  useEffect(() => {
    loadLead()
  }, [leadId])
  
  const loadLead = async () => {
    try {
      const response = await leadsAPI.getDetail(leadId)
      setLead(response.data)
    } catch (error) {
      console.error('Error loading lead:', error)
    } finally {
      setLoading(false)
    }
  }
  
  const updateStatus = async (status) => {
    try {
      await leadsAPI.update(leadId, { lead_status: status })
      loadLead()
    } catch (error) {
      console.error('Error updating status:', error)
    }
  }
  
  const addNote = async () => {
    if (!note.trim()) return
    try {
      await leadsAPI.addNote(leadId, note)
      setNote('')
      loadLead()
    } catch (error) {
      console.error('Error adding note:', error)
    }
  }
  
  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin" />
          <p className="text-sm text-gray-500">Loading lead...</p>
        </div>
      </div>
    )
  }
  if (!lead) return <div className="p-6 text-gray-600">Error loading lead</div>
  
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          to="/leads"
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-amber-50 hover:border-amber-300 transition-all"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Lead Details</h2>
          <p className="text-sm text-gray-500">{lead.full_name || 'Anonymous lead'}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">Contact Information</h3>
            </div>
            <div className="px-6 py-3 grid grid-cols-1 sm:grid-cols-2 gap-x-8 divide-y sm:divide-y-0">
              <InfoRow icon={User} label="Full Name" value={lead.full_name} />
              <InfoRow icon={Phone} label="Phone" value={lead.phone_number} />
              <InfoRow icon={Mail} label="Email" value={lead.email} />
              <InfoRow icon={MapPin} label="Location" value={lead.wedding_location} />
              <InfoRow icon={Calendar} label="Wedding Date" value={lead.wedding_date} />
              <InfoRow icon={Users} label="Guest Count" value={lead.guest_count} />
              <InfoRow icon={Wallet} label="Budget" value={lead.budget_range_text} />
              <InfoRow icon={MessageSquare} label="Wedding Type" value={lead.wedding_type} />
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">Requirements</h3>
            </div>
            <div className="px-6 py-5 space-y-3 text-sm">
              <div>
                <p className="text-xs text-gray-400 font-medium mb-2">Services</p>
                <div className="flex flex-wrap gap-1.5">
                  {lead.required_services?.length ? lead.required_services.map((s, i) => (
                    <span key={i} className="text-xs font-medium px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">{s}</span>
                  )) : <span className="text-gray-500">—</span>}
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-400 font-medium mb-1">Additional Requirements</p>
                <p className="text-gray-700 leading-relaxed">{lead.additional_requirements || '—'}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
              <StickyNote className="w-4 h-4 text-amber-600" />
              <h3 className="text-lg font-bold text-gray-900">Internal Notes</h3>
            </div>
            <div className="p-6">
              <div className="flex flex-col sm:flex-row gap-2 mb-5">
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addNote()}
                  placeholder="Add a note..."
                  className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                />
                <button
                  onClick={addNote}
                  className="px-5 py-2.5 bg-gradient-gold text-white rounded-xl hover:shadow-gold font-semibold text-sm transition-all"
                >
                  Add Note
                </button>
              </div>
              <div className="space-y-3">
                {lead.notes?.length ? lead.notes.map((n) => (
                  <div key={n.id} className="bg-gradient-to-br from-gray-50 to-amber-50/40 p-4 rounded-xl border border-gray-100">
                    <p className="text-sm text-gray-800">{n.note}</p>
                    <p className="text-xs text-gray-400 mt-2">{n.author} · {new Date(n.created_at).toLocaleString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true, month: 'short', day: 'numeric', year: 'numeric' })}</p>
                  </div>
                )) : (
                  <p className="text-sm text-gray-400 text-center py-4">No notes yet.</p>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">Lead Status</h3>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-gray-50 to-amber-50 border border-gray-100">
                <div>
                  <p className="text-xs text-gray-400 font-medium">Lead Score</p>
                  <p className="text-3xl font-bold text-gray-900">{lead.lead_score}<span className="text-sm text-gray-400 font-medium">/100</span></p>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-400 font-medium mb-1.5">Qualification</p>
                <span className={`inline-flex px-3 py-1.5 text-xs font-bold rounded-full border capitalize ${qualificationStyles[(lead.qualification_level || '').toLowerCase()] || qualificationStyles.cold}`}>
                  {lead.qualification_level || 'cold'}
                </span>
              </div>
              <div>
                <p className="text-xs text-gray-400 font-medium mb-1.5">Change Status</p>
                <select
                  value={lead.lead_status}
                  onChange={(e) => updateStatus(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                >
                  <option value="new">New</option>
                  <option value="contact_pending">Contact Pending</option>
                  <option value="contacted">Contacted</option>
                  <option value="consultation_scheduled">Consultation Scheduled</option>
                  <option value="proposal_sent">Proposal Sent</option>
                  <option value="converted">Converted</option>
                  <option value="lost">Lost</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LeadDetail
