import { ref, computed } from "vue";
import axios from "axios";

const authApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
});

export const user = ref(null);
export const loading = ref(true);

const SUPERUSER_EMAIL = "marllon.mfb@gmail.com"; // Should match backend env var

export const isSuperUser = computed(() => {
  return user.value && user.value.email === SUPERUSER_EMAIL;
});

// Load initial state from localStorage
const storedUser = localStorage.getItem("user");
if (storedUser) {
  try {
    user.value = JSON.parse(storedUser);
  } catch (e) {
    console.error("Failed to parse user from localStorage", e);
  }
}
loading.value = false;

export const login = async (email, password) => {
  const { data } = await authApi.post("/auth/login", { email, password });
  localStorage.setItem("token", data.token);
  localStorage.setItem("user", JSON.stringify(data.user));
  user.value = data.user;
  return data.user;
};

export const register = async (email, password) => {
  const { data } = await authApi.post("/auth/register", { email, password });
  localStorage.setItem("token", data.token);
  localStorage.setItem("user", JSON.stringify(data.user));
  user.value = data.user;
  return data.user;
};

export const logout = async () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  user.value = null;
};

export const getToken = async () => {
  return localStorage.getItem("token");
};
