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

  // Safe data fetching with validation
  const fetchData = async () => {
    setLoading(true);
    try {
      const [vouchersRes, packagesRes] = await Promise.all([
        axiosInstance.get('/api/vouchers/'),
        axiosInstance.get('/api/packages/')
      ]);

      // Validate and transform vouchers data
      const validatedVouchers = Array.isArray(vouchersRes?.data) 
        ? vouchersRes.data
            .filter(v => v && v.id) // Remove invalid entries
            .map(v => ({
              ...v,
              payment: v.payment ? {
                ...v.payment,
                package: v.payment.package ? {
                  ...v.payment.package,
                  price: Number(v.payment.package.price) || 0 // Ensure price is a number
                } : null
              } : null
            }))
        : [];

      // Validate packages data
      const validatedPackages = Array.isArray(packagesRes?.data) 
        ? packagesRes.data
            .filter(p => p && p.id)
            .map(p => ({
              ...p,
              price: Number(p.price) || 0 // Ensure price is a number
            }))
        : [];

      setVouchers(validatedVouchers);
      setPackages(validatedPackages);
    } catch (error) {
      console.error('Fetch error:', error);
      setSnackbar({
        open: true,
        message: 'Failed to fetch data. Please try again.',
        severity: 'error'
      });
      setVouchers([]);
      setPackages([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle voucher creation
  const handleCreateVouchers = async () => {
    if (!selectedPackage) return;
    
    try {
      const response = await axiosInstance.post('/api/vouchers/generate/', {
        package_id: selectedPackage,
        quantity: quantity
      });
      
      // Validate and transform new vouchers
      const newVouchers = Array.isArray(response?.data) 
        ? response.data
            .filter(v => v && v.id)
            .map(v => ({
              ...v,
              payment: v.payment ? {
                ...v.payment,
                package: v.payment.package ? {
                  ...v.payment.package,
                  price: Number(v.payment.package.price) || 0
                } : null
              } : null
            }))
        : [];
      
      if (newVouchers.length > 0) {
        setVouchers(prev => [...newVouchers, ...prev]);
        setSnackbar({
          open: true,
          message: `${newVouchers.length} voucher(s) created successfully`,
          severity: 'success'
        });
        setCreateDialogOpen(false);
        setSelectedPackage('');
        setQuantity(1);
      } else {
        throw new Error('No valid vouchers were created');
      }
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
    if (!voucherId) return;
    
    try {
      await axiosInstance.patch(`/api/vouchers/${voucherId}/`, {
        status: newStatus
      });
      
      setVouchers(prev => prev.map(v => 
        v?.id === voucherId ? {...v, is_used: newStatus === 'used'} : v
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
      setSelectedVoucher(null);
    }
  };

  // Safe date formatting
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      return format(new Date(dateString), 'dd/MM/yyyy HH:mm');
    } catch {
      return dateString; // Return raw string if formatting fails
    }
  };

  // Safe menu handling
  const handleMenuOpen = (event, voucher) => {
    if (!voucher?.id) {
      setSnackbar({
        open: true,
        message: 'Invalid voucher selected',
        severity: 'error'
      });
      return;
    }
    setAnchorEl(event.currentTarget);
    setSelectedVoucher(voucher);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedVoucher(null);
  };

  // Render table rows safely
  const renderTableRows = () => {
    if (loading) {
      return (
        <TableRow>
          <TableCell colSpan={7} align="center">
            <CircularProgress />
          </TableCell>
        </TableRow>
      );
    }

    if (!Array.isArray(vouchers)) {
      return (
        <TableRow>
          <TableCell colSpan={7} align="center">
            <Alert severity="error">Invalid data format</Alert>
          </TableCell>
        </TableRow>
      );
    }

    if (vouchers.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={7} align="center">
            No vouchers found
          </TableCell>
        </TableRow>
      );
    }

    return vouchers.map((voucher) => {
      if (!voucher?.id) return null;

      // Safely handle price display
      const price = voucher.payment?.package?.price;
      const displayPrice = typeof price === 'number' 
        ? `Ksh ${price.toFixed(2)}` 
        : 'N/A';

      return (
        <TableRow key={voucher.id}>
          <TableCell>{voucher.code || 'N/A'}</TableCell>
          <TableCell>
            {voucher.payment?.package?.package_name || 'N/A'}
          </TableCell>
          <TableCell>
            {displayPrice}
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
            <IconButton onClick={(e) => handleMenuOpen(e, voucher)}>
              <MoreVert />
            </IconButton>
          </TableCell>
        </TableRow>
      );
    });
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
              {renderTableRows()}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

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
              {Array.isArray(packages) && packages.map((pkg) => (
                pkg?.id && (
                  <MenuItem key={pkg.id} value={pkg.id}>
                    {pkg.package_name || 'Unnamed Package'} (Ksh {typeof pkg.price === 'number' ? pkg.price.toFixed(2) : '0.00'})
                  </MenuItem>
                )
              ))}
            </Select>
          </FormControl>
          <TextField
            fullWidth
            margin="normal"
            label="Quantity"
            type="number"
            value={quantity}
            onChange={(e) => {
              const value = parseInt(e.target.value);
              setQuantity(isNaN(value) || value < 1 ? 1 : value);
            }}
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
        {selectedVoucher?.id && (
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