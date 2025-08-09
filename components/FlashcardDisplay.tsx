import { Flashcard, Mode } from '../types';
import styles from '../styles/Home.module.css';

interface FlashcardDisplayProps {
    flashcard: Flashcard | null;
    currentIndex: number;
    totalCards: number;
    showAnswer: boolean;
    mode: Mode;
    onCardClick: () => void;
}

export default function FlashcardDisplay({
    flashcard,
    currentIndex,
    totalCards,
    showAnswer,
    mode,
    onCardClick
}: FlashcardDisplayProps) {
    if (!flashcard) {
        return (
            <div className={`${styles.flashcardDisplay} ${styles.empty}`} onClick={onCardClick}>
                <div className={styles.cardContent}>
                    Ready to learn! Use the controls on the left to get started.
                </div>
            </div>
        );
    }

    return (
        <div className={styles.flashcardDisplay} onClick={onCardClick}>
            <div className={styles.cardNumber}>
                {currentIndex + 1} / {totalCards}
            </div>
            <div className={styles.cardContent}>
                <div>{flashcard.question}</div>
                <div className={`${styles.answer} ${showAnswer ? styles.show : ''}`}>
                    Answer: {flashcard.answer}
                </div>
            </div>
        </div>
    );
}