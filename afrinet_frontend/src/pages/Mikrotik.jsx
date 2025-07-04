import React from 'react';
import { Box, Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { Settings } from '@mui/icons-material';
import PageLayout from './PageLayout';

const Mikrotik = () => {
  const mikrotikData = [
    { id: 1, device: 'Router-01', ip: '192.168.1.1', status: 'Online', lastUpdate: 'Jul 02, 2025 02:45 PM' },
    { id: 2, device: 'Router-02', ip: '192.168.1.2', status: 'Offline', lastUpdate: 'Jul 02, 2025 01:15 PM' },
  ];

  return (
    <PageLayout 
      title="Mikrotik Management" 
      description="Manage your Mikrotik router devices"
    >
      <Box sx={{ mb: 2 }}>
        <Button 
          variant="contained" 
          color="warning" 
          startIcon={<Settings />} 
          sx={{ 
            backgroundColor: '#ff9800', 
            '&:hover': { backgroundColor: '#f57c00' } 
          }}
        >
          Configure Device
        </Button>
      </Box>
      
      <Paper elevation={3} sx={{ p: 2, borderRadius: 2, overflow: 'hidden' }}>
        <TableContainer sx={{ overflowX: 'auto' }}>
          <Table sx={{ minWidth: 650 }}>
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
    </PageLayout>
  );
};

export default Mikrotik;