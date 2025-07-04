import React from 'react';
import { Box, Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { Add } from '@mui/icons-material';
import PageLayout from './PageLayout';

const Expenses = () => {
  const expensesData = [
    { date: '01/07/2025', description: 'Internet Subscription', amount: 'Ksh 5,000.00', category: 'Utilities', status: 'Pending' },
    { date: '30/06/2025', description: 'Office Rent', amount: 'Ksh 15,000.00', category: 'Rent', status: 'Paid' },
    { date: '28/06/2025', description: 'Staff Salaries', amount: 'Ksh 50,000.00', category: 'Salaries', status: 'Paid' },
    { date: '25/06/2025', description: 'Equipment Purchase', amount: 'Ksh 20,000.00', category: 'Equipment', status: 'Pending' },
  ];

  return (
    <PageLayout 
      title="Expenses" 
      description="Track and manage your business expenses"
    >
      <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          <Button variant="outlined" color="primary">All (4)</Button>
          <Button variant="outlined" color="primary">Paid (2)</Button>
          <Button variant="outlined" color="primary">Pending (2)</Button>
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
        >
          Record Expense
        </Button>
      </Box>

      <Paper elevation={3} sx={{ p: 2, borderRadius: 2, overflow: 'hidden' }}>
        <TableContainer sx={{ overflowX: 'auto' }}>
          <Table sx={{ minWidth: 650 }}>
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
    </PageLayout>
  );
};

export default Expenses;