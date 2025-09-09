// src/layouts/Layouts.jsx
import { useEffect, useState, useCallback } from "react";
import styles from "@/assets/scss/Layouts.module.scss";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import Navbar from "../components/Navbars/Navbar";
import { useDashboardDataContext } from "../context/dashboardDataContext";
import PermissionCheck from "../components/PermissionCheck";
import LanguageSwitcher from "../components/LanguageSwitcher";
import i18n from "../i18n";
import {
  Logo,
  Menu,
  MenuItem,
  SearchBar,
  Sidebar,
  SidenavUser,
  SubMenu,
} from "../components/Sidebar/Sidebar";
import userImg from "../assets/image/admin.jpg";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { getMenuItems } from "../config/menuConfig";

const Layouts = () => {
  const [user, setUser] = useState(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { sidebarMini } = useDashboardDataContext();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const location = useLocation();

  const menuItems = getMenuItems(t); // dynamic menu config
  const isRTL = i18n.dir() === "rtl";

  useEffect(() => {
    const storedUser = localStorage.getItem("USER_DATA");
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const token = localStorage.getItem("ACCESS_TOKEN");
      if (token) {
        await axios.delete("auth/remove-token", {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      localStorage.removeItem("ACCESS_TOKEN");
      localStorage.removeItem("USER_DATA");
      navigate("/login");
      setIsLoggingOut(false);
    }
  };

  /** Recursive renderer for tree menus */
  const renderMenuItems = useCallback(
    (items, level = 0) =>
      items.map((item, index) => {
        const isActive =
          item.route && location.pathname.startsWith(item.route);

        if (item.children && item.children.length > 0) {
          const hasActiveChild = item.children.some(
            (child) => child.route && location.pathname.startsWith(child.route)
          );

          return (
            <PermissionCheck key={index} permission={item.permission}>
              <SubMenu
                label={
                  <div
                    className={`${styles.submenu_label} ${
                      hasActiveChild ? styles.activeParent : ""
                    }`}
                    style={{ paddingLeft: `${level * 16}px` }} // indentation
                  >
                    <i className={item.icon}></i>
                    <span>{item.label}</span>
                  </div>
                }
                defaultOpen={hasActiveChild}
                rightIcon={
                  <i
                    className={`fa ${
                      hasActiveChild ? "fa-angle-down" : "fa-angle-right"
                    }`}
                  />
                }
              >
                {renderMenuItems(item.children, level + 1)}
              </SubMenu>
            </PermissionCheck>
          );
        }

        return (
          <PermissionCheck key={index} permission={item.permission}>
            <MenuItem
              routeLink={item.route}
              className={`${isActive ? styles.activeMenuItem : ""}`}
              style={{ paddingLeft: `${level * 16 + 24}px` }} // extra indent for children
            >
              <i className={item.icon}></i>
              <span>{item.label}</span>
            </MenuItem>
          </PermissionCheck>
        );
      }),
    [location.pathname]
  );

  return (
    <div
      className={`${styles.layout_wrapper} ${isRTL ? styles.rtl : ""}`}
      dir={i18n.dir()}
    >
      <LanguageSwitcher />
      <Sidebar>
        <Logo>
          <Link to="/">
            <img
              className="mini-logo"
              data-logo="mini-logo"
              src="/logoColored.png"
              alt="logo"
            />
            <img
              className="logo"
              data-logo="logo"
              src="/logoColored.png"
              alt="logo"
            />
          </Link>
        </Logo>

        <SearchBar />

        <Menu>
          {renderMenuItems(menuItems)}
          <MenuItem>
            <i className="fa fa-sign-out" />
            <span
              style={{ color: "white", cursor: "pointer" }}
              onClick={!isLoggingOut ? handleLogout : undefined}
            >
              {isLoggingOut ? t("logging_out") : t("logout")}
            </span>
          </MenuItem>
        </Menu>

        <SidenavUser
          userImg={userImg}
          userName={user?.name}
          userEmail={user?.email}
        />
      </Sidebar>

      <div
        className={`${styles.content} p-4`}
        style={{
          width: sidebarMini ? "calc(100% - 80px)" : "calc(100% - 280px)",
        }}
      >
        <div style={{ textAlign: isRTL ? "right" : "left" }}>
          <Navbar />
        </div>
        <Outlet />
      </div>
    </div>
  );
};

export default Layouts;
