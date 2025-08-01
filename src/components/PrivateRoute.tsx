import { type ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../features/auth/useAuth";

const PrivateRoute = ({ children }: { children: ReactNode }) => {
  const { currentUser } = useAuth();

  return currentUser ? children : <Navigate to="/login" replace />;
};

export default PrivateRoute;
