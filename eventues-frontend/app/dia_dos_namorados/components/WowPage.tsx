"use client";

import { useState, useEffect } from "react";
import styles from "../styles/WowPage.module.css";
import StoryScroll from "./StoryScroll";
import QuestLetter from "./QuestLetter";
import TreasureChest from "./TreasureChest";
import ConfettiExplosion from "./ConfettiExplosion";

export default function WowPage() {
  const [questAccepted, setQuestAccepted] = useState(false);
  const [showChest, setShowChest] = useState(false);
  const [showVoucher, setShowVoucher] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  // Optional WoW ambient music
  useEffect(() => {
    const backgroundMusic = new Audio("/dia_dos_namorados/sounds/wow-tavern-music.mp3");
    backgroundMusic.loop = true;
    backgroundMusic.volume = 0.2;
    
    if (audioEnabled) {
      backgroundMusic.play().catch(e => console.log("Audio playback prevented:", e));
    }
    
    return () => {
      backgroundMusic.pause();
      backgroundMusic.currentTime = 0;
    };
  }, [audioEnabled]);

  const handleAcceptQuest = () => {
    // Play quest accept sound
    if (audioEnabled) {
      const acceptSound = new Audio("/dia_dos_namorados/sounds/quest-accept.mp3");
      acceptSound.volume = 0.4;
      acceptSound.play().catch(e => console.log("Audio playback prevented:", e));
    }
    
    setQuestAccepted(true);
    
    // Show the treasure chest after a delay
    setTimeout(() => {
      setShowChest(true);
    }, 2000);
  };

  const handleOpenChest = () => {
    // Play chest opening sound
    if (audioEnabled) {
      const chestSound = new Audio("/dia_dos_namorados/sounds/chest-open.mp3");
      chestSound.volume = 0.4;
      chestSound.play().catch(e => console.log("Audio playback prevented:", e));
    }
    
    setShowVoucher(true);
    
    // Show confetti animation
    setShowConfetti(true);
    
    // Hide confetti after 6 seconds
    setTimeout(() => {
      setShowConfetti(false);
    }, 6000);
  };
  
  const handleShareOnWhatsapp = () => {
    const phoneNumber = "5527999346010"; // Formato: código do país (55) + DDD (27) + número
    const message = encodeURIComponent("Recebi um Voucher Lendário de 300 Reais! 🎮💰");
    const url = `https://api.whatsapp.com/send?phone=${phoneNumber}&text=${message}`;
    window.open(url, "_blank");
  };

  return (
    <div className={styles.container}>
      {/* Confetti explosion effect */}
      {showConfetti && <ConfettiExplosion />}
      
      {/* Audio toggle button */}
      <button 
        className={styles.audioButton} 
        onClick={() => setAudioEnabled(!audioEnabled)}
        aria-label={audioEnabled ? "Desativar música" : "Ativar música"}
      >
        {audioEnabled ? "🔊" : "🔇"}
      </button>
      
      {/* Main content */}
      <div className={styles.mainContent}>
        <header className={styles.header}>
          <img 
            src="title-banner.png" 
            alt="WORLD MABEL - O PENÚLTIMO DIA DOS NAMORADOS" 
            className={styles.titleBanner}
          />
        </header>
        
        {/* Story section with your relationship story */}
        <StoryScroll />
        
        {/* Quest letter that appears initially */}
        {!questAccepted && (
          <QuestLetter onAccept={handleAcceptQuest} />
        )}
        
        {/* Thank you message after accepting the quest */}
        {questAccepted && !showVoucher && (
          <div className={styles.thankYouMessage}>
            <div className={styles.achievementBox}>
              <h2>Missão Completa!</h2>
              <p>Obrigado por todo o companheirismo nessa jornada!</p>
              <p>Sua lealdade e carinho merecem uma recompensa especial...</p>
            </div>
          </div>
        )}
        
        {/* Treasure chest appears after accepting the quest */}
        {showChest && (
          <TreasureChest onOpen={handleOpenChest} isOpen={showVoucher} />
        )}
        
        {/* Voucher appears after opening the chest */}
        {showVoucher && (
          <div className={styles.voucherContainer}>
            <div className={styles.voucher}>
              <div className={styles.voucherInner}>
                <div className={styles.voucherHeader}>
                  <div className={styles.voucherCrest}></div>
                  <h3>Voucher Lendário</h3>
                </div>
                
                <div className={styles.voucherContent}>
                  <div className={styles.voucherAmount}>
                    <span className={styles.currencySymbol}>R$</span>
                    <span className={styles.amountValue}>300</span>
                  </div>
                  <p className={styles.voucherDescription}>Use este voucher para comprar o que você quiser!</p>
                  <div className={styles.voucherDecoration}></div>
                </div>
                
                <p className={styles.flavorText}>"Para a melhor companheira de aventuras que eu poderia desejar."</p>
                
                <button 
                  className={styles.shareButton} 
                  onClick={handleShareOnWhatsapp}
                >
                  <span className={styles.shareIcon}>💬</span>
                  Confirme aqui para receber o seu voucher!
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
