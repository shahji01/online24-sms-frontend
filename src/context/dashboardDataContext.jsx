import { createContext, useContext, useEffect, useState } from "react";

export const DashboardDataCreateContext = createContext();

export const DashboardDataProvider = ({ children }) => {
  const [sidebarMini, setSidebarMini] = useState(true);
  const [isDark, setIsDark] = useState(false);
  const [isThemeDirection, setIsThemeDirection] = useState(false);

  // handle RTL/LTR direction
  useEffect(() => {
    document.body.setAttribute(
      "data-theme-direction",
      isThemeDirection ? "rtl" : "ltr"
    );
  }, [isThemeDirection]);

  // handle dark/light theme
  useEffect(() => {
    document.body.setAttribute("data-theme", isDark ? "dark" : "light");
  }, [isDark]);

  return (
    <DashboardDataCreateContext.Provider
      value={{
        sidebarMini,
        setSidebarMini, // ✅ FIXED (include setter)
        isDark,
        setIsDark,
        isThemeDirection,
        setIsThemeDirection,
      }}
    >
      {children}
    </DashboardDataCreateContext.Provider>
  );
};

export const useDashboardDataContext = () => {
  const context = useContext(DashboardDataCreateContext);
  if (!context) {
    throw new Error(
      "useDashboardDataContext must be used within DashboardDataProvider"
    );
  }
  return context;
};
