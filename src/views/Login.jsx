import { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import Cookies from "js-cookie";
import axios from "../Utils/axios";
import styles from "@/assets/scss/Authentication.module.scss";
import { useStateContext } from "../context/contextProvider";
import { useTranslation } from "react-i18next";
import i18n from "../i18n";
import LanguageSwitcher from "../components/LanguageSwitcher";

const RTL_LANGS = ["ar", "ur", "hi"];

const Login = () => {
  const navigate = useNavigate();
  const { setUser, setToken } = useStateContext();
  const { t } = useTranslation();

  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  // Centralized language change logic
  const changeLanguage = useCallback((lang) => {
    i18n.changeLanguage(lang);
    Cookies.set("lang", lang);
    document.body.dir = RTL_LANGS.includes(lang) ? "rtl" : "ltr";
  }, []);

  // Load saved language
  useEffect(() => {
    changeLanguage(Cookies.get("lang") || "en");
  }, [changeLanguage]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data } = await axios.public.post("auth/login", form);

      if (data.status) {
        const { access_token, user } = data.data;
        setToken(access_token);
        setUser(user);

        Swal.fire({
          icon: "success",
          title: t("login_success"),
          text: t("welcome_back", { name: user.name || "Admin" }),
          timer: 1500,
          showConfirmButton: false,
        });

        navigate("/dashboard");
        window.location.reload();
      } else {
        Swal.fire({
          icon: "error",
          title: t("invalid_credentials"),
          text: t("check_credentials"),
        });
      }
    } catch {
      Swal.fire({
        icon: "error",
        title: t("login_failed"),
        text: t("try_again"),
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
              <strong>{t("welcome")}</strong>
              <LanguageSwitcher />
            </div>

            <div className={`${styles.card_body} card-body`}>
              <form onSubmit={handleLogin}>
                <div className="input-group mb-3">
                  <span className="input-group-text">
                    <i className="fa fa-envelope" />
                  </span>
                  <input
                    type="email"
                    name="email"
                    className="form-control"
                    placeholder={t("email")}
                    value={form.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="input-group mb-3">
                  <span className="input-group-text">
                    <i className="fa fa-asterisk" />
                  </span>
                  <input
                    type="password"
                    name="password"
                    className="form-control"
                    placeholder={t("password")}
                    value={form.password}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary w-100 mb-3"
                  disabled={loading}
                >
                  {loading ? t("logging_in") : t("login")}
                </button>

                <div className="text-center">
                  <Link to="/forgot-password" className="text-decoration-none">
                    {t("forgot_password")}
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

export default Login;
