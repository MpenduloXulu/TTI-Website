// Authentication utilities
export const getStoredUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

export const getStoredToken = () => {
  return localStorage.getItem('token');
};

export const storeUserData = (user, token) => {
  localStorage.setItem('user', JSON.stringify(user));
  if (token) {
    localStorage.setItem('token', token);
  } else {
    localStorage.removeItem('token');
  }
};

export const clearUserData = () => {
  localStorage.removeItem('user');
  localStorage.removeItem('token');
};

export const isAuthenticated = () => {
  return !!getStoredToken();
};

export const getUserRole = () => {
  const user = getStoredUser();
  return user?.role || null;
};

export const isAdmin = () => {
  return getUserRole() === 'admin';
};

export const isApplicant = () => {
  return getUserRole() === 'applicant';
};

export const isReviewer = () => {
  return getUserRole() === 'reviewer';
};

export const getFullName = () => {
  const user = getStoredUser();
  return user ? `${user.firstName} ${user.lastName}` : 'Guest';
};
