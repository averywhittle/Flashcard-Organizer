import { Stats } from '../types';
import styles from '../styles/Home.module.css';

interface ScoreDisplayProps {
    stats: Stats;
    show: boolean;
}

export default function ScoreDisplay({ stats, show }: ScoreDisplayProps) {
    const total = stats.correct + stats.incorrect;
    const accuracy = total > 0 ? Math.round((stats.correct / total) * 100) : 0;

    if (!show) {
        return null;
    }

    return (
        <div className={styles.scoreDisplay}>
            <div className={styles.scoreItem}>
                <div className={styles.scoreLabel}>Correct</div>
                <div className={styles.scoreValue}>{stats.correct}</div>
            </div>
            <div className={styles.scoreItem}>
                <div className={styles.scoreLabel}>Incorrect</div>
                <div className={styles.scoreValue}>{stats.incorrect}</div>
            </div>
            <div className={styles.scoreItem}>
                <div className={styles.scoreLabel}>Streak</div>
                <div className={styles.scoreValue}>{stats.streak}</div>
            </div>
            <div className={styles.scoreItem}>
                <div className={styles.scoreLabel}>Accuracy</div>
                <div className={styles.scoreValue}>{accuracy}%</div>
            </div>
        </div>
    );
}