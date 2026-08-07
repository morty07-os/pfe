import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Fade, Box } from '@mui/material';

/**
 * PageTransition component for smooth transitions between pages
 * Uses Material-UI's Fade component with the blue-grey theme
 */
const PageTransition = ({ children }) => {
  const location = useLocation();
  const [displayLocation, setDisplayLocation] = useState(location);
  const [transitionStage, setTransitionStage] = useState("fadeIn");
  
  useEffect(() => {
    if (location !== displayLocation) {
      setTransitionStage("fadeOut");
    }
  }, [location, displayLocation]);

  const handleAnimationEnd = () => {
    if (transitionStage === "fadeOut") {
      setTransitionStage("fadeIn");
      setDisplayLocation(location);
    }
  };

  return (
    <Fade 
      in={transitionStage === "fadeIn"}
      timeout={{ enter: 500, exit: 400 }}
      onExited={handleAnimationEnd}
      style={{
        transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)' // Material Design standard easing
      }}
    >
      <Box 
        sx={{
          width: '100%', 
          height: '100%',
          position: 'relative',
          '&::after': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: '#475569',
            opacity: transitionStage === "fadeIn" ? 0 : 0.02, // Very subtle blue-grey overlay during transition
            transition: 'opacity 400ms cubic-bezier(0.4, 0, 0.2, 1)',
            pointerEvents: 'none',
            zIndex: 1000
          }
        }}
      >
        {children}
      </Box>
    </Fade>
  );
};

export default PageTransition;
