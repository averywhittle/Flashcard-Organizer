import { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import { Flashcard, Stats, Mode } from '../types';
import { loadFlashcards, saveFlashcards, shuffleDeck } from '../utils/flashcardUtils';
import FlashcardDisplay from '../components/FlashcardDisplay';
import AIGeneration from '../components/AIGeneration';
import ManualForm from '../components/ManualForm';
import QuizMode from '../components/QuizMode';
import ScoreDisplay from '../components/ScoreDisplay';
import styles from '../styles/Home.module.css';

export default function Home() {
    const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [currentMode, setCurrentMode] = useState<Mode>('study');
    const [showAnswer, setShowAnswer] = useState(false);
    const [stats, setStats] = useState<Stats>({
        correct: 0,
        incorrect: 0,
        streak: 0,
        maxStreak: 0,
        attempts: {}
    });

    // Load flashcards on component mount
    useEffect(() => {
        const loaded = loadFlashcards();
        setFlashcards(loaded);
    }, []);

    // Save flashcards whenever they change
    useEffect(() => {
        if (flashcards.length > 0) {
            saveFlashcards(flashcards);
        }
    }, [flashcards]);

    const currentCard = flashcards.length > 0 ? flashcards[currentIndex] : null;

    const resetStats = useCallback(() => {
        setStats({
            correct: 0,
            incorrect: 0,
            streak: 0,
            maxStreak: 0,
            attempts: {}
        });
    }, []);

    const setMode = (mode: Mode) => {
        setCurrentMode(mode);
        setShowAnswer(false);
        
        if (mode === 'quiz' && flashcards.length > 0) {
            const shouldReset = confirm('Start a new quiz session? This will reset your score.');
            if (shouldReset) {
                resetStats();
            }
        }
    };

    const toggleQuizMode = () => {
        setMode(currentMode === 'study' ? 'quiz' : 'study');
    };

    const handleCardClick = () => {
        if (currentMode === 'study') {
            toggleAnswer();
        }
    };

    const toggleAnswer = () => {
        if (flashcards.length > 0 && currentMode === 'study') {
            setShowAnswer(!showAnswer);
        }
    };

    const nextCard = () => {
        if (flashcards.length > 0) {
            setCurrentIndex((currentIndex + 1) % flashcards.length);
            setShowAnswer(false);
        }
    };

    const previousCard = () => {
        if (flashcards.length > 0) {
            setCurrentIndex(currentIndex === 0 ? flashcards.length - 1 : currentIndex - 1);
            setShowAnswer(false);
        }
    };

    const handleShuffle = () => {
        if (flashcards.length > 1) {
            const shuffled = shuffleDeck(flashcards);
            setFlashcards(shuffled);
            setCurrentIndex(0);
            setShowAnswer(false);
        }
    };

    const handleFlashcardsGenerated = (newFlashcards: Flashcard[], replace: boolean) => {
        if (replace) {
            setFlashcards(newFlashcards);
            setCurrentIndex(0);
        } else {
            setFlashcards(prev => [...prev, ...newFlashcards]);
        }
        setShowAnswer(false);
    };

    const handleFlashcardAdded = (newFlashcard: Flashcard) => {
        setFlashcards(prev => [...prev, newFlashcard]);
        setCurrentIndex(flashcards.length); // Move to the new card
        setShowAnswer(false);
    };

    const handleAnswerChecked = (isCorrect: boolean) => {
        setStats(prevStats => ({
            ...prevStats,
            correct: prevStats.correct + (isCorrect ? 1 : 0),
            incorrect: prevStats.incorrect + (isCorrect ? 0 : 1),
            streak: isCorrect ? prevStats.streak + 1 : 0,
            maxStreak: isCorrect && (prevStats.streak + 1) > prevStats.maxStreak 
                ? prevStats.streak + 1 
                : prevStats.maxStreak
        }));
    };

    const clearAll = () => {
        if (confirm('This will delete all flashcards and reset the app completely. Are you sure?')) {
            setFlashcards([]);
            setCurrentIndex(0);
            setCurrentMode('study');
            resetStats();
            setShowAnswer(false);
            
            // Clear localStorage
            if (typeof window !== 'undefined') {
                localStorage.removeItem('flashcards');
            }
        }
    };

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.target as HTMLElement).tagName === 'INPUT' || (e.target as HTMLElement).tagName === 'TEXTAREA') return;
            
            switch(e.key) {
                case 'ArrowLeft':
                    previousCard();
                    break;
                case 'ArrowRight':
                    nextCard();
                    break;
                case ' ':
                    e.preventDefault();
                    toggleAnswer();
                    break;
                case 's':
                    handleShuffle();
                    break;
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [currentIndex, flashcards.length, currentMode]);

    return (
        <div className={styles.container}>
            <Head>
                <title>Flashcard Memory Game</title>
                <meta name="description" content="AI-powered flashcard memory game" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <div className={styles.appLayout}>
                {/* Left Sidebar with Controls */}
                <div className={styles.sidebar}>
                    <h1 className={styles.title}>Flashcard Memory Game</h1>
                    
                    <div className={styles.modeToggle}>
                        <button 
                            className={`${styles.modeBtn} ${currentMode === 'study' ? styles.active : ''}`}
                            onClick={() => setMode('study')}
                        >
                            Study Mode
                        </button>
                        <button 
                            className={`${styles.modeBtn} ${currentMode === 'quiz' ? styles.active : ''}`}
                            onClick={() => setMode('quiz')}
                        >
                            Quiz Mode
                        </button>
                    </div>
                    
                    <AIGeneration 
                        onFlashcardsGenerated={handleFlashcardsGenerated}
                        existingCardCount={flashcards.length}
                    />

                    <ManualForm onFlashcardAdded={handleFlashcardAdded} />

                    <div className={styles.controls}>
                        <button className={styles.btn} onClick={previousCard}>
                            ← Previous
                        </button>
                        {currentMode === 'study' && (
                            <button className={styles.btn} onClick={toggleAnswer}>
                                Show/Hide Answer
                            </button>
                        )}
                        <button className={styles.btn} onClick={nextCard}>
                            Next →
                        </button>
                        <button className={styles.btn} onClick={handleShuffle}>
                            Shuffle Deck
                        </button>
                        <button className={styles.btn} onClick={toggleQuizMode}>
                            {currentMode === 'study' ? 'Quiz Mode' : 'Study Mode'}
                        </button>
                        <button 
                            className={`${styles.btn} ${styles.clearBtn}`}
                            onClick={clearAll}
                        >
                            Clear All
                        </button>
                    </div>

                    <div className={styles.stats}>
                        Total Cards: {flashcards.length}
                    </div>
                </div>

                {/* Right Main Content with Flashcards */}
                <div className={styles.mainContent}>
                    <ScoreDisplay stats={stats} show={currentMode === 'quiz'} />

                    <FlashcardDisplay
                        flashcard={currentCard}
                        currentIndex={currentIndex}
                        totalCards={flashcards.length}
                        showAnswer={showAnswer}
                        mode={currentMode}
                        onCardClick={handleCardClick}
                    />

                    {currentMode === 'quiz' && (
                        <QuizMode
                            flashcard={currentCard}
                            stats={stats}
                            onAnswerChecked={handleAnswerChecked}
                            onNextCard={nextCard}
                            showAnswer={showAnswer}
                            onShowAnswer={() => setShowAnswer(true)}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}