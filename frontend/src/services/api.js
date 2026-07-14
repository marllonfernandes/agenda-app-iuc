import axios from "axios";

import { getToken } from "./auth";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
});

// Request interceptor to add the auth token
api.interceptors.request.use(async (config) => {
  const token = await getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const setOrgId = (orgId) => {
  if (orgId) {
    api.defaults.headers.common["x-org-id"] = orgId;
  } else {
    delete api.defaults.headers.common["x-org-id"];
  }
};

export default api;
