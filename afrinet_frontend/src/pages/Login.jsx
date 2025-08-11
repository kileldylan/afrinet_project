// pages/Login.jsx
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
import { Lock, Email } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import PageLayout from './PageLayout';
import { useNotification } from './Notifications';

const Login = () => {
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showNotification, NotificationComponent } = useNotification();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await login(credentials.email, credentials.password);
      showNotification('Login successful! Redirecting...', 'success');
      navigate('/dashboard');
    } catch (err) {
      const errorMessage = err.response?.data?.error || 
                         err.response?.data?.detail || 
                         err.message || 
                         'Login failed. Please check your credentials.';
      showNotification(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageLayout title="Wifi Billing System" hideNav>
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
            Admin Login
          </Typography>
          
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              margin="normal"
              label="Email"
              name="email"
              type="email"
              value={credentials.email}
              onChange={handleChange}
              required
              InputProps={{
                startAdornment: <Email sx={{ color: 'action.active', mr: 1 }} />
              }}
            />
            
            <TextField
              fullWidth
              margin="normal"
              label="Password"
              name="password"
              type="password"
              value={credentials.password}
              onChange={handleChange}
              required
              InputProps={{
                startAdornment: <Lock sx={{ color: 'action.active', mr: 1 }} />
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
                {loading ? <CircularProgress size={24} /> : 'Login'}
              </Button>
            </Box>
            
            <Typography variant="body2" align="center" sx={{ mt: 2 }}>
              <Link href="/forgot-password" underline="hover">
                Forgot password?
              </Link>
            </Typography>
            <Typography variant="body1" align="center" sx={{ mt: 1 }}>
              Don’t have an account?{' '}
              <Link 
                component="button"
                onClick={() => navigate('/register')} 
                underline="hover"
              >
                Register
              </Link>
            </Typography>
          </form>
        </Paper>
      </Box>
      
      {/* Reusable notification component */}
      <NotificationComponent />
    </PageLayout>
  );
};

export default Login;