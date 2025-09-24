import styles from '../LoadingScreen.module.css';

export function Line() {
  return (
    <div className={styles.lineWrapper}>
      <div className={styles.lineCircle} />
      <div className={styles.line} />
    </div>
  );
}