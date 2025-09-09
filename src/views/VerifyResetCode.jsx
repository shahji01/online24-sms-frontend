import { useEffect, useState, useCallback } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Swal from "sweetalert2";
import Cookies from "js-cookie";
import axios from "../Utils/axios";
import styles from "@/assets/scss/Authentication.module.scss";
import { useTranslation } from "react-i18next";
import i18n from "../i18n";
import LanguageSwitcher from "../components/LanguageSwitcher";

const RTL_LANGS = ["ar", "ur", "hi"];

const VerifyResetCode = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  const queryEmail = new URLSearchParams(location.search).get("email");
  const stateEmail = location.state?.email || "";
  const [form, setForm] = useState({
    email: stateEmail || queryEmail || "",
    code: "",
  });
  const [loading, setLoading] = useState(false);

  const changeLanguage = useCallback((lang) => {
    i18n.changeLanguage(lang);
    Cookies.set("lang", lang);
    document.body.dir = RTL_LANGS.includes(lang) ? "rtl" : "ltr";
  }, []);

  useEffect(() => {
    changeLanguage(Cookies.get("lang") || "en");
  }, [changeLanguage]);

  // Redirect if email missing
  useEffect(() => {
    if (!form.email) {
      Swal.fire({
        icon: "warning",
        title: t("email_required"),
        text: t("please_enter_email_again"),
      });
      navigate("/forgot-password");
    }
  }, [form.email, navigate, t]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.public.post("auth/verify-reset-code", {
        email: form.email,
        code: form.code,
      });

      Swal.fire({
        icon: "success",
        title: t("success"),
        text: t("code_verified"),
        timer: 2000,
        showConfirmButton: false,
      });

      navigate("/reset-password", { state: { email: form.email } });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: t("verification_failed"),
        text: err?.response?.data?.message || t("verify_failed"),
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
              <strong>{t("verify_reset_code")}</strong>
              <LanguageSwitcher />
            </div>

            <div className={`${styles.card_body} card-body`}>
              <form onSubmit={handleSubmit}>
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

                {/* Reset Code Field */}
                <div className="input-group mb-3">
                  <span className="input-group-text">
                    <i className="fa fa-key"></i>
                  </span>
                  <input
                    type="number"
                    name="code"
                    className="form-control"
                    placeholder={t("enter_reset_code")}
                    value={form.code}
                    onChange={handleChange}
                    required
                    min="0"
                    pattern="\d*"
                  />
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  className="btn btn-primary w-100 mb-3"
                  disabled={loading}
                >
                  {loading ? t("verifying") : t("verify_code")}
                </button>

                {/* Back to Login */}
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

export default VerifyResetCode;
