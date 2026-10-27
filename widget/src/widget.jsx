import React, { useState, useEffect, useRef } from 'react'
import ReactDOM from 'react-dom/client'

// ─── Inline styles (no Tailwind dependency) ──────────────────────────────────
const S = {
  // Floating button
  fab: {
    position: 'fixed',
    bottom: '24px',
    right: '24px',
    width: '56px',
    height: '56px',
    borderRadius: '50%',
    background: '#F5C518',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
    zIndex: 999999,
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
  fabHover: {
    transform: 'scale(1.08)',
    boxShadow: '0 6px 28px rgba(0,0,0,0.35)',
  },
  // Chat window
  window: (minimized) => ({
    position: 'fixed',
    bottom: '24px',
    right: '24px',
    width: '360px',
    maxWidth: 'calc(100vw - 32px)',
    height: minimized ? '52px' : '500px',
    maxHeight: 'calc(100vh - 48px)',
    background: '#f9f9f9',
    borderRadius: '16px',
    boxShadow: '0 8px 40px rgba(0,0,0,0.22)',
    display: 'flex',
    flexDirection: 'column',
    zIndex: 999999,
    overflow: 'hidden',
    transition: 'height 0.25s ease',
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    fontSize: '14px',
    border: '1px solid #e5e7eb',
  }),
  // Header
  header: {
    background: '#F5C518',
    color: '#1a1a1a',
    padding: '12px 14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexShrink: 0,
    cursor: 'default',
  },
  headerTitle: {
    fontWeight: 700,
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  headerActions: {
    display: 'flex',
    gap: '8px',
  },
  iconBtn: {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: '2px',
    display: 'flex',
    alignItems: 'center',
    color: '#1a1a1a',
    borderRadius: '4px',
    opacity: 0.7,
  },
  // Messages area
  messages: {
    flex: 1,
    overflowY: 'auto',
    padding: '12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  bubbleRow: (isUser) => ({
    display: 'flex',
    justifyContent: isUser ? 'flex-end' : 'flex-start',
  }),
  bubble: (isUser) => ({
    maxWidth: '75%',
    padding: '8px 12px',
    borderRadius: isUser ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
    background: isUser ? '#F5C518' : '#ffffff',
    color: '#1a1a1a',
    boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
    border: isUser ? 'none' : '1px solid #e5e7eb',
    lineHeight: 1.5,
    wordBreak: 'break-word',
    whiteSpace: 'pre-wrap',
  }),
  typingBubble: {
    background: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    padding: '10px 14px',
    display: 'flex',
    gap: '4px',
    alignItems: 'center',
  },
  dot: (delay) => ({
    width: '7px',
    height: '7px',
    borderRadius: '50%',
    background: '#9ca3af',
    animation: 'iwp-bounce 1.2s infinite ease-in-out',
    animationDelay: delay,
  }),
  // Input area
  inputArea: {
    padding: '10px 12px',
    borderTop: '1px solid #e5e7eb',
    display: 'flex',
    gap: '8px',
    background: '#fff',
    flexShrink: 0,
  },
  input: {
    flex: 1,
    padding: '8px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '13px',
    outline: 'none',
    fontFamily: 'inherit',
    background: '#fff',
    color: '#1a1a1a',
    resize: 'none',
  },
  sendBtn: {
    width: '36px',
    height: '36px',
    borderRadius: '8px',
    background: '#F5C518',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    alignSelf: 'flex-end',
  },
}

// Inject keyframes once
const injectKeyframes = () => {
  if (document.getElementById('iwp-keyframes')) return
  const style = document.createElement('style')
  style.id = 'iwp-keyframes'
  style.textContent = `
    @keyframes iwp-bounce {
      0%, 80%, 100% { transform: scale(0.7); opacity: 0.5; }
      40% { transform: scale(1); opacity: 1; }
    }
  `
  document.head.appendChild(style)
}

// ─── SVG icons ────────────────────────────────────────────────────────────────
const IconChat = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
)
const IconX = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
)
const IconMinus = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
)
const IconSend = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
  </svg>
)

