import { useEffect, useState } from 'react';
import { Get } from '../config/apiMethods';
import { UseStateContext } from '../context/ContextProvider';

export const useSubscriptionStatus = () => {
    const { user, subscriptionAllowed, setSubscriptionAllowed } = UseStateContext();
    const [loading, setLoading] = useState(true); // Start with true - check immediately
    const [hasChecked, setHasChecked] = useState(false);

    useEffect(() => {
        // Only check for HR-Admin users
        if (!user || user.userType !== 'HR-Admin' || hasChecked) {
            if (user && user.userType !== 'HR-Admin') {
                setLoading(false);
                setSubscriptionAllowed(true); // Non-HR-Admin users are always allowed
            } else if (!user) {
                setLoading(false);
            }
            return;
        }

        let isMounted = true;
        setLoading(true);

        (async () => {
            try {
                const resp: any = await Get('/hr-admin/subscription');
                if (!isMounted) return;

                if (resp?.success) {
                    const sub = resp.data?.subscription;
                    const granted = sub?.accessGrantedBySuperAdmin === true;
                    const active = sub?.status === 'active';
                    const allowed = Boolean(granted || active);
                    setSubscriptionAllowed(allowed);
                } else {
                    setSubscriptionAllowed(false);
                }
            } catch {
                setSubscriptionAllowed(false);
            } finally {
                if (isMounted) {
                    setLoading(false);
                    setHasChecked(true);
                }
            }
        })();

        return () => { isMounted = false; };
    }, [user, hasChecked, setSubscriptionAllowed]);

    // Function to refresh subscription status (useful after subscribing)
    const refreshSubscriptionStatus = async () => {
        if (!user || user.userType !== 'HR-Admin') return;

        setLoading(true);
        try {
            const resp: any = await Get('/hr-admin/subscription');
            if (resp?.success) {
                const sub = resp.data?.subscription;
                const granted = sub?.accessGrantedBySuperAdmin === true;
                const active = sub?.status === 'active';
                const allowed = Boolean(granted || active);
                setSubscriptionAllowed(allowed);
            } else {
                setSubscriptionAllowed(false);
            }
        } catch {
            setSubscriptionAllowed(false);
        } finally {
            setLoading(false);
        }
    };

    return { loading, allowed: subscriptionAllowed, refreshSubscriptionStatus };
};


