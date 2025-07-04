import React from 'react';
import { Box, Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { Add } from '@mui/icons-material';
import PageLayout from './PageLayout';

const Vouchers = () => {
  const vouchersData = [
    { code: 'VCH-123456', package: '1 Hour unlimited', price: 'Ksh 10.00', expiry: '03/07/2025 01:32', status: 'Active', created: '02/07/2025 12:00' },
    { code: 'VCH-789012', package: '6 hours unlimited', price: 'Ksh 20.00', expiry: '04/07/2025 01:32', status: 'Active', created: '02/07/2025 12:05' },
    { code: 'VCH-345678', package: '12 Hours unlimited', price: 'Ksh 30.00', expiry: '05/07/2025 01:32', status: 'Active', created: '02/07/2025 12:10' },
    { code: 'VCH-901234', package: '24 Hours unlimited', price: 'Ksh 50.00', expiry: '06/07/2025 01:32', status: 'Active', created: '02/07/2025 12:15' },
  ];

  return (
    <PageLayout 
      title="Vouchers" 
      description="Manage and create voucher codes"
    >
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          color="warning"
          startIcon={<Add />}
          sx={{ 
            backgroundColor: '#ff9800', 
            '&:hover': { backgroundColor: '#f57c00' } 
          }}
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
    </PageLayout>
  );
};

export default Vouchers;