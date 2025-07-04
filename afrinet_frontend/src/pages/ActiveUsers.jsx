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
import { PersonAdd } from '@mui/icons-material';

const ActiveUsers = () => {
  const activeUsersData = [
    { username: 'A271', phone: '0719235952', ip: '192.168.1.10', package: '6 hours unlimited', expiry: '4 hours from now', upload: '1.2 MB', download: '2.3 MB' },
    { username: 'T-12:B6:17:33:A:19', phone: '-', ip: '192.168.1.11', package: 'Free Trial', expiry: '2 hours from now', upload: '0.5 MB', download: '0.8 MB' },
    { username: 'A270', phone: '0722567024', ip: '192.168.1.12', package: '1 hour unlimited', expiry: '1 hour from now', upload: '0.9 MB', download: '1.5 MB' },
  ];

  return (
    <PageLayout 
      title="ACTIVE USERS" 
      disablePadding // Optional prop to remove default padding if needed
    >
        <Typography variant="h5" fontWeight="bold" mb={3} color="text.primary">
          Active Users
        </Typography>
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            color="warning"
            startIcon={<PersonAdd />}
            sx={{ backgroundColor: '#ff9800', '&:hover': { backgroundColor: '#f57c00' } }}
          >
            Kick User
          </Button>
        </Box>
        <Paper elevation={3} sx={{ p: 2, borderRadius: 2 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Username</TableCell>
                  <TableCell>Phone</TableCell>
                  <TableCell>IP</TableCell>
                  <TableCell>Package</TableCell>
                  <TableCell>Expiry</TableCell>
                  <TableCell>Upload</TableCell>
                  <TableCell>Download</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {activeUsersData.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell>{row.username}</TableCell>
                    <TableCell>{row.phone}</TableCell>
                    <TableCell>{row.ip}</TableCell>
                    <TableCell>{row.package}</TableCell>
                    <TableCell>{row.expiry}</TableCell>
                    <TableCell>{row.upload}</TableCell>
                    <TableCell>{row.download}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
     </PageLayout>
  );
};

export default ActiveUsers;