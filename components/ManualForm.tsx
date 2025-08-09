import { useState } from 'react';
import { Flashcard } from '../types';
import styles from '../styles/Home.module.css';

interface ManualFormProps {
    onFlashcardAdded: (flashcard: Flashcard) => void;
}

export default function ManualForm({ onFlashcardAdded }: ManualFormProps) {
    const [question, setQuestion] = useState('');
    const [answer, setAnswer] = useState('');

    const addFlashcard = () => {
        const trimmedQuestion = question.trim();
        const trimmedAnswer = answer.trim();

        if (trimmedQuestion && trimmedAnswer) {
            onFlashcardAdded({
                question: trimmedQuestion,
                answer: trimmedAnswer
            });
            
            // Clear inputs
            setQuestion('');
            setAnswer('');
        } else {
            alert('Please enter both a question and an answer.');
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && e.ctrlKey) {
            addFlashcard();
        }
    };

    return (
        <div className={styles.inputSection}>
            <h3 className={styles.sectionTitle}>Add Manually</h3>
            <div style={{ marginBottom: '15px' }}>
                <label htmlFor="question">Question:</label>
                <textarea
                    id="question"
                    className={styles.textarea}
                    placeholder="Enter your question here..."
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    onKeyPress={handleKeyPress}
                />
            </div>
            <div style={{ marginBottom: '15px' }}>
                <label htmlFor="answer">Answer:</label>
                <textarea
                    id="answer"
                    className={styles.textarea}
                    placeholder="Enter the answer here..."
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    onKeyPress={handleKeyPress}
                />
            </div>
            <button className={styles.btn} onClick={addFlashcard}>
                Add Flashcard
            </button>
        </div>
    );
}