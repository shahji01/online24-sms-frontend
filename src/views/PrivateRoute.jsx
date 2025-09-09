// components/PrivateRoute.js
import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { isAuthenticated } from "../Utils/auth";

const PrivateRoute = ({ children }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  // If children are passed (like <PrivateRoute><Dashboard /></PrivateRoute>), render them.
  // Otherwise, default to <Outlet /> (for nested routes).
  return children ? children : <Outlet />;
};

export default PrivateRoute;
