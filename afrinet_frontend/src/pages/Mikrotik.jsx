import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  Chip
} from '@mui/material';
import { Settings, Refresh, CloudOff, CloudDone } from '@mui/icons-material';
import PageLayout from './PageLayout';
import axiosInstance from '../api/axios';

const Mikrotik = () => {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [currentDevice, setCurrentDevice] = useState(null);
  const [formData, setFormData] = useState({
    host: '',
    username: '',
    password: '',
    port: '8728'
  });

  // Fetch MikroTik devices from API
  const fetchDevices = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/api/mikrotik/devices/');
      setDevices(response.data);
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to fetch MikroTik devices',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  // Handle device configuration
const handleConfigure = (device) => {
  setCurrentDevice(device);
    setFormData({
    name: device?.name || '',
    host: device?.ip || '',
    username: device?.username || 'admin',
    password: '', // Always start with empty password for security
    port: device?.port || '8728'
  });
  
  setConfigDialogOpen(true);
};

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Save device configuration
  const handleSaveConfig = async () => {
    try {
      const payload = {
        ...formData,
        id: currentDevice?.id
      };

      const response = await axiosInstance.post('/api/mikrotik/configure/', payload);
      
      setSnackbar({
        open: true,
        message: 'Device configuration saved successfully',
        severity: 'success'
      });
      
      // Update the device in local state
      if (currentDevice) {
        setDevices(devices.map(d => 
          d.id === currentDevice.id ? { ...d, ...response.data } : d
        ));
      } else {
        // Add new device
        setDevices([...devices, response.data]);
      }
      
      setConfigDialogOpen(false);
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to save configuration',
        severity: 'error'
      });
    }
  };

  // Test device connection
  const testConnection = async (deviceId) => {
    try {
      const response = await axiosInstance.get(`/api/mikrotik/test-connection/${deviceId}/`);
      setSnackbar({
        open: true,
        message: response.data.message,
        severity: response.data.success ? 'success' : 'error'
      });
      
      // Update device status if successful
      if (response.data.success) {
        setDevices(devices.map(d => 
          d.id === deviceId ? { ...d, status: 'Online', lastUpdate: new Date().toISOString() } : d
        ));
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to test connection',
        severity: 'error'
      });
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <PageLayout 
      title="Mikrotik Management" 
      description="Manage your Mikrotik router devices"
    >
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between' }}>
        <Button
          variant="contained"
          startIcon={<Refresh />}
          onClick={fetchDevices}
          disabled={loading}
        >
          Refresh
        </Button>
        <Button 
          variant="contained" 
          color="warning" 
          startIcon={<Settings />}
          sx={{ 
            backgroundColor: '#ff9800', 
            '&:hover': { backgroundColor: '#f57c00' } 
          }}
          onClick={() => handleConfigure(null)} // Explicitly pass null for new device
        >
          Add New Device
        </Button>
      </Box>
      
      {loading ? (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      ) : (
        <Paper elevation={3} sx={{ p: 2, borderRadius: 2, overflow: 'hidden' }}>
          <TableContainer sx={{ overflowX: 'auto' }}>
            <Table sx={{ minWidth: 650 }}>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Device</TableCell>
                  <TableCell>IP Address</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Last Update</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {devices.length > 0 ? (
                  devices.map((device) => (
                    <TableRow key={device.id}>
                      <TableCell>{device.id}</TableCell>
                      <TableCell>{device.name || `Router-${device.id}`}</TableCell>
                      <TableCell>{device.ip}</TableCell>
                      <TableCell>
                        <Chip
                          icon={device.status === 'Online' ? <CloudDone /> : <CloudOff />}
                          label={device.status}
                          color={device.status === 'Online' ? 'success' : 'error'}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>{formatDate(device.lastUpdate)}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => testConnection(device.id)}
                          >
                            Test
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => handleConfigure(device)}
                          >
                            Configure
                          </Button>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      No MikroTik devices found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* Configuration Dialog */}
      <Dialog open={configDialogOpen} onClose={() => setConfigDialogOpen(false)}>
        <DialogTitle>
          {currentDevice ? 'Configure Device' : 'Add New Device'}
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            margin="normal"
            label="Device Name"
            name="name"
            value={currentDevice?.name || ''}
            disabled
          />
          <TextField
            fullWidth
            margin="normal"
            label="IP Address/Host"
            name="host"
            value={formData.host}
            onChange={handleInputChange}
            required
          />
          <TextField
            fullWidth
            margin="normal"
            label="Username"
            name="username"
            value={formData.username}
            onChange={handleInputChange}
            required
          />
          <TextField
            fullWidth
            margin="normal"
            label="Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleInputChange}
            required={!currentDevice}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Port"
            name="port"
            value={formData.port}
            onChange={handleInputChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfigDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleSaveConfig}
            variant="contained"
            color="primary"
            disabled={!formData.host || !formData.username}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({...snackbar, open: false})}
      >
        <Alert
          onClose={() => setSnackbar({...snackbar, open: false})}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </PageLayout>
  );
};

export default Mikrotik;