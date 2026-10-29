import IWPChatbot from './widget.jsx'

const isLocal =
  typeof window !== 'undefined' &&
  ['localhost', '127.0.0.1', ''].includes(window.location.hostname)

const apiUrl =
  import.meta.env.VITE_WIDGET_API_URL ||
  (isLocal
    ? 'http://localhost:8000/api/v1'
    : 'https://iwp-chatbot-backend.onrender.com/api/v1')

const widget = new IWPChatbot({
  apiUrl,
  position: 'bottom-right',
})

widget.init()
