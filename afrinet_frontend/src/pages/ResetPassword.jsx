import React, { useState } from 'react';
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
  Email as EmailIcon,
  Lock as LockIcon,
  Visibility,
  VisibilityOff,
  VerifiedUser as VerifiedUserIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useNotification } from './Notifications';
import PageLayout from './PageLayout';
import axiosInstance from '../api/axios';

const ResetPassword = () => {
  const [step, setStep] = useState(1); // 1 = email, 2 = code, 3 = new password
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { showNotification } = useNotification();
  const navigate = useNavigate();

  const handleRequestCode = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axiosInstance.post('/api/auth/request-reset/', { email });
      showNotification('Reset code sent to your email', 'success');
      setStep(2);
    } catch (err) {
      showNotification(err.response?.data?.error || 'Failed to send code', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axiosInstance.post('/api/auth/verify-code/', { email, code });
      setToken(response.data.token);
      showNotification('Code verified. Set your new password', 'success');
      setStep(3);
    } catch (err) {
      showNotification(err.response?.data?.error || 'Invalid code', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (password !== password2) {
      showNotification("Passwords don't match", 'error');
      return;
    }
    setLoading(true);
    try {
      await axiosInstance.post('/api/auth/reset-password/', { 
        token, 
        password, 
        password2 
      });
      showNotification('Password reset successfully! Redirecting...', 'success');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      showNotification(err.response?.data?.error || 'Password reset failed', 'error');
    } finally {
      setLoading(false);
    }
  };

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
          {step === 1 && (
            <>
              <Typography variant="h5" component="h1" gutterBottom align="center" sx={{ mb: 3 }}>
                Reset Password
              </Typography>
              <Typography variant="body1" paragraph align="center" sx={{ mb: 3 }}>
                Enter your email to receive a 6-digit reset code
              </Typography>
              
              <form onSubmit={handleRequestCode}>
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
                    startAdornment: <EmailIcon sx={{ color: 'action.active', mr: 1 }} />
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
                    {loading ? <CircularProgress size={24} /> : 'Send Reset Code'}
                  </Button>
                </Box>
              </form>
            </>
          )}

          {step === 2 && (
            <>
              <Typography variant="h5" component="h1" gutterBottom align="center" sx={{ mb: 3 }}>
                Enter Verification Code
              </Typography>
              <Typography variant="body1" paragraph align="center" sx={{ mb: 3 }}>
                Check your email for the 6-digit code
              </Typography>
              
              <form onSubmit={handleVerifyCode}>
                <TextField
                  fullWidth
                  margin="normal"
                  label="Verification Code"
                  name="code"
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  required
                  inputProps={{ maxLength: 6 }}
                  InputProps={{
                    startAdornment: <VerifiedUserIcon sx={{ color: 'action.active', mr: 1 }} />
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
                    {loading ? <CircularProgress size={24} /> : 'Verify Code'}
                  </Button>
                </Box>
              </form>
            </>
          )}

          {step === 3 && (
            <>
              <Typography variant="h5" component="h1" gutterBottom align="center" sx={{ mb: 3 }}>
                Set New Password
              </Typography>
              
              <form onSubmit={handleResetPassword}>
                <TextField
                  fullWidth
                  margin="normal"
                  label="New Password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  InputProps={{
                    startAdornment: <LockIcon sx={{ color: 'action.active', mr: 1 }} />,
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
                  value={password2}
                  onChange={(e) => setPassword2(e.target.value)}
                  required
                  InputProps={{
                    startAdornment: <LockIcon sx={{ color: 'action.active', mr: 1 }} />
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
              </form>
            </>
          )}
          
          <Typography variant="body2" align="center" sx={{ mt: 2 }}>
            Remember your password?{' '}
            <Link href="/login" underline="hover">
              Login here
            </Link>
          </Typography>
        </Paper>
      </Box>
    </PageLayout>
  );
};

export default ResetPassword;