"use client";

import { useState } from "react";
import styles from "../styles/QuestLetter.module.css";

interface QuestLetterProps {
  onAccept: () => void;
}

export default function QuestLetter({ onAccept }: QuestLetterProps) {
  const [hover, setHover] = useState(false);
  
  return (
    <div className={styles.questContainer}>
      <div 
        className={styles.questParchment}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        <div className={styles.questIcon}>!</div>
        
        <div className={styles.questContent}>
          <h2 className={styles.questTitle}>Uma Jornada de Companheirismo</h2>
          
          <div className={styles.questDescription}>
            <p>Aventureira,</p>
            <p>Ao longo de nossa jornada juntos, você provou ser uma aliada leal e uma companheira incrível. Sua coragem, carinho e bondade tornaram cada aventura mais especial.</p>
            <p>Esta missão é um pequeno agradecimento por todos os momentos que compartilhamos e por fazer da minha vida um lugar mais mágico.</p>
            <p>Aceitas continuar esta jornada e receber uma pequena recompensa por todo seu companheirismo?</p>
          </div>
          
          <div className={styles.questRewards}>
            <h3>Recompensas:</h3>
            <div className={styles.rewardItem}>
              <div className={styles.rewardIcon}>?</div>
              <span>Item Misterioso</span>
            </div>
            <div className={styles.rewardItem}>
              <div className={styles.rewardIcon}>❤️</div>
              <span>+100 Pontos de Afeto</span>
            </div>
          </div>
          
          <div className={styles.questActions}>
            <button 
              className={`${styles.questButton} ${styles.acceptButton} ${hover ? styles.hover : ""}`} 
              onClick={onAccept}
            >
              Aceitar
            </button>
            <button className={`${styles.questButton} ${styles.declineButton}`}>
              Recusar
            </button>
          </div>
        </div>
        
        <div className={styles.questSeal}></div>
      </div>
    </div>
  );
}
