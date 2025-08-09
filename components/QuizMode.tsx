import { useState, useEffect } from 'react';
import { Flashcard, Stats } from '../types';
import { extractCoreAnswer, checkAnswer } from '../utils/flashcardUtils';
import styles from '../styles/Home.module.css';

interface QuizModeProps {
    flashcard: Flashcard | null;
    stats: Stats;
    onAnswerChecked: (isCorrect: boolean) => void;
    onNextCard: () => void;
    showAnswer: boolean;
    onShowAnswer: () => void;
}

export default function QuizMode({
    flashcard,
    stats,
    onAnswerChecked,
    onNextCard,
    showAnswer,
    onShowAnswer
}: QuizModeProps) {
    const [userAnswer, setUserAnswer] = useState('');
    const [hint, setHint] = useState('');
    const [inputClass, setInputClass] = useState('');

    useEffect(() => {
        // Clear input and hint when flashcard changes
        setUserAnswer('');
        setHint('');
        setInputClass('');
    }, [flashcard]);

    const handleSubmit = () => {
        if (!flashcard || !userAnswer.trim()) return;

        const isCorrect = checkAnswer(userAnswer, flashcard.answer);
        
        if (isCorrect) {
            setInputClass('correct');
            onShowAnswer();
            
            // Auto-advance after 1.5 seconds
            setTimeout(() => {
                setUserAnswer('');
                setInputClass('');
                setHint('');
                onNextCard();
            }, 1500);
        } else {
            setInputClass('incorrect');
            
            // Show hint
            const coreAnswer = extractCoreAnswer(flashcard.answer.toLowerCase());
            setHint(`Hint: The answer has ${coreAnswer.length} characters`);
            
            setTimeout(() => {
                setInputClass('');
            }, 500);
        }
        
        onAnswerChecked(isCorrect);
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSubmit();
        }
    };

    if (!flashcard) {
        return (
            <div className={styles.guessSection}>
                <h3 className={styles.sectionTitle}>Your Answer</h3>
                <div className={styles.guessInputGroup}>
                    <input 
                        type="text" 
                        className={styles.guessInput}
                        placeholder="Add some flashcards to start the quiz..."
                        disabled
                    />
                    <button className={styles.btn} disabled>Submit</button>
                </div>
            </div>
        );
    }

    return (
        <div className={`${styles.guessSection} ${styles.active}`}>
            <h3 className={styles.sectionTitle}>Your Answer</h3>
            <div className={styles.guessInputGroup}>
                <input 
                    type="text" 
                    className={`${styles.guessInput} ${inputClass === 'correct' ? styles.correct : ''} ${inputClass === 'incorrect' ? styles.incorrect : ''}`}
                    placeholder="Type your answer and press Enter..."
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    onKeyPress={handleKeyPress}
                    autoFocus
                />
                <button className={styles.btn} onClick={handleSubmit}>
                    Submit
                </button>
            </div>
            {hint && (
                <div className={styles.guessHint}>{hint}</div>
            )}
        </div>
    );
}