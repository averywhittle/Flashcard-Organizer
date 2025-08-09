#!/usr/bin/env node

const { spawn, exec } = require('child_process');
const path = require('path');
const fs = require('fs');

// Colors for console output
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    red: '\x1b[31m'
};

console.log(`${colors.blue}${colors.bright}🚀 Starting Flashcard Memory Game...${colors.reset}\n`);

// Check if .env file exists and has API key
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    if (envContent.includes('your_openai_api_key_here')) {
        console.log(`${colors.yellow}⚠️  Warning: OpenAI API key not configured!${colors.reset}`);
        console.log(`${colors.yellow}   Please add your API key to the .env file to enable AI generation.${colors.reset}\n`);
    } else {
        console.log(`${colors.green}✓ OpenAI API key configured${colors.reset}\n`);
    }
} else {
    console.log(`${colors.red}❌ .env file not found!${colors.reset}`);
    console.log(`${colors.yellow}   Creating .env file...${colors.reset}\n`);
    fs.writeFileSync(envPath, `# OpenAI API Configuration
# Get your API key from: https://platform.openai.com/api-keys
OPENAI_API_KEY=your_openai_api_key_here

# Server Configuration
PORT=3000`);
}

// Start the server
console.log(`${colors.blue}Starting server on port 3000...${colors.reset}`);
const server = spawn('node', ['server.js'], {
    stdio: 'inherit',
    env: { ...process.env }
});

// Wait a moment for server to start
setTimeout(() => {
    console.log(`\n${colors.green}${colors.bright}✨ Opening Flashcard Game in your browser...${colors.reset}`);
    console.log(`${colors.blue}URL: http://localhost:3000${colors.reset}\n`);
    
    // Open browser based on platform
    const url = 'http://localhost:3000';
    const platform = process.platform;
    
    let command;
    if (platform === 'darwin') {
        command = `open ${url}`;
    } else if (platform === 'win32') {
        command = `start ${url}`;
    } else {
        command = `xdg-open ${url}`;
    }
    
    exec(command, (error) => {
        if (error) {
            console.log(`${colors.yellow}Could not auto-open browser. Please open manually: ${url}${colors.reset}`);
        }
    });
    
    console.log(`${colors.green}Server is running! Press Ctrl+C to stop.${colors.reset}\n`);
}, 1500);

// Handle process termination
process.on('SIGINT', () => {
    console.log(`\n${colors.yellow}Shutting down server...${colors.reset}`);
    server.kill();
    process.exit();
});

process.on('exit', () => {
    server.kill();
});