import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuthenticator } from "@aws-amplify/ui-react";

interface ProtectedRouteProps {
  element: React.ReactElement;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ element }) => {
  const { user } = useAuthenticator((context) => [context.user]);
  const location = useLocation();

  if (!user) {
    console.log('from em ProtectedRoute:', location.pathname);
    localStorage.setItem('from', location.pathname);
    return <Navigate to="/login" replace />;
  }
  return element;
};

export default ProtectedRoute;
