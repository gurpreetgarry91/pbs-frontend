import React from "react";
import { Navigate, useLocation } from "react-router";
import { useAuth } from "../../context/AuthContext";

const RequireAuth: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const auth = useAuth();
  const location = useLocation();

  if (!auth.isAuthenticated) {
    // Redirect to sign-in (root path), preserve attempted location
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return children;
};

export default RequireAuth;
