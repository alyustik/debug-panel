import styles from './Copyright.module.scss';

function Copyright() {
  return (
    <div className={styles.root}>
      Draw the Space by{' '}
      <a href="https://www.basedesign.com/" target="_blank" rel="noopener noreferrer">
        Base Design
      </a>
    </div>
  );
}

export { Copyright };
