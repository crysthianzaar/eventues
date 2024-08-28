import React from 'react';
import Navbar from './Navbar';
import Hero from './Hero';
import Filters from './Filters';
import Events from './Events';
import FAQ from './FAQ';
import Footer from './Footer';

const App: React.FC = () => {
  return (
    <div>
      <Navbar />
      <Hero />
      <Filters />
      <Events />
      <FAQ />
      <Footer />
    </div>
  );
};

export default App;