// ─── Main Widget Component ────────────────────────────────────────────────────
const ChatWidget = ({ apiUrl }) => {
  const [isOpen, setIsOpen]       = useState(false)
  const [minimized, setMinimized] = useState(false)
  const [messages, setMessages]   = useState([])
  const [input, setInput]         = useState('')
  const [loading, setLoading]     = useState(false)
  const [sessionId, setSessionId] = useState(null)
  const [fabHovered, setFabHovered] = useState(false)
  const messagesEndRef = useRef(null)

  useEffect(() => { injectKeyframes() }, [])

  useEffect(() => {
    if (isOpen && !sessionId) createSession()
  }, [isOpen])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const createSession = async () => {
    try {
      const res = await fetch(`${apiUrl}/chat/sessions/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ source_url: window.location.href, referrer_url: document.referrer }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      setSessionId(data.session_id)
      setMessages([{ role: 'assistant', content: 'Hello! I\'m your wedding planning assistant from Indian Wedding Planners. How can I help you plan your dream wedding today?' }])
    } catch (err) {
      console.error('[IWP Widget] session error:', err)
      setMessages([{ role: 'assistant', content: '⚠️ Could not connect to the server. Please try again later.' }])
    }
  }

  const sendMessage = async () => {
    const text = input.trim()
    if (!text || !sessionId || loading) return
    setMessages(prev => [...prev, { role: 'user', content: text }])
    setInput('')
    setLoading(true)
    try {
      const res = await fetch(`${apiUrl}/chat/sessions/${sessionId}/messages/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ message: text }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      setMessages(prev => [...prev, data.message])
    } catch (err) {
      console.error('[IWP Widget] message error:', err)
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, something went wrong. Please try again.' }])
    } finally {
      setLoading(false)
    }
  }

  const onKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() }
  }

  const renderText = (text) => {
    const parts = text.split(/(https?:\/\/[^\s]+)/g)
    return parts.map((p, i) =>
      /^https?:\/\//.test(p)
        ? <a key={i} href={p} target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb', wordBreak: 'break-all' }}>{p}</a>
        : <span key={i}>{p}</span>
    )
  }

  if (!isOpen) {
    return (
      <button
        style={{ ...S.fab, ...(fabHovered ? S.fabHover : {}) }}
        onClick={() => setIsOpen(true)}
        onMouseEnter={() => setFabHovered(true)}
        onMouseLeave={() => setFabHovered(false)}
        title="Chat with us"
        aria-label="Open chat"
      >
        <IconChat />
      </button>
    )
  }

  return (
    <div style={S.window(minimized)}>
      {/* Header */}
      <div style={S.header}>
        <div style={S.headerTitle}>
          <IconChat />
          IWP Wedding Assistant
        </div>
        <div style={S.headerActions}>
          <button style={S.iconBtn} onClick={() => setMinimized(m => !m)} title={minimized ? 'Expand' : 'Minimize'}>
            <IconMinus />
          </button>
          <button style={S.iconBtn} onClick={() => { setIsOpen(false); setMinimized(false) }} title="Close">
            <IconX />
          </button>
        </div>
      </div>

      {/* Messages */}
      {!minimized && (
        <>
          <div style={S.messages}>
            {messages.map((msg, i) => (
              <div key={i} style={S.bubbleRow(msg.role === 'user')}>
                <div style={S.bubble(msg.role === 'user')}>
                  {renderText(msg.content || '')}
                </div>
              </div>
            ))}
            {loading && (
              <div style={S.bubbleRow(false)}>
                <div style={S.typingBubble}>
                  <div style={S.dot('0s')} />
                  <div style={S.dot('0.2s')} />
                  <div style={S.dot('0.4s')} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div style={S.inputArea}>
            <textarea
              style={S.input}
              rows={1}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={onKey}
              placeholder="Type your message…"
            />
            <button style={S.sendBtn} onClick={sendMessage} disabled={loading} title="Send">
              <IconSend />
            </button>
          </div>
        </>
      )}
    </div>
  )
}

// ─── Widget class (public API) ────────────────────────────────────────────────
class IWPChatbotWidget {
  constructor(options = {}) {
    this.options = {
      apiUrl: options.apiUrl || 'https://iwp-chatbot.onrender.com/api/v1',
      ...options,
    }
  }

  init() {
    const mount = document.createElement('div')
    mount.id = 'iwp-chatbot-widget-root'
    document.body.appendChild(mount)
    ReactDOM.createRoot(mount).render(
      <ChatWidget apiUrl={this.options.apiUrl} />
    )
  }
}

if (typeof window !== 'undefined') {
  window.IWPChatbot = IWPChatbotWidget
}

export default IWPChatbotWidget
