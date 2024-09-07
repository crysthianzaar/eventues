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
import CreateEvent from "./CreateEvent";
import ProtectedRoute from "./ProtectedRoute";
import { Box } from "@mui/material";
import MyEvents from "./MyEvents";

const App: React.FC = () => {
  return (
    <Authenticator.Provider>
      <Router>
        <Navbar />
        <Box sx={{ flexGrow: 1, minHeight: 'calc(100vh - 120px)' }}>
          <Routes>
            <Route
              path="/"
              element={
                <>
                  <Hero />
                  <Filters />
                  <Events />
                  <FAQ />
                </>
              }
            />
            <Route path="/login" element={<MyAuthenticator />} />
            <Route path="/callback" element={<Callback />} />
            <Route path="/criar_evento" element={<ProtectedRoute element={<CreateEvent />} />} />
            <Route path="/meus_eventos" element={<ProtectedRoute element={<MyEvents />} />} />
          </Routes>
        </Box>
        <Footer />
      </Router>
    </Authenticator.Provider>
  );
};

export default App;
