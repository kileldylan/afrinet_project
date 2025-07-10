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
  IconButton,
  Menu,
  MenuItem,
  CircularProgress,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  FormControl,
  InputLabel,
  Typography
} from '@mui/material';
import { Add, Refresh, MoreVert } from '@mui/icons-material';
import PageLayout from './PageLayout';
import axiosInstance from '../api/axios';
import { format } from 'date-fns';

const Vouchers = () => {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [packages, setPackages] = useState([]);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedVoucher, setSelectedVoucher] = useState(null);

  // Fetch data from API
  const fetchData = async () => {
    setLoading(true);
    try {
      const [vouchersRes, packagesRes] = await Promise.all([
        axiosInstance.get('/api/vouchers/'),
        axiosInstance.get('/api/packages/')
      ]);
      setVouchers(vouchersRes.data);
      setPackages(packagesRes.data);
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to fetch data',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle voucher creation
  const handleCreateVouchers = async () => {
    try {
      const response = await axiosInstance.post('/api/vouchers/generate/', {
        package_id: selectedPackage,
        quantity: quantity
      });
      setVouchers([...response.data, ...vouchers]);
      setSnackbar({
        open: true,
        message: 'Vouchers created successfully',
        severity: 'success'
      });
      setCreateDialogOpen(false);
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to create vouchers',
        severity: 'error'
      });
    }
  };

  // Handle voucher status change
  const handleStatusChange = async (voucherId, newStatus) => {
    try {
      await axiosInstance.patch(`/api/vouchers/${voucherId}/`, {
        status: newStatus
      });
      setVouchers(vouchers.map(v => 
        v.id === voucherId ? {...v, status: newStatus} : v
      ));
      setSnackbar({
        open: true,
        message: 'Voucher updated successfully',
        severity: 'success'
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to update voucher',
        severity: 'error'
      });
    } finally {
      setAnchorEl(null);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return format(new Date(dateString), 'dd/MM/yyyy HH:mm');
  };

  // Handle menu open
  const handleMenuOpen = (event, voucher) => {
    setAnchorEl(event.currentTarget);
    setSelectedVoucher(voucher);
  };

  // Handle menu close
  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedVoucher(null);
  };

  return (
    <PageLayout 
      title="Vouchers" 
      description="Manage and create voucher codes"
    >
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between' }}>
        <Button
          variant="contained"
          startIcon={<Refresh />}
          onClick={fetchData}
          disabled={loading}
        >
          Refresh
        </Button>
        <Button
          variant="contained"
          color="warning"
          startIcon={<Add />}
          sx={{ 
            backgroundColor: '#ff9800', 
            '&:hover': { backgroundColor: '#f57c00' } 
          }}
          onClick={() => setCreateDialogOpen(true)}
        >
          Create Voucher
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
                  <TableCell>Code</TableCell>
                  <TableCell>Package</TableCell>
                  <TableCell>Price</TableCell>
                  <TableCell>Expiry</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {vouchers.length > 0 ? (
                  vouchers.map((voucher) => (
                    <TableRow key={voucher.id}>
                      <TableCell>{voucher.code}</TableCell>
                      <TableCell>
                        {voucher.payment?.package?.package_name || 'N/A'}
                      </TableCell>
                      <TableCell>
                        {voucher.payment?.package?.price ? 
                          `Ksh ${voucher.payment.package.price.toFixed(2)}` : 'N/A'}
                      </TableCell>
                      <TableCell>{formatDate(voucher.end_time)}</TableCell>
                      <TableCell>
                        <Typography 
                          color={voucher.is_used ? 'error' : 'success.main'}
                          fontWeight="bold"
                        >
                          {voucher.is_used ? 'Used' : 'Active'}
                        </Typography>
                      </TableCell>
                      <TableCell>{formatDate(voucher.created_at)}</TableCell>
                      <TableCell>
                        <IconButton
                          onClick={(e) => handleMenuOpen(e, voucher)}
                        >
                          <MoreVert />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      No vouchers found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* Create Voucher Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)}>
        <DialogTitle>Create New Vouchers</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="normal">
            <InputLabel>Package</InputLabel>
            <Select
              value={selectedPackage}
              label="Package"
              onChange={(e) => setSelectedPackage(e.target.value)}
              required
            >
              {packages.map((pkg) => (
                <MenuItem key={pkg.id} value={pkg.id}>
                  {pkg.package_name} (Ksh {pkg.price.toFixed(2)})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            fullWidth
            margin="normal"
            label="Quantity"
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
            inputProps={{ min: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleCreateVouchers}
            disabled={!selectedPackage}
            variant="contained"
            color="primary"
          >
            Generate
          </Button>
        </DialogActions>
      </Dialog>

      {/* Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        {selectedVoucher && (
          <>
            <MenuItem 
              onClick={() => handleStatusChange(selectedVoucher.id, 'active')}
              disabled={!selectedVoucher.is_used}
            >
              Mark as Active
            </MenuItem>
            <MenuItem 
              onClick={() => handleStatusChange(selectedVoucher.id, 'used')}
              disabled={selectedVoucher.is_used}
            >
              Mark as Used
            </MenuItem>
          </>
        )}
      </Menu>

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

export default Vouchers;