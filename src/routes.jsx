import React from "react";
import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import PermissionCheck from "./components/PermissionCheck";

// Route Wrappers
import PrivateRoute from "./views/PrivateRoute";
import PublicRoute from "./views/PublicRoute";

// Layout
import Layouts from "./layouts/Layouts";

// Core
import Dashboard from "./views/Dashboard";
import Login from "./views/Login";
import DatabaseTablesList from "./views/Modules/DatabaseTables/DatabaseTablesList";


// Users Portal
import Users from "./views/Modules/UsersPortal/Users";
import AssignRoles from "./views/Modules/UsersPortal/AssignRoles";
import AssignPermissions from "./views/Modules/UsersPortal/AssignPermissions";
import Permissions from "./views/Modules/UsersPortal/Permissions";
import Roles from "./views/Modules/UsersPortal/Roles";
import ForgetPassword from "./views/ForgetPassword";
import ResetPassword from "./views/ResetPassword";
import VerifyResetCode from "./views/VerifyResetCode";
import withSpecialPassword from "./withSpecialPassword";
import ActivityLogs from "./views/Modules/ActivityLogs";
import Schools from "./views/Modules/Schools";
const ProtectedDatabaseTables = withSpecialPassword(DatabaseTablesList);

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/forgot-password" element={<PublicRoute><ForgetPassword /></PublicRoute>} />
      <Route path="/reset-password" element={<PublicRoute><ResetPassword /></PublicRoute>} />
      <Route path="/verify-reset-code" element={<PublicRoute><VerifyResetCode /></PublicRoute>} />

      {/* Private Routes inside Layout */}
      <Route
        element={
          <PrivateRoute>
            <Layouts />
          </PrivateRoute>
        }
      >
        {/* Core */}
        <Route path="/schools" element={<PermissionCheck permission={["schools",1]}><Schools /></PermissionCheck>} />
        <Route path="/dashboard" element={<PermissionCheck permission={["dashboard",1]}><Dashboard /></PermissionCheck>} />
        <Route path="/database-tables" element={<PermissionCheck permission={["database-tables",1]}><ProtectedDatabaseTables /></PermissionCheck>} />
        <Route path="/activity-logs" element={<PermissionCheck permission={["activity-logs",1]}><ActivityLogs /></PermissionCheck>} />
        

        {/* Users Portal */}
        <Route path="/users" element={<PermissionCheck permission={["users",1]}><Users /></PermissionCheck>} />
        <Route path="/roles" element={<PermissionCheck permission={["roles",1]}><Roles /></PermissionCheck>} />
        <Route path="/permissions" element={<PermissionCheck permission={["permissions",1]}><Permissions /></PermissionCheck>} />
        <Route path="/assign-roles" element={<PermissionCheck permission={["assign-roles",1]}><AssignRoles /></PermissionCheck>} />
        <Route path="/assign-permissions" element={<PermissionCheck permission={["assign-permissions",1]}><AssignPermissions /></PermissionCheck>} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
};

export default AppRoutes;
