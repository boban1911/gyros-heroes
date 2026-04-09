import ReactGA from 'react-ga4';

let isInitialized = false;

export const initializeAnalytics = () => {
  if (isInitialized) return;
  
  const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID;
  if (measurementId) {
    ReactGA.initialize(measurementId);
    isInitialized = true;
  } else {
    console.warn('GA Measurement ID is missing');
  }
};

export const trackPageview = (path: string) => {
  if (isInitialized) {
    ReactGA.send({ hitType: 'pageview', page: path });
  }
};

export const trackEvent = (category: string, action: string, label?: string) => {
  if (isInitialized) {
    ReactGA.event({
      category,
      action,
      label,
    });
  }
};

