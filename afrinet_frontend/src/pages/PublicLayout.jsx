import React from 'react';
import { 
  Box, 
  Typography,
  CssBaseline,
  useTheme
} from '@mui/material';

const PublicLayout = ({ title, children }) => {
  const theme = useTheme();

  return (
    <Box sx={{ 
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      width: '100vw',
      overflow: 'auto',
      background: 'linear-gradient(135deg, rgb(64, 161, 241) 0%, rgb(193, 219, 240) 100%)',            
    }}>
      <CssBaseline />
      
      {/* Main Content Area - Centered */}
      <Box
        component="main"
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          flex: 1,
          p: 3,
        }}
      >
        {/* Optional Title (shown on desktop) */}
        {title && (
          <Typography 
            variant="h4" 
            fontWeight="bold" 
            mb={4}
            sx={{
              display: { xs: 'none', md: 'block' },
              color: theme.palette.primary.contrastText
            }}
          >
            {title}
          </Typography>
        )}
        
        {/* Child content (your forms) */}
        <Box
          sx={{
            width: '100%',
            maxWidth: 450,
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

export default PublicLayout;