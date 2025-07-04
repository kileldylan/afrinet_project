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
  ChevronLeft,
} from '@mui/icons-material';
import { Link } from 'react-router-dom';

const Sidebar = ({ mobileOpen, handleDrawerToggle, isMobile }) => {
  const theme = useTheme();
  const drawerWidth = 240;

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
    <Box sx={{ 
      width: drawerWidth,
      height: '100%',
      overflowY: 'auto',
      overflowX: 'hidden',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {isMobile && (
        <Toolbar sx={{ 
          display: 'flex',
          justifyContent: 'flex-end',
          minHeight: '56px !important',
          flexShrink: 0
        }}>
          <IconButton onClick={handleDrawerToggle}>
            <ChevronLeft />
          </IconButton>
        </Toolbar>
      )}
      <List sx={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', py: 0 }}>
        {menuItems.map((item) => (
          <ListItem
            button
            key={item.text}
            component={Link}
            to={item.path}
            sx={{ 
              color: 'black',
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.04)',
              },
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
            onClick={isMobile ? handleDrawerToggle : undefined}
          >
            <ListItemIcon sx={{ color: 'black', minWidth: '40px' }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box
      component="nav"
      sx={{ 
        width: { md: drawerWidth }, 
        flexShrink: { md: 0 },
      }}
    >
      <Drawer
        variant={isMobile ? "temporary" : "permanent"}
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            background: 'linear-gradient(135deg, rgb(64, 161, 241) 0%, rgb(193, 219, 240) 100%)',
            overflow: 'hidden',
            borderRight: isMobile ? 'none' : '1px solid rgba(0, 0, 0, 0.12)',
          },
        }}
      >
        {drawerContent}
      </Drawer>
    </Box>
  );
};

export default Sidebar;