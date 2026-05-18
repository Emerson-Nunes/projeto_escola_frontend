import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

export function PageTransition({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [displayLocation, setDisplayLocation] = useState(location);
  const [transitioning, setTransitioning] = useState(false);

  useEffect(() => {
    if (location.pathname !== displayLocation.pathname) {
      setTransitioning(true);
      const timer = setTimeout(() => {
        setDisplayLocation(location);
        setTransitioning(false);
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [location, displayLocation]);

  return (
    <div
      style={{
        opacity: transitioning ? 0 : 1,
        transform: transitioning ? 'translateY(4px)' : 'translateY(0)',
        transition: 'opacity 0.15s ease, transform 0.15s ease',
      }}
    >
      {children}
    </div>
  );
}
