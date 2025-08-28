"use client";

import { useEffect, useRef } from "react";
import styles from "../styles/StoryScroll.module.css";

export default function StoryScroll() {
  const storyRef = useRef<HTMLDivElement>(null);
  
  // Animation for scroll reveal
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add(styles.visible);
          }
        });
      },
      {
        root: null,
        threshold: 0.1,
      }
    );
    
    const storyElements = document.querySelectorAll(`.${styles.storyItem}`);
    storyElements.forEach(element => observer.observe(element));
    
    return () => {
      storyElements.forEach(element => observer.unobserve(element));
    };
  }, []);
  
  return (
    <div className={styles.storyScroll} ref={storyRef}>
      <div className={styles.storyContainer}>
        <h2 className={styles.storyTitle}>Nossa História</h2>
        
        {/* Customize these sections with your actual story */}
        <div className={styles.storyItem}>
          <div className={styles.chapter}>Capítulo 1</div>
          <h3 className={styles.eventTitle}>O Encontro Inicial</h3>
          <p className={styles.storyText}>
            <span className={styles.firstLetter}>E</span>m um reino não tão distante, dois aventureiros se encontraram pela primeira vez. 
            O destino havia tramado esse encontro por muito tempo, entrelaçando seus caminhos sem que soubessem.
            [Personalize esta parte com o início da sua história]
          </p>
        </div>
        
        <div className={styles.separator}>
          <div className={styles.separatorIcon}></div>
        </div>
        
        <div className={styles.storyItem}>
          <div className={styles.chapter}>Capítulo 2</div>
          <h3 className={styles.eventTitle}>A Primeira Aventura</h3>
          <p className={styles.storyText}>
            <span className={styles.firstLetter}>J</span>untos, embarcaram em sua primeira missão. O que parecia ser uma simples jornada 
            revelou-se como o início de algo muito maior. A sincronização de seus passos já demonstrava a parceria que estava por vir.
            [Personalize esta parte com o desenvolvimento da sua história]
          </p>
        </div>
        
        <div className={styles.separator}>
          <div className={styles.separatorIcon}></div>
        </div>
        
        <div className={styles.storyItem}>
          <div className={styles.chapter}>Capítulo 3</div>
          <h3 className={styles.eventTitle}>Desafios e Conquistas</h3>
          <p className={styles.storyText}>
            <span className={styles.firstLetter}>C</span>omo todo bom RPG, a jornada não foi sem obstáculos. Juntos, enfrentaram raids difíceis e chefes intimidadores. 
            Cada vitória fortaleceu a aliança entre vocês, tornando-os invencíveis quando unidos.
            [Personalize esta parte com os desafios que superaram juntos]
          </p>
        </div>
        
        <div className={styles.separator}>
          <div className={styles.separatorIcon}></div>
        </div>
        
        <div className={styles.storyItem}>
          <div className={styles.chapter}>Capítulo Atual</div>
          <h3 className={styles.eventTitle}>Uma Aliança Inabalável</h3>
          <p className={styles.storyText}>
            <span className={styles.firstLetter}>H</span>oje, a aliança entre vocês é mais forte do que nunca. Como companheiros de jornada, 
            enfrentam cada nova fase lado a lado, construindo uma história digna das lendas mais épicas.
            [Personalize esta parte com o momento atual do relacionamento]
          </p>
        </div>
      </div>
    </div>
  );
}
