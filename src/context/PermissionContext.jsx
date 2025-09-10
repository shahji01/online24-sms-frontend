import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import axios from "../Utils/axios";

const PermissionContext = createContext();

export const PermissionProvider = ({ children }) => {
  const [permissions, setPermissions] = useState([]);
  const [userEmail, setUserEmail] = useState("");
  const [userType, setUserType] = useState("");
  const [loading, setLoading] = useState(true);
  const fetchPermissions = useCallback(async () => {
    const token = localStorage.getItem("ACCESS_TOKEN");
    if (!token) return setLoading(false);

    try {
      const { data } = await axios.protected.get("/users/get-permission-user-wise", {
        headers: { Authorization: `Bearer ${token}` },
      });
      

      if (data?.status && data?.data) {
        const { seperatePermission = [], roles = [], email = "", type = "" } = data.data;
        setUserEmail(email);
        setUserType(type);
        const rolePermissions = roles.flatMap(r =>
          r.permissions?.map(p => p.permission_name) || []
        );
        const directPermissions = seperatePermission.map(p => p.permission_name);
        const uniquePermissions = [...new Set([...directPermissions, ...rolePermissions])];

        setPermissions(uniquePermissions);
      }
    } catch (error) {
      console.error("Failed to fetch permissions:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPermissions();
  }, [fetchPermissions]);

  const hasPermission = (perm) => {
    if (userType === 1 || userType === 2) return true; //Admin or School Admin
    return permissions.includes(perm);
  };

  return (
    <PermissionContext.Provider
      value={{
        permissions,
        hasPermission,
        loading,
        userType,
        refreshPermissions: fetchPermissions,

      }}
    >
      {children}
    </PermissionContext.Provider>
  );
};

export const usePermission = () => useContext(PermissionContext);
