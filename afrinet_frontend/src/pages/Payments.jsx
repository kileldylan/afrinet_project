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
  Tabs,
  Tab,
  AppBar,
  CircularProgress,
  Chip,
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
import { Add, CheckCircle, Cancel, HourglassEmpty } from '@mui/icons-material';
import axiosInstance from '../api/axios';
import PageLayout from './PageLayout';

const Payments = () => {
  const [tabValue, setTabValue] = useState(0);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [formData, setFormData] = useState({
    phone_number: '',
    amount: '',
    package_id: '',
  });

  // Fetch payments based on tab selection
  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setLoading(true);
        const endpoint = tabValue === 0 ? '/api/payments/?checked=true' : '/api/payments/?checked=false';
        const response = await axiosInstance.get(endpoint);
        setPayments(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch payments');
        console.error('Payment fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, [tabValue]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmitPayment = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.post('/mpesa/stk-push/', formData);
      
      if (response.data.success) {
        // Refresh payments list
        const endpoint = `/api/payments/?checked=${tabValue === 0}`;
        const updatedPayments = await axiosInstance.get(endpoint);
        setPayments(updatedPayments.data);
        
        // Close modal and reset form
        setOpenModal(false);
        setFormData({
          phone: '',
          amount: '',
          package_id: '',
        });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Payment failed');
      console.error('Payment submission error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusChip = (status) => {
    const statusMap = {
      completed: { icon: <CheckCircle fontSize="small" />, color: 'success' },
      failed: { icon: <Cancel fontSize="small" />, color: 'error' },
      pending: { icon: <HourglassEmpty fontSize="small" />, color: 'warning' },
    };

    return (
      <Chip
        icon={statusMap[status]?.icon}
        label={status}
        color={statusMap[status]?.color || 'default'}
        variant="outlined"
        size="small"
      />
    );
  };

  return (
    <PageLayout title="Payments" description="View and manage payment records">
      {/* Tabs for payment filtering */}
      <AppBar position="static" color="default" sx={{ mb: 3, borderRadius: 1, boxShadow: 'none' }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Verified Payments" />
          <Tab label="Pending Verification" />
        </Tabs>
      </AppBar>

      {/* Payments Table */}
      {loading ? (
        <Box display="flex" justifyContent="center" p={4}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : (
        <Paper elevation={3} sx={{ p: 2, mb: 3, borderRadius: 2 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>User</TableCell>
                  <TableCell>Phone</TableCell>
                  <TableCell>Receipt No.</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Paid At</TableCell>
                  <TableCell>Package</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>{payment.user?.username || 'N/A'}</TableCell>
                    <TableCell>{payment.phone_number}</TableCell>
                    <TableCell>{payment.mpesa_receipt || 'Pending'}</TableCell>
                    <TableCell>Ksh {payment.amount}</TableCell>
                    <TableCell>{getStatusChip(payment.status)}</TableCell>
                    <TableCell>
                      {new Date(payment.created_at).toLocaleString()}
                    </TableCell>
                    <TableCell>{payment.package?.name || 'N/A'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* Record Payment Modal */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)}>
        <DialogTitle>Initiate New Payment</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="normal">
            <TextField
              label="Phone Number"
              name="phone_number"
              value={formData.phone_number}
              onChange={handleInputChange}
              required
            />
          </FormControl>
          <FormControl fullWidth margin="normal">
            <TextField
              label="Amount"
              name="amount"
              type="number"
              value={formData.amount}
              onChange={handleInputChange}
              required
            />
          </FormControl>
          <FormControl fullWidth margin="normal">
            <InputLabel>Package</InputLabel>
            <Select
              name="package_id"
              value={formData.package_id}
              onChange={handleInputChange}
              required
            >
              <MenuItem value="daily">Daily Package</MenuItem>
              <MenuItem value="weekly">Weekly Package</MenuItem>
              <MenuItem value="monthly">Monthly Package</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenModal(false)}>Cancel</Button>
          <Button 
            onClick={handleSubmitPayment} 
            color="primary" 
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Initiate Payment'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Record Payment Button */}
      <Box textAlign="right">
        <Button
          variant="contained"
          color="warning"
          startIcon={<Add />}
          onClick={() => setOpenModal(true)}
          sx={{ 
            backgroundColor: '#ff9800', 
            '&:hover': { backgroundColor: '#f57c00' },
          }}
        >
          Record Payment
        </Button>
      </Box>
    </PageLayout>
  );
};

export default Payments;