import React, { useState } from 'react';
import { FaBell, FaTimes, FaClock } from 'react-icons/fa';
import { Post } from '../../../config/apiMethods';
import { displayMessage } from '../../../config';

interface NotificationModalProps {
  isVisible: boolean;
  onClose: () => void;
  notifications: any[]; // Replace with your actual notification type
  onNotificationsUpdated?: () => void; // Callback to refresh notifications
}

const NotificationsModal: React.FC<NotificationModalProps> = ({ isVisible, onClose, notifications, onNotificationsUpdated }) => {
  const [isMarkingAsRead, setIsMarkingAsRead] = useState(false);

  if (!isVisible) return null;

  // Get current user ID from localStorage
  const getCurrentUserId = () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '');
      return user?._id || user?.id;
    } catch {
      return null;
    }
  };

  // Check if a notification is read by current user
  const isNotificationRead = (notification: any) => {
    const currentUserId = getCurrentUserId();
    if (!currentUserId || !notification.readBy) return false;

    return notification.readBy.some((readEntry: any) =>
      readEntry.userId === currentUserId || readEntry.userId._id === currentUserId
    );
  };

  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const date = new Date(timestamp);
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + "y ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + "mo ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + "d ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + "h ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + "m ago";
    return Math.floor(seconds) + "s ago";
  };

  const handleMarkAllAsRead = async () => {
    try {
      setIsMarkingAsRead(true);

      const response = await Post('/markAllNotificationsAsRead', {});

      if (response.success) {
        displayMessage(response.message || "All notifications marked as read", "success");

        // Refresh notifications if callback is provided
        if (onNotificationsUpdated) {
          onNotificationsUpdated();
        }
      } else {
        displayMessage(response.message || "Failed to mark notifications as read", "error");
      }
    } catch (error: any) {
      displayMessage("Failed to mark notifications as read", "error");
    } finally {
      setIsMarkingAsRead(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-start justify-end pt-12 pr-5">
      <div className="bg-white z-40 rounded-xl shadow-2xl p-0 w-4/5 sm:w-3/5 lg:w-2/5 max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <FaBell className="w-4 h-4 text-blue-600" />
            </div>
            <h1 className="font-ubuntu font-semibold text-lg text-gray-800">
              Notifications
            </h1>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
          >
            <FaTimes className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="max-h-96 overflow-y-auto">
          {notifications?.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                <FaBell className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 text-sm font-medium">No notifications yet</p>
              <p className="text-gray-400 text-xs mt-1">We'll notify you when something new happens</p>
            </div>
          ) : (
            <div className="p-2">
              {notifications.map((notification, index) => {
                const isRead = isNotificationRead(notification);
                return (
                  <div
                    key={index}
                    className={`group p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer border-b border-gray-50 last:border-b-0 ${isRead ? 'opacity-75' : ''
                      }`}
                  >
                    <div className="flex items-start space-x-3">
                      {/* Notification indicator dot - different colors for read/unread */}
                      <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${isRead ? 'bg-gray-400' : 'bg-blue-500'
                        }`}></div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm leading-relaxed ${isRead ? 'font-normal text-gray-600' : 'font-medium text-gray-800'
                          }`}>
                          {notification?.title}
                        </p>
                        <div className="flex items-center space-x-1 mt-2">
                          <FaClock className="w-3 h-3 text-gray-400" />
                          <span className="text-xs text-gray-500">
                            {getTimeAgo(notification?.createdAt || notification?.updatedAt)}
                          </span>
                          {isRead && (
                            <span className="text-xs text-green-600 font-medium ml-2">
                              ✓ Read
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {notifications?.length > 0 && notifications.some(notification => !isNotificationRead(notification)) && (
          <div className="p-3 border-t border-gray-100 bg-gray-50 rounded-b-xl">
            <button
              onClick={handleMarkAllAsRead}
              disabled={isMarkingAsRead}
              className="w-full text-center text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isMarkingAsRead ? "Marking as read..." : "Mark all as read"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsModal;
