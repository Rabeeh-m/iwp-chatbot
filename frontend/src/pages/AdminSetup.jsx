import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { authAPI } from '../services/api'
import { Lock, User, Mail, ArrowRight, Sparkles } from 'lucide-react'

const AdminSetup = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)
    try {
      await authAPI.createAdmin(formData)
      setSuccess('Admin account created successfully! Redirecting to login...')
      setTimeout(() => {
        navigate('/login')
      }, 2000)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create admin account')
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-yellow-50 to-white relative overflow-hidden">
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-amber-200/40 rounded-full blur-3xl" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-yellow-200/40 rounded-full blur-3xl" />
      
      <div className="relative bg-white/90 backdrop-blur-sm p-10 rounded-3xl shadow-gold-lg w-full max-w-md border border-amber-100">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-gold flex items-center justify-center mx-auto mb-4 shadow-gold">
            <span className="text-white font-bold text-2xl">IWP</span>
          </div>
          <div className="flex items-center justify-center gap-1.5 text-amber-600 text-xs font-semibold uppercase tracking-widest mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Admin Setup</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Create Admin Account</h2>
          <p className="text-sm text-gray-500 mt-1">Temporary setup</p>
        </div>
        
        {error && (
          <div className="bg-rose-50 text-rose-700 p-3 rounded-xl mb-4 border border-rose-200 text-sm text-center">
            {error}
          </div>
        )}
        
        {success && (
          <div className="bg-green-50 text-green-700 p-3 rounded-xl mb-4 border border-green-200 text-sm text-center">
            {success}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 mb-2 text-sm font-semibold">Username</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="w-full pl-10 pr-3 py-3 border border-gray-200 bg-gray-50/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all"
                placeholder="Enter username"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-gray-700 mb-2 text-sm font-semibold">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full pl-10 pr-3 py-3 border border-gray-200 bg-gray-50/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all"
                placeholder="Enter email"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-gray-700 mb-2 text-sm font-semibold">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full pl-10 pr-3 py-3 border border-gray-200 bg-gray-50/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all"
                placeholder="Enter password"
                required
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading || success}
            className="w-full flex items-center justify-center gap-2 bg-gradient-gold text-white py-3 rounded-xl hover:shadow-gold font-semibold transition-all duration-200 disabled:opacity-60"
          >
            {loading ? 'Creating...' : 'Create Admin'}
            {!loading && !success && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>
        
        <div className="text-center mt-4">
          <Link to="/login" className="text-xs text-amber-600 hover:text-amber-700">
            Back to Login
          </Link>
        </div>
        
        <p className="text-center text-xs text-gray-400 mt-6">Indian Wedding Planners &copy; {new Date().getFullYear()}</p>
      </div>
    </div>
  )
}

export default AdminSetup
