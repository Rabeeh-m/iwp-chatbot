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
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
  }
  
  useEffect(() => {
    if (isOpen && !sessionId) {
      createSession()
    }
  }, [isOpen])
  
  useEffect(() => {
    scrollToBottom()
  }, [messages])
  
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
        className={`fixed ${positionClasses[position]} bg-yellow-400 text-gray-900 rounded-full p-4 shadow-lg hover:bg-yellow-500 transition-all z-[999999]`}
      >
        <MessageCircle className="w-6 h-6" />
      </button>
    )
  }
  
  return (
    <div className={`fixed ${positionClasses[position]} w-80 sm:w-96 bg-gray-50 rounded-lg shadow-xl flex flex-col z-[999999] border border-gray-200 overflow-hidden ${isMinimized ? 'h-12' : 'h-[500px]'}`}>
      <div className="bg-yellow-400 text-gray-900 p-3 flex items-center justify-between">
        <div className="flex items-center">
          <MessageCircle className="w-5 h-5 mr-2" />
          <span className="font-semibold">IWP Wedding Assistant</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setIsMinimized(!isMinimized)}>
            <Minimize2 className="w-4 h-4" />
          </button>
          <button onClick={() => setIsOpen(false)}>
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      {!isMinimized && (
        <>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg, idx) => {
              const content = msg.content || '';
              const urlRegex = /(https?:\/\/[^\s]+)/g;
              const parts = content.split(urlRegex);
              return (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[75%] p-2 rounded-lg text-sm ${
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
                <div className="bg-white border border-gray-200 p-2 rounded-lg text-sm text-gray-900 shadow-sm">Typing...</div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          
          <div className="p-3 border-t flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
            />
            <button onClick={sendMessage} disabled={loading}               className="bg-yellow-400 text-gray-900 p-2 rounded-lg hover:bg-yellow-500 disabled:opacity-50">
              <Send className="w-4 h-4" />
            </button>
          </div>
        </>
      )}
    </div>
  )
}

export default ChatWidget
