// components/Notification.jsx
import { Snackbar, Alert } from '@mui/material';
import { useState } from 'react';

export const useNotification = () => {
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success' // 'success', 'error', 'warning', 'info'
  });

  const showNotification = (message, severity = 'success') => {
    setNotification({
      open: true,
      message,
      severity
    });
  };

  const closeNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  const NotificationComponent = () => (
    <Snackbar
      open={notification.open}
      autoHideDuration={6000}
      onClose={closeNotification}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
    >
      <Alert 
        onClose={closeNotification} 
        severity={notification.severity}
        sx={{ width: '100%' }}
      >
        {notification.message}
      </Alert>
    </Snackbar>
  );

  return { showNotification, closeNotification, NotificationComponent };
};