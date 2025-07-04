import React, { useState, useEffect } from 'react';

import {
  Box,
  Typography,
  Paper,
  TextField,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  FormControl,
  Button,
  Checkbox,
  FormControlLabel,
  Divider,
  Switch,
  AppBar,
  Tabs,
  Tab,
  Stack
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Payment as PaymentIcon,
  Wifi as WifiIcon,
  WifiTethering as HotspotIcon,
  Sms as SmsIcon,
  Notifications as NotificationsIcon,
  UploadFile as UploadFileIcon,
} from '@mui/icons-material';
import Sidebar from './Sidebar';
import PageLayout from './PageLayout';

// Custom color input component
const ColorInput = ({ value, onChange, ...props }) => (
  <input
    type="color"
    value={value}
    onChange={onChange}
    style={{
      width: 40,
      height: 40,
      border: 'none',
      borderRadius: 4,
      cursor: 'pointer',
      padding: 0,
    }}
    {...props}
  />
);

function TabPanel({ children, value, index }) {
  return value === index ? (
    <Paper elevation={3} sx={{ p: 3, borderRadius: 2, mb: 3 }}>
      {children}
    </Paper>
  ) : null;
}

const Settings = () => {
  const [tabValue, setTabValue] = React.useState(0);
  const [font, setFont] = React.useState('Work Sans');
  const [color, setColor] = React.useState('#fa8200');
  const [logoName, setLogoName] = React.useState('');
  const [inactiveDays, setInactiveDays] = React.useState('');
  const [reminderTimes, setReminderTimes] = React.useState({
    sixDays: false,
    twoDays: false,
    fourHours: false,
  });
  const [enableInvoices, setEnableInvoices] = React.useState(false);
  const [paymentMethods, setPaymentMethods] = React.useState({
    mpesa: true,
    card: false,
    bank: false,
  });
  const [hotspotSettings, setHotspotSettings] = React.useState({
    enable: true,
    idleTimeout: 30,
    sessionTimeout: 60,
  });
  const [smsSettings, setSmsSettings] = React.useState({
    enable: true,
    apiKey: '',
    senderId: '',
  });
  const [notificationSettings, setNotificationSettings] = React.useState({
    email: true,
    sms: true,
    push: false,
  });

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

  const handleInactiveDaysChange = (event) => {
    setInactiveDays(event.target.value);
  };

  const handleReminderChange = (event) => {
    setReminderTimes({
      ...reminderTimes,
      [event.target.name]: event.target.checked,
    });
  };

  const handleInvoiceToggle = (event) => {
    setEnableInvoices(event.target.checked);
  };

  const handlePaymentMethodChange = (event) => {
    setPaymentMethods({
      ...paymentMethods,
      [event.target.name]: event.target.checked,
    });
  };

  const handleHotspotSettingChange = (event) => {
    setHotspotSettings({
      ...hotspotSettings,
      [event.target.name]: event.target.value,
    });
  };

  const handleSmsSettingChange = (event) => {
    setSmsSettings({
      ...smsSettings,
      [event.target.name]: event.target.value,
    });
  };

  const handleNotificationChange = (event) => {
    setNotificationSettings({
      ...notificationSettings,
      [event.target.name]: event.target.checked,
    });
  };
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <PageLayout 
      title="Settings" 
    >
        <Typography variant="h5" fontWeight="bold" color="text.secondary" mb={3}>
          AFRINET
        </Typography>

        {/* Horizontal Tabs */}
        <AppBar position="static" color="default" sx={{ mb: 3, borderRadius: 1, background: 'linear-gradient(135deg, rgb(64, 161, 241) 0%, rgb(193, 219, 240) 100%)', }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab icon={<SettingsIcon />} label="General" />
            <Tab icon={<PaymentIcon />} label="Payments" />
            <Tab icon={<WifiIcon />} label="PPoE" />
            <Tab icon={<HotspotIcon />} label="Hotspot" />
            <Tab icon={<SmsIcon />} label="SMS Gateway" />
            <Tab icon={<NotificationsIcon />} label="Notifications" />
          </Tabs>
        </AppBar>

        {/* General Settings Tab */}
        <TabPanel value={tabValue} index={0}>
          <Typography variant="h6" mb={2}>Appearance</Typography>
          <Grid container spacing={3}>
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

            <Grid item xs={12} sm={6}>
              <TextField
                label="The name of your ISP / WiFi Company"
                fullWidth
                required
                defaultValue="AFRINET"
              />
            </Grid>

            <Grid item xs={6}>
              <Typography gutterBottom fontWeight="bold">System Theme Color</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ColorInput
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

        {/* Payments Tab */}
        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" mb={3}>Payment Settings</Typography>
          <Typography color="text.secondary" mb={4}>
            Configure your payment gateway settings
          </Typography>

          <Divider sx={{ my: 3 }} />

          <Box mb={4}>
            <Typography variant="subtitle1" fontWeight="bold" mb={2}>
              Enabled Payment Methods
            </Typography>
            <Stack spacing={1}>
              <FormControlLabel
                control={
                  <Switch
                    checked={paymentMethods.mpesa}
                    onChange={handlePaymentMethodChange}
                    name="mpesa"
                  />
                }
                label="M-Pesa"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={paymentMethods.card}
                    onChange={handlePaymentMethodChange}
                    name="card"
                  />
                }
                label="Credit/Debit Card"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={paymentMethods.bank}
                    onChange={handlePaymentMethodChange}
                    name="bank"
                  />
                }
                label="Bank Transfer"
              />
            </Stack>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Box mb={4}>
            <Typography variant="subtitle1" fontWeight="bold" mb={2}>
              M-Pesa Configuration
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Paybill Number"
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Account Number"
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Consumer Key"
                  fullWidth
                  type="password"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Consumer Secret"
                  fullWidth
                  type="password"
                />
              </Grid>
            </Grid>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button variant="contained" color="primary">
              Save changes
            </Button>
            <Button variant="outlined" color="primary">
              Cancel
            </Button>
          </Box>
        </TabPanel>

        {/* PPPoE Tab */}
        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" mb={3}>PPPoE Settings</Typography>
          <Typography color="text.secondary" mb={4}>
            Configure your PPPoE settings
          </Typography>

          <Divider sx={{ my: 3 }} />

          <Box mb={4}>
            <Typography variant="subtitle1" fontWeight="bold" mb={2}>
              Prime Inactive Users After
            </Typography>
            <FormControl fullWidth sx={{ maxWidth: 400 }}>
              <InputLabel>Select an option</InputLabel>
              <Select
                value={inactiveDays}
                onChange={handleInactiveDaysChange}
                label="Select an option"
              >
                <MenuItem value={30}>30 days</MenuItem>
                <MenuItem value={60}>60 days</MenuItem>
                <MenuItem value={90}>90 days</MenuItem>
                <MenuItem value={180}>180 days</MenuItem>
              </Select>
            </FormControl>
            <Typography variant="caption" color="text.secondary">
              Automatically delete PPPoE users that have been inactive for the specified number of days
            </Typography>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Box mb={4}>
            <Typography variant="subtitle1" fontWeight="bold" mb={2}>
              PPPoE Reminder Notification Times*
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={reminderTimes.sixDays}
                    onChange={handleReminderChange}
                    name="sixDays"
                  />
                }
                label="6 days before X"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={reminderTimes.twoDays}
                    onChange={handleReminderChange}
                    name="twoDays"
                  />
                }
                label="2 days before X"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={reminderTimes.fourHours}
                    onChange={handleReminderChange}
                    name="fourHours"
                  />
                }
                label="4 hours before X"
              />
            </Box>
            <FormControl fullWidth sx={{ maxWidth: 400, mt: 2 }}>
              <InputLabel>Select an option</InputLabel>
              <Select
                value={inactiveDays}
                onChange={handleInactiveDaysChange}
                label="Select an option"
              >
                <MenuItem value={1}>1 day before</MenuItem>
                <MenuItem value={3}>3 days before</MenuItem>
                <MenuItem value={7}>7 days before</MenuItem>
              </Select>
            </FormControl>
            <Typography variant="caption" color="text.secondary">
              Select when users should be notified before their subscription expires
            </Typography>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Box mb={4}>
            <Typography variant="subtitle1" fontWeight="bold" mb={2}>
              Invoice Settings
            </Typography>
            <Typography color="text.secondary" mb={2}>
              Configure your invoice generation settings
            </Typography>
            
            <FormControlLabel
              control={
                <Checkbox
                  checked={enableInvoices}
                  onChange={handleInvoiceToggle}
                  name="enableInvoices"
                />
              }
              label="Enable Invoices"
            />
            <Typography variant="caption" color="text.secondary" display="block">
              Generate invoices for subscription renewals
            </Typography>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button variant="contained" color="primary">
              Save changes
            </Button>
            <Button variant="outlined" color="primary">
              Cancel
            </Button>
          </Box>
        </TabPanel>

        {/* Hotspot Tab */}
        <TabPanel value={tabValue} index={3}>
          <Typography variant="h6" mb={3}>Hotspot Settings</Typography>
          <Typography color="text.secondary" mb={4}>
            Configure your Hotspot settings
          </Typography>

          <Divider sx={{ my: 3 }} />

          <Box mb={4}>
            <Typography variant="subtitle1" fontWeight="bold" mb={2}>
              General Hotspot Settings
            </Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={hotspotSettings.enable}
                  onChange={handleHotspotSettingChange}
                  name="enable"
                />
              }
              label="Enable Hotspot"
            />
            <Typography variant="caption" color="text.secondary" display="block">
              Enable or disable the hotspot functionality
            </Typography>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Box mb={4}>
            <Typography variant="subtitle1" fontWeight="bold" mb={2}>
              Session Timeout Settings
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Idle Timeout (minutes)"
                  type="number"
                  fullWidth
                  value={hotspotSettings.idleTimeout}
                  onChange={handleHotspotSettingChange}
                  name="idleTimeout"
                />
                <Typography variant="caption" color="text.secondary">
                  Disconnect users after this period of inactivity
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Session Timeout (minutes)"
                  type="number"
                  fullWidth
                  value={hotspotSettings.sessionTimeout}
                  onChange={handleHotspotSettingChange}
                  name="sessionTimeout"
                />
                <Typography variant="caption" color="text.secondary">
                  Maximum session duration
                </Typography>
              </Grid>
            </Grid>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Box mb={4}>
            <Typography variant="subtitle1" fontWeight="bold" mb={2}>
              Landing Page Settings
            </Typography>
            <TextField
              label="Custom Landing Page URL"
              fullWidth
              placeholder="https://"
            />
            <Typography variant="caption" color="text.secondary">
              Optional custom URL for hotspot login page
            </Typography>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button variant="contained" color="primary">
              Save changes
            </Button>
            <Button variant="outlined" color="primary">
              Cancel
            </Button>
          </Box>
        </TabPanel>

        {/* SMS Gateway Tab */}
        <TabPanel value={tabValue} index={4}>
          <Typography variant="h6" mb={3}>SMS Gateway Settings</Typography>
          <Typography color="text.secondary" mb={4}>
            Configure your SMS gateway integration
          </Typography>

          <Divider sx={{ my: 3 }} />

          <Box mb={4}>
            <Typography variant="subtitle1" fontWeight="bold" mb={2}>
              Enable SMS Notifications
            </Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={smsSettings.enable}
                  onChange={handleSmsSettingChange}
                  name="enable"
                />
              }
              label="Enable SMS Gateway"
            />
            <Typography variant="caption" color="text.secondary" display="block">
              Enable or disable SMS notifications
            </Typography>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Box mb={4}>
            <Typography variant="subtitle1" fontWeight="bold" mb={2}>
              SMS Gateway Configuration
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="API Key"
                  fullWidth
                  value={smsSettings.apiKey}
                  onChange={handleSmsSettingChange}
                  name="apiKey"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Sender ID"
                  fullWidth
                  value={smsSettings.senderId}
                  onChange={handleSmsSettingChange}
                  name="senderId"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="API URL"
                  fullWidth
                  placeholder="https://api.example.com/send"
                />
              </Grid>
            </Grid>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Box mb={4}>
            <Typography variant="subtitle1" fontWeight="bold" mb={2}>
              SMS Templates
            </Typography>
            <TextField
              label="Payment Received Template"
              fullWidth
              multiline
              rows={3}
              placeholder={`Dear {name}, your payment of {amount} has been received. New expiry: {date}`}
            />
            <Typography variant="caption" color="text.secondary" display="block" mt={1}>
              Available variables: {'{name}'}, {'{amount}'}, {'{date}'}, {'{account}'}
            </Typography>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button variant="contained" color="primary">
              Save changes
            </Button>
            <Button variant="outlined" color="primary">
              Cancel
            </Button>
          </Box>
        </TabPanel>

        {/* Notifications Tab */}
        <TabPanel value={tabValue} index={5}>
          <Typography variant="h6" mb={3}>Notification Settings</Typography>
          <Typography color="text.secondary" mb={4}>
            Configure your notification preferences
          </Typography>

          <Divider sx={{ my: 3 }} />

          <Box mb={4}>
            <Typography variant="subtitle1" fontWeight="bold" mb={2}>
              Notification Methods
            </Typography>
            <Stack spacing={1}>
              <FormControlLabel
                control={
                  <Switch
                    checked={notificationSettings.email}
                    onChange={handleNotificationChange}
                    name="email"
                  />
                }
                label="Email Notifications"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={notificationSettings.sms}
                    onChange={handleNotificationChange}
                    name="sms"
                  />
                }
                label="SMS Notifications"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={notificationSettings.push}
                    onChange={handleNotificationChange}
                    name="push"
                  />
                }
                label="Push Notifications"
              />
            </Stack>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Box mb={4}>
            <Typography variant="subtitle1" fontWeight="bold" mb={2}>
              Email Configuration
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="SMTP Host"
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="SMTP Port"
                  fullWidth
                  type="number"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="SMTP Username"
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="SMTP Password"
                  fullWidth
                  type="password"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="From Email Address"
                  fullWidth
                />
              </Grid>
            </Grid>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Box mb={4}>
            <Typography variant="subtitle1" fontWeight="bold" mb={2}>
              Notification Templates
            </Typography>
            <TextField
              label="Payment Reminder Template"
              fullWidth
              multiline
              rows={3}
              placeholder="Dear {name}, your subscription will expire on {date}. Please renew to avoid service interruption."
            />
          </Box>

          <Divider sx={{ my: 3 }} />

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button variant="contained" color="primary">
              Save changes
            </Button>
            <Button variant="outlined" color="primary">
              Cancel
            </Button>
          </Box>
        </TabPanel>

        {/* Footer */}
        <Box mt={6} sx={{ textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Certified Shop
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Whatsapp Channel
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Privacy & Terms
          </Typography>
          <Typography variant="body2" color="text.secondary" mt={1}>
            © 2025 Certified Billings All Rights Reserved.
          </Typography>
        </Box>
    </PageLayout>
  );
};

export default Settings;