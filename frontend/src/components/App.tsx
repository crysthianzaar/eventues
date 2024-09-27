import React, { ReactNode } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./GeneralComponents/Navbar";
import NavbarBlog from "./Blog/NavbarBlog"; // Importa o NavbarBlog específico para o blog
import Hero from "./GeneralComponents/Hero";
import Filters from "./GeneralComponents/Filters";
import Events from "./GeneralComponents/Events";
import FAQ from "./FAQ";
import Footer from "./GeneralComponents/Footer";
import MyAuthenticator from "./MyAuthenticator";
import { Authenticator } from "@aws-amplify/ui-react";
import Callback from "./Callback";
import CreateEvent from "./CreateEvent";
import ProtectedRoute from "./ProtectedRoute";
import { Box } from "@mui/material";
import MyEvents from "./MyEvents";
import OrganizatorEventDetail from "./OrganizatorEventDetails/OrganizatorEventDetail";
import TermsOfService from "./GeneralComponents/TermsOfService";
import PrivacyPolicy from "./GeneralComponents/PrivacyPolicy";
import WhyChooseEventues from "./WhyChooseEventues";
import EventuesConnect from "./Blog/EventuesConnect";

// Defina a interface para as props que o LayoutWithNavbar irá receber
interface LayoutWithNavbarProps {
  children: ReactNode;
}

const LayoutWithNavbar: React.FC<LayoutWithNavbarProps> = ({ children }) => {
  const location = useLocation();
  const isBlogRoute = location.pathname.startsWith("/blog");

  return (
    <>
      {!isBlogRoute && <Navbar />}
      {isBlogRoute && <NavbarBlog />}
      
      <Box sx={{ flexGrow: 1, minHeight: 'calc(100vh - 120px)' }}>
        {children}
      </Box>
      <Footer />
    </>
  );
};

const App: React.FC = () => {
  return (
    <Authenticator.Provider>
      <Router>
        <LayoutWithNavbar>
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
            <Route path="/terms-of-service" element={<TermsOfService />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/seja_organizador" element={<WhyChooseEventues />} />
            <Route path="/blog" element={<EventuesConnect />} />
            <Route path="/callback" element={<Callback />} />
            <Route path="/criar_evento" element={<ProtectedRoute element={<CreateEvent />} />} />
            <Route path="/meus_eventos" element={<ProtectedRoute element={<MyEvents />} />} />
            <Route path="/event_detail/:event_id" element={<ProtectedRoute element={<OrganizatorEventDetail />} />} />
          </Routes>
        </LayoutWithNavbar>
      </Router>
    </Authenticator.Provider>
  );
};

export default App;
