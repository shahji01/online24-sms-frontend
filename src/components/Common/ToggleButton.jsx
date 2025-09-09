import React from "react";
import { Button } from "react-bootstrap";
import { FaToggleOn, FaToggleOff, FaEyeSlash, FaEye } from "react-icons/fa";
import Swal from "sweetalert2";
import { useTranslation } from "react-i18next";
import axios from "../../Utils/axios";

const ToggleButton = ({ 
  row,
  value,
  type = "status",
  route,
  permission,
  onSuccess
}) => {
  const { t, i18n } = useTranslation();

  const handleToggle = async () => {
    try {
      await axios.protected.patch(
        `${route}/toggle/${type}/${value}`,
        {},
        { headers: { "Accept-Language": i18n.language || "ar" } }
      );
      Swal.fire(t("success"), t(`${type}_updated`), "success");
      if (onSuccess) onSuccess();
    } catch {
      Swal.fire(t("error"), t("update_failed"), "error");
    }
  };

  if (type === "status") {
    return (
      <Button
        variant={row.status === 1 ? "warning" : "success"}
        size="sm"
        onClick={handleToggle}
      >
        {row.status === 1 ? <FaToggleOff /> : <FaToggleOn />}
      </Button>
    );
  }

  if (type === "publish") {
    return (
      <Button
        variant={row.publish === 1 ? "secondary" : "success"}
        size="sm"
        onClick={handleToggle}
      >
        {row.publish === 1 ? <FaEyeSlash /> : <FaEye />}
      </Button>
    );
  }

  return null;
};

export default ToggleButton;
