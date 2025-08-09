# Deployment Guide

This Next.js application can be deployed to Vercel with the following steps:

## Prerequisites

1. A Vercel account (https://vercel.com)
2. An OpenAI API key (https://platform.openai.com/api-keys)

## Vercel Deployment Steps

### 1. Connect Repository to Vercel

1. Go to https://vercel.com/new
2. Import your Git repository
3. Vercel will automatically detect this is a Next.js project

### 2. Configure Environment Variables

In your Vercel dashboard:

1. Go to Project Settings > Environment Variables
2. Add the following variable:
   - **Name**: `OPENAI_API_KEY`
   - **Value**: Your OpenAI API key (starts with `sk-`)
   - **Environments**: Production, Preview, Development

### 3. Deploy

1. Click "Deploy" - Vercel will build and deploy your application
2. Your app will be available at a URL like `https://your-app-name.vercel.app`

## Local Development

1. Copy your OpenAI API key to `.env.local`:
   ```
   OPENAI_API_KEY=sk-your-key-here
   ```

2. Install dependencies and run:
   ```bash
   npm install
   npm run dev
   ```

3. Open http://localhost:3000

## Features

- ✅ AI-powered flashcard generation using OpenAI GPT-3.5
- ✅ Study mode with manual navigation
- ✅ Quiz mode with automatic scoring
- ✅ Local storage persistence
- ✅ Responsive design
- ✅ Keyboard shortcuts

## Technical Details

- **Framework**: Next.js 15 with React 19
- **Styling**: CSS Modules
- **API**: Next.js API Routes
- **AI**: OpenAI GPT-3.5 Turbo
- **Storage**: Browser localStorage
- **Deployment**: Vercel (recommended)

## Migration from Legacy Version

This is a Next.js conversion of the original Express.js app. The legacy server can still be run with:

```bash
npm run legacy:start  # Runs the original Express.js server
```