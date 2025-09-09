import React from "react";
import { EntypoSprite } from "@entypo-icons/react";
import { DashboardDataProvider } from "@/context/dashboardDataContext";
import AppRoutes from "./routes";
import { PermissionProvider } from "./context/PermissionContext";

function App() {
  return (
    <div className="admin-container position-relative overflow-hidden">
      <PermissionProvider>
        <DashboardDataProvider>
          <EntypoSprite />
          <AppRoutes />
        </DashboardDataProvider>
      </PermissionProvider>
    </div>
  );
}

export default App;
