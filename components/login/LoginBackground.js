'use client';

import React, { useMemo } from 'react';
import styles from './Login.module.css';

export default function LoginBackground({ isDark }) {
  // Generate random properties for stars once so they are stable
  const stars = useMemo(() => {
    return Array.from({ length: 80 }).map((_, i) => ({
      id: i,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      size: `${Math.random() * 2 + 1}px`, // 1px to 3px
      delay: `${Math.random() * 5}s`,
      duration: `${Math.random() * 3 + 2}s`, // 2s to 5s
      // Blend white stars and soft lavender stars
      color: Math.random() > 0.6 ? 'var(--color-purple-light)' : '#ffffff',
    }));
  }, []);

  return (
    <>
      {/* Nebulae (Shifting Cosmic Glowing Blobs) */}
      <div className={styles.ambientBlob1} />
      <div className={styles.ambientBlob2} />
      <div className={styles.ambientBlob3} />

      {/* Starry Sky - Only renders in Dark Mode */}
      {isDark && (
        <div className={styles.starsContainer}>
          {stars.map((star) => (
            <div
              key={star.id}
              className={styles.star}
              style={{
                top: star.top,
                left: star.left,
                width: star.size,
                height: star.size,
                backgroundColor: star.color,
                animationDelay: star.delay,
                animationDuration: star.duration,
              }}
            />
          ))}
        </div>
      )}
    </>
  );
}
