import React, { useEffect, useState } from 'react';
import { Get, Post } from '../../../config/apiMethods';
import { UseStateContext } from '../../../context/ContextProvider';
import { Navbar, SideDrawer } from '../../../components';
import { useSubscriptionStatus } from '../../../hooks/useSubscriptionStatus.hook';

const PRICE_ID = process.env.REACT_APP_STRIPE_PRICE_ID || '';

const Subscription: React.FC = () => {
    const { role } = UseStateContext();
    const { refreshSubscriptionStatus } = useSubscriptionStatus();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    const fetchStatus = async () => {
        setLoading(true);
        setError(null);
        try {
            const resp: any = await Get('/hr-admin/subscription');
            if (resp?.success) {
                setData(resp.data);
                // Also refresh the global subscription status
                await refreshSubscriptionStatus();
            } else {
                setError(resp?.message || 'Failed to load subscription');
            }
        } catch (e: any) {
            setError(e?.message || 'Failed to load subscription');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStatus();

        // Check if user returned from successful Stripe checkout
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('success') === '1') {
            // Refresh status after successful subscription
            setTimeout(() => {
                fetchStatus();
            }, 1000);
        }
    }, []);

    const handleCheckout = async () => {
        try {
            if (!PRICE_ID) {
                setError('Stripe Price ID not configured. Please contact support.');
                return;
            }
            const resp: any = await Post('/hr-admin/subscription/checkout', { priceId: PRICE_ID });
            if (resp?.success && resp?.url) {
                window.location.href = resp.url;
            } else {
                setError(resp?.message || 'Failed to create checkout session');
            }
        } catch (e: any) {
            setError(e?.message || 'Failed to start subscription');
        }
    };

    const status = data?.subscription?.status;
    const seatCount = data?.seatCount || 0;

    // Format next billing date in a more humanized way
    const formatNextBilling = (dateString: string) => {
        if (!dateString) return { date: 'N/A', daysUntil: 0 };

        const date = new Date(dateString);
        const now = new Date();
        const diffTime = date.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        // Format date as "Nov 2, 2025"
        const formattedDate = date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });

        return { date: formattedDate, daysUntil: diffDays };
    };

    const nextBilling = data?.subscription?.currentPeriodEnd ? formatNextBilling(data.subscription.currentPeriodEnd) : { date: 'N/A', daysUntil: 0 };

    return (
        <div className="flex flex-row w-screen h-screen max-w-[2200px] justify-center items-center mx-auto bg-mainBg flex-wrap">
            {/* Left side */}
            <div className="lg:w-1/6 h-full bg-transparent">
                <SideDrawer />
            </div>

            {/* Right side */}
            <div className="flex flex-col h-screen w-screen lg:w-10/12 px-2 py-2 md:px-6 md:py-6 md:pr-16 bg-mainBg">
                <div className="w-full h-fit mb-4 md:mb-6">
                    <Navbar title="Subscription" />
                </div>

                <div className="w-full">
                    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5 md:p-6">
                        {loading ? (
                            <div className="animate-pulse space-y-3">
                                <div className="h-5 bg-gray-100 rounded w-1/3"></div>
                                <div className="h-4 bg-gray-100 rounded w-1/2"></div>
                                <div className="h-4 bg-gray-100 rounded w-1/4"></div>
                            </div>
                        ) : error ? (
                            <p className="text-red-600">{error}</p>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="p-4 border border-gray-100 rounded-lg bg-gray-50">
                                    <p className="text-sm text-gray-600">Status</p>
                                    <p className="text-lg font-semibold text-gray-900 mt-1 capitalize">{status || 'not subscribed'}</p>
                                </div>
                                <div className="p-4 border border-gray-100 rounded-lg bg-gray-50">
                                    <p className="text-sm text-gray-600">Employees (Seats)</p>
                                    <p className="text-lg font-semibold text-gray-900 mt-1">{seatCount}</p>
                                </div>
                                <div className="p-4 border border-gray-100 rounded-lg bg-gray-50">
                                    <p className="text-sm text-gray-600">Next Billing</p>
                                    <p className="text-lg font-semibold text-gray-900 mt-1">
                                        {nextBilling.date}
                                        {nextBilling.daysUntil > 0 && (
                                            <span className="text-sm text-gray-500 ml-1">
                                                ({nextBilling.daysUntil === 1 ? 'Tomorrow' : `${nextBilling.daysUntil} days`})
                                            </span>
                                        )}
                                    </p>
                                </div>
                            </div>
                        )}

                        {status !== 'active' && !loading && !error && (
                            <div className="mt-6">
                                <button onClick={handleCheckout} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-md shadow-sm">
                                    Start Subscription
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Subscription;


