import React from 'react';
import Navbar from './Navbar';
import Hero from './Hero';
import Filters from './Filters';
import Events from './Events';
import FAQ from './FAQ';
import Footer from './Footer';
import MyAuthenticator from './MyAuthenticator';

const App: React.FC = () => {
  return (
    <MyAuthenticator>
      <Navbar />
      <Hero />
      <Filters />
      <Events />
      <FAQ />
      <Footer />
    </MyAuthenticator>
  );
};

export default App;
