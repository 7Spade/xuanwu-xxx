
import { useContext } from 'react';
import { AppContext } from '../_components/app-provider';
import { useAuth } from '@/shared/app-providers/auth-provider';

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
