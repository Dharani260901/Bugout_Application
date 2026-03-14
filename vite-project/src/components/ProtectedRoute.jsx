import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const token = localStorage.getItem("accessToken");

  console.log("Access token:", token);
  console.log("Token exists:", !!token);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}