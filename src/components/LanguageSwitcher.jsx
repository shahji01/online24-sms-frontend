// src/components/LanguageSwitcher.jsx
import React, { useState, useEffect, useCallback } from "react";
import Cookies from "js-cookie";
import { useTranslation } from "react-i18next";
import Swal from "sweetalert2";
import axios from "../Utils/axios"; // adjust path if needed

const LanguageSwitcher = () => {
  const { i18n, t } = useTranslation();
  const [languages, setLanguages] = useState([]);

  const changeLanguage = (lang) => {
    Cookies.set("lang", lang);
    i18n.changeLanguage(lang);

    // Reload only if direction changes
    const rtlLangs = ["ar", "ur"];
    const currentDir = document.documentElement.dir;
    const newDir = rtlLangs.includes(lang) ? "rtl" : "ltr";
    if (currentDir !== newDir) {
      window.location.reload();
    }
  };

  const fetchLanguages = useCallback(async () => {
    try {
      const res = await axios.public.get("/languages", {
        params: { status: 1 },
      });

      if (Array.isArray(res.data)) {
        setLanguages(res.data);
      }
    } catch {
      Swal.fire(t("error"), t("fetch_languages_failed"), "error");
    }
  }, [t]);

  useEffect(() => {
    fetchLanguages();
  }, [fetchLanguages]);

  return (
    <div style={{ margin: "10px", textAlign: "right" }}>
      <select
        value={i18n.language}
        onChange={(e) => changeLanguage(e.target.value)}
      >
        {languages.length > 0 ? (
          languages.map((lang) => (
            <option key={lang.lang_code} value={lang.lang_code}>
              {lang.lang_name}
            </option>
          ))
        ) : (
          <>
            {/* <option value="ar">العربية</option>
            <option value="ur">اردو</option> */}
            <option value="en">English</option>
          </>
        )}
      </select>
    </div>
  );
};

export default LanguageSwitcher;
