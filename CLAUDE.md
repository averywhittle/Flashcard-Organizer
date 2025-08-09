# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Essential Commands

```bash
# Quick start (recommended)
npm start          # Starts server + opens browser automatically
./auto-start.sh    # macOS/Linux alternative startup script
auto-start.bat     # Windows alternative startup script

# Development commands
npm install        # Install dependencies
npm run server     # Run server only (port 3000)
npm run dev        # Same as npm start

# Server testing
curl http://localhost:3000/api/health  # Check server status and API key config
```

## Architecture Overview

This is a single-page flashcard application with AI generation capabilities using a client-server architecture:

### Core Components

**Frontend (`index.html`):**
- Single HTML file containing all UI, CSS, and JavaScript
- Uses vanilla JavaScript with localStorage for persistence
- Implements two modes: Study Mode and Quiz Mode
- Features cyberpunk-style UI (black/cyan theme, monospace fonts, sharp edges)

**Backend (`server.js`):**
- Express.js server serving static files and AI API
- Single endpoint: `POST /api/generate-flashcards`
- Integrates with OpenAI GPT-3.5 Turbo for flashcard generation
- Each request uses unique session ID to prevent AI from remembering previous generations

**Startup Scripts:**
- `start.js` - Auto-launches server and browser
- `auto-start.sh/bat` - Platform-specific startup scripts

### Key State Management

**Global Variables:**
- `flashcards[]` - Array of {question, answer} objects
- `currentIndex` - Current card position
- `currentMode` - 'study' or 'quiz'
- `stats` - Quiz statistics object

**Two Operating Modes:**
1. **Study Mode**: Click cards to reveal answers, manual navigation
2. **Quiz Mode**: Input guessing with auto-advance, score tracking

### Critical Functions

**Answer Processing:**
- `extractCoreAnswer()` - Extracts key answer from AI-generated full text (handles "Answer: Fe is the atomic symbol" → "fe")
- `checkAnswer()` - Smart matching with similarity scoring and multiple comparison methods

**Mode Management:**
- `setMode()` - Switches between study/quiz modes, updates UI state
- `toggleQuizMode()` - Main mode toggle function

**Data Persistence:**
- Uses browser localStorage for flashcard storage
- `loadFlashcards()` and `saveFlashcards()` handle persistence

### AI Integration

**Prompt System:**
- Default prompt generates educational flashcards
- Custom prompts support `{topic}` and `{count}` placeholders
- Each request includes unique session ID and randomization to prevent repetition
- Temperature set to 0.8 with random seeds for variety

**Answer Extraction Challenges:**
AI generates varied answer formats, so `extractCoreAnswer()` handles:
- Chemical symbols (Fe, H2O, CO2)
- Numbers with units (42%, 32°, 3.14)
- Quoted content ("Paris")
- Years (1776, 2023)
- Complex sentences with prefixes

### Environment Setup

**Required:**
- OpenAI API key in `.env` file as `OPENAI_API_KEY`
- Port 3000 (configurable via `PORT` env var)

**Dependencies:**
- express, cors, dotenv, openai

### Common Issues

**Function Name Conflicts:**
- Two different `updateStats()` functions exist:
  - One for quiz statistics (correct/incorrect counts)
  - One renamed to `updateCardStats()` for total card count display

**Answer Matching Problems:**
If quiz mode isn't accepting correct answers, check browser console logs from `extractCoreAnswer()` to debug the parsing logic.

**Server Port Conflicts:**
The app checks for existing processes on port 3000 and will show EADDRINUSE error if multiple instances run simultaneously.