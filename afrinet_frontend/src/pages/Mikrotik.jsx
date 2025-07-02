import React from 'react';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button } from '@mui/material';
import Sidebar from './Sidebar';
import { Settings } from '@mui/icons-material';

const Mikrotik = () => {
  const mikrotikData = [
    { id: 1, device: 'Router-01', ip: '192.168.1.1', status: 'Online', lastUpdate: 'Jul 02, 2025 02:45 PM' },
    { id: 2, device: 'Router-02', ip: '192.168.1.2', status: 'Offline', lastUpdate: 'Jul 02, 2025 01:15 PM' },
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
          Mikrotik Management
        </Typography>
        <Box sx={{ mb: 2 }}>
          <Button variant="contained" color="warning" startIcon={<Settings />} sx={{ backgroundColor: '#ff9800', '&:hover': { backgroundColor: '#f57c00' } }}>
            Configure Device
          </Button>
        </Box>
        <Paper elevation={3} sx={{ p: 2, borderRadius: 2 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Device</TableCell>
                  <TableCell>IP Address</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Last Update</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {mikrotikData.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>{row.id}</TableCell>
                    <TableCell>{row.device}</TableCell>
                    <TableCell>{row.ip}</TableCell>
                    <TableCell>{row.status}</TableCell>
                    <TableCell>{row.lastUpdate}</TableCell>
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

export default Mikrotik;