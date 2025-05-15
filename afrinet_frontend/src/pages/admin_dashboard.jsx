import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Button,
  Card,
  CardContent,
  Typography,
  Grid,
  Container,
  Box,
  Chip,
  Divider,
  Paper,
  useTheme,
  Avatar,
  Stack,
  CircularProgress,
  Snackbar,
  Alert,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer
} from "@mui/material";
import {
  Wifi,
  Speed,
  Public,
  ContactPhone,
  CheckCircle
} from "@mui/icons-material";

const AdminDashboard = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const theme = useTheme();

  const fetchSessions = async () => {
    try {
      const res = await axios.get("https://afrinet-project.onrender.com/api/sessions/");
      const data = res.data;
  
      if (Array.isArray(data)) {
        setSessions(data);
      } else {
        console.warn("Expected array but got:", data);
        setSessions([]); // Fallback to empty array to avoid .map() crash
      }
    } catch (err) {
      console.error("Error fetching sessions:", err);
      setSnackbar({
        open: true,
        message: 'Failed to load sessions. Please try again.',
        severity: 'error'
      });
      setSessions([]); // Avoid null or undefined
    } finally {
      setLoading(false);
    }
  };  

  const disconnectUser = async (id) => {
    try {
      await axios.post(`https://afrinet-project.onrender.com/api/sessions/disconnect/${id}/`);
      setSnackbar({
        open: true,
        message: 'User disconnected successfully',
        severity: 'success'
      });
      fetchSessions();
    } catch (err) {
      console.error("Error disconnecting user:", err);
      setSnackbar({
        open: true,
        message: 'Failed to disconnect user',
        severity: 'error'
      });
    }
  };

  useEffect(() => {
    fetchSessions();
    const interval = setInterval(fetchSessions, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  return (
    <Container maxWidth="lg" sx={{ 
      py: { xs: 3, sm: 4, md: 6 },
      background: 'linear-gradient(to bottom, #a8edea, #fed6e3)',
      minHeight: '100vh'
    }}>
      {/* Hero Section */}
      <Box sx={{ 
        textAlign: 'center', 
        mb: { xs: 4, sm: 5, md: 6 },
        px: { xs: 1, sm: 2, md: 0 }
      }}>
        <Avatar sx={{ 
          bgcolor: 'primary.main', 
          width: 80, 
          height: 80,
          mx: 'auto',
          mb: 3
        }}>
          <Wifi sx={{ fontSize: 40 }} />
        </Avatar>

        <Typography 
          variant="h3" 
          component="h1" 
          gutterBottom 
          sx={{ 
            fontWeight: 800,
            letterSpacing: 0.5,
            color: theme.palette.primary.dark,
            lineHeight: 1.2,
            fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' }
          }}
        >
          Active Sessions Dashboard
        </Typography>

        <Typography 
          variant="h6" 
          color="text.secondary"
          sx={{ maxWidth: 700, mx: 'auto', fontSize: { xs: '0.95rem', sm: '1rem' } }}
        >
          Monitor and manage all active user sessions
        </Typography>
      </Box>

      {/* Sessions Table */}
      <Box sx={{ 
        width: '100%',
        maxWidth: '1400px',
        mx: 'auto',
        mb: { xs: 4, sm: 6 }
      }}>
        {loading ? (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress />
          </Box>
        ) : (
          <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
            <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: 'primary.light' }}>
                    <TableCell sx={{ fontWeight: 600 }}>User</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>IP Address</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Package</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Start Time</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Time Remaining</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sessions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                        <Typography color="text.secondary">
                          💤 No active sessions at the moment.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    sessions.map((session) => (
                      <TableRow key={session.id} hover>
                        <TableCell>{session.user_phone || session.device_mac}</TableCell>
                        <TableCell>{session.ip_address}</TableCell>
                        <TableCell>{session.package_name}</TableCell>
                        <TableCell>
                          {new Date(session.start_time).toLocaleString()}
                        </TableCell>
                        <TableCell>{session.time_remaining} min</TableCell>
                        <TableCell>
                          <Chip 
                            label={session.status} 
                            color={session.status === "active" ? "success" : "error"}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {session.status === "active" && (
                            <Button
                              variant="contained"
                              color="error"
                              size="small"
                              onClick={() => disconnectUser(session.id)}
                              sx={{
                                borderRadius: 2,
                                fontWeight: 'bold',
                                textTransform: 'none'
                              }}
                            >
                              Disconnect
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        )}
      </Box>

      {/* Footer */}
      <Divider sx={{ my: 3 }} />
      <Box sx={{ 
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        <Avatar sx={{ 
          bgcolor: 'primary.light', 
          color: 'primary.dark',
          mb: 2,
          width: 50,
          height: 50
        }}>
          <Public />
        </Avatar>
        <Typography variant="body1" color="text.secondary">
          Need help with administration?
        </Typography>
        <Button 
          variant="text" 
          color="primary" 
          size="medium" 
          startIcon={<ContactPhone />}
          sx={{ mt: 1, fontWeight: 'bold' }}
        >
          Contact technical support
        </Button>
        <Typography variant="caption" color="text.disabled" mt={2}>
          © {new Date().getFullYear()} AfriNet Communications
        </Typography>
      </Box>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default AdminDashboard;