import React, { useState } from 'react';
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
} from '@mui/material';
import { Add } from '@mui/icons-material';
import PageLayout from './PageLayout';

const Payments = () => {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const paymentsData = [
    { user: 'A47', phone: '0740761455', receiptNo: 'TG24A0D4Y', amount: 'Ksh 20.00', checked: 'Yes', paidAt: '02/07/2025 13:05', disbursement: 'Direct' },
    { user: 'A44', phone: '0701831424', receiptNo: 'TG269W5VKE', amount: 'Ksh 20.00', checked: 'Yes', paidAt: '02/07/2025 12:39', disbursement: 'Direct' },
    { user: 'A48', phone: '0703841489', receiptNo: 'TG239SW0AP', amount: 'Ksh 20.00', checked: 'Yes', paidAt: '02/07/2025 12:19', disbursement: 'Direct' },
    { user: 'A271', phone: '0719235952', receiptNo: 'TG229JXS0Y', amount: 'Ksh 20.00', checked: 'Yes', paidAt: '02/07/2025 11:22', disbursement: 'Direct' },
    { user: 'A40', phone: '0706797247', receiptNo: 'TG269JINSG', amount: 'Ksh 30.00', checked: 'Yes', paidAt: '02/07/2025 11:16', disbursement: 'Direct' },
    { user: 'A253', phone: '0718386174', receiptNo: 'TG289E2ES', amount: 'Ksh 20.00', checked: 'Yes', paidAt: '02/07/2025 10:45', disbursement: 'Direct' },
    { user: 'A33', phone: '075440468', receiptNo: 'TG219DRY3F', amount: 'Ksh 20.00', checked: 'Yes', paidAt: '02/07/2025 10:43', disbursement: 'Direct' },
    { user: 'A213', phone: '071389437', receiptNo: 'TG19USUGX', amount: 'Ksh 10.00', checked: 'Yes', paidAt: '01/07/2025 21:41', disbursement: 'Direct' },
  ];

  return (
    <PageLayout 
      title="Payments" 
      description="View and manage payment records"
    >
      <AppBar 
        position="static" 
        color="default" 
        sx={{ 
          mb: 3, 
          borderRadius: 1,
          boxShadow: 'none',
          backgroundColor: 'transparent',
          backgroundImage: 'none'
        }}
      >
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          textColor="primary" 
          indicatorColor="primary"
          sx={{
            '& .MuiTabs-flexContainer': {
              gap: 1,
            },
            '& .MuiTab-root': {
              minHeight: 48,
              borderRadius: 1,
              '&.Mui-selected': {
                backgroundColor: 'rgba(0, 0, 0, 0.04)',
              }
            }
          }}
        >
          <Tab label="Checked payments" />
          <Tab label="Unchecked payments" />
        </Tabs>
      </AppBar>

      <Paper elevation={3} sx={{ p: 2, mb: 3, borderRadius: 2, overflow: 'hidden' }}>
        <TableContainer sx={{ overflowX: 'auto' }}>
          <Table sx={{ minWidth: 750 }}>
            <TableHead>
              <TableRow>
                <TableCell>User</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Receipt No.</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Checked</TableCell>
                <TableCell>Paid At</TableCell>
                <TableCell>Disbursement</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paymentsData.map((row, index) => (
                <TableRow key={index}>
                  <TableCell>{row.user}</TableCell>
                  <TableCell>{row.phone}</TableCell>
                  <TableCell>{row.receiptNo}</TableCell>
                  <TableCell>{row.amount}</TableCell>
                  <TableCell>{row.checked}</TableCell>
                  <TableCell>{row.paidAt}</TableCell>
                  <TableCell>{row.disbursement}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Box sx={{ textAlign: 'right' }}>
        <Button
          variant="contained"
          color="warning"
          startIcon={<Add />}
          sx={{ 
            backgroundColor: '#ff9800', 
            '&:hover': { backgroundColor: '#f57c00' },
            whiteSpace: 'nowrap'
          }}
        >
          Record Payment
        </Button>
      </Box>
    </PageLayout>
  );
};

export default Payments;