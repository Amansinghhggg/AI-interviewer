import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function ThemeProvider({ children }) {
  const location = useLocation();

  useEffect(() => {
    // If the path starts with /candidate, inject the dark theme
    const isCandidateRoute = location.pathname.startsWith('/candidate');
    
    if (isCandidateRoute) {
      document.documentElement.classList.add('theme-candidate');
    } else {
      document.documentElement.classList.remove('theme-candidate');
    }
  }, [location.pathname]);

  return <>{children}</>;
}
