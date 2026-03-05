import axios from "axios";

export const geocodeLocation = async (location: string) => {
  const res = await axios.get("https://nominatim.openstreetmap.org/search", {
    params: {
      q: location,
      format: "json",
      limit: 1,
    },
    headers: {
      "User-Agent": "finpro-app",
    },
  });

  if (!res.data || res.data.length === 0) {
    return null;
  }

  return {
    lat: parseFloat(res.data[0].lat),
    lng: parseFloat(res.data[0].lon),
  };
};
