import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Toolbar,
  useTheme,
  useMediaQuery,
  Box,
} from '@mui/material';
import {
  Dashboard,
  Inventory,
  People,
  Payment,
  ConfirmationNumber,
  Wifi,
  Settings,
  MoneyOff,
  Message,
  Devices,
  Menu,
  ChevronLeft,
} from '@mui/icons-material';
import { Link } from 'react-router-dom';

const Sidebar = ({ mobileOpen, handleDrawerToggle, isMobile }) => {
  const theme = useTheme();
  const drawerWidth = 200;

  const menuItems = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/' },
    { text: 'Users', icon: <People />, path: '/users' },
    { text: 'Active Users', icon: <Wifi />, path: '/active-users' },
    { text: 'Packages', icon: <Inventory />, path: '/packages' },
    { text: 'Payments', icon: <Payment />, path: '/payments' },
    { text: 'Vouchers', icon: <ConfirmationNumber />, path: '/vouchers' },
    { text: 'Expenses', icon: <MoneyOff />, path: '/expenses' },
    { text: 'SMS', icon: <Message />, path: '/sms' },
    { text: 'Mikrotik', icon: <Devices />, path: '/mikrotik' },
    { text: 'Settings', icon: <Settings />, path: '/settings' },
  ];

  const drawerContent = (
    <Box>
      {/* Close button for mobile */}
      {isMobile && (
        <Toolbar sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <IconButton onClick={handleDrawerToggle}>
            <ChevronLeft />
          </IconButton>
        </Toolbar>
      )}
      <List>
        {menuItems.map((item) => (
          <ListItem
            button
            key={item.text}
            component={Link}
            to={item.path}
            sx={{ color: 'black' }}
            onClick={isMobile ? handleDrawerToggle : undefined} // Close drawer on mobile when item is clicked
          >
            <ListItemIcon sx={{ color: 'black' }}>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box
      component="nav"
      sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      aria-label="sidebar"
    >
      {/* Mobile/Tablet Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            background: 'linear-gradient(135deg, rgb(64, 161, 241) 0%, rgb(193, 219, 240) 100%)',
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Desktop Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            background: 'linear-gradient(135deg, rgb(64, 161, 241) 0%, rgb(193, 219, 240) 100%)',
            borderRight: 'none',
          },
        }}
        open
      >
        {drawerContent}
      </Drawer>
    </Box>
  );
};

export default Sidebar;