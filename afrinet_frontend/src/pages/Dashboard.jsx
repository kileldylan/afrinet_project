import React, { useState, useEffect } from "react";
import axios from 'axios';
import {
  Button,
  Card,
  CardContent,
  Typography,
  TextField,
  Grid,
  Container,
  Box,
  Divider,
  Paper,
  useTheme,
  Avatar,
  Stack,
  CircularProgress,
  Snackbar,
  Alert
} from "@mui/material";
import {
  LocalAtm,
  ContactPhone,
  CheckCircle,
  Wifi,
  Speed,
  Public,
  Payment
} from "@mui/icons-material";

const Dashboard = () => {
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [packages, setPackages] = useState([]);
  const [fetchingPackages, setFetchingPackages] = useState(true);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const theme = useTheme();

  // Fetch packages from Django backend
  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8000/api/packages/');
        setPackages(response.data);
      } catch (error) {
        console.error("Error fetching packages:", error);
        setSnackbar({
          open: true,
          message: 'Failed to load packages. Please try again later.',
          severity: 'error'
        });
      } finally {
        setFetchingPackages(false);
      }
    };

    fetchPackages();
  }, []);

  const handleSelect = (offer) => {
    setSelectedOffer(offer);
  };

  const handlePayment = async () => {
    if (!phoneNumber || !selectedOffer) {
      setSnackbar({
        open: true,
        message: 'Please enter your phone number',
        severity: 'error'
      });
      return;
    }

    if (!selectedOffer) {
      setSnackbar({
        open: true,
        message: 'Please select a package',
        severity: 'error'
      });
      return;
    }

    try {
      setLoading(true);
      
      // Format phone number exactly as backend expects (raw input)
      const rawPhone = phoneNumber.startsWith('254') 
        ? phoneNumber 
        : phoneNumber.startsWith('0') 
          ? `254${phoneNumber.substring(1)}` 
          : `254${phoneNumber}`;
  
      const response = await axios.post('http://127.0.0.1:8000/mpesa/stk-push/', {
        phone_number: rawPhone,  // Send as 254...
        amount: selectedOffer.price.toString(),  // Must be string
        account_reference: `WIFI_${selectedOffer.id}`,  // Match backend format
        transaction_desc: `Wifi ${selectedOffer.duration} Package`  // Match backend
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
  
      if (response.data.success) {
        setSnackbar({
          open: true,
          message: response.data.message || 'Payment initiated! Check your phone',
          severity: 'success'
        });
      } else {
        setSnackbar({
          open: true,
          message: response.data.message || 'Payment initiation failed',
          severity: 'error'
        });
      }
    } catch (error) {
      console.error("Payment error:", error);
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Payment failed. Please try again.';
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  if (fetchingPackages) {
    return (
      <Container maxWidth="lg" sx={{ 
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(to bottom, #a8edea, #fed6e3)'
      }}>
        <CircularProgress size={60} />
      </Container>
    );
  }

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
          Premium Internet Packages
        </Typography>

        <Typography 
          variant="h6" 
          color="text.secondary"
          sx={{ maxWidth: 700, mx: 'auto', fontSize: { xs: '0.95rem', sm: '1rem' } }}
        >
          Experience lightning-fast connectivity with our affordable, high-quality internet plans
        </Typography>
      </Box>

      {/* Packages Grid */}
      <Grid 
        container 
        spacing={{ xs: 2, sm: 3 }} 
        justifyContent="center"
        sx={{ mb: { xs: 4, sm: 6 } }}
      >
        {packages.map((pkg) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={pkg.id}>
            <Card
              onClick={() => handleSelect(pkg)}
              sx={{
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                border: selectedOffer?.id === pkg.id ? 
                  `2px solid ${theme.palette.primary.main}` : 
                  '1px solid rgba(0, 0, 0, 0.12)',
                boxShadow: selectedOffer?.id === pkg.id ? 
                  `0 8px 16px ${theme.palette.primary.light}` : 
                  '0 4px 12px rgba(0, 0, 0, 0.08)',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: `0 12px 20px ${theme.palette.primary.light}`
                },
                position: 'relative',
                overflow: 'visible',
                borderRadius: 3
              }}
            >
              {pkg.popular && (
                <Box sx={{
                  position: 'absolute',
                  top: -12,
                  right: 20,
                  bgcolor: 'secondary.main',
                  color: 'white',
                  px: 2,
                  py: 0.5,
                  borderRadius: 2,
                  fontSize: 12,
                  fontWeight: 'bold',
                  boxShadow: 2
                }}>
                  MOST POPULAR
                </Box>
              )}

              <CardContent sx={{ 
                textAlign: 'center', 
                flexGrow: 1,
                pt: pkg.popular ? 4 : 3
              }}>
                <Stack direction="row" alignItems="center" justifyContent="center" spacing={1} mb={1}>
                  <Speed color="primary" />
                  <Typography variant="body2" color="primary">
                    {pkg.speed}
                  </Typography>
                </Stack>

                <Typography 
                  variant="h4" 
                  component="h2" 
                  sx={{ 
                    color: theme.palette.primary.dark,
                    fontWeight: 700,
                    mb: 1
                  }}
                >
                  Ksh {pkg.price}
                </Typography>

                <Typography 
                  variant="body1" 
                  color="text.secondary" 
                  sx={{ mb: 2 }}
                >
                  {pkg.duration}
                </Typography>

                <Divider sx={{ my: 2 }} />

                <Button
                  fullWidth
                  variant={selectedOffer?.id === pkg.id ? "contained" : "outlined"}
                  color="primary"
                  size="medium"
                  sx={{ 
                    mt: 1,
                    borderRadius: 2,
                    fontWeight: 'bold',
                    textTransform: 'none'
                  }}
                >
                  {selectedOffer?.id === pkg.id ? 
                    "✓ Selected" : "Choose Plan"}
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Payment Section - THIS IS THE PART THAT WAS MISSING */}
      {selectedOffer && (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center',
          mb: { xs: 4, sm: 6 }
        }}>
          <Paper 
            elevation={3} 
            sx={{ 
              p: { xs: 3, sm: 4 }, 
              width: '100%',
              maxWidth: 600,
              borderRadius: 3,
              border: `1px solid ${theme.palette.divider}`,
              background: 'white'
            }}
          >
            <Box display="flex" alignItems="center" mb={3}>
              <Avatar sx={{ 
                bgcolor: 'primary.light', 
                color: 'primary.dark',
                mr: 2
              }}>
                <Payment />
              </Avatar>
              <Typography variant="h5" component="h3" fontWeight="600">
                Complete Your Purchase
              </Typography>
            </Box>

            <Paper elevation={0} sx={{ 
              bgcolor: 'primary.light', 
              p: 3, 
              mb: 3,
              borderRadius: 2,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <Box>
                <Typography variant="body1" fontWeight="500">
                  Selected Plan
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedOffer.duration} • {selectedOffer.speed}
                </Typography>
              </Box>
              <Typography variant="h5" fontWeight="700" color="primary">
                Ksh {selectedOffer.price}
              </Typography>
            </Paper>

            <TextField
              fullWidth
              label="M-Pesa Phone Number"
              variant="outlined"
              placeholder="0712345678"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              InputProps={{
                startAdornment: (
                  <Typography sx={{ mr: 1, color: 'text.secondary' }}>+254</Typography>
                ),
              }}
              sx={{ mb: 3 }}
              size="medium"
            />

            <Button
              fullWidth
              variant="contained"
              color="primary"
              size="large"
              startIcon={loading ? <CircularProgress size={24} color="inherit" /> : <LocalAtm />}
              onClick={handlePayment}
              disabled={loading}
              sx={{ 
                py: 2,
                borderRadius: 2,
                fontWeight: 'bold',
                fontSize: '1rem',
                textTransform: 'none',
                boxShadow: `0 4px 12px ${theme.palette.primary.light}`,
                '&:hover': {
                  boxShadow: `0 6px 16px ${theme.palette.primary.light}`
                }
              }}
            >
              {loading ? 'Processing...' : 'Pay Now with M-Pesa'}
            </Button>

            <Typography 
              variant="body2" 
              color="text.secondary" 
              textAlign="center" 
              mt={2}
              sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <CheckCircle color="success" sx={{ mr: 1, fontSize: 18 }} />
              Secure payment via M-Pesa STK Push
            </Typography>
          </Paper>
        </Box>
      )}

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
          Need help with your purchase?
        </Typography>
        <Button 
          variant="text" 
          color="primary" 
          size="medium" 
          startIcon={<ContactPhone />}
          sx={{ mt: 1, fontWeight: 'bold' }}
        >
          Contact our support team
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

export default Dashboard;