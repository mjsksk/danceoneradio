import { useState } from 'react';

export const usePopupPlayer = () => {
  const [isOpen, setIsOpen] = useState(false);

  const openPlayer = () => setIsOpen(true);
  const closePlayer = () => setIsOpen(false);
  const togglePlayer = () => setIsOpen(!isOpen);

  return {
    isOpen,
    openPlayer,
    closePlayer,
    togglePlayer
  };
};