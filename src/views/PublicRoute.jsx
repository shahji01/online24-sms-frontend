// components/PublicRoute.js
import React from "react";
import { Navigate } from "react-router-dom";
import { isAuthenticated } from "../Utils/auth";

const PublicRoute = ({ children }) => {
  return isAuthenticated() ? <Navigate to="/dashboard" /> : children;
};

export default PublicRoute;
