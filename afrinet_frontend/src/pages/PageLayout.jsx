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

const PageLayout = ({ title, description, children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box sx={{ 
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      width: '100vw',
      overflow: 'hidden'
    }}>
      <CssBaseline />
      
      {/* Mobile App Bar - Fixed at top */}
      {isMobile && (
        <Toolbar 
          sx={{ 
            position: 'fixed',
            top: 0,
            zIndex: theme.zIndex.appBar + 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-start',
            background: 'linear-gradient(135deg, rgb(64, 161, 241) 0%, rgb(193, 219, 240) 100%)',            
            backdropFilter: 'blur(10px)',
            boxShadow: 1,
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
            {title}
          </Typography>
        </Toolbar>
      )}

      <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <Sidebar 
          mobileOpen={mobileOpen} 
          handleDrawerToggle={handleDrawerToggle} 
          isMobile={isMobile}
        />
        
        {/* Main Content Area */}
        <Box
          component="main"
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            overflow: 'auto',
            background: 'linear-gradient(135deg, rgb(64, 161, 241) 0%, rgb(193, 219, 240) 100%)',
            pt: isMobile ? '56px' : 0, // Offset for mobile app bar
          }}
        >
          {/* Page Content */}
          <Box
            sx={{
              p: isMobile ? 2 : 3,
              flex: 1,
              overflow: 'auto',
              '& > *': {
                maxWidth: '100%',
              }
            }}
          >
            {!isMobile && (
              <>
                <Typography variant="h5" fontWeight="bold" mb={2}>
                  {title}
                </Typography>
                {description && (
                  <Typography variant="body2" mb={3} color="text.secondary">
                    {description}
                  </Typography>
                )}
              </>
            )}
            {children}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default PageLayout;