import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageview } from '../utils/analytics';

const AnalyticsTracker: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    // This will accurately run trackPageview whenever the route changes
    // Assuming analytics was appropriately initialized via CookieConsent
    trackPageview(location.pathname + location.search);
  }, [location]);

  return null;
};

export default AnalyticsTracker;
