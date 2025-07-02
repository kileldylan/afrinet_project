// src/components/Layout.jsx
import React from 'react';
import { Box } from '@mui/material';
import Sidebar from './Sidebar';

const Layout = ({ children }) => (
  <Box sx={{ display: 'flex' }}>
    <Sidebar />
    <Box
      component="main"
      sx={{
        flexGrow: 1,
        ml: '200px', // Adjust based on Sidebar width
        p: 3,
        minHeight: '100vh',
        background: 'linear-gradient(135deg, rgb(64, 161, 241) 0%, rgb(193, 219, 240) 100%)',
        fontFamily: 'Roboto, sans-serif',
      }}
    >
      {children}
    </Box>
  </Box>
);

export default Layout;
