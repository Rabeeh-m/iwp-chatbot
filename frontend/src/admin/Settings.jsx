import React, { useEffect, useState } from 'react'
import { settingsAPI } from '../services/api'
import { MessageSquare, Sliders, Save } from 'lucide-react'

const inputClass = "w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"

const Settings = () => {
  const [settings, setSettings] = useState({})
  const [scoring, setScoring] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  useEffect(() => {
    loadSettings()
  }, [])
  
  const loadSettings = async () => {
    try {
      const response = await settingsAPI.get()
      setSettings(response.data.settings || {})
      setScoring(response.data.scoring || {})
    } catch (error) {
      console.error('Error loading settings:', error)
    } finally {
      setLoading(false)
    }
  }
  
  const saveSettings = async () => {
    setSaving(true)
    try {
      await settingsAPI.update({ settings, scoring })
      alert('Settings saved successfully')
    } catch (error) {
      console.error('Error saving settings:', error)
      alert('Error saving settings')
    } finally {
      setSaving(false)
    }
  }
  
  const scoringTotal =
    5 +
    (scoring.wedding_date_points ?? 15) +
    (scoring.wedding_location_points ?? 10) +
    (scoring.budget_points ?? 20) +
    (scoring.services_points ?? 15) +
    (scoring.guest_count_points ?? 10) +
    (scoring.phone_points ?? 15) +
    (scoring.consultation_request_points ?? 10)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin" />
          <p className="text-sm text-gray-500">Loading settings...</p>
        </div>
      </div>
    )
  }
  
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Chatbot Settings</h2>
        <p className="text-sm text-gray-500 mt-1">Configure your assistant and lead scoring rules</p>
      </div>
      
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-amber-600" />
          <h3 className="text-lg font-bold text-gray-900">General Settings</h3>
        </div>
        <div className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Chatbot Display Name</label>
            <input
              type="text"
              value={settings.chatbot_name || 'IWP Wedding Assistant'}
              onChange={(e) => setSettings({...settings, chatbot_name: e.target.value})}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Welcome Message</label>
            <textarea
              value={settings.welcome_message || 'Hello! How can I help you plan your dream wedding?'}
              onChange={(e) => setSettings({...settings, welcome_message: e.target.value})}
              className={`${inputClass} h-24`}
            />
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
          <Sliders className="w-5 h-5 text-amber-600" />
          <h3 className="text-lg font-bold text-gray-900">Lead Scoring Configuration</h3>
        </div>
        <div className="p-6">
          <div className="mb-5 flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-amber-50 border border-amber-200 text-sm">
            <span className="text-gray-600">Full Name is fixed at <span className="font-semibold">5</span> points. Weights are capped at 100 total.</span>
            <span className={`font-bold whitespace-nowrap ${scoringTotal > 100 ? 'text-rose-600' : 'text-emerald-600'}`}>
              {scoringTotal} / 100
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Wedding Date (points)</label>
              <input type="number" value={scoring.wedding_date_points || 15} onChange={(e) => setScoring({...scoring, wedding_date_points: parseInt(e.target.value)})} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Wedding Location (points)</label>
              <input type="number" value={scoring.wedding_location_points || 10} onChange={(e) => setScoring({...scoring, wedding_location_points: parseInt(e.target.value)})} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Budget (points)</label>
              <input type="number" value={scoring.budget_points || 20} onChange={(e) => setScoring({...scoring, budget_points: parseInt(e.target.value)})} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Services (points)</label>
              <input type="number" value={scoring.services_points || 15} onChange={(e) => setScoring({...scoring, services_points: parseInt(e.target.value)})} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Guest Count (points)</label>
              <input type="number" value={scoring.guest_count_points || 10} onChange={(e) => setScoring({...scoring, guest_count_points: parseInt(e.target.value)})} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Phone Number (points)</label>
              <input type="number" value={scoring.phone_points || 15} onChange={(e) => setScoring({...scoring, phone_points: parseInt(e.target.value)})} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Consultation Request (points)</label>
              <input type="number" value={scoring.consultation_request_points ?? 10} onChange={(e) => setScoring({...scoring, consultation_request_points: parseInt(e.target.value)})} className={inputClass} />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-5 pt-5 border-t border-gray-100">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Hot Lead Threshold</label>
              <input type="number" value={scoring.hot_threshold || 70} onChange={(e) => setScoring({...scoring, hot_threshold: parseInt(e.target.value)})} className={inputClass} />
              <p className="text-xs text-gray-400 mt-1">Score at or above this becomes a Hot lead</p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Warm Lead Threshold</label>
              <input type="number" value={scoring.warm_threshold || 40} onChange={(e) => setScoring({...scoring, warm_threshold: parseInt(e.target.value)})} className={inputClass} />
              <p className="text-xs text-gray-400 mt-1">Score at or above this becomes a Warm lead</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex justify-end">
        <button
          onClick={saveSettings}
          disabled={saving}
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-gold text-white rounded-xl hover:shadow-gold font-semibold transition-all disabled:opacity-60"
        >
          <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </div>
  )
}

export default Settings
