import { useEffect, useRef, useState } from "react";
import { useDashboardDataContext } from "@/context/dashboardDataContext";
import styles from "@/assets/scss/Navbar.module.scss";

const Navbar = () => {
  const [openNotification, setOpenNotification] = useState(false);
  const [openMessage, setOpenMessage] = useState(false);
  const [openUser, setOpenUser] = useState(false);
  const { sidebarMini, setSidebarMini } = useDashboardDataContext();

  const dropRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      // ✅ Close only dropdowns, not sidebar
      if (dropRef.current && !dropRef.current.contains(e.target)) {
        setOpenNotification(false);
        setOpenMessage(false);
        setOpenUser(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={styles.navbars_wrapper}>
      <div className="d-flex align-items-center justify-content-between">
        <div className="d-flex align-items-center gap-3">
          {/* ✅ Sidebar will toggle only on button click */}
          <button
            type="button"
            className={`${styles.minimize_btn} ${
              sidebarMini ? styles.minimize_active : ""
            }`}
            onClick={() => setSidebarMini((prev) => !prev)}
          >
            <span></span>
            <span className={styles.toggle_effect}></span>
            <span></span>
          </button>
        </div>

        {/* ✅ Dropdown container ref */}
        <ul ref={dropRef}>
          {/* DarkMode, Notifications, Messages, User etc. */}
        </ul>
      </div>
    </div>
  );
};

export default Navbar;
