// pages/Logout.jsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { useNotification } from './Notifications';
import PageLayout from './PageLayout';
import { Box, Typography, CircularProgress } from '@mui/material';

const Logout = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  useEffect(() => {
    const performLogout = async () => {
      try {
        await logout();
        showNotification('You have been logged out successfully', 'success');
        navigate('/login');
      } catch (error) {
        showNotification('Error during logout', 'error');
        navigate('/');
      }
    };

    performLogout();
  }, [logout, navigate, showNotification]);

  return (
    <PageLayout title="Logging out..." hideNav>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '80vh',
          flexDirection: 'column',
          gap: 2
        }}
      >
        <CircularProgress size={60} />
        <Typography variant="h6">Logging you out...</Typography>
      </Box>
    </PageLayout>
  );
};

export default Logout;