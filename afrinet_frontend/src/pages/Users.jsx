import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  CircularProgress,
  Snackbar,
  Alert,
} from '@mui/material';
import { CloudUpload, PersonAdd } from '@mui/icons-material';
import axiosInstance from '../api/axios';
import PageLayout from './PageLayout';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  // Fetch users from API
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get('/api/users/', {
          params: { filter }
        });
        
        // Ensure response.data is an array
        const userData = Array.isArray(response.data) ? response.data : [];
        setUsers(userData);
        
      } catch (err) {
        console.error('Error fetching users:', err);
        setError(err.response?.data?.message || 'Failed to fetch users');
        setSnackbar({
          open: true,
          message: 'Failed to fetch users',
          severity: 'error'
        });
        setUsers([]); // Reset to empty array on error
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [filter]);

  // Safe filtering functions
  const getFilteredCount = (type) => {
    if (!Array.isArray(users)) return 0;
    return users.filter(u => {
      if (type === 'hotspot') return u.user_type === 'hotspot';
      if (type === 'pppoe') return u.user_type === 'pppoe';
      if (type === 'paused') return u.status === 'paused';
      return true;
    }).length;
  };

  const handleCreateUser = async () => {
    try {
      // Implement create user logic using axiosInstance
      const response = await axiosInstance.post('/api/users/', {
        // Your user creation data here
      });
      setSnackbar({
        open: true,
        message: 'User created successfully',
        severity: 'success'
      });
      // Refresh users list
      fetchUsers();
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.response?.data?.message || 'Failed to create user',
        severity: 'error'
      });
    }
  };

  const handleImportUsers = async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await axiosInstance.post('/users/import/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setSnackbar({
        open: true,
        message: 'Users imported successfully',
        severity: 'success'
      });
      // Refresh users list
      fetchUsers();
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.response?.data?.message || 'Failed to import users',
        severity: 'error'
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <PageLayout 
      title="Users" 
      description="All users including hotspot and PPPoE users"
    >
      {/* Filter Buttons */}
      <Box sx={{ 
        mb: 2, 
        display: 'flex', 
        flexDirection: { xs: 'column', sm: 'row' },
        justifyContent: 'space-between', 
        alignItems: { xs: 'flex-start', sm: 'center' },
        gap: 1
      }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          <Button 
            variant={filter === 'all' ? 'contained' : 'outlined'} 
            color="primary"
            onClick={() => setFilter('all')}
            size="small"
          >
            All ({getFilteredCount('all')})
          </Button>
          <Button 
            variant={filter === 'hotspot' ? 'contained' : 'outlined'} 
            color="primary"
            onClick={() => setFilter('hotspot')}
            size="small"
          >
            Hotspot ({getFilteredCount('hotspot')})
          </Button>
          <Button 
            variant={filter === 'pppoe' ? 'contained' : 'outlined'} 
            color="primary"
            onClick={() => setFilter('pppoe')}
            size="small"
          >
            PPPoE ({getFilteredCount('pppoe')})
          </Button>
          <Button 
            variant={filter === 'paused' ? 'contained' : 'outlined'} 
            color="primary"
            onClick={() => setFilter('paused')}
            size="small"
          >
            Paused ({getFilteredCount('paused')})
          </Button>
        </Box>
        
        {/* Action Buttons */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          <Button
            variant="contained"
            color="warning"
            startIcon={<CloudUpload />}
            sx={{ 
              backgroundColor: '#ff9800', 
              '&:hover': { backgroundColor: '#f57c00' },
              whiteSpace: 'nowrap'
            }}
            onClick={() => document.getElementById('import-users-input').click()}
            size="small"
          >
            Import Users
            <input
              id="import-users-input"
              type="file"
              hidden
              onChange={(e) => e.target.files[0] && handleImportUsers(e.target.files[0])}
            />
          </Button>
          <Button
            variant="contained"
            color="warning"
            startIcon={<PersonAdd />}
            sx={{ 
              backgroundColor: '#ff9800', 
              '&:hover': { backgroundColor: '#f57c00' },
              whiteSpace: 'nowrap'
            }}
            onClick={handleCreateUser}
            size="small"
          >
            Create User
          </Button>
        </Box>
      </Box>

      {/* User Table */}
      <Paper elevation={3} sx={{ p: 2, borderRadius: 2, overflow: 'hidden' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Typography color="error">{error}</Typography>
        ) : (
          <TableContainer sx={{ overflowX: 'auto' }}>
            <Table sx={{ minWidth: 650 }}>
              <TableHead>
                <TableRow>
                  <TableCell>Username</TableCell>
                  <TableCell>Phone</TableCell>
                  <TableCell>Package</TableCell>
                  <TableCell>Expiry</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Last Online</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.length > 0 ? (
                  users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>{user.username}</TableCell>
                      <TableCell>{user.phone || '-'}</TableCell>
                      <TableCell>{user.package?.name || 'None'}</TableCell>
                      <TableCell>
                        {user.expiry_date ? 
                          new Date(user.expiry_date).toLocaleString() : 
                          'Expired'}
                      </TableCell>
                      <TableCell>
                        <span style={{ 
                          color: user.status === 'active' ? '#4caf50' : 
                                user.status === 'paused' ? '#ff9800' : '#f44336' 
                        }}>
                          {user.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        {user.last_online ? 
                          `${Math.floor((new Date() - new Date(user.last_online)) / (1000 * 60 * 60))} hours ago` : 
                          'Never'}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      No users found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </PageLayout>
  );
};

export default Users;