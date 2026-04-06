import api from "./axios";

/* -------- SIGNUP -------- */
export const signupApi = async (payload) => {
  const { data } = await api.post("/auth/signup", payload);

 sessionStorage.setItem("accessToken", data.accessToken);
sessionStorage.setItem("refreshToken", data.refreshToken);
sessionStorage.setItem("user", JSON.stringify(data.user));
  return data;
};

/* -------- LOGIN -------- */
export const loginApi = async (payload) => {
  const { data } = await api.post("/auth/login", payload);

sessionStorage.setItem("accessToken", data.accessToken);
sessionStorage.setItem("refreshToken", data.refreshToken);
sessionStorage.setItem("user", JSON.stringify(data.user));

  return data;
};

/* -------- LOGOUT -------- */
export const logoutApi = async () => {
  await api.post("/api/auth/logout");

  localStorage.clear();
};
