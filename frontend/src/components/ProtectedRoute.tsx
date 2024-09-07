import React from "react";
import { Navigate } from "react-router-dom";
import { useAuthenticator } from "@aws-amplify/ui-react";

interface ProtectedRouteProps {
  element: React.ReactElement;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ element }) => {
  const { user } = useAuthenticator((context) => [context.user]);
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return element;
};

export default ProtectedRoute;
