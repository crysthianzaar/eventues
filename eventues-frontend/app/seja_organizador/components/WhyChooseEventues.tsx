"use client";

import React from 'react';
import HeroSection from './sections/HeroSection';
import BenefitsSection from './sections/BenefitsSection';
import AboutSection from './sections/AboutSection';
import EconomyCalculator from './sections/EconomyCalculator';

const WhyChooseEventues: React.FC = () => {
  return (
    <>
      <HeroSection />
      <BenefitsSection />
      <AboutSection />
      <EconomyCalculator />
    </>
  );
};

export default WhyChooseEventues;
