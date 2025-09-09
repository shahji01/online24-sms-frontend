import { useEffect, useState, useCallback } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import Swal from "sweetalert2";
import Cookies from "js-cookie";
import axios from "../Utils/axios";
import styles from "@/assets/scss/Authentication.module.scss";
import { useTranslation } from "react-i18next";
import i18n from "../i18n";
import LanguageSwitcher from "../components/LanguageSwitcher";

const RTL_LANGS = ["ar", "ur", "hi"];

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  const stateEmail = location.state?.email || "";
  const [form, setForm] = useState({
    email: stateEmail,
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);

  // Centralized language change
  const changeLanguage = useCallback((lang) => {
    i18n.changeLanguage(lang);
    Cookies.set("lang", lang);
    document.body.dir = RTL_LANGS.includes(lang) ? "rtl" : "ltr";
  }, []);

  // Load saved language
  useEffect(() => {
    changeLanguage(Cookies.get("lang") || "en");
  }, [changeLanguage]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleReset = async (e) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      Swal.fire({
        icon: "error",
        title: t("password_mismatch"),
        text: t("confirm_password_mismatch"),
      });
      return;
    }

    setLoading(true);
    try {
      await axios.public.post("/auth/reset-password", {
        email: form.email,
        newPassword: form.password,
        confirmPassword: form.confirmPassword,
      });

      Swal.fire({
        icon: "success",
        title: t("password_reset_success"),
        text: t("password_reset_done"),
        timer: 2000,
        showConfirmButton: false,
      });

      navigate("/login");
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: t("reset_failed"),
        text: err?.response?.data?.message || t("reset_failed_msg"),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`${styles.auth_wrapper} d-flex align-items-center justify-content-center vh-100`}>
      <div className="row w-100 justify-content-center align-items-center">
        <div className="col-md-10 col-lg-6 col-xl-4">
          <div className={`${styles.card} card rounded shadow-sm`}>
            <div className={`${styles.card_header} card-header d-flex justify-content-between align-items-center`}>
              <strong>{t("reset_password")}</strong>
              <LanguageSwitcher />
            </div>

            <div className={`${styles.card_body} card-body`}>
              <form onSubmit={handleReset}>
                {/* Email Field */}
                <div className="input-group mb-3">
                  <span className="input-group-text">
                    <i className="fa fa-envelope"></i>
                  </span>
                  <input
                    type="email"
                    name="email"
                    className="form-control"
                    value={form.email}
                    disabled
                    readOnly
                  />
                </div>

                {/* New Password */}
                <div className="input-group mb-3">
                  <span className="input-group-text">
                    <i className="fa fa-lock"></i>
                  </span>
                  <input
                    type="password"
                    name="password"
                    className="form-control"
                    placeholder={t("enter_new_password")}
                    value={form.password}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Confirm Password */}
                <div className="input-group mb-3">
                  <span className="input-group-text">
                    <i className="fa fa-lock"></i>
                  </span>
                  <input
                    type="password"
                    name="confirmPassword"
                    className="form-control"
                    placeholder={t("enter_confirm_password")}
                    value={form.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  className="btn btn-success w-100 mb-3"
                  disabled={loading}
                >
                  {loading ? t("resetting") : t("reset_password")}
                </button>

                {/* Back Link */}
                <div className="text-center">
                  <Link to="/login" className="text-decoration-none">
                    {t("back_to_login")}
                  </Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
