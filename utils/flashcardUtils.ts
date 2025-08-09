import { Flashcard } from '../types';

export function extractCoreAnswer(fullAnswer: string): string {
    let answer = fullAnswer.trim();
    console.log('Original answer:', answer);
    
    // Remove common prefixes (more comprehensive)
    answer = answer.replace(/^(answer:\s*|the answer is\s*|it is\s*|this is\s*|the correct answer is\s*|correct answer:\s*|solution:\s*)/i, '').trim();
    
    // Extract content within quotes or parentheses
    const quoteMatch = answer.match(/["']([^"']+)["']/) || answer.match(/\(([^)]+)\)/);
    if (quoteMatch) {
        console.log('Found quoted answer:', quoteMatch[1]);
        return quoteMatch[1].trim().toLowerCase();
    }
    
    // Extract chemical symbols (more flexible pattern)
    const chemicalSymbol = answer.match(/\b([A-Z][a-z]?(?:[0-9]+)?)\b/);
    if (chemicalSymbol && answer.length < 30) {
        console.log('Found chemical symbol:', chemicalSymbol[1]);
        return chemicalSymbol[1].toLowerCase();
    }
    
    // Extract numbers (including decimals, fractions, percentages)
    const numberMatch = answer.match(/^-?\d+(?:\.\d+)?(?:%|°)?/) || answer.match(/\b(\d+(?:\.\d+)?(?:%|°)?)\b/);
    if (numberMatch && answer.length < 20) {
        console.log('Found number:', numberMatch[0] || numberMatch[1]);
        return (numberMatch[0] || numberMatch[1]).toLowerCase();
    }
    
    // Extract years (4 digits)
    const yearMatch = answer.match(/\b((?:19|20)\d{2})\b/);
    if (yearMatch) {
        console.log('Found year:', yearMatch[1]);
        return yearMatch[1];
    }
    
    // Extract single words that are likely answers (proper nouns, etc.)
    const singleWordMatch = answer.match(/\b([A-Z][a-zA-Z]*)\b/);
    if (singleWordMatch && answer.split(/\s+/).length <= 3) {
        console.log('Found single word:', singleWordMatch[1]);
        return singleWordMatch[1].toLowerCase();
    }
    
    // Remove explanatory text after common delimiters
    const cleanPatterns = [
        /^([^,;.!?]+)[\s,;.!?].*/,  // Everything before first punctuation
        /^([^(]+)\s*\([^)]*\).*/,    // Everything before parentheses
        /^([^-]+)\s*-\s*.*/,         // Everything before dash
        /^([^:]+):\s*.*/,            // Everything before colon
        /^([^|]+)\s*\|\s*.*/         // Everything before pipe
    ];
    
    for (const pattern of cleanPatterns) {
        const match = answer.match(pattern);
        if (match) {
            let cleaned = match[1].trim();
            if (cleaned.length > 0 && cleaned.length < 50) {
                console.log('Pattern matched:', cleaned);
                answer = cleaned;
                break;
            }
        }
    }
    
    // Split into words and take the most likely answer part
    const words = answer.split(/\s+/);
    
    // If 1-2 words, probably the answer
    if (words.length <= 2) {
        console.log('Short answer:', answer);
        return answer.toLowerCase();
    }
    
    // If 3-4 words and short, probably the answer
    if (words.length <= 4 && answer.length < 30) {
        console.log('Medium answer:', answer);
        return answer.toLowerCase();
    }
    
    // Take first 1-3 words as likely core answer
    const coreWords = words.slice(0, Math.min(3, words.length)).join(' ');
    console.log('Core words extracted:', coreWords);
    return coreWords.toLowerCase();
}

export function calculateSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const distance = levenshteinDistance(longer, shorter);
    return (longer.length - distance) / longer.length;
}

export function levenshteinDistance(str1: string, str2: string): number {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
        matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
        matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
        for (let j = 1; j <= str1.length; j++) {
            if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1,
                    matrix[i][j - 1] + 1,
                    matrix[i - 1][j] + 1
                );
            }
        }
    }
    
    return matrix[str2.length][str1.length];
}

export function checkAnswer(userAnswer: string, fullAnswer: string): boolean {
    const userAnswerLower = userAnswer.trim().toLowerCase();
    const fullAnswerLower = fullAnswer.toLowerCase();
    
    // Extract core answer from the full answer text
    const coreAnswer = extractCoreAnswer(fullAnswerLower);
    
    // Multiple ways to check correctness
    const isCorrect = 
        // Exact match with core answer
        userAnswerLower === coreAnswer ||
        // Exact match with full answer
        userAnswerLower === fullAnswerLower ||
        // Core answer contains user answer (for partial matches)
        (coreAnswer.includes(userAnswerLower) && userAnswerLower.length >= 2) ||
        // User answer contains core answer (in case user gives more detail)
        (userAnswerLower.includes(coreAnswer) && coreAnswer.length >= 2) ||
        // Similarity check with core answer
        calculateSimilarity(userAnswerLower, coreAnswer) > 0.8 ||
        // Similarity check with full answer (lower threshold)
        calculateSimilarity(userAnswerLower, fullAnswerLower) > 0.7;
    
    return isCorrect;
}

export function shuffleDeck(flashcards: Flashcard[]): Flashcard[] {
    const shuffled = [...flashcards];
    // Fisher-Yates shuffle algorithm
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

export function loadFlashcards(): Flashcard[] {
    if (typeof window === 'undefined') return [];
    
    const stored = localStorage.getItem('flashcards');
    if (stored) {
        try {
            return JSON.parse(stored);
        } catch (error) {
            console.error('Error parsing stored flashcards:', error);
            return [];
        }
    }
    return [];
}

export function saveFlashcards(flashcards: Flashcard[]): void {
    if (typeof window === 'undefined') return;
    
    localStorage.setItem('flashcards', JSON.stringify(flashcards));
}