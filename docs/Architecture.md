# Architecture

## System Overview

The IWP Chatbot follows a modern three-tier architecture with clear separation of concerns between the frontend, backend, and AI services.

## High-Level Architecture Diagram

```mermaid
graph TB
    subgraph "Client Layer"
        W[Embeddable Widget]
        AD[Admin Dashboard]
    end
    
    subgraph "API Layer"
        API[Django REST API]
        AUTH[Authentication]
    end
    
    subgraph "Business Logic"
        CHAT[Chat Service]
        LEAD[Lead Management]
        AI[AI Service]
        JOURNEY[Journey Engine]
    end
    
    subgraph "Data Layer"
        DB[(PostgreSQL/SQLite)]
        KB[Knowledge Base]
    end
    
    subgraph "AI Providers"
        GEM[Google Gemini]
        OLL[Ollama Local]
        FB[Fallback Provider]
    end
    
    W --> API
    AD --> API
    API --> AUTH
    API --> CHAT
    CHAT --> AI
    CHAT --> JOURNEY
    CHAT --> LEAD
    AI --> GEM
    AI --> OLL
    AI --> FB
    LEAD --> DB
    CHAT --> DB
    KB --> DB
```

## Component Architecture

### 1. Frontend Layer

#### Admin Dashboard (React + Vite)
- **Purpose**: Management interface for chats, leads, knowledge base, and settings
- **Port**: 5173 (dev) / served via Nginx (prod)
- **Features**: Real-time chat monitoring, lead tracking, analytics
- **State Management**: React hooks and context
- **Routing**: React Router DOM
- **Styling**: Tailwind CSS

#### Embeddable Widget (React + Vite)
- **Purpose**: Customer-facing chat interface
- **Build**: IIFE bundle for script tag embedding
- **Features**: Session management, message handling, responsive design
- **Integration**: Can be embedded on any website

### 2. Backend Layer (Django REST Framework)

#### Core Apps

```mermaid
graph LR
    subgraph "Django Apps"
        CHAT[apps/chat]
        LEADS[apps/leads]
        KB[apps/knowledge]
        SETTINGS[apps/chatbot_settings]
        AUDIT[apps/audit]
    end
    
    CHAT --> LEADS
    CHAT --> KB
    LEADS --> CHAT
```

- **chat**: Session management, messaging, AI integration, conversation flow
- **leads**: Lead capture, scoring, qualification, management
- **knowledge**: FAQ and business information repository
- **chatbot_settings**: Configuration and scoring rules
- **audit**: Activity logging and audit trails

### 3. Data Flow Architecture

```mermaid
sequenceDiagram
    participant User
    participant Widget
    participant API
    participant Journey
    participant AI
    participant DB
    
    User->>Widget: Opens chat
    Widget->>API: POST /chat/sessions/
    API->>DB: Create session & lead
    API-->>Widget: Return session_id
    
    User->>Widget: Sends message
    Widget->>API: POST /chat/sessions/{id}/messages/
    API->>DB: Save user message
    API->>Journey: Process answer & get next question
    alt Journey not complete
        Journey-->>API: Return question
        API->>DB: Save assistant message
        API-->>Widget: Return question
    else Journey complete
        API->>AI: Generate response with context
        AI-->>API: Return AI response
        API->>DB: Save assistant message
        API-->>Widget: Return response
    end
```

## Design Patterns

### 1. Provider Pattern (AI Services)
The AI service uses a provider pattern for flexibility and fallback:
- `AIProvider` (abstract base class)
- `GeminiProvider`, `OllamaProvider`, `FallbackProvider`
- `AIService` orchestrates provider selection

### 2. State Machine Pattern (Conversation Flow)
The conversation follows a state-driven approach:
- Journey states track lead collection progress
- Automatic progression through questions
- State persistence in database

### 3. Repository Pattern
Data access is abstracted through Django ORM models with clear relationships.

### 4. Strategy Pattern (Scoring)
Lead scoring uses a configurable `LeadScoringEngine` with weights and thresholds sourced from `ScoringConfig` in the database (falling back to sensible defaults). The engine normalizes weights so their maximum possible total is 100, computes per-factor awarded points, and persists them as `LeadScoreEvent` records. This keeps the score and the Score Breakdown UI perfectly in sync on every recalculation.

## Scalability Considerations

- **Stateless API**: RESTful design allows horizontal scaling
- **Database**: Can use PostgreSQL for production, SQLite for development
- **Caching**: Can be added with Redis for sessions and responses
- **Async Processing**: Celery can be integrated for background tasks (summaries, emails)
- **CDN**: Widget assets can be served via CDN

## Security Architecture

```mermaid
graph TD
    REQ[Request] --> CORS[CORS Middleware]
    CORS --> CSRF[CSRF Protection]
    CSRF --> AUTH[Authentication]
    AUTH --> RATE[Rate Limiting]
    RATE --> VIEW[View Logic]
    VIEW --> RESP[Response]
```

## Performance Considerations

- **Message History**: Limited to last 15 messages for AI context
- **Knowledge Base**: Limited queries to top 3 relevant entries
- **Database Indexes**: Optimized indexes on frequently queried fields
- **Lazy Loading**: Frontend components loaded as needed
- **Bundle Optimization**: Vite for fast builds and code splitting

## Integration Points

1. **Website Integration**: Widget via script tag
2. **Admin Access**: Browser-based dashboard
3. **AI Services**: External APIs (Gemini) or local (Ollama)
4. **Database**: PostgreSQL/SQLite

## Deployment Architecture

```mermaid
graph TB
    subgraph "Production"
        LB[Load Balancer/Nginx]
        WEB[Frontend Static Files]
        API[Gunicorn + Django]
        DB[(PostgreSQL)]
        REDIS[(Redis - Optional)]
    end
    
    LB --> WEB
    LB --> API
    API --> DB
    API --> REDIS
```
