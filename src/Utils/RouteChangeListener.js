// RouteChangeListener.js
import { useEffect } from "react";
import { useLocation, useNavigationType } from "react-router-dom";
import { saveScrollPosition } from "./scrollPositions";
// import { saveScrollPosition } from "../../Utils/scrollPositions";

const RouteChangeListener = () => {
  const location = useLocation();
  const navType = useNavigationType();

  useEffect(() => {
    return () => {
      // Only save when leaving the home page
      if (location.pathname === "/") {
        saveScrollPosition(location.pathname);
      }
    };
  }, [location]);

  return null;
};

export default RouteChangeListener;
