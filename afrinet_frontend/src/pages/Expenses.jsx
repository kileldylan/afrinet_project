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

const Expenses = () => {
  const expensesData = [
    { date: '01/07/2025', description: 'Internet Subscription', amount: 'Ksh 5,000.00', category: 'Utilities', status: 'Pending' },
    { date: '30/06/2025', description: 'Office Rent', amount: 'Ksh 15,000.00', category: 'Rent', status: 'Paid' },
    { date: '28/06/2025', description: 'Staff Salaries', amount: 'Ksh 50,000.00', category: 'Salaries', status: 'Paid' },
    { date: '25/06/2025', description: 'Equipment Purchase', amount: 'Ksh 20,000.00', category: 'Equipment', status: 'Pending' },
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
          Expenses
        </Typography>
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Button variant="outlined" color="primary" sx={{ mr: 1 }}>All (4)</Button>
            <Button variant="outlined" color="primary" sx={{ mr: 1 }}>Paid (2)</Button>
            <Button variant="outlined" color="primary">Pending (2)</Button>
          </Box>
          <Button
            variant="contained"
            color="warning"
            startIcon={<Add />}
            sx={{ backgroundColor: '#ff9800', '&:hover': { backgroundColor: '#f57c00' } }}
          >
            Record Expense
          </Button>
        </Box>
        <Paper elevation={3} sx={{ p: 2, borderRadius: 2 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {expensesData.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell>{row.date}</TableCell>
                    <TableCell>{row.description}</TableCell>
                    <TableCell>{row.amount}</TableCell>
                    <TableCell>{row.category}</TableCell>
                    <TableCell>
                      <span style={{ color: row.status === 'Paid' ? '#4caf50' : '#f44336' }}>
                        {row.status}
                      </span>
                    </TableCell>
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

export default Expenses;