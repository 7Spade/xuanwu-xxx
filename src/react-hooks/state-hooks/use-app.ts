
import { useContext } from 'react';
import { AppContext } from '@/react-providers/app-provider';
import { useAuth } from '@/shared/app-providers/auth-provider';

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
