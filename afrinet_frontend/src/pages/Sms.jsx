import React from 'react';
import { Box, Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { Add } from '@mui/icons-material';
import PageLayout from './PageLayout';

const SMS = () => {
  const smsData = [
    { id: 1, recipient: '254712345678', message: 'Your bill is due', date: 'Jul 02, 2025 02:00 PM', status: 'Sent' },
    { id: 2, recipient: '254798765432', message: 'Welcome to Afrinet', date: 'Jul 02, 2025 01:30 PM', status: 'Pending' },
  ];

  return (
    <PageLayout 
      title="SMS Management" 
      description="View and manage sent SMS messages"
    >
      <Box sx={{ mb: 2 }}>
        <Button 
          variant="contained" 
          color="warning" 
          startIcon={<Add />} 
          sx={{ 
            backgroundColor: '#ff9800', 
            '&:hover': { backgroundColor: '#f57c00' } 
          }}
        >
          Send New SMS
        </Button>
      </Box>
      
      <Paper elevation={3} sx={{ p: 2, borderRadius: 2, overflow: 'hidden' }}>
        <TableContainer sx={{ overflowX: 'auto' }}>
          <Table sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Recipient</TableCell>
                <TableCell>Message</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {smsData.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{row.id}</TableCell>
                  <TableCell>{row.recipient}</TableCell>
                  <TableCell>{row.message}</TableCell>
                  <TableCell>{row.date}</TableCell>
                  <TableCell>{row.status}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </PageLayout>
  );
};

export default SMS;