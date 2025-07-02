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

const Packages = () => {
  const packagesData = [
    { name: '1 Hour unlimited', price: 'Ksh 10.00', speed: '3M/3M', time: '1 Hour', type: 'Hotspot', devices: 1, enabled: 'Yes' },
    { name: '6 hours unlimited', price: 'Ksh 20.00', speed: '5M/5M', time: '6 Hours', type: 'Hotspot', devices: 1, enabled: 'Yes' },
    { name: '12 Hours unlimited', price: 'Ksh 30.00', speed: '8M/8M', time: '12 Hours', type: 'Hotspot', devices: 1, enabled: 'Yes' },
    { name: '24 Hours unlimited', price: 'Ksh 50.00', speed: '10M/10M', time: '1 Day', type: 'Hotspot', devices: 1, enabled: 'Yes' },
    { name: '1 week unlimited', price: 'Ksh 200.00', speed: '10M/10M', time: '7 Days', type: 'Hotspot', devices: 1, enabled: 'Yes' },
    { name: '1 month unlimited', price: 'Ksh 1500.00', speed: '10M/10M', time: '1 Month', type: 'Hotspot', devices: 3, enabled: 'Yes' },
    { name: 'Free Trial', price: 'Free', speed: '5M/5M', time: '3 Minutes', type: 'Free Trial', devices: 1, enabled: 'Yes' },
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
          Packages
        </Typography>
        <Typography variant="body2" mb={2} color="text.secondary">
          All packages available to clients including hotspot, PPPoE and Data Plan packages
        </Typography>
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Button variant="outlined" color="primary" sx={{ mr: 1 }}>All (7)</Button>
            <Button variant="outlined" color="primary" sx={{ mr: 1 }}>Hotspot (6)</Button>
            <Button variant="outlined" color="primary" sx={{ mr: 1 }}>PPPoE (0)</Button>
            <Button variant="outlined" color="primary" sx={{ mr: 1 }}>Data Plans (0)</Button>
            <Button variant="outlined" color="primary">Free Trial (1)</Button>
          </Box>
          <Button
            variant="contained"
            color="warning"
            startIcon={<Add />}
            sx={{ backgroundColor: '#ff9800', '&:hover': { backgroundColor: '#f57c00' } }}
          >
            Create Package
          </Button>
        </Box>
        <Paper elevation={3} sx={{ p: 2, borderRadius: 2 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Price</TableCell>
                  <TableCell>Speed</TableCell>
                  <TableCell>Time</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Devices</TableCell>
                  <TableCell>Enabled</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {packagesData.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell>{row.name}</TableCell>
                    <TableCell>{row.price}</TableCell>
                    <TableCell>{row.speed}</TableCell>
                    <TableCell>{row.time}</TableCell>
                    <TableCell>{row.type}</TableCell>
                    <TableCell>{row.devices}</TableCell>
                    <TableCell>{row.enabled}</TableCell>
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

export default Packages;