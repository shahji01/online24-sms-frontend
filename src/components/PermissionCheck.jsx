// src/components/PermissionCheck.js
import React from "react";
import { usePermission } from "../context/PermissionContext";

const PermissionCheck = ({ permission, children, fallback = null }) => {
  const { hasPermission } = usePermission();

  const normalizedPermissions = Array.isArray(permission)
    ? permission.filter(p => typeof p === "string")
    : [permission].filter(p => typeof p === "string");

  const showFallbackMessage = Array.isArray(permission) && permission.includes(1);

  const isAuthorized = normalizedPermissions.some(p => hasPermission(p));

  if (isAuthorized) return children;

  if (showFallbackMessage) {
    return (
      fallback || (
        <div style={styles.fallback}>
          You don’t have permission to view this section.
        </div>
      )
    );
  }

  return null;
};

const styles = {
  fallback: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100%",
    minHeight: "300px",
    textAlign: "center",
    color: "#ff4d4f",
    fontWeight: "bold",
    fontSize: "18px",
  },
};

export default PermissionCheck;
