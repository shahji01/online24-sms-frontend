import axios from "../Utils/axios";

export const fetchHadiths = async (type, value, lang = "ar") => {
  try {
    const res = await axios.protected.get(`hadiths/by-${type}/${value}`, {
      headers: { "Accept-Language": lang },
    });
    return res.data || [];
  } catch (err) {
    throw new Error("Failed to fetch hadiths");
  }
};
