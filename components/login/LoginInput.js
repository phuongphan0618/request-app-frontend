import React from 'react';
import styles from './Login.module.css';

export default function LoginInput({ label, type = 'text', value, onChange }) {
  return (
    <div className={styles.inputGroup}>
      <input
        type={type}
        className={styles.input}
        value={value}
        onChange={onChange}
        placeholder=" " // Crucial placeholder for CSS floating label selector (:placeholder-shown)
        required
      />
      <label className={styles.label}>{label}</label>
    </div>
  );
}
