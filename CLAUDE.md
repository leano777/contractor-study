# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
npm run dev          # Start development server (http://localhost:3000)
npm run build        # Production build
npm run lint         # Run ESLint
npm run db:generate  # Generate Supabase TypeScript types
```

## Architecture Overview

Next.js 14 App Router application for California contractor license exam prep (License A & B). Uses TypeScript with path alias `@/*` → `./src/*`.

**Stack**: Next.js 14, React 18, Supabase (PostgreSQL + Auth + Storage), Claude API, Voyage AI (embeddings), Resend (email), Twilio (SMS)

## Key Systems

### Content Pipeline (`src/lib/pipeline/`)
Processes uploaded study materials:
1. `extraction.ts` - Extract text from PDFs/images (uses Claude Vision for scanned docs)
2. `chunking.ts` - Split into ~1000 token chunks with overlap
3. `embeddings.ts` - Generate vectors via Voyage AI or OpenAI
4. `questions.ts` - Generate 3-5 exam-style MC questions per chunk via Claude

### RAG Chat (`src/lib/rag/chat.ts`)
Hybrid search combining semantic (vector) + keyword (full-text) search with Reciprocal Rank Fusion for ranking. Returns source citations from handouts.

### Challenge Engine (`src/lib/challenge-engine.ts`)
Spaced repetition algorithm selecting 5 daily questions:
- Difficulty mix: 2 easy, 2 medium, 1 hard
- Prioritizes previously incorrect questions for review

### Route Protection (`src/middleware.ts`)
- Public routes: `/`, `/login`, `/register`
- Protected student routes: `/dashboard`, `/challenge`, `/study`, `/chat`, `/leaderboard`, `/progress`, `/achievements`, `/settings`
- Admin routes: `/admin/*`

## Database

Supabase with Row Level Security (RLS) on all tables. Main tables: `students`, `handouts`, `handout_chunks`, `questions`, `daily_challenges`, `challenge_responses`, `chat_sessions`, `student_achievements`

Migrations in `supabase/migrations/`

## Cron Jobs

Configured in `vercel.json`:
- `/api/cron/daily-challenge` runs at 14:00 UTC (7 AM PT) to generate daily challenges

## Environment Setup

Copy `.env.example` to `.env.local`. Required services:
- Supabase (database, auth, storage)
- Anthropic (Claude API for AI features)
- Voyage AI or OpenAI (embeddings)
- Resend (email notifications)
- Twilio (SMS notifications)
