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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
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
  const [openModal, setOpenModal] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    phone: '',
    email: '',
    password: '',
    user_type: 'hotspot',
    package_id: '',
    status: 'active',
  });

  // Fetch users from API
  useEffect(() => {
    fetchUsers();
  }, [filter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/api/users/', {
        params: { filter }
      });
      setUsers(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err.response?.data?.message || 'Failed to fetch users');
      showSnackbar('Failed to fetch users', 'error');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleOpenModal = () => {
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setFormData({
      username: '',
      phone: '',
      email: '',
      password: '',
      user_type: 'hotspot',
      package_id: '',
      status: 'active',
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleCreateUser = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.post('/api/users/', formData);
      showSnackbar('User created successfully', 'success');
      fetchUsers();
      handleCloseModal();
    } catch (err) {
      console.error('Error creating user:', err);
      showSnackbar(err.response?.data?.message || 'Failed to create user', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getFilteredCount = (type) => {
    if (!Array.isArray(users)) return 0;
    return users.filter(u => {
      if (type === 'hotspot') return u.user_type === 'hotspot';
      if (type === 'pppoe') return u.user_type === 'pppoe';
      if (type === 'paused') return u.status === 'paused';
      return true;
    }).length;
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
      showSnackbar('Users imported successfully', 'success');
      fetchUsers();
    } catch (err) {
      showSnackbar(err.response?.data?.message || 'Failed to import users', 'error');
    }
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
            onClick={handleOpenModal}
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

      {/* Create User Modal */}
      <Dialog open={openModal} onClose={handleCloseModal} maxWidth="sm" fullWidth>
        <DialogTitle>Create New User</DialogTitle>
        <DialogContent>
          <TextField
            margin="normal"
            name="username"
            label="Username"
            type="text"
            fullWidth
            variant="outlined"
            value={formData.username}
            onChange={handleInputChange}
            required
          />
          <TextField
            margin="normal"
            name="phone"
            label="Phone Number"
            type="tel"
            fullWidth
            variant="outlined"
            value={formData.phone}
            onChange={handleInputChange}
          />
          <TextField
            margin="normal"
            name="email"
            label="Email"
            type="email"
            fullWidth
            variant="outlined"
            value={formData.email}
            onChange={handleInputChange}
          />
          <TextField
            margin="normal"
            name="password"
            label="Password"
            type="password"
            fullWidth
            variant="outlined"
            value={formData.password}
            onChange={handleInputChange}
            required
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>User Type</InputLabel>
            <Select
              name="user_type"
              value={formData.user_type}
              label="User Type"
              onChange={handleInputChange}
              required
            >
              <MenuItem value="hotspot">Hotspot</MenuItem>
              <MenuItem value="pppoe">PPPoE</MenuItem>
            </Select>
          </FormControl>
          <TextField
            margin="normal"
            name="package_id"
            label="Package ID"
            type="text"
            fullWidth
            variant="outlined"
            value={formData.package_id}
            onChange={handleInputChange}
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Status</InputLabel>
            <Select
              name="status"
              value={formData.status}
              label="Status"
              onChange={handleInputChange}
              required
            >
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="paused">Paused</MenuItem>
              <MenuItem value="disabled">Disabled</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal} color="primary">
            Cancel
          </Button>
          <Button 
            onClick={handleCreateUser} 
            color="primary" 
            variant="contained" 
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

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