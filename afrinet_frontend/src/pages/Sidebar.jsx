import React from 'react';
import { Drawer, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
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
} from '@mui/icons-material';
import { Link } from 'react-router-dom';

const Sidebar = () => {
  const menuItems = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/' },
    { text: 'Packages', icon: <Inventory />, path: '/packages' },
    { text: 'Users', icon: <People />, path: '/users' },
    { text: 'Payments', icon: <Payment />, path: '/payments' },
    { text: 'Vouchers', icon: <ConfirmationNumber />, path: '/vouchers' },
    { text: 'Active Users', icon: <Wifi />, path: '/active-users' },
    { text: 'Settings', icon: <Settings />, path: '/settings' },
    { text: 'Expenses', icon: <MoneyOff />, path: '/expenses' },
    { text: 'SMS', icon: <Message />, path: '/sms' },
    { text: 'Mikrotik', icon: <Devices />, path: '/mikrotik' },
  ];

  return (
    <Drawer
      variant="permanent"
      anchor="left"
      sx={{
        width: 200,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: 200,
          boxSizing: 'border-box',
          fontFamily: 'Roboto, sans-serif',
          borderRight: 'none',
          background: 'linear-gradient(135deg,rgb(64, 161, 241) 0%,rgb(193, 219, 240) 100%)',
        },
      }}
    >
      <List>
        {menuItems.map((item) => (
          <ListItem
            button
            key={item.text}
            component={Link}
            to={item.path}
            sx={{ color: 'black' }} // Set text and icon color
          >
            <ListItemIcon sx={{ color: 'black' }}>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
};

export default Sidebar;
