import React, { useState, useEffect } from 'react';
import { Get, Post } from '../../config/apiMethods';
import { FaBell, FaTimes, FaClock } from 'react-icons/fa';

interface Notification {
    _id: string;
    title: string;
    forAll: boolean;
    forType: string;
    for?: {
        _id: string;
        fullName: string;
        email: string;
        userType: string;
    };
    readBy?: { userId: string; readAt: string }[];
    createdAt: string;
    updatedAt: string;
}

interface NotificationsProps {
    maxNotifications?: number;
    showCloseButton?: boolean;
    onClose?: () => void;
}

const Notifications: React.FC<NotificationsProps> = ({
    maxNotifications = 5,
    showCloseButton = false,
    onClose
}) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [disabledMsg, setDisabledMsg] = useState<string | null>(null);

    useEffect(() => {
        try {
            const raw = localStorage.getItem('user');
            const user = raw ? JSON.parse(raw) : null;
            if (user && user.notification === false) {
                setDisabledMsg('In-app notifications are disabled in your Settings. Enable notifications to see updates.');
                setNotifications([]);
                setLoading(false);
                return;
            }
        } catch { }
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await Get('/auth/notifications');

            if (response.success) {
                // Limit the number of notifications displayed
                const limitedNotifications = (response.data || []).slice(0, maxNotifications);
                setNotifications(limitedNotifications);
                if (Array.isArray(response.data) && response.data.length === 0 && response.message === 'Notifications disabled for user') {
                    setDisabledMsg('In-app notifications are disabled in your Settings. Enable notifications to see updates.');
                } else {
                    setDisabledMsg(null);
                }
            } else {
                setError('Failed to fetch notifications');
            }
        } catch (err: any) {
            console.error('Error fetching notifications:', err);
            setError('Failed to load notifications');
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (id: string) => {
        try {
            await Post('/auth/notifications/read', { notificationId: id });
            // Optimistically update UI
            setNotifications(prev => prev.filter(n => n._id !== id));
        } catch (e) {
            // silent fail
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

        if (diffInHours < 1) {
            return 'Just now';
        } else if (diffInHours < 24) {
            return `${diffInHours}h ago`;
        } else if (diffInHours < 48) {
            return 'Yesterday';
        } else {
            return date.toLocaleDateString();
        }
    };


    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow-md p-4">
                <div className="flex items-center space-x-2 mb-3">
                    <FaBell className="w-5 h-5 text-blue-600" />
                    <h3 className="text-lg font-semibold text-gray-800">Notifications</h3>
                </div>
                <div className="space-y-3">
                    {[...Array(3)].map((_, index) => (
                        <div key={index} className="animate-pulse">
                            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white rounded-lg shadow-md p-4">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                        <FaBell className="w-5 h-5 text-blue-600" />
                        <h3 className="text-lg font-semibold text-gray-800">Notifications</h3>
                    </div>
                    {showCloseButton && onClose && (
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <FaTimes className="w-5 h-5" />
                        </button>
                    )}
                </div>
                <div className="text-center py-4">
                    <p className="text-red-500 text-sm">{error}</p>
                    <button
                        onClick={fetchNotifications}
                        className="mt-2 text-blue-600 hover:text-blue-800 text-sm underline"
                    >
                        Try again
                    </button>
                </div>
            </div>
        );
    }

    if (notifications.length === 0) {
        return (
            <div className="bg-white rounded-lg shadow-md p-4">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                        <FaBell className="w-5 h-5 text-blue-600" />
                        <h3 className="text-lg font-semibold text-gray-800">Notifications</h3>
                    </div>
                    {showCloseButton && onClose && (
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <FaTimes className="w-5 h-5" />
                        </button>
                    )}
                </div>
                <div className="text-center py-4">
                    <FaBell className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">{disabledMsg || 'No notifications yet'}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                    <FaBell className="w-5 h-5 text-blue-600" />
                    <h3 className="text-lg font-semibold text-gray-800">Notifications</h3>
                </div>
                {showCloseButton && onClose && (
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <FaTimes className="w-5 h-5" />
                    </button>
                )}
            </div>

            <div className="space-y-3">
                {notifications.map((notification) => (
                    <div
                        key={notification._id}
                        className="border-l-4 border-blue-500 pl-3 py-2 hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={() => markAsRead(notification._id)}
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <h4 className="text-sm font-medium text-gray-800 mb-1">
                                    {notification.title}
                                </h4>
                                <div className="flex items-center space-x-1 text-xs text-gray-500">
                                    <FaClock className="w-3 h-3" />
                                    <span>{formatDate(notification.createdAt)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {notifications.length >= maxNotifications && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                    <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                        View all notifications
                    </button>
                </div>
            )}
        </div>
    );
};

export default Notifications;
