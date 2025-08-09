import { useState } from 'react';
import { Flashcard } from '../types';
import styles from '../styles/Home.module.css';

interface AIGenerationProps {
    onFlashcardsGenerated: (flashcards: Flashcard[], replace: boolean) => void;
    existingCardCount: number;
}

export default function AIGeneration({ onFlashcardsGenerated, existingCardCount }: AIGenerationProps) {
    const [topic, setTopic] = useState('');
    const [count, setCount] = useState(20);
    const [isGenerating, setIsGenerating] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const hideMessages = () => {
        setErrorMessage('');
        setSuccessMessage('');
    };

    const showError = (message: string) => {
        setErrorMessage(message);
        setSuccessMessage('');
        setTimeout(hideMessages, 5000);
    };

    const showSuccess = (message: string) => {
        setSuccessMessage(message);
        setErrorMessage('');
        setTimeout(hideMessages, 5000);
    };

    const generateFlashcards = async () => {
        if (!topic.trim()) {
            showError('Please enter a topic or question');
            return;
        }

        // Check if server is running
        try {
            const healthCheck = await fetch('/api/health');
            const health = await healthCheck.json();
            if (!health.apiKeyConfigured) {
                showError('OpenAI API key not configured. Please add your API key to the .env file.');
                return;
            }
        } catch (error) {
            showError('AI server is not running. Please check your configuration.');
            return;
        }

        setIsGenerating(true);
        hideMessages();

        try {
            const response = await fetch('/api/generate-flashcards', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ topic: topic.trim(), count })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to generate flashcards');
            }

            if (data.flashcards && data.flashcards.length > 0) {
                // Ask user if they want to replace or append
                const replace = existingCardCount === 0 || 
                    confirm(`You have ${existingCardCount} existing flashcards. Do you want to REPLACE them?\n\nClick OK to replace, Cancel to add to existing deck.`);
                
                onFlashcardsGenerated(data.flashcards, replace);
                
                // Show success message with warning if count didn't match
                let message = `Successfully generated ${data.flashcards.length} flashcards!`;
                if (data.warning) {
                    message = `${data.warning}\n\nThis can happen with complex topics or when the AI has difficulty generating unique content.`;
                    console.warn('Generation warning:', data.warning);
                } else if (data.flashcards.length === count) {
                    message = `Successfully generated exactly ${count} flashcards!`;
                }
                
                showSuccess(message);
                setTopic('');
            } else {
                throw new Error('No flashcards were generated');
            }
        } catch (error: any) {
            console.error('Error:', error);
            showError(error.message);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !isGenerating) {
            generateFlashcards();
        }
    };

    return (
        <div className={styles.aiSection}>
            <h3 className={styles.sectionTitle}>AI Flashcard Generator</h3>
            <div className={styles.aiInputGroup}>
                <input
                    type="text"
                    className={styles.input}
                    placeholder="Enter a topic or question"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={isGenerating}
                />
                <input
                    type="number"
                    className={styles.numberInput}
                    min="1"
                    max="100"
                    value={count}
                    onChange={(e) => setCount(parseInt(e.target.value) || 20)}
                    placeholder="Count"
                    disabled={isGenerating}
                />
            </div>
            <button 
                className={`${styles.btn} ${styles.btnAi}`}
                onClick={generateFlashcards}
                disabled={isGenerating}
            >
                {isGenerating ? `Generating ${count} cards...` : 'Generate Flashcards'}
            </button>
            <div style={{ fontSize: '0.9em', opacity: 0.9, marginTop: '10px' }}>
                Examples: "Spanish vocabulary", "Chemistry", "History facts"
            </div>
            
            {errorMessage && (
                <div className={`${styles.errorMessage} ${styles.show}`}>
                    {errorMessage}
                </div>
            )}
            {successMessage && (
                <div className={`${styles.successMessage} ${styles.show}`}>
                    {successMessage}
                </div>
            )}
        </div>
    );
}