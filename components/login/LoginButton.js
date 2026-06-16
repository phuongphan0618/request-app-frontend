import React from 'react';
import styles from './Login.module.css';

export default function LoginButton({ label, onClick, disabled, loading }) {
  return (
    <button
      type="submit"
      onClick={onClick}
      disabled={disabled || loading}
      className={styles.button}
    >
      {loading ? 'Đang xác thực...' : label}
    </button>
  );
}
