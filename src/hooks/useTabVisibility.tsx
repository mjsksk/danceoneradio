import { useState, useEffect } from 'react';

export const useTabVisibility = () => {
  const [isVisible, setIsVisible] = useState(!document.hidden);
  const [wasHidden, setWasHidden] = useState(false);

  useEffect(() => {
    const handleVisibilityChange = () => {
      const visible = !document.hidden;
      
      if (!visible) {
        setWasHidden(true);
      }
      
      setIsVisible(visible);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Also listen for focus/blur events as backup
    const handleFocus = () => setIsVisible(true);
    const handleBlur = () => setIsVisible(false);
    
    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
    };
  }, []);

  // Return both current visibility and whether tab was hidden
  // This allows components to refresh data when tab becomes visible again
  return { 
    isVisible, 
    wasHidden, 
    clearHiddenFlag: () => setWasHidden(false) 
  };
};