import React, { useEffect, useState } from 'react'
import { knowledgeAPI } from '../services/api'
import { Plus, Edit, Trash2, BookOpen, X } from 'lucide-react'

const Knowledge = () => {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({ title: '', content: '', category: 'general', is_active: true })
  
  useEffect(() => {
    loadEntries()
  }, [])
  
  const loadEntries = async () => {
    try {
      const response = await knowledgeAPI.getAll()
      setEntries(response.data.results || response.data)
    } catch (error) {
      console.error('Error loading knowledge:', error)
    } finally {
      setLoading(false)
    }
  }
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await knowledgeAPI.create(formData)
      setShowForm(false)
      setFormData({ title: '', content: '', category: 'general', is_active: true })
      loadEntries()
    } catch (error) {
      console.error('Error creating entry:', error)
    }
  }

  const StatusBadge = ({ active }) => (
    <span className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-full ${
      active ? 'bg-sage-50 text-sage-700 border border-sage-200' : 'bg-cream-100 text-forest-500 border border-forest-200'
    }`}>
      {active ? 'Active' : 'Inactive'}
    </span>
  )

  const EntryActions = () => (
    <div className="flex items-center gap-1">
      <button aria-label="Edit entry" className="p-2 rounded-lg text-sage-600 hover:bg-sage-50 transition-colors"><Edit className="w-4 h-4" /></button>
      <button aria-label="Delete entry" className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors"><Trash2 className="w-4 h-4" /></button>
    </div>
  )
  
  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Knowledge Base</h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">Train your chatbot with verified business information</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-gold text-forest-900 rounded-xl hover:shadow-gold font-semibold transition-all w-full sm:w-auto"
        >
          <Plus className="w-4 h-4" /> Add Entry
        </button>
      </div>
      
      {showForm && (
        <div className="bg-white rounded-2xl shadow-sm border border-amber-100 p-4 sm:p-6">
          <div className="flex items-center justify-between mb-5 gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <BookOpen className="w-5 h-5 text-amber-600 flex-shrink-0" />
              <h3 className="text-base sm:text-lg font-bold text-gray-900 truncate">Add Knowledge Entry</h3>
            </div>
            <button onClick={() => setShowForm(false)} aria-label="Close form" className="p-2 -mr-1 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 flex-shrink-0">
              <X className="w-5 h-5" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                >
                  <option value="general">General</option>
                  <option value="service">Service</option>
                  <option value="faq">FAQ</option>
                  <option value="destination">Destination</option>
                  <option value="policy">Policy</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Content</label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({...formData, content: e.target.value})}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm h-32 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                required
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button type="submit" className="px-5 py-2.5 bg-gradient-gold text-forest-900 rounded-xl hover:shadow-gold font-semibold text-sm transition-all w-full sm:w-auto">Save Entry</button>
              <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 font-semibold text-sm transition-all w-full sm:w-auto">Cancel</button>
            </div>
          </form>
        </div>
      )}
      
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="md:hidden divide-y divide-gray-100">
          {loading ? (
            <p className="px-4 py-12 text-center text-sm text-gray-400">Loading entries...</p>
          ) : entries.length === 0 ? (
            <p className="px-4 py-12 text-center text-sm text-gray-400">No entries found</p>
          ) : (
            entries.map((entry) => (
              <div key={entry.id} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 break-words">{entry.title}</p>
                    <span className="inline-flex mt-1.5 px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-50 text-amber-700 border border-amber-200 capitalize">{entry.category}</span>
                  </div>
                  <StatusBadge active={entry.is_active} />
                </div>
                <div className="mt-3 flex items-center justify-between gap-3">
                  <span className="text-xs text-gray-400">{new Date(entry.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  <EntryActions />
                </div>
              </div>
            ))
          )}
        </div>

        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50/80">
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Title</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Created</th>
                <th className="px-6 py-3.5 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan="5" className="text-center py-12 text-gray-400">Loading entries...</td></tr>
              ) : entries.length === 0 ? (
                <tr><td colSpan="5" className="text-center py-12 text-gray-400">No entries found</td></tr>
              ) : (
                entries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-amber-50/40 transition-colors">
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">{entry.title}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-50 text-amber-700 border border-amber-200 capitalize">{entry.category}</span>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge active={entry.is_active} />
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{new Date(entry.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <EntryActions />
                      </div>
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

export default Knowledge
