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
  MenuItem,
  FormControlLabel,
  Checkbox,
  Select,
  InputLabel,
  FormControl,
} from '@mui/material';
import { Add } from '@mui/icons-material';
import axiosInstance from '../api/axios';
import PageLayout from './PageLayout';

const Packages = () => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [formData, setFormData] = useState({
    package_id: '',
    package_name: '',
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
    setFormData({
      package_id: '',
      package_name: '',
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
      fetchPackages();
      handleCloseModal();
    } catch (err) {
      setError('Failed to create package');
      console.error('Error creating package:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageLayout 
      title="Packages" 
      description="All packages available to clients including hotspot, PPPoE and Data Plan packages"
    >
      <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          <Button variant="outlined" color="primary">All ({packages.length})</Button>
          <Button variant="outlined" color="primary">Hotspot</Button>
          <Button variant="outlined" color="primary">PPPoE</Button>
          <Button variant="outlined" color="primary">Free Trial</Button>
        </Box>
        <Button
          variant="contained"
          color="warning"
          startIcon={<Add />}
          sx={{ 
            backgroundColor: '#ff9800', 
            '&:hover': { backgroundColor: '#f57c00' },
            whiteSpace: 'nowrap'
          }}
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
        <Paper elevation={3} sx={{ p: 2, borderRadius: 2, overflow: 'hidden' }}>
          <TableContainer sx={{ overflowX: 'auto' }}>
            <Table sx={{ minWidth: 650 }}>
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
                  <TableRow key={packageItem.package_name}>
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
              name="package_name"
              label="Package Name"
              type="text"
              fullWidth
              variant="outlined"
              value={formData.package_name}
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
    </PageLayout>
  );
};

export default Packages;