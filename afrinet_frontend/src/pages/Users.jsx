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
import { CloudUpload, PersonAdd } from '@mui/icons-material';

const Users = () => {
  const usersData = [
    { username: 'T-12:B6:17:33:A:19', phone: '-', package: 'Free Trial', expiry: '3 hours from now', status: 'Active', lastOnline: '1 hour ago' },
    { username: 'A271', phone: '0719235952', package: '6 hours unlimited', expiry: '3 hours from now', status: 'Active', lastOnline: 'Online' },
    { username: 'A270', phone: '0722567024', package: '1 hour unlimited', expiry: 'Expired', status: 'Active', lastOnline: 'Never' },
    { username: 'T-9E:BB:2D:30:E:20', phone: '-', package: 'Free Trial', expiry: 'Expired', status: 'Active', lastOnline: '20 hours ago' },
    { username: 'A268', phone: '0743102939', package: '1 hour unlimited', expiry: 'Expired', status: 'Active', lastOnline: '22 hours ago' },
    { username: 'A267', phone: '0711598467', package: '6 hours unlimited', expiry: 'Expired', status: 'Active', lastOnline: '22 hours ago' },
    { username: 'A266', phone: '0722765021', package: '12 Hours unlimited', expiry: 'Expired', status: 'Active', lastOnline: '19 hours ago' },
    { username: 'A265', phone: '0114033310', package: '1 hour unlimited', expiry: 'Expired', status: 'Active', lastOnline: 'Never' },
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
          Users
        </Typography>
        <Typography variant="body2" mb={2} color="text.secondary">
          All users including hotspot and PPPoE users
        </Typography>
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Button variant="outlined" color="primary" sx={{ mr: 1 }}>All (271)</Button>
            <Button variant="outlined" color="primary" sx={{ mr: 1 }}>Hotspot (271)</Button>
            <Button variant="outlined" color="primary" sx={{ mr: 1 }}>PPPoE (0)</Button>
            <Button variant="outlined" color="primary">Paused (0)</Button>
          </Box>
          <Box>
            <Button
              variant="contained"
              color="warning"
              startIcon={<CloudUpload />}
              sx={{ mr: 2, backgroundColor: '#ff9800', '&:hover': { backgroundColor: '#f57c00' } }}
            >
              Import Users
            </Button>
            <Button
              variant="contained"
              color="warning"
              startIcon={<PersonAdd />}
              sx={{ backgroundColor: '#ff9800', '&:hover': { backgroundColor: '#f57c00' } }}
            >
              Create User
            </Button>
          </Box>
        </Box>
        <Paper elevation={3} sx={{ p: 2, borderRadius: 2 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Username</TableCell>
                  <TableCell>Phone</TableCell>
                  <TableCell>Package</TableCell>
                  <TableCell>Expiry</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Last Online</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {usersData.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell>{row.username}</TableCell>
                    <TableCell>{row.phone}</TableCell>
                    <TableCell>{row.package}</TableCell>
                    <TableCell>{row.expiry}</TableCell>
                    <TableCell>
                      <span style={{ color: row.status === 'Active' ? '#4caf50' : '#f44336' }}>
                        {row.status}
                      </span>
                    </TableCell>
                    <TableCell>{row.lastOnline}</TableCell>
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

export default Users;