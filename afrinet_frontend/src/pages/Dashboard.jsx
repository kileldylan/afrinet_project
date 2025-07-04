import React, { useState } from 'react';
import { 
  Box, 
  Grid, 
  Typography, 
  Paper, 
  IconButton,
  useTheme,
  useMediaQuery,
  CssBaseline,
  Toolbar
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import Sidebar from './Sidebar';
import Insights from './InsightCard';

const Dashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box sx={{ display: 'flex', fontFamily: 'Roboto, sans-serif', height: '100vh', width: '100%' }}>
      <CssBaseline />
      {/* Sidebar - Always rendered but conditionally shown based on screen size */}
      <Sidebar 
        mobileOpen={mobileOpen} 
        handleDrawerToggle={handleDrawerToggle} 
        isMobile={isMobile}
      />
      
      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 0,
          background: 'linear-gradient(135deg, rgb(64, 161, 241) 0%, rgb(193, 219, 240) 100%)',
          minHeight: '100vh',
          width: '100%',
          overflow: 'auto',
        }}
      >
        {/* Mobile App Bar with Toggle Button */}
        {isMobile && (
          <Toolbar sx={{ 
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-start',
            backgroundColor: 'rgba(255, 255, 255, 0.7)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          }}>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" noWrap component="div">
              Dashboard
            </Typography>
          </Toolbar>
        )}

        {/* Insights Section */}
        <Box sx={{ p: isMobile ? 2 : 3 }}>
          <Insights />
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;