import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./Navbar";
import Hero from "./Hero";
import Filters from "./Filters";
import Events from "./Events";
import FAQ from "./FAQ";
import Footer from "./Footer";
import MyAuthenticator from "./MyAuthenticator";
import { Authenticator } from "@aws-amplify/ui-react";
import Callback from "./Callback";

const App: React.FC = () => {
  return (
    <Authenticator.Provider>
      <Router>
        <Navbar />
        <Routes>
          <Route
            path="/"
            element={
              <>
                <Hero />
                <Filters />
                <Events />
                <FAQ />
                <Footer />
              </>
            }
          />
          <Route path="/login" element={<MyAuthenticator />} />
          <Route path="/callback" element={<Callback />} />
        </Routes>
      </Router>
    </Authenticator.Provider>
  );
};

export default App;
