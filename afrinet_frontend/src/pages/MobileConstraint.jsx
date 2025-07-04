import { Box, useTheme, useMediaQuery } from '@mui/material';

const MobileConstraint = ({ children, sx = {} }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: '100%',
        mx: 'auto',
        px: isMobile ? 2 : 0,
        boxSizing: 'border-box',
        '& > *': {
          maxWidth: '100%',
          overflowX: 'hidden',
        },
        ...sx
      }}
    >
      {children}
    </Box>
  );
};

export default MobileConstraint;