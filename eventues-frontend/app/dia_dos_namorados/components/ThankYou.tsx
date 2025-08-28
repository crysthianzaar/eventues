"use client";

import { useEffect, useState } from 'react';
import styles from '../styles/ThankYou.module.css';

export default function ThankYou() {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    // Show with a slight delay for animation purposes
    const timeout = setTimeout(() => {
      setIsVisible(true);
    }, 500);
    
    return () => clearTimeout(timeout);
  }, []);
  
  return (
    <div className={styles.thankYouContainer}>
      {isVisible && (
        <div className={styles.thankYouContent}>
          {/* Background glow effect */}
          <div className={styles.glowEffect}></div>
          
          {/* Decorative top element */}
          <div className={styles.decorativeTop}></div>
          
          {/* Main heading */}
          <h2 className={styles.thankYouHeading}>Obrigado por Aceitar!</h2>
          
          {/* Decorative divider */}
          <div className={styles.divider}></div>
          
          {/* Thank you message */}
          <div className={styles.thankYouMessage}>
            <p>
              Sua coragem em aceitar esta missão não passará despercebida. 
              A recompensa que você recebeu é apenas uma pequena demonstração 
              do valor que você tem em nossa aventura juntos.
            </p>
            <p>
              <span className={styles.heartIcon}>❤️</span> 
              Feliz Dia dos Namorados 
              <span className={styles.heartIcon}>❤️</span>
            </p>
            <p>
              Esta jornada está apenas começando, e muitas outras missões 
              e tesouros nos esperam no horizonte.
            </p>
          </div>
          
          {/* Special message with glow effect */}
          <div className={styles.specialMessage}>
            Para a melhor companheira de aventuras que eu poderia desejar!
          </div>
          
          {/* Signature */}
          <div className={styles.signature}>
            Com todo meu amor,<br />
            Seu aventureiro
          </div>
        </div>
      )}
    </div>
  );
}
