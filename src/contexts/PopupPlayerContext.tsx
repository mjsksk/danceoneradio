import { createContext, useContext } from 'react';

interface PopupPlayerContextType {
  openPlayer: () => void;
  closePlayer: () => void;
  togglePlayer: () => void;
  isOpen: boolean;
}

export const PopupPlayerContext = createContext<PopupPlayerContextType | undefined>(undefined);

export const usePopupPlayerContext = () => {
  const context = useContext(PopupPlayerContext);
  if (!context) {
    throw new Error('usePopupPlayerContext must be used within PopupPlayerProvider');
  }
  return context;
};