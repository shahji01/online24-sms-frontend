// utils/auth.js
export const isAuthenticated = () => {
  return !!localStorage.getItem('ACCESS_TOKEN'); // or check for user info
};
