import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import axios from "../../../Utils/axios";
import { useTranslation } from "react-i18next";
import SchoolForm from "./SchoolForm";

const SchoolHandler = ({ show, onClose, fetchList, data = null }) => {
  const { t, i18n } = useTranslation();
  const isEditMode = Boolean(data);

  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [contactNo, setContactNo] = useState("");
  const [adminEmail, setAdminEmail] = useState("");

  useEffect(() => {
    if (data) {
      setName(data.name || "");
      setAddress(data.address || "");
      setContactNo(data.contact_no || "");
      setAdminEmail(data.admin_email || ""); // if editing, may not exist
    } else {
      setName("");
      setAddress("");
      setContactNo("");
      setAdminEmail("");
    }
  }, [data, show]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim() || !address.trim() || !contactNo.trim() || !adminEmail.trim()) {
      return Swal.fire(t("validation_error"), t("all_fields_required"), "warning");
    }

    setLoading(true);
    try {
      const payload = {
        name: name.trim(),
        address: address.trim(),
        contact_no: contactNo.trim(),
        admin_email: adminEmail.trim(),
      };

      const endpoint = isEditMode ? `schools/update-school/${data.id}` : "schools/add-school";
      const method = isEditMode ? "put" : "post";

      const res = await axios.protected[method](endpoint, payload, {
        headers: { "Accept-Language": i18n.language || "en" },
      });

      if (res.data.status) {
        Swal.fire(t("success"), res.data.message, "success");
        // If create call returned credentials (only on add), show them
        if (!isEditMode && res.data.data?.credentials) {
          const { email, password } = res.data.data.credentials;
          Swal.fire({
            title: t("school_account_created"),
            html: `<p>${t("login_email")}: <strong>${email}</strong></p>
                   <p>${t("login_password")}: <strong>${password}</strong></p>
                   <p class="text-muted small">${t("advise_change_password")}</p>`,
            icon: "info",
          });
        }
        fetchList();
        onClose();
      } else {
        throw new Error(res.data.message || t("operation_failed"));
      }
    } catch (error) {
      Swal.fire(t("error"), error.response?.data?.message || error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SchoolForm
      show={show}
      onClose={onClose}
      onSubmit={handleSubmit}
      loading={loading}
      name={name}
      setName={setName}
      address={address}
      setAddress={setAddress}
      contactNo={contactNo}
      setContactNo={setContactNo}
      adminEmail={adminEmail}
      setAdminEmail={setAdminEmail}
      modalType={isEditMode ? "edit" : "add"}
    />
  );
};

export default SchoolHandler;
