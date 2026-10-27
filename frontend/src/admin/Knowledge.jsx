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
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Knowledge Base</h2>
          <p className="text-sm text-gray-500 mt-1">Train your chatbot with verified business information</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-gold text-white rounded-xl hover:shadow-gold font-semibold transition-all"
        >
          <Plus className="w-4 h-4" /> Add Entry
        </button>
      </div>
      
      {showForm && (
        <div className="bg-white rounded-2xl shadow-sm border border-amber-100 p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-amber-600" />
              <h3 className="text-lg font-bold text-gray-900">Add Knowledge Entry</h3>
            </div>
            <button onClick={() => setShowForm(false)} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600">
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
            <div className="flex gap-3">
              <button type="submit" className="px-5 py-2.5 bg-gradient-gold text-white rounded-xl hover:shadow-gold font-semibold text-sm transition-all">Save Entry</button>
              <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 font-semibold text-sm transition-all">Cancel</button>
            </div>
          </form>
        </div>
      )}
      
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
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
                      <span className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-full ${
                        entry.is_active ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-gray-100 text-gray-600 border border-gray-200'
                      }`}>
                        {entry.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{new Date(entry.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"><Edit className="w-4 h-4" /></button>
                        <button className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors"><Trash2 className="w-4 h-4" /></button>
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
