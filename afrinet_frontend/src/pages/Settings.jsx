import React from 'react';
import {
  Box,
  Typography,
  AppBar,
  Tabs,
  Tab,
  Paper,
  TextField,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  FormControl,
  Button,
  IconButton,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import ColorLensIcon from '@mui/icons-material/ColorLens';
import Sidebar from './Sidebar';
import SettingsIcon from '@mui/icons-material/Settings';
import PaymentIcon from '@mui/icons-material/Payment';
import WifiIcon from '@mui/icons-material/Wifi';
import HotspotIcon from '@mui/icons-material/WifiTethering';
import SmsIcon from '@mui/icons-material/Sms';
import NotificationsIcon from '@mui/icons-material/Notifications';
import UploadFileIcon from '@mui/icons-material/UploadFile';

function TabPanel({ children, value, index }) {
  return value === index ? (
    <Paper elevation={3} sx={{ p: 3, borderRadius: 2, mb: 3 }}>
      {children}
    </Paper>
  ) : null;
}

const ColorInput = styled('input')({
  width: 40,
  height: 40,
  border: 'none',
  borderRadius: 4,
  cursor: 'pointer',
  padding: 0,
});

const Settings = () => {
  const [tabValue, setTabValue] = React.useState(0);
  const [font, setFont] = React.useState('Work Sans');
  const [color, setColor] = React.useState('#fa8200');
  const [logoName, setLogoName] = React.useState('');

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleFontChange = (event) => {
    setFont(event.target.value);
  };

  const handleLogoUpload = (e) => {
    if (e.target.files.length > 0) {
      setLogoName(e.target.files[0].name);
    }
  };

  return (
    <Box sx={{ display: 'flex', fontFamily: 'Roboto, sans-serif' }}>
      <Sidebar />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          background: 'linear-gradient(to right, #e0f7fa, #ffffff)',
          minHeight: '100vh',
        }}
      >
        <Typography variant="h5" fontWeight="bold" mb={3}>
          System Settings
        </Typography>

        <AppBar position="static" color="default" sx={{ mb: 3, borderRadius: 1 }}>
          <Tabs value={tabValue} onChange={handleTabChange} indicatorColor="primary" textColor="primary">
            <Tab icon={<SettingsIcon />} label="General" />
            <Tab icon={<PaymentIcon />} label="Payments" />
            <Tab icon={<WifiIcon />} label="PPPoE" />
            <Tab icon={<HotspotIcon />} label="Hotspot" />
            <Tab icon={<SmsIcon />} label="SMS Gateway" />
            <Tab icon={<NotificationsIcon />} label="Notifications" />
          </Tabs>
        </AppBar>

        {/* General Settings Tab */}
        <TabPanel value={tabValue} index={0}>
          <Typography variant="h6" mb={2}>Appearance</Typography>
          <Grid container spacing={3}>
            {/* Logo Upload */}
            <Grid item xs={12} sm={6}>
              <Typography fontWeight="bold">Logo</Typography>
              <Box
                sx={{
                  border: '2px dashed #ccc',
                  borderRadius: 2,
                  p: 2,
                  textAlign: 'center',
                  color: '#888',
                }}
              >
                <UploadFileIcon fontSize="large" />
                <Typography>{logoName || 'Drag & Drop your file or Browse'}</Typography>
                <Button component="label" size="small">
                  Browse
                  <input hidden type="file" onChange={handleLogoUpload} />
                </Button>
              </Box>
              <Typography variant="caption">
                Upload a logo that will be used in the system header and login page.
              </Typography>
            </Grid>

            {/* ISP Name */}
            <Grid item xs={12} sm={6}>
              <TextField
                label="The name of your ISP / WiFi Company"
                fullWidth
                required
                defaultValue="AFRINET"
              />
            </Grid>

            {/* Color Picker & Support Number */}
            <Grid item xs={6}>
              <Typography gutterBottom fontWeight="bold">System Theme Color</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ColorInput
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                />
                <Typography>{color}</Typography>
              </Box>
              <Typography variant="caption">What color should we use for the system?</Typography>
            </Grid>

            <Grid item xs={6}>
              <TextField
                label="Customer Support Number"
                fullWidth
                required
                defaultValue="254758715788"
              />
              <Typography variant="caption">The number your clients can contact when they need support.</Typography>
            </Grid>

            {/* Font Picker */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Font</InputLabel>
                <Select value={font} onChange={handleFontChange}>
                  <MenuItem value="Work Sans">Work Sans</MenuItem>
                  <MenuItem value="Roboto">Roboto</MenuItem>
                  <MenuItem value="Poppins">Poppins</MenuItem>
                  <MenuItem value="Open Sans">Open Sans</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Support Email */}
            <Grid item xs={12} sm={6}>
              <TextField
                label="Customer Support Email"
                fullWidth
                defaultValue=""
              />
              <Typography variant="caption">The email your clients can contact when they need help.</Typography>
            </Grid>
          </Grid>

          <Box mt={4}>
            <Typography variant="h6" mb={1}>Terms & Conditions</Typography>
            <TextField
              fullWidth
              multiline
              minRows={4}
              placeholder="Add your business terms and conditions here..."
            />
          </Box>

          <Box mt={4}>
            <Button variant="contained" color="primary">
              Save Settings
            </Button>
          </Box>
        </TabPanel>

        {/* Add other tabs below here */}
      </Box>
    </Box>
  );
};

export default Settings;
