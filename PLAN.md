# AI Lead Generation Chatbot for Indian Wedding Planners - Implementation Plan

## Project Overview
Building a complete, production-ready AI chatbot for https://www.indianweddingplanners.in/ with React + Vite frontend, Django REST backend, PostgreSQL, and free/local AI models.

## Key Requirements Summary
- Embeddable chatbot widget matching website design
- Lead collection (name, phone, location, date, budget, etc.)
- Lead scoring (0-100, Hot/Warm/Cold) - configurable
- Conversation summaries with AI + fallback
- Persistent chat sessions in DB
- Custom admin dashboard with chat logs, leads, settings
- Free AI models (Ollama/local or free HF) with provider interface
- FAQ/knowledge retrieval
- Security, auth, rate limiting, consent
- Tests, docs, docker-compose

## Website Analysis
- Business: Luxury destination wedding planners in Jaipur/Mumbai
- Services: wedding planning, destination weddings, venue selection, decoration, catering, photography, entertainment
- Destinations: Rajasthan (Jaipur, Udaipur, Jodhpur), Goa, Kerala, Himachal, Uttarakhand, international (Thailand, UAE, Turkey etc.)
- Colors: Logo has maroon/burgundy/gold tones, elegant design
- Focus: NRI/international couples, luxury/palace weddings
- Has "Plan My Wedding" form, WhatsApp contact

## Phase 1: Repository Setup & Architecture
- [ ] Create monorepo structure
- [ ] Set up backend (Django + DRF + PostgreSQL)
- [ ] Set up frontend (React + Vite + Tailwind)
- [ ] Set up widget (separate build)
- [ ] Create docs, docker-compose
- [ ] Design DB models
- [ ] Create architecture doc

## Phase 2: Backend Core Models & Setup
- [ ] Django project structure with apps: chat, leads, knowledge, chatbot_settings, audit
- [ ] Models: ChatSession, ChatMessage, Lead, ConversationSummary, AdminNote, KnowledgeEntry, ChatbotConfiguration, LeadScoreEvent, AuditLog
- [ ] Migrations
- [ ] Admin setup
- [ ] Environment config

## Phase 3: Chat Session, Messages, Lead Logic
- [ ] Session creation with secure tokens
- [ ] Message persistence
- [ ] Lead auto-creation/updates from conversation
- [ ] Lead scoring engine (configurable weights/thresholds)
- [ ] Phone validation (Indian + international)
- [ ] Consent tracking

## Phase 4: AI Provider Interface & Integration
- [ ] Abstract AI provider interface
- [ ] Ollama provider
- [ ] HuggingFace/free provider (optional)
- [ ] Fallback when unavailable
- [ ] FAQ retrieval (simple text search)
- [ ] System prompt building with context
- [ ] Summary generation

## Phase 5: Public & Admin APIs
- [ ] Public chat APIs (sessions, messages, history, consent)
- [ ] Admin auth (session-based with CSRF)
- [ ] Admin dashboard APIs
- [ ] Chat logs APIs
- [ ] Leads management APIs
- [ ] Settings & knowledge APIs
- [ ] Rate limiting
- [ ] Permissions

## Phase 6: Admin Dashboard (React)
- [ ] Auth pages
- [ ] Layout with sidebar
- [ ] Dashboard overview with stats
- [ ] Chat logs list + detail view
- [ ] Leads list + detail/edit
- [ ] Settings page
- [ ] Knowledge base management
- [ ] Charts, filters, pagination

## Phase 7: Embeddable Widget
- [ ] Widget React app
- [ ] Floating button + chat window
- [ ] Message flow with backend
- [ ] Lead collection UI
- [ ] Mobile responsive
- [ ] Build as embeddable script
- [ ] Styling isolation

## Phase 8: Tests, Security, Docs, Deployment
- [ ] Unit/integration tests
- [ ] Security checks
- [ ] docker-compose for local dev
- [ ] Complete documentation
- [ ] Test end-to-end flow

## Design Decisions
- Use Django sessions for admin auth (secure HttpOnly cookies)
- Public chat uses session tokens (hashed in DB)
- Lead scoring is deterministic code
- AI provider pluggable via interface
- Widget built separately, can be loaded via script tag
- All configs in DB with env fallbacks
