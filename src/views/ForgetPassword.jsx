import { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import Cookies from "js-cookie";
import axios from "../Utils/axios";
import styles from "@/assets/scss/Authentication.module.scss";
import { useTranslation } from "react-i18next";
import i18n from "../i18n";
import LanguageSwitcher from "../components/LanguageSwitcher";

const RTL_LANGS = ["ar", "ur", "hi"];

const ForgetPassword = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  // Centralized language change function
  const changeLanguage = useCallback((lang) => {
    i18n.changeLanguage(lang);
    Cookies.set("lang", lang);
    document.body.dir = RTL_LANGS.includes(lang) ? "rtl" : "ltr";
  }, []);

  // Load saved language on mount
  useEffect(() => {
    changeLanguage(Cookies.get("lang") || "en");
  }, [changeLanguage]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.public.post("auth/forgot-password", { email });

      Swal.fire({
        icon: "success",
        title: t("success"),
        text: t("reset_link_sent"),
        timer: 2000,
        showConfirmButton: false,
      });

      navigate("/verify-reset-code", { state: { email } });
    } catch {
      Swal.fire({
        icon: "error",
        title: t("error"),
        text: t("reset_link_failed"),
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
              <strong>{t("forgot_password")}</strong>
              <LanguageSwitcher />
            </div>

            <div className={`${styles.card_body} card-body`}>
              <form onSubmit={handleSubmit}>
                <div className="input-group mb-3">
                  <span className="input-group-text">
                    <i className="fa fa-envelope"></i>
                  </span>
                  <input
                    type="email"
                    className="form-control"
                    placeholder={t("enter_email")}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary w-100 mb-3"
                  disabled={loading}
                >
                  {loading ? t("sending") : t("send_reset_link")}
                </button>

                <div className="text-center">
                  <Link to="/" className="text-decoration-none">
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

export default ForgetPassword;
