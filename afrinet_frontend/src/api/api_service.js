import axiosInstance from "./axios";

export const fetchActiveUsers = async () => {
  try {
    const response = await axiosInstance.get('/api/active-users/');
    return response.data;
  } catch (error) {
    console.error('Error fetching active users:', error);
    throw error; // Re-throw to handle in components
  }
};

export const disconnectUser = async (sessionId) => {
  try {
    await axiosInstance.patch(`/api/active-users/${sessionId}/disconnect/`);
    return true;
  } catch (error) {
    console.error('Error disconnecting user:', error);
    throw error;
  }
};

export const fetchActiveUserStats = async () => {
  try {
    const response = await axiosInstance.get('/api/active-users/stats/');
    return response.data;
  } catch (error) {
    console.error('Error fetching stats:', error);
    throw error;
  }
};

// Add auth header when user is logged in
export const setAuthToken = (token) => {
  if (token) {
    axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete axiosInstance.defaults.headers.common['Authorization'];
  }
};