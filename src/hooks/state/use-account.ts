
import { useContext } from 'react';
import { AccountContext } from '@/context/account-context';

export const useAccount = () => {
    const context = useContext(AccountContext);
    if (!context) {
        throw new Error('useAccount must be used within an AccountProvider');
    }
    return context;
};
