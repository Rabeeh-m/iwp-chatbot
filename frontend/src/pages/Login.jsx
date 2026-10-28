import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { authAPI } from '../services/api'
import { Lock, User, ArrowRight, Sparkles } from 'lucide-react'

const Login = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await authAPI.login(username, password)
      navigate('/')
    } catch (err) {
      setError('Invalid credentials')
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
            <span>Admin Portal</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Welcome Back</h2>
          <p className="text-sm text-gray-500 mt-1">Sign in to Indian Wedding Planners</p>
        </div>
        
        {error && (
          <div className="bg-rose-50 text-rose-700 p-3 rounded-xl mb-4 border border-rose-200 text-sm text-center">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-gray-700 mb-2 text-sm font-semibold">Username</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 pr-3 py-3 border border-gray-200 bg-gray-50/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all"
                placeholder="Enter your username"
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-3 py-3 border border-gray-200 bg-gray-50/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all"
                placeholder="Enter your password"
                required
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-gradient-gold text-white py-3 rounded-xl hover:shadow-gold font-semibold transition-all duration-200 disabled:opacity-60"
          >
            {loading ? 'Signing in...' : 'Sign In'}
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>
        
        <div className="text-center mt-4">
          <Link to="/setup-admin" className="text-xs text-amber-600 hover:text-amber-700">
            Setup Admin Account
          </Link>
        </div>
        
        <p className="text-center text-xs text-gray-400 mt-6">Indian Wedding Planners &copy; {new Date().getFullYear()}</p>
      </div>
    </div>
  )
}

export default Login
