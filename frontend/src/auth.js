export const setToken = (token) => localStorage.setItem("token", token);
export const getToken = () => localStorage.getItem("token");
export const clearToken = () => localStorage.removeItem("token");

export const authHeader = () => {
  const token = getToken();
  return { Authorization: `Bearer ${token}` };
};
