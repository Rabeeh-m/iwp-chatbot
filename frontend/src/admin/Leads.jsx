import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { leadsAPI } from '../services/api'
import { Search, Flame, ThermometerSun, Snowflake, Users, ChevronRight } from 'lucide-react'

const qualificationStyles = {
  hot: 'bg-gradient-to-r from-rose-100 to-orange-100 text-rose-700 border-rose-200',
  warm: 'bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-700 border-amber-200',
  cold: 'bg-gradient-to-r from-sky-100 to-slate-100 text-sky-700 border-sky-200',
}

const statusStyles = {
  new: 'bg-blue-50 text-blue-700 border-blue-200',
  contacted: 'bg-violet-50 text-violet-700 border-violet-200',
  qualified: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  converted: 'bg-green-50 text-green-700 border-green-200',
  lost: 'bg-gray-50 text-gray-600 border-gray-200',
}

const Leads = () => {
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(true)
  const [qualificationFilter, setQualificationFilter] = useState('')
  const [search, setSearch] = useState('')
  
  useEffect(() => {
    loadLeads()
  }, [])
  
  const loadLeads = async () => {
    try {
      setLoading(true)
      const response = await leadsAPI.getAll()
      setLeads(response.data.results || response.data)
    } catch (error) {
      console.error('Error loading leads:', error)
    } finally {
      setLoading(false)
    }
  }
  
  const filteredLeads = leads.filter((lead) => {
    const matchesQualification = qualificationFilter
      ? (lead.qualification_level || '').toLowerCase() === qualificationFilter
      : true
    const query = search.trim().toLowerCase()
    const matchesSearch = query
      ? `${lead.full_name || ''} ${lead.phone_number || ''} ${lead.wedding_location || ''}`.toLowerCase().includes(query)
      : true
    return matchesQualification && matchesSearch
  })

  const counts = {
    all: leads.length,
    hot: leads.filter((l) => (l.qualification_level || '').toLowerCase() === 'hot').length,
    warm: leads.filter((l) => (l.qualification_level || '').toLowerCase() === 'warm').length,
    cold: leads.filter((l) => (l.qualification_level || '').toLowerCase() === 'cold').length,
  }

  const statChips = [
    { key: '', label: 'All Leads', value: counts.all, icon: Users, style: 'from-amber-400 to-yellow-500' },
    { key: 'hot', label: 'Hot', value: counts.hot, icon: Flame, style: 'from-rose-500 to-orange-500' },
    { key: 'warm', label: 'Warm', value: counts.warm, icon: ThermometerSun, style: 'from-orange-400 to-amber-500' },
    { key: 'cold', label: 'Cold', value: counts.cold, icon: Snowflake, style: 'from-sky-400 to-slate-500' },
  ]
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Lead Management</h2>
          <p className="text-sm text-gray-500 mt-1">Track, qualify and manage all captured wedding leads</p>
        </div>
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, phone, location..."
            className="w-full pl-9 pr-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statChips.map((chip) => {
          const Icon = chip.icon
          const active = qualificationFilter === chip.key
          return (
            <button
              key={chip.key}
              onClick={() => setQualificationFilter(chip.key)}
              className={`group flex items-center gap-3 p-4 rounded-2xl border bg-white text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-gold ${
                active ? 'border-amber-400 ring-2 ring-amber-200 shadow-sm' : 'border-gray-100'
              }`}
            >
              <div className={`p-2.5 rounded-xl bg-gradient-to-br ${chip.style} shadow-sm group-hover:scale-105 transition-transform`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 leading-none">{chip.value}</p>
                <p className="text-xs text-gray-500 mt-1">{chip.label}</p>
              </div>
            </button>
          )
        })}
      </div>
      
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50/80">
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Phone</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Location</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Score</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Qualification</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Created</th>
                <th className="px-6 py-3.5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan="8" className="text-center py-12 text-gray-400">Loading leads...</td></tr>
              ) : filteredLeads.length === 0 ? (
                <tr><td colSpan="8" className="text-center py-12 text-gray-400">No leads found</td></tr>
              ) : (
                filteredLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-amber-50/40 transition-colors group">
                    <td className="px-6 py-4 text-sm text-gray-900 font-semibold">{lead.full_name || 'Anonymous'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{lead.phone_number || '—'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{lead.wedding_location || '—'}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-gray-900 w-6">{lead.lead_score}</span>
                        <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500"
                            style={{ width: `${Math.min(lead.lead_score || 0, 100)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-full border capitalize ${qualificationStyles[(lead.qualification_level || '').toLowerCase()] || qualificationStyles.cold}`}>
                        {lead.qualification_level || 'cold'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-full border capitalize ${statusStyles[(lead.lead_status || '').toLowerCase()] || statusStyles.new}`}>
                        {(lead.lead_status || 'new').replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{new Date(lead.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        to={`/leads/${lead.id}`}
                        className="inline-flex items-center gap-1 text-sm font-semibold text-amber-700 hover:text-amber-900 transition-colors"
                      >
                        Manage <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                      </Link>
                    </td>
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

export default Leads
