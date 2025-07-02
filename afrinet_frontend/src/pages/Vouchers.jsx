import React from 'react';
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
} from '@mui/material';
import Sidebar from './Sidebar'; // Assuming Sidebar.jsx is available
import { Add } from '@mui/icons-material';

const Vouchers = () => {
  const vouchersData = [
    { code: 'VCH-123456', package: '1 Hour unlimited', price: 'Ksh 10.00', expiry: '03/07/2025 01:32', status: 'Active', created: '02/07/2025 12:00' },
    { code: 'VCH-789012', package: '6 hours unlimited', price: 'Ksh 20.00', expiry: '04/07/2025 01:32', status: 'Active', created: '02/07/2025 12:05' },
    { code: 'VCH-345678', package: '12 Hours unlimited', price: 'Ksh 30.00', expiry: '05/07/2025 01:32', status: 'Active', created: '02/07/2025 12:10' },
    { code: 'VCH-901234', package: '24 Hours unlimited', price: 'Ksh 50.00', expiry: '06/07/2025 01:32', status: 'Active', created: '02/07/2025 12:15' },
  ];

  return (
    <Box sx={{ display: 'flex', fontFamily: 'Roboto, sans-serif', backgroundColor: '#f5f5f5' }}>
      <Sidebar />
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
          Vouchers
        </Typography>
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            color="warning"
            startIcon={<Add />}
            sx={{ backgroundColor: '#ff9800', '&:hover': { backgroundColor: '#f57c00' } }}
          >
            Create Voucher
          </Button>
        </Box>
        <Paper elevation={3} sx={{ p: 2, borderRadius: 2 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Code</TableCell>
                  <TableCell>Package</TableCell>
                  <TableCell>Price</TableCell>
                  <TableCell>Expiry</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Created</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {vouchersData.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell>{row.code}</TableCell>
                    <TableCell>{row.package}</TableCell>
                    <TableCell>{row.price}</TableCell>
                    <TableCell>{row.expiry}</TableCell>
                    <TableCell>{row.status}</TableCell>
                    <TableCell>{row.created}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Box>
    </Box>
  );
};

export default Vouchers;