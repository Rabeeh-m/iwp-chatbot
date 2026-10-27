import React from 'react'
import ReactDOM from 'react-dom/client'
import ChatWidget from './ChatWidget'
import './widget.css'

class IWPChatbotWidget {
  constructor(options = {}) {
    this.options = {
      apiUrl: options.apiUrl || 'http://localhost:8000/api/v1',
      position: options.position || 'bottom-right',
      ...options
    }
    this.mountPoint = null
  }
  
  init() {
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
