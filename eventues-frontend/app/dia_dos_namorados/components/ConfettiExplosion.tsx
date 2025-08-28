"use client";

import { useEffect, useState } from 'react';
import styles from '../styles/ConfettiExplosion.module.css';

interface Confetti {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  rotation: number;
  speed: number;
}

export default function ConfettiExplosion() {
  const [confetti, setConfetti] = useState<Confetti[]>([]);
  
  useEffect(() => {
    // Colors themed for WoW: golds, purples, blues
    const colors = [
      '#FFC700', // Gold
      '#FFD700',
      '#9370DB', // Purple
      '#8A2BE2',
      '#4169E1', // Royal Blue
      '#1E90FF',
      '#FF7F50', // Coral
      '#F8F8FF', // White
    ];
    
    // Generate 100 confetti pieces
    const newConfetti: Confetti[] = [];
    for (let i = 0; i < 100; i++) {
      newConfetti.push({
        id: i,
        x: Math.random() * 100, // random position as percentage of container
        y: Math.random() * 100,
        size: Math.random() * 1 + 0.5, // between 0.5 and 1.5rem
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360, // random rotation in degrees
        speed: Math.random() * 3 + 2, // random animation speed
      });
    }
    
    setConfetti(newConfetti);
    
    // Clean up animation frames
    return () => {
      setConfetti([]);
    };
  }, []);
  
  return (
    <div className={styles.confettiContainer}>
      {confetti.map((piece) => (
        <div
          key={piece.id}
          className={styles.confettiPiece}
          style={{
            left: `${piece.x}%`,
            top: `${piece.y}%`,
            width: `${piece.size}rem`,
            height: `${piece.size}rem`,
            backgroundColor: piece.color,
            transform: `rotate(${piece.rotation}deg)`,
            animationDuration: `${piece.speed}s`,
          }}
        />
      ))}
    </div>
  );
}
