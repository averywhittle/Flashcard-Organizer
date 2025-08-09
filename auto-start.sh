#!/bin/bash

# Flashcard Game Auto-Start Script (macOS/Linux)
# This script automatically starts the server when opening the HTML file

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Flashcard Game Auto-Launcher${NC}"

# Get the directory of this script
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$DIR"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Installing dependencies...${NC}"
    npm install
fi

# Check if server is already running
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null ; then
    echo -e "${GREEN}✅ Server already running on port 3000${NC}"
else
    echo -e "${BLUE}🔧 Starting server...${NC}"
    # Start server in background
    npm run server &
    SERVER_PID=$!
    echo -e "${GREEN}✅ Server started (PID: $SERVER_PID)${NC}"
    
    # Wait a moment for server to initialize
    sleep 2
fi

# Open the HTML file in default browser
echo -e "${BLUE}🌐 Opening browser...${NC}"
if [[ "$OSTYPE" == "darwin"* ]]; then
    open "http://localhost:3000"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    xdg-open "http://localhost:3000"
fi

echo -e "${GREEN}✨ Flashcard Game is ready!${NC}"
echo -e "${YELLOW}Press Ctrl+C to stop the server${NC}"

# Keep script running
wait