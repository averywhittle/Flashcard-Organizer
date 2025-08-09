# AI-Powered Flashcard Memory Game

A modern, interactive flashcard application with AI-powered card generation using OpenAI's GPT-3.5.

## Features

- **AI Generation**: Generate up to 100 flashcards instantly on any topic
- **Manual Creation**: Add your own custom Q&A pairs
- **Persistent Storage**: Flashcards saved in browser localStorage
- **Interactive UI**: Click cards to reveal answers, navigate with keyboard
- **Shuffle Mode**: Randomize your deck for better learning
- **Responsive Design**: Works on desktop and mobile devices

## Quick Start Options

### Option 1: Auto-Start (Recommended)
**macOS/Linux:**
```bash
./auto-start.sh
```

**Windows:**
```cmd
auto-start.bat
```

### Option 2: Manual Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure OpenAI API Key
1. Get your API key from [OpenAI Platform](https://platform.openai.com/api-keys)
2. Open `.env` file
3. Replace `your_openai_api_key_here` with your actual API key

### 3. Start the Application
```bash
npm start
```
This will automatically:
- Start the server on port 3000
- Open the application in your default browser
- Display the API key configuration status

## How to Use

### AI Generation
1. Enter a topic in the AI Generator field (e.g., "World War II", "Python basics")
2. Specify number of cards (1-100, default is 100)
3. (Optional) Click "Advanced: Customize AI Prompt" to edit the generation prompt
   - Use {topic} and {count} as placeholders in your custom prompt
   - Customize difficulty, style, and focus of the flashcards
4. Click "Generate Flashcards"
5. Choose to replace existing cards or append to your deck

### Manual Creation
1. Enter a question and answer in the input fields
2. Click "Add Flashcard"

### Navigation
- **Previous/Next**: Navigate through cards
- **Show/Hide Answer**: Toggle answer visibility
- **Shuffle**: Randomize card order
- **Clear All**: Reset the entire application

### Keyboard Shortcuts
- `←` / `→`: Previous/Next card
- `Space`: Show/hide answer
- `S`: Shuffle deck

## Technology Stack
- Frontend: HTML5, CSS3, Vanilla JavaScript
- Backend: Node.js, Express
- AI: OpenAI GPT-3.5 Turbo
- Storage: Browser localStorage

## Security Note
Never commit your `.env` file with your API key. The `.gitignore` file is configured to exclude it.