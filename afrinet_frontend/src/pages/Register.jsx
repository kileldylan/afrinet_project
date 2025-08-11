// pages/Register.jsx
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
import { Lock, Email, Person, Phone } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import PageLayout from './PageLayout';
import { useNotification } from './Notifications';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: ''
  });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();
  const { showNotification, NotificationComponent } = useNotification();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (formData.password !== formData.confirmPassword) {
      showNotification('Passwords do not match', 'error');
      return;
    }

    if (formData.password.length < 8) {
      showNotification('Password must be at least 8 characters', 'error');
      return;
    }

    setLoading(true);
    try {
      await register(formData.name, formData.email, formData.password, formData.phone);
      showNotification('Registration successful! Redirecting...', 'success');
      // Navigation is handled by AuthContext after successful registration
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                         error.response?.data?.detail || 
                         'Registration failed. Please try again.';
      showNotification(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageLayout title="Wi-Fi Billing System" hideNav>
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
            Create Account
          </Typography>
          
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              margin="normal"
              label="Full Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              InputProps={{
                startAdornment: <Person sx={{ color: 'action.active', mr: 1 }} />
              }}
            />

            <TextField
              fullWidth
              margin="normal"
              label="Email"
              name="email"
              type="email"
              value={formData.email}
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
              value={formData.password}
              onChange={handleChange}
              required
              InputProps={{
                startAdornment: <Lock sx={{ color: 'action.active', mr: 1 }} />
              }}
            />

            <TextField
              fullWidth
              margin="normal"
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              InputProps={{
                startAdornment: <Lock sx={{ color: 'action.active', mr: 1 }} />
              }}
            />

            <TextField
              fullWidth
              margin="normal"
              label="Phone Number"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              InputProps={{
                startAdornment: <Phone sx={{ color: 'action.active', mr: 1 }} />
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
                {loading ? <CircularProgress size={24} /> : 'Register'}
              </Button>
            </Box>
            
            <Typography variant="body2" align="center" sx={{ mt: 2 }}>
              Already have an account?{' '}
              <Link href="/login" underline="hover">
                Login here
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

export default Register;