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
  FormControlLabel,
  Checkbox,
  Select,
  InputLabel,
  FormControl,
} from '@mui/material';
import Sidebar from './Sidebar';
import { Add } from '@mui/icons-material';
import axiosInstance from '../api/axios';
import MobileConstraint from './MobileConstraint';

const Packages = () => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [formData, setFormData] = useState({
    package_id: '',
    price: '',
    duration_value: 1,
    duration_unit: 'min',
    speed: '',
    popular: false,
  });

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/api/packages/');
      setPackages(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch packages');
      setLoading(false);
      console.error('Error fetching packages:', err);
    }
  };

  const formatDuration = (packageItem) => {
    const { duration_value, duration_unit } = packageItem;
    if (duration_unit === 'hour') {
      return `${duration_value} Hour${duration_value !== 1 ? 's' : ''}`;
    } else if (duration_unit === 'day') {
      return `${duration_value} Day${duration_value !== 1 ? 's' : ''}`;
    } else {
      return `${duration_value} Minute${duration_value !== 1 ? 's' : ''}`;
    }
  };

  const handleCloseSnackbar = () => {
    setError(null);
    setSuccess(null);
  };

  const handleOpenModal = () => {
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    // Reset form when closing
    setFormData({
      package_id: '',
      price: '',
      duration_value: 1,
      duration_unit: 'min',
      speed: '',
      popular: false,
    });
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await axiosInstance.post('/api/packages/', formData);
      setSuccess('Package created successfully!');
      fetchPackages(); // Refresh the list
      handleCloseModal();
    } catch (err) {
      setError('Failed to create package');
      console.error('Error creating package:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', fontFamily: 'Roboto, sans-serif', backgroundColor: '#f5f5f5' }}>
      <Sidebar />
      <MobileConstraint>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          background: 'linear-gradient(135deg, rgb(64, 161, 241) 0%, rgb(193, 219, 240) 100%)',
          minHeight: '100vh',
        }}
      >
        <Typography variant="h5" fontWeight="bold" mb={3} color="text.primary">
          Packages
        </Typography>
        <Typography variant="body2" mb={2} color="text.secondary">
          All packages available to clients including hotspot, PPPoE and Data Plan packages
        </Typography>
        
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Button variant="outlined" color="primary" sx={{ mr: 1 }}>All ({packages.length})</Button>
            <Button variant="outlined" color="primary" sx={{ mr: 1 }}>Hotspot</Button>
            <Button variant="outlined" color="primary" sx={{ mr: 1 }}>PPPoE</Button>
            <Button variant="outlined" color="primary">Free Trial</Button>
          </Box>
          <Button
            variant="contained"
            color="warning"
            startIcon={<Add />}
            sx={{ backgroundColor: '#ff9800', '&:hover': { backgroundColor: '#f57c00' } }}
            onClick={handleOpenModal}
          >
            Create Package
          </Button>
        </Box>

        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
            <CircularProgress />
          </Box>
        ) : (
          <Paper elevation={3} sx={{ p: 2, borderRadius: 2 }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Price</TableCell>
                    <TableCell>Speed</TableCell>
                    <TableCell>Duration</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Popular</TableCell>
                    <TableCell>Enabled</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {packages.map((packageItem) => (
                    <TableRow key={packageItem.package_id}>
                      <TableCell>{formatDuration(packageItem)} at {packageItem.speed}</TableCell>
                      <TableCell>Ksh {packageItem.price}</TableCell>
                      <TableCell>{packageItem.speed}</TableCell>
                      <TableCell>{formatDuration(packageItem)}</TableCell>
                      <TableCell>Hotspot</TableCell>
                      <TableCell>{packageItem.popular ? 'Yes' : 'No'}</TableCell>
                      <TableCell>Yes</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        )}

        {/* Create Package Modal */}
        <Dialog open={openModal} onClose={handleCloseModal} maxWidth="sm" fullWidth>
          <DialogTitle>Create New Package</DialogTitle>
          <form onSubmit={handleSubmit}>
            <DialogContent>
              <TextField
                margin="dense"
                name="package_id"
                label="Package ID"
                type="text"
                fullWidth
                variant="outlined"
                value={formData.package_id}
                onChange={handleInputChange}
                required
              />
              <TextField
                margin="dense"
                name="price"
                label="Price (Ksh)"
                type="number"
                fullWidth
                variant="outlined"
                value={formData.price}
                onChange={handleInputChange}
                inputProps={{ step: "0.01" }}
                required
              />
              <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                <TextField
                  margin="dense"
                  name="duration_value"
                  label="Duration Value"
                  type="number"
                  fullWidth
                  variant="outlined"
                  value={formData.duration_value}
                  onChange={handleInputChange}
                  required
                />
                <FormControl fullWidth margin="dense">
                  <InputLabel>Duration Unit</InputLabel>
                  <Select
                    name="duration_unit"
                    value={formData.duration_unit}
                    label="Duration Unit"
                    onChange={handleInputChange}
                    required
                  >
                    <MenuItem value="min">Minutes</MenuItem>
                    <MenuItem value="hour">Hours</MenuItem>
                    <MenuItem value="day">Days</MenuItem>
                  </Select>
                </FormControl>
              </Box>
              <TextField
                margin="dense"
                name="speed"
                label="Speed (e.g., 10M/10M)"
                type="text"
                fullWidth
                variant="outlined"
                value={formData.speed}
                onChange={handleInputChange}
                required
              />
              <FormControlLabel
                control={
                  <Checkbox
                    name="popular"
                    checked={formData.popular}
                    onChange={handleInputChange}
                    color="primary"
                  />
                }
                label="Mark as popular package"
                sx={{ mt: 2 }}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseModal} color="primary">
                Cancel
              </Button>
              <Button type="submit" color="primary" variant="contained" disabled={loading}>
                {loading ? <CircularProgress size={24} /> : 'Create'}
              </Button>
            </DialogActions>
          </form>
        </Dialog>

        {/* Error and Success notifications */}
        <Snackbar open={!!error} autoHideDuration={6000} onClose={handleCloseSnackbar}>
          <Alert onClose={handleCloseSnackbar} severity="error" sx={{ width: '100%' }}>
            {error}
          </Alert>
        </Snackbar>
        <Snackbar open={!!success} autoHideDuration={6000} onClose={handleCloseSnackbar}>
          <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
            {success}
          </Alert>
        </Snackbar>
      </Box>
      </MobileConstraint>
    </Box>
  );
};

export default Packages;