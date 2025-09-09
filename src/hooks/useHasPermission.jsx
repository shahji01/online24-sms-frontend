// src/hooks/useHasPermission.jsx
import { usePermission } from "../context/PermissionContext";

const useHasPermission = (permission) => {
  const { hasPermission } = usePermission();
  return hasPermission(permission);
};

export default useHasPermission;
