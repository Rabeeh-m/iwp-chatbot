import React from 'react'
import ReactDOM from 'react-dom/client'
import ChatWidget from './ChatWidget'
import styles from './widget.css?inline'

if (typeof document !== 'undefined') {
  const existing = document.querySelector('style[data-iwp-widget]')
  if (!existing) {
    const style = document.createElement('style')
    style.setAttribute('data-iwp-widget', 'true')
    style.textContent = styles
    document.head.appendChild(style)
  }
}

class IWPChatbotWidget {
  constructor(options = {}) {
    this.options = {
      apiUrl: options.apiUrl || import.meta.env.VITE_API_URL || 'https://iwp-chatbot.onrender.com/api/v1',
      position: options.position || 'bottom-right',
      ...options
    }
    this.mountPoint = null
  }
  
  init() {
    if (typeof document === 'undefined') return
    if (this.mountPoint && document.body.contains(this.mountPoint)) return
    this.mountPoint = document.createElement('div')
    this.mountPoint.id = 'iwp-chatbot-widget-root'
    document.body.appendChild(this.mountPoint)
    const root = ReactDOM.createRoot(this.mountPoint)
    root.render(<ChatWidget apiUrl={this.options.apiUrl} position={this.options.position} />)
  }
}

if (typeof window !== 'undefined') {
  window.IWPChatbot = IWPChatbotWidget
}

export default IWPChatbotWidget
