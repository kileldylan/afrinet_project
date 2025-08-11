import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Button, 
  TextField, 
  Typography, 
  Paper, 
  Link,
  CircularProgress,
  InputAdornment,
  IconButton
} from '@mui/material';
import { 
  Lock as LockIcon,
  Visibility,
  VisibilityOff
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useNotification } from './Notifications';
import PageLayout from './PageLayout';
import axiosInstance from '../api/axios';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [loading, setLoading] = useState(true);
  const [validToken, setValidToken] = useState(false);
  const [email, setEmail] = useState('');
  const [formData, setFormData] = useState({
    password: '',
    password2: '',
    token: token
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);

  // Verify token when component mounts
  useEffect(() => {
    const verifyToken = async () => {
      try {
        const response = await axiosInstance.get(`/api/reset-password/${token}/`);
        setEmail(response.data.email);
        setValidToken(true);
      } catch (err) {
        setErrors({ token: 'Invalid or expired reset link' });
      } finally {
        setLoading(false);
      }
    };
    verifyToken();
  }, [token]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    // Validation
    if (formData.password.length < 8) {
      setErrors({ password: 'Password must be at least 8 characters' });
      return;
    }

    if (formData.password !== formData.password2) {
      setErrors({ password2: 'Passwords do not match' });
      return;
    }

    try {
      setLoading(true);
      await axiosInstance.post('/api/reset-password-confirm/', formData);
      showNotification('Password reset successfully!', 'success');
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      const errorMessage = err.response?.data?.error || 
                         'Failed to reset password. Please try again.';
      showNotification(errorMessage, 'error');
      setErrors({ submit: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <PageLayout title="Verifying Reset Link" hideNav>
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
              borderRadius: 2,
              textAlign: 'center'
            }}
          >
            <Typography variant="h5" component="h1" gutterBottom>
              Verifying Reset Link
            </Typography>
            <CircularProgress sx={{ mt: 3 }} />
          </Paper>
        </Box>
      </PageLayout>
    );
  }

  if (!validToken) {
    return (
      <PageLayout title="Invalid Reset Link" hideNav>
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
              borderRadius: 2,
              textAlign: 'center'
            }}
          >
            <Typography variant="h5" component="h1" gutterBottom color="error">
              Reset Link Invalid
            </Typography>
            <Typography variant="body1" paragraph sx={{ mb: 3 }}>
              {errors.token || 'This password reset link is invalid or has expired.'}
            </Typography>
            <Button
              variant="contained"
              onClick={() => navigate('/forgot-password')}
              sx={{ width: '100%', py: 1.5 }}
            >
              Request New Reset Link
            </Button>
          </Paper>
        </Box>
      </PageLayout>
    );
  }

  if (success) {
    return (
      <PageLayout title="Password Reset Successful" hideNav>
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
              borderRadius: 2,
              textAlign: 'center'
            }}
          >
            <Typography variant="h5" component="h1" gutterBottom color="success">
              Password Reset Successful!
            </Typography>
            <Typography variant="body1" paragraph sx={{ mb: 3 }}>
              Your password has been updated successfully. Redirecting to login page...
            </Typography>
            <CircularProgress size={24} />
          </Paper>
        </Box>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Reset Password" hideNav>
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
            Reset Your Password
          </Typography>
          
          <Typography variant="body1" paragraph align="center" sx={{ mb: 3 }}>
            Enter a new password for {email}
          </Typography>
          
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              margin="normal"
              label="New Password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange}
              required
              error={!!errors.password}
              helperText={errors.password}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
            
            <TextField
              fullWidth
              margin="normal"
              label="Confirm New Password"
              name="password2"
              type={showPassword ? 'text' : 'password'}
              value={formData.password2}
              onChange={handleChange}
              required
              error={!!errors.password2}
              helperText={errors.password2}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon color="action" />
                  </InputAdornment>
                )
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
                {loading ? <CircularProgress size={24} /> : 'Reset Password'}
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

export default ResetPassword;