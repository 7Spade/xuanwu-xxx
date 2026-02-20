
import { useContext } from 'react';
import { AccountContext } from '@/react-providers/account-provider';

export const useAccount = () => {
    const context = useContext(AccountContext);
    if (!context) {
        throw new Error('useAccount must be used within an AccountProvider');
    }
    return context;
};
