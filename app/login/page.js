'use client';

import React, { useState } from 'react';
import LoginBackground from '../../components/login/LoginBackground';
import LoginCard from '../../components/login/LoginCard';
import styles from '../../components/login/Login.module.css';

export default function LoginPage() {
  const [isDark, setIsDark] = useState(true);

  return (
    <main className={`${styles.container} ${isDark ? '' : styles.lightTheme}`}>
      <LoginBackground isDark={isDark} />
      <LoginCard isDark={isDark} onToggleTheme={() => setIsDark(!isDark)} />
    </main>
  );
}
