import React, { useState } from 'react';
import { 
  Box, 
  Button, 
  TextField, 
  Typography, 
  Paper, 
  Link, 
  CircularProgress,
  Snackbar,
  Alert
} from '@mui/material';
import { Lock, Email } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import PageLayout from './PageLayout';

const Login = () => {
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Login.jsx
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(credentials.email, credentials.password); // Now calls AuthContext only once
      navigate('/dashboard');
    } catch (err) {
      const errorMessage = err.response?.data?.error ||
                          err.response?.data?.detail ||
                          err.message ||
                          'Login failed';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageLayout title="Hotspot Management System" hideNav>
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
          </form>
        </Paper>
      </Box>
      
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
      >
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      </Snackbar>
    </PageLayout>
  );
};

export default Login;