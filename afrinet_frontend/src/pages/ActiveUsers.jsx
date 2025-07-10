import React, { useState, useEffect } from 'react';
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
  IconButton,
  Tooltip,
  CircularProgress,
  Snackbar,
  Alert,
} from '@mui/material';
import { PersonAdd, Delete, Refresh } from '@mui/icons-material';
import PageLayout from './PageLayout';
import { fetchActiveUsers, disconnectUser, fetchActiveUserStats } from '../api/api_service';

const ActiveUsers = () => {
  const [activeUsers, setActiveUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [users, statsData] = await Promise.all([
        fetchActiveUsers(),
        fetchActiveUserStats(),
      ]);
      setActiveUsers(users);
      setStats(statsData);
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to fetch active users',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDisconnect = async (sessionId) => {
    const success = await disconnectUser(sessionId);
    if (success) {
      setSnackbar({
        open: true,
        message: 'User disconnected successfully',
        severity: 'success',
      });
      fetchData(); // Refresh the list
    } else {
      setSnackbar({
        open: true,
        message: 'Failed to disconnect user',
        severity: 'error',
      });
    }
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatTimeRemaining = (minutes) => {
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return `${hours}h ${mins}m`;
    }
    return `${minutes}m`;
  };

  return (
    <PageLayout title="ACTIVE USERS" disablePadding>
      <Typography variant="h5" fontWeight="bold" mb={3} color="text.primary">
        Active Users
        {stats && (
          <Typography variant="subtitle1" color="text.secondary">
            {stats.active_users} active users | {formatBytes(stats.total_data_used)} transferred
          </Typography>
        )}
      </Typography>

      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between' }}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<Refresh />}
          onClick={fetchData}
          disabled={loading}
        >
          Refresh
        </Button>
        <Button
          variant="contained"
          color="warning"
          startIcon={<PersonAdd />}
          sx={{ backgroundColor: '#ff9800', '&:hover': { backgroundColor: '#f57c00' } }}
          disabled={!selectedUser}
          onClick={() => selectedUser && handleDisconnect(selectedUser.session_id)}
        >
          Kick Selected User
        </Button>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      ) : (
        <Paper elevation={3} sx={{ p: 2, borderRadius: 2 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Username</TableCell>
                  <TableCell>Phone</TableCell>
                  <TableCell>IP</TableCell>
                  <TableCell>Package</TableCell>
                  <TableCell>Time Remaining</TableCell>
                  <TableCell>Upload</TableCell>
                  <TableCell>Download</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {activeUsers.length > 0 ? (
                  activeUsers.map((user) => (
                    <TableRow 
                      key={user.session_id}
                      hover
                      selected={selectedUser?.session_id === user.session_id}
                      onClick={() => setSelectedUser(user)}
                    >
                      <TableCell>{user.user?.username || user.device_mac}</TableCell>
                      <TableCell>{user.phone || '-'}</TableCell>
                      <TableCell>{user.ip_address}</TableCell>
                      <TableCell>{user.package?.package_name || 'Unknown'}</TableCell>
                      <TableCell>{formatTimeRemaining(user.time_remaining)}</TableCell>
                      <TableCell>{formatBytes(user.data_used / 2)}</TableCell> {/* Assuming half is upload */}
                      <TableCell>{formatBytes(user.data_used / 2)}</TableCell> {/* Assuming half is download */}
                      <TableCell>
                        <Tooltip title="Disconnect">
                          <IconButton
                            color="error"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDisconnect(user.session_id);
                            }}
                          >
                            <Delete />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      No active users found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </PageLayout>
  );
};

export default ActiveUsers;