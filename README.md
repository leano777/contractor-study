# Contractor License Study System

A full-stack study platform for California contractor license exam preparation, featuring daily challenges, RAG-powered AI chat, gamification, and progress tracking.

## 🎯 Features

### Student Features
- **Daily Challenges**: 5 questions per day with streak tracking
- **AI Chat Assistant**: RAG-powered Q&A using your course materials
- **Study Browser**: Browse questions by topic, difficulty, bookmark favorites
- **Progress Tracking**: Detailed stats, accuracy by topic, activity calendar
- **Leaderboard**: Compete with classmates on streaks and accuracy
- **Achievements**: Unlock badges for milestones
- **Streak Freeze**: Protect your streak when you miss a day

### Admin Features
- **Student Management**: View registrations, stats, send notifications
- **Content Pipeline**: Upload handouts → Extract text → Generate embeddings → Create questions
- **Question Review**: Approve/reject AI-generated questions, edit inline
- **QR Code Generator**: Create registration links with UTM tracking

## 🛠 Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, Tailwind CSS
- **Backend**: Next.js API Routes, Supabase (PostgreSQL + Auth + Storage)
- **AI**: Claude API (question generation, RAG chat), Voyage AI (embeddings)
- **Notifications**: Resend (email), Twilio (SMS)
- **Deployment**: Vercel (includes cron jobs)

## 📁 Project Structure

```
contractor-study/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── page.tsx              # Landing page
│   │   ├── login/                # Magic link auth
│   │   ├── register/             # Student registration
│   │   ├── dashboard/            # Student home
│   │   ├── challenge/            # Daily challenge quiz
│   │   ├── study/                # Question browser
│   │   ├── chat/                 # AI chat interface
│   │   ├── leaderboard/          # Rankings
│   │   ├── progress/             # Stats & analytics
│   │   ├── achievements/         # Badges
│   │   ├── settings/             # User preferences
│   │   ├── admin/                # Admin panel
│   │   │   ├── page.tsx          # Admin overview
│   │   │   ├── students/         # Student management
│   │   │   ├── handouts/         # Content management
│   │   │   ├── questions/        # Question review
│   │   │   └── qr/               # QR generator
│   │   ├── api/                  # API routes
│   │   └── auth/callback/        # Magic link redirect
│   ├── components/
│   │   ├── ui/                   # Reusable UI components
│   │   └── layout/               # Navigation, shell
│   ├── lib/
│   │   ├── supabase/             # Database clients
│   │   ├── pipeline/             # Content processing
│   │   ├── rag/                  # RAG chat system
│   │   ├── auth/                 # Auth hook & context
│   │   ├── email.ts              # Email service
│   │   ├── sms.ts                # SMS service
│   │   └── challenge-engine.ts   # Question selection
│   └── types/index.ts            # TypeScript definitions
├── supabase/migrations/          # Database schema
├── middleware.ts                 # Route protection
├── package.json
├── tailwind.config.ts
└── vercel.json                   # Cron configuration
```

## 🚀 Quick Start

```bash
# Clone and install
git clone <your-repo>
cd contractor-study
npm install

# Set up environment
cp .env.example .env.local
# Edit .env.local with your API keys

# Run database migrations (via Supabase dashboard)

# Start development server
npm run dev
```

Visit:
- http://localhost:3000 - Landing page
- http://localhost:3000/register - Registration
- http://localhost:3000/dashboard - Student dashboard
- http://localhost:3000/admin - Admin panel

## 📱 All Pages

### Student Pages
| Route | Description |
|-------|-------------|
| `/` | Landing page |
| `/login` | Magic link authentication |
| `/register` | Student registration |
| `/dashboard` | Home with streak, today's challenge |
| `/challenge` | Daily 5-question quiz |
| `/study` | Browse questions by topic |
| `/chat` | AI study assistant |
| `/leaderboard` | Student rankings |
| `/progress` | Stats & analytics |
| `/achievements` | Badge collection |
| `/settings` | Profile & notifications |

### Admin Pages
| Route | Description |
|-------|-------------|
| `/admin` | Overview dashboard |
| `/admin/students` | Student management |
| `/admin/handouts` | Content upload & processing |
| `/admin/questions` | Question review queue |
| `/admin/qr` | QR code generator |

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/login` - Send magic link
- `POST /api/auth/logout` - Sign out
- `GET /api/auth/callback` - Magic link redirect

### Student
- `GET /api/students/me` - Get profile
- `PATCH /api/students/me` - Update profile
- `GET /api/students/me/stats` - Get statistics
- `POST /api/students/me/streak-freeze` - Use streak freeze

### Challenges
- `GET /api/challenges` - Get today's challenge
- `POST /api/challenges` - Submit answer

### Chat
- `POST /api/chat` - Send message
- `GET /api/chat?sessionId=xxx` - Get history

### Leaderboard & Achievements
- `GET /api/leaderboard` - Get rankings
- `GET /api/achievements` - Get badges

### Admin
- `GET/POST /api/admin/students` - Manage students
- `GET/POST/DELETE /api/admin/handouts` - Manage content
- `POST /api/admin/handouts/process` - Run pipeline
- `GET/POST/PATCH/DELETE /api/admin/questions` - Manage questions

### Cron
- `POST /api/cron/daily-challenge` - Generate daily challenges (7 AM PT)

## 🎮 Gamification

### Streaks
- Complete daily challenge to maintain streak
- One streak freeze available per week
- Longest streak tracked for achievements

### Achievements
| Category | Badges |
|----------|--------|
| Streak | 3, 7, 14, 30, 100 days |
| Volume | 10, 50, 100, 500, 1000 questions |
| Accuracy | Perfect challenge, 80% over 50 |
| Special | Early bird, all topics |

## 🔄 Content Pipeline

1. **Upload** - PDF, DOCX, or images via admin panel
2. **Extract** - pdf-parse for text PDFs, Claude Vision for scanned/images
3. **Chunk** - Split into ~1000 token sections with overlap
4. **Embed** - Generate vectors with Voyage AI
5. **Generate** - Claude creates 3-5 questions per chunk
6. **Review** - Admin approves/edits before going live

## 📧 Notifications

- **Daily Challenge (7 AM PT)**: Email/SMS reminder
- **Streak Reminder (8 PM PT)**: Warning if not completed
- **Weekly Progress**: Sunday email summary

## 🚢 Deployment

### Vercel
1. Push to GitHub
2. Import to Vercel
3. Add environment variables
4. Deploy

Cron job automatically configured from `vercel.json`.

## 🔒 Security

- Row Level Security (RLS) on all tables
- Magic link authentication (passwordless)
- Route protection via middleware
- Admin routes require special access

## 📊 Database Tables

- `students` - User profiles
- `handouts` - Uploaded content
- `handout_chunks` - Chunked text with vectors
- `questions` - Study questions
- `daily_challenges` - Generated challenges
- `challenge_responses` - Student answers
- `chat_sessions` - AI chat history
- `student_achievements` - Unlocked badges
- `notification_log` - Sent notifications

---

Built with ❤️ for contractor license students
