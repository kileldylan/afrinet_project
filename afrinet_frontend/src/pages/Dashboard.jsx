import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  IconButton,
  useTheme,
  useMediaQuery,
  CssBaseline,
  Toolbar
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import Sidebar from './Sidebar';

const Dashboard = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box sx={{ 
      display: 'flex',
      width: '100vw',
      height: '100vh',
      overflow: 'hidden'
    }}>
      <CssBaseline />
      
      <Sidebar 
        mobileOpen={mobileOpen} 
        handleDrawerToggle={handleDrawerToggle} 
        isMobile={isMobile}
      />
      
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          overflowY: 'auto',
          overflowX: 'hidden',
          position: 'relative',
          backgroundColor: theme.palette.background.default,
        }}
      >
        {isMobile && (
          <Toolbar 
            sx={{ 
              position: 'sticky',
              top: 0,
              zIndex: theme.zIndex.appBar,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-start',
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(10px)',
              boxShadow: 1,
              minHeight: '56px !important',
              width: '100%',
            }}
          >
            <IconButton
              edge="start"
              color="inherit"
              aria-label="menu"
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

        <Box 
          sx={{ 
            flex: 1,
            p: isMobile ? 2 : 3,
            width: '100%',
            maxWidth: '100%',
            overflow: 'hidden',
            '& > *': {
              maxWidth: '100%',
            }
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;