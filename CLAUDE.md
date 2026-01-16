# Instagram Conversations App

## Project Overview
Full-stack application to fetch and display Instagram Business conversations using the Facebook Graph API.

## Current Status
- [x] Initial planning
- [x] Backend API implementation
- [x] Frontend implementation
- [ ] Real-time updates (WebSocket)
- [ ] AI Agent integration

## Tech Stack

### Backend (`/backend`)
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **API**: Facebook Graph API (Instagram Messaging)
- **HTTP Client**: axios
- **Port**: 3001

### Frontend (`/frontend`)
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI
- **Date Formatting**: date-fns
- **Port**: 3000

## Project Structure
```
instagramBot/
├── backend/
│   ├── src/
│   │   ├── index.ts              # Express server entry
│   │   ├── config/index.ts       # Environment config
│   │   ├── types/instagram.ts    # TypeScript interfaces
│   │   ├── services/instagram.ts # Graph API wrapper
│   │   └── routes/conversations.ts
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx          # Main page
│   │   │   ├── layout.tsx
│   │   │   └── globals.css
│   │   ├── components/
│   │   │   ├── ConversationList.tsx
│   │   │   └── MessageView.tsx
│   │   ├── hooks/
│   │   │   └── useConversations.ts
│   │   ├── lib/
│   │   │   ├── api.ts
│   │   │   └── utils.ts
│   │   └── types/instagram.ts
│   ├── package.json
│   └── .env.local
├── .env                          # Shared env (INSTAGRAM_TOKEN)
├── knowledgeBase/
│   └── researchSummary.md
└── CLAUDE.md
```

## Environment Variables
- `INSTAGRAM_TOKEN` - Instagram Graph API access token (in root `.env`)

## API Endpoints (Backend - port 3001)
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/me` | GET | Get account info |
| `/api/conversations` | GET | List all conversations |
| `/api/conversations/:id/messages` | GET | Get messages for a conversation |

## Running the App

### Backend
```bash
cd backend
npm install
npm run dev    # Starts on http://localhost:3001
```

### Frontend
```bash
cd frontend
npm install
npm run dev    # Starts on http://localhost:3000
```

## Key Policies (from Research)
- **24-Hour Messaging Window**: Can only respond within 24 hours of user's last message
- **Human Agent Tag**: Only for human responses, not AI
- **Rate Limits**: 200 × number of conversations per hour

## Instagram Graph API Endpoints Used
- `GET /me` - Get account info
- `GET /{ig-user-id}/conversations` - List conversations
- `GET /{conversation-id}?fields=messages` - Get messages in conversation
- `GET /{message-id}?fields=id,created_time,from,to,message` - Get message details

## Next Steps
1. Add WebSocket for real-time message updates
2. Implement message sending functionality
3. Add AI agent for automated responses
4. Implement cursor-based pagination for infinite scroll
