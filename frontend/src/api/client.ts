import axios from "axios";

const configuredApiUrl = import.meta.env.VITE_API_URL?.trim() || "/api";

function getApiBaseUrl() {
  if (typeof window === "undefined") {
    return configuredApiUrl;
  }

  try {
    const url = new URL(configuredApiUrl);

    if (
      window.location.protocol === "https:" &&
      url.protocol === "http:" &&
      url.hostname === window.location.hostname
    ) {
      return url.pathname || "/api";
    }
  } catch {
    return configuredApiUrl;
  }

  return configuredApiUrl;
}

export const api = axios.create({
  baseURL: getApiBaseUrl(),
});
