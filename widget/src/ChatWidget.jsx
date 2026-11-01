import React, { useState, useEffect, useRef } from 'react'
import { MessageCircle, X, Send, Minimize2 } from 'lucide-react'
import axios from 'axios'

const ChatWidget = ({ apiUrl, position = 'bottom-right' }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [sessionId, setSessionId] = useState(null)
  const [visitorToken, setVisitorToken] = useState(null)
  const messagesEndRef = useRef(null)
  
  const positionClasses = {
    'bottom-right': 'bottom-4 right-4 sm:bottom-6 sm:right-6',
    'bottom-left': 'bottom-4 left-4 sm:bottom-6 sm:left-6',
  }

  const safeBottom = { marginBottom: 'env(safe-area-inset-bottom)' }
  
  useEffect(() => {
    if (isOpen && !sessionId) {
      createSession()
    }
  }, [isOpen])
  
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (!isOpen || isMinimized) return
    const isMobile = window.matchMedia('(max-width: 639px)').matches
    if (!isMobile) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [isOpen, isMinimized])
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }
  
  const createSession = async () => {
    try {
      const response = await axios.post(`${apiUrl}/chat/sessions/`, {
        source_url: window.location.href,
        referrer_url: document.referrer
      })
      setSessionId(response.data.session_id)
      setVisitorToken(response.data.visitor_token)
      setMessages([{
        role: 'assistant',
        content: 'Hello! I\'m your wedding planning assistant from Indian Wedding Planners. How can I help you plan your dream wedding today?'
      }])
    } catch (error) {
      console.error('Error creating session:', error)
    }
  }
  
  const sendMessage = async () => {
    if (!input.trim() || !sessionId) return
    
    const userMsg = { role: 'user', content: input }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)
    
    try {
      const response = await axios.post(`${apiUrl}/chat/sessions/${sessionId}/messages/`, {
        message: input
      })
      setMessages(prev => [...prev, response.data.message])
    } catch (error) {
      console.error('Error sending message:', error)
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, something went wrong. Please try again.'
      }])
    } finally {
      setLoading(false)
    }
  }
  
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }
  
  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        aria-label="Open chat"
        style={safeBottom}
        className={`fixed ${positionClasses[position] || positionClasses['bottom-right']} bg-yellow-400 text-gray-900 rounded-full p-3.5 sm:p-4 shadow-lg hover:bg-yellow-500 active:scale-95 transition-all z-[999999]`}
      >
        <MessageCircle className="w-6 h-6" />
      </button>
    )
  }

  const horizontalPosition = position === 'bottom-left'
    ? 'sm:left-6 sm:right-auto'
    : 'sm:right-6 sm:left-auto'

  const sizeClasses = isMinimized
    ? 'h-14 sm:h-12'
    : 'h-[100dvh] sm:h-[600px] sm:max-h-[calc(100dvh-3rem)]'
  
  return (
    <div
      className={`fixed z-[999999] flex flex-col bg-gray-50 shadow-2xl border border-gray-200 overflow-hidden left-0 right-0 bottom-0 w-full rounded-none sm:w-[380px] sm:bottom-6 sm:rounded-2xl ${horizontalPosition} ${sizeClasses}`}
    >
      <div
        className="bg-yellow-400 text-gray-900 px-3 sm:px-4 py-3 flex items-center justify-between flex-shrink-0"
        style={{ paddingTop: 'max(0.75rem, env(safe-area-inset-top))' }}
      >
        <div className="flex items-center min-w-0">
          <MessageCircle className="w-5 h-5 mr-2 flex-shrink-0" />
          <span className="font-semibold text-sm sm:text-base truncate">IWP Wedding Assistant</span>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            type="button"
            onClick={() => setIsMinimized(!isMinimized)}
            aria-label={isMinimized ? 'Expand chat' : 'Minimize chat'}
            className="p-3 -my-1 rounded-full hover:bg-yellow-500/50 transition-colors"
          >
            <Minimize2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            aria-label="Close chat"
            className="p-3 -my-1 rounded-full hover:bg-yellow-500/50 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      {!isMinimized && (
        <>
          <div
            className="flex-1 overflow-y-auto overscroll-contain p-3 sm:p-4 space-y-3"
            aria-live="polite"
          >
            {messages.map((msg, idx) => {
              const content = msg.content || '';
              const urlRegex = /(https?:\/\/[^\s]+)/g;
              const parts = content.split(urlRegex);
              return (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] sm:max-w-[80%] p-2.5 rounded-xl text-sm ${
                  msg.role === 'user' ? 'bg-yellow-400 text-gray-900' : 'bg-white border border-gray-200 text-gray-900 shadow-sm'
                }`}>
                    {parts.map((part, i) => {
                      if (urlRegex.test(part)) {
                        return (
                          <a key={i} href={part} target="_blank" rel="noopener noreferrer" className={`${msg.role === 'user' ? 'text-forest-900 underline' : 'text-sage-700 underline'} break-all`}>
                            {part}
                          </a>
                        );
                      }
                      urlRegex.lastIndex = 0;
                      return <span key={i}>{part}</span>;
                    })}
                  </div>
                </div>
              );
            })}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 p-2.5 rounded-xl text-sm text-gray-900 shadow-sm">Typing...</div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          
          <div
            className="border-t bg-white p-3 flex gap-2 items-center flex-shrink-0"
            style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Type your message..."
              aria-label="Message"
              className="flex-1 min-w-0 px-3 py-2.5 border border-gray-300 rounded-xl text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
            />
            <button
              type="button"
              onClick={sendMessage}
              disabled={loading}
              aria-label="Send message"
              className="bg-yellow-400 text-gray-900 p-3 rounded-xl hover:bg-yellow-500 disabled:opacity-50 flex-shrink-0 transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </>
      )}
    </div>
  )
}

export default ChatWidget
