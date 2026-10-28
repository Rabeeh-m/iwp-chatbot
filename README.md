# AI Lead Generation Chatbot for Indian Wedding Planners

A complete, production-ready AI chatbot for Indian Wedding Planners (https://www.indianweddingplanners.in/) with lead generation, scoring, and admin dashboard.

## Features

- **Embeddable Chatbot Widget** - React-based widget that can be added to any website
- **AI-Powered Conversations** - Uses Ollama (local) or fallback responses, with pluggable provider architecture
- **Lead Collection** - Conversationally collects visitor details (name, phone, location, date, budget, etc.)
- **Lead Scoring** - Automatic scoring (0-100) with Hot/Warm/Cold qualification
- **Conversation Summaries** - AI-generated summaries with fallback
- **Persistent Chat Sessions** - All conversations stored in PostgreSQL
- **Admin Dashboard** - Manage chats, leads, knowledge base, and settings
- **FAQ Knowledge Base** - Ground responses in verified business information
- **Security** - Authentication, CSRF protection, rate limiting, session security

## Tech Stack

- **Frontend (Admin):** React + Vite + Tailwind CSS
- **Widget:** React + Vite (built as embeddable script)
- **Backend:** Django + Django REST Framework
- **Database:** PostgreSQL (or SQLite for dev)
- **AI:** Ollama (local open-source models) with fallback

## Quick Start (Local Development)

### Prerequisites

- Python 3.11+
- Node.js 18+
- PostgreSQL (or use SQLite)
- Ollama (optional, for AI responses)

### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

### Frontend (Admin Dashboard) Setup

```bash
cd frontend
npm install
npm run dev
```

### Widget Setup

```bash
cd widget
npm install
npm run dev
```

### Using Docker Compose

```bash
docker-compose up -d
cd backend && python manage.py migrate
cd backend && python manage.py createsuperuser
```

## Admin Dashboard

Access at http://localhost:5173

- Chat Logs: View all conversations with transcripts
- Leads: Manage leads, update status, add notes
- Knowledge Base: Manage FAQs and business information
- Settings: Configure chatbot and lead scoring

## Embedding the Widget

Add to your website:

```html
<script src="path/to/iwp-chatbot.iife.js"></script>
<script>
  const widget = new IWPChatbot({ apiUrl: 'https://your-api.com/api/v1' });
  widget.init();
</script>
```

## AI Setup with Ollama

```bash
# Install Ollama from https://ollama.ai
ollama pull llama3.2
# Ollama will run on http://localhost:11434
```

If Ollama is not available, the system uses intelligent fallback responses.

## Project Structure

```
iwp-chatbot/
├── backend/          # Django backend
├── frontend/         # React admin dashboard
├── widget/           # Embeddable chatbot widget
├── docs/             # Documentation
├── docker-compose.yml
└── README.md
```

## License

MIT
