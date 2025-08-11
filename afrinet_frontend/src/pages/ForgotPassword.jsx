// pages/ForgotPassword.jsx
import React, { useState } from 'react';
import { 
  Box, 
  Button, 
  TextField, 
  Typography, 
  Paper, 
  Link,
  CircularProgress
} from '@mui/material';
import { Email } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useNotification } from './Notifications';
import PageLayout from './PageLayout';
import axiosInstance from '../api/axios';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { showNotification } = useNotification();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await axiosInstance.post('/api/auth/password-reset/', { email });
      showNotification('Password reset link sent to your email', 'success');
      navigate('/login');
    } catch (error) {
      const errorMessage = error.response?.data?.error || 
                         'Failed to send reset link. Please try again.';
      showNotification(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageLayout title="Forgot Password" hideNav>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '80vh'
        }}
      >
        <Paper 
          elevation={3} 
          sx={{
            p: 4,
            width: '100%',
            maxWidth: 450,
            borderRadius: 2
          }}
        >
          <Typography variant="h5" component="h1" gutterBottom align="center" sx={{ mb: 3 }}>
            Forgot Password
          </Typography>
          
          <Typography variant="body1" paragraph align="center" sx={{ mb: 3 }}>
            Enter your email address and we'll send you a link to reset your password.
          </Typography>
          
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              margin="normal"
              label="Email"
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              InputProps={{
                startAdornment: <Email sx={{ color: 'action.active', mr: 1 }} />
              }}
            />
            
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                size="large"
                disabled={loading}
                sx={{ width: '100%', py: 1.5 }}
              >
                {loading ? <CircularProgress size={24} /> : 'Send Reset Link'}
              </Button>
            </Box>
            
            <Typography variant="body2" align="center" sx={{ mt: 2 }}>
              Remember your password?{' '}
              <Link href="/login" underline="hover">
                Login here
              </Link>
            </Typography>
          </form>
        </Paper>
      </Box>
    </PageLayout>
  );
};

export default ForgotPassword;