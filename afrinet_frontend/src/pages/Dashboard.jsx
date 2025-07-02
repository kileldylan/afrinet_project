import React from 'react';
import { Box, Grid, Typography, Paper } from '@mui/material';
import Sidebar from './Sidebar';
import Insights from './InsightCard';

const Dashboard = () => {
  return (
    <Box sx={{ display: 'flex', fontFamily: 'Roboto, sans-serif', height: '100vh', width: '100%', margin: 0, padding: 0 }}>
      <Sidebar />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 0,
          background: 'linear-gradient(135deg, rgb(64, 161, 241) 0%, rgb(193, 219, 240) 100%)',
          minHeight: '100vh',
          width: '100%',
          overflow: 'auto',
          marginLeft: '-2px', // Slight negative margin to ensure no gap
        }}
      >
        {/* Insights Section */}
        <Insights />
      </Box>
    </Box>
  );
};

export default Dashboard;