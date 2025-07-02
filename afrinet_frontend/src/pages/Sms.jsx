import React from 'react';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button } from '@mui/material';
import Sidebar from './Sidebar';
import { Add } from '@mui/icons-material';

const SMS = () => {
  const smsData = [
    { id: 1, recipient: '254712345678', message: 'Your bill is due', date: 'Jul 02, 2025 02:00 PM', status: 'Sent' },
    { id: 2, recipient: '254798765432', message: 'Welcome to Afrinet', date: 'Jul 02, 2025 01:30 PM', status: 'Pending' },
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
          SMS Management
        </Typography>
        <Box sx={{ mb: 2 }}>
          <Button variant="contained" color="warning" startIcon={<Add />} sx={{ backgroundColor: '#ff9800', '&:hover': { backgroundColor: '#f57c00' } }}>
            Send New SMS
          </Button>
        </Box>
        <Paper elevation={3} sx={{ p: 2, borderRadius: 2 }}>
          <TableContainer>
            <Table>
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
      </Box>
    </Box>
  );
};

export default SMS;