import React, { ReactNode } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./GeneralComponents/Navbar";
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

// Defina a interface para as props que o LayoutWithNavbar irá receber
interface LayoutWithNavbarProps {
  children: ReactNode;
}

const LayoutWithNavbar: React.FC<LayoutWithNavbarProps> = ({ children }) => {
  const location = useLocation();

  const hideNavbar = location.pathname.startsWith("/not_nav");

  return (
    <>
      {!hideNavbar && <Navbar />}
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
