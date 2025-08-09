export interface Flashcard {
    question: string;
    answer: string;
}

export interface Stats {
    correct: number;
    incorrect: number;
    streak: number;
    maxStreak: number;
    attempts: Record<string, any>;
}

export type Mode = 'study' | 'quiz';

export interface FlashcardAppState {
    flashcards: Flashcard[];
    currentIndex: number;
    currentMode: Mode;
    stats: Stats;
}