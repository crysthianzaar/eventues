"use client";

import { useState } from 'react';
import styles from '../styles/TreasureChest.module.css';

interface TreasureChestProps {
  onOpen: () => void;
  isOpen: boolean;
}

export default function TreasureChest({ onOpen, isOpen }: TreasureChestProps) {
  const [isUnwrapping, setIsUnwrapping] = useState(false);
  const [showPrompt, setShowPrompt] = useState(true);
  
  const handleChestClick = () => {
    if (isOpen) return;
    
    // First unwrap the ribbon
    if (!isUnwrapping) {
      setIsUnwrapping(true);
      setShowPrompt(false);
      
      // After ribbon animation, trigger the chest open callback
      setTimeout(() => {
        onOpen();
      }, 1000);
    }
  };
  
  return (
    <div className={styles.treasureContainer}>
      <div 
        className={`${styles.chestWrapper} ${isUnwrapping ? styles.unwrapping : ''} ${isOpen ? styles.chestOpen : ''}`}
        onClick={handleChestClick}
        role="button"
        tabIndex={0}
        aria-label="Baú do tesouro. Clique para abrir."
      >
        {/* Light rays effect when chest opens */}
        <div className={styles.lightRays}></div>
        
        {/* Glow effect around the chest */}
        <div className={styles.glow}></div>
        
        {/* The chest box - using CSS instead of images */}
        <div className={styles.chestBox}></div>
        
        {/* The chest lid that opens - using CSS instead of images */}
        <div className={styles.chestLid}></div>
        
        {/* Ribbon decorations - using CSS instead of images */}
        <div className={styles.ribbonContainer}>
          <div className={styles.ribbon}>
            <div className={styles.ribbonLeft}></div>
            <div className={styles.ribbonRight}></div>
            <div className={styles.ribbonKnot}></div>
          </div>
        </div>
      </div>
      
      {/* Click prompt that shows only before unwrapping */}
      {showPrompt && !isUnwrapping && !isOpen && (
        <div className={styles.prompt}>
          Clique no baú lendário para desembrulhar seu presente!
        </div>
      )}
    </div>
  );
}
