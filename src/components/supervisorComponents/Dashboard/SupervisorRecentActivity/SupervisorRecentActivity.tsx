import { useState, useEffect } from "react";
import { Get } from "../../../../config/apiMethods";
import { displayMessage } from "../../../../config";

interface Activity {
    _id: string;
    type: 'quiz_completed' | 'training_started' | 'training_completed' | 'request_submitted' | 'feedback_given';
    employee: {
        _id: string;
        fullName: string;
        image?: string;
    };
    subject?: {
        _id: string;
        name: string;
    };
    score?: number;
    result?: 'pass' | 'fail';
    createdAt: string;
    message: string;
}

const SupervisorRecentActivity = () => {
    const [activities, setActivities] = useState<Activity[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchRecentActivity = () => {
        setLoading(true);
        Get("/supervisor/recentactivity").then((d) => {
            if (d.success) {
                setActivities(d.data || []);
            } else {
                console.warn("Failed to fetch recent activity:", d.message);
                setActivities([]);
            }
        }).catch((error) => {
            console.error("Error fetching recent activity:", error);
            displayMessage("Failed to load recent activity", "error");
            setActivities([]);
        }).finally(() => {
            setLoading(false);
        });
    };

    useEffect(() => {
        fetchRecentActivity();
    }, []);

    const getActivityIcon = (type: string) => {
        switch (type) {
            case 'quiz_completed':
                return (
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                );
            case 'training_started':
                return (
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                );
            case 'training_completed':
                return (
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                );
            case 'request_submitted':
                return (
                    <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                );
            case 'feedback_given':
                return (
                    <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                    </svg>
                );
            default:
                return (
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                );
        }
    };

    const getActivityColor = (type: string) => {
        switch (type) {
            case 'quiz_completed':
                return 'bg-green-100 text-green-800';
            case 'training_started':
                return 'bg-blue-100 text-blue-800';
            case 'training_completed':
                return 'bg-purple-100 text-purple-800';
            case 'request_submitted':
                return 'bg-orange-100 text-orange-800';
            case 'feedback_given':
                return 'bg-indigo-100 text-indigo-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getTimeAgo = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
        const diffInHours = Math.floor(diffInMinutes / 60);
        const diffInDays = Math.floor(diffInHours / 24);

        if (diffInMinutes < 1) return "Just now";
        if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
        if (diffInHours < 24) return `${diffInHours}h ago`;
        if (diffInDays < 7) return `${diffInDays}d ago`;
        return date.toLocaleDateString();
    };

    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase();
    };

    if (loading) {
        return (
            <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="animate-pulse">
                        <div className="flex items-start p-4 bg-gray-50 rounded-lg">
                            <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                            <div className="ml-3 flex-1">
                                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                            </div>
                            <div className="w-16 h-4 bg-gray-200 rounded"></div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (activities.length === 0) {
        return (
            <div className="text-center py-12">
                <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No Recent Activity</h3>
                <p className="text-gray-500">Recent team activities will appear here.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4 max-h-96 overflow-y-auto">
            {activities.map((activity) => (
                <div key={activity._id} className="flex items-start p-4 bg-gradient-to-r from-white to-gray-50 rounded-lg border border-gray-200 hover:shadow-md transition-all duration-200">
                    {/* Activity Icon */}
                    <div className="flex-shrink-0">
                        <div className="w-8 h-8 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center">
                            {getActivityIcon(activity.type)}
                        </div>
                    </div>

                    {/* Activity Content */}
                    <div className="ml-3 flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">
                                    {activity.message}
                                </p>

                                {/* Employee Info */}
                                <div className="flex items-center mt-1">
                                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mr-2">
                                        {activity.employee?.image ? (
                                            <img
                                                src={activity.employee.image}
                                                alt={activity.employee.fullName}
                                                className="w-full h-full object-cover rounded-full"
                                            />
                                        ) : (
                                            <span className="text-white text-xs font-semibold">
                                                {getInitials(activity.employee?.fullName || "U")}
                                            </span>
                                        )}
                                    </div>
                                    <span className="text-sm text-gray-600">
                                        {activity.employee?.fullName || "Unknown Employee"}
                                    </span>
                                </div>

                                {/* Subject and Score Info */}
                                {(activity.subject || activity.score) && (
                                    <div className="flex items-center mt-2 space-x-4">
                                        {activity.subject && (
                                            <span className="text-xs text-gray-500">
                                                Subject: {activity.subject.name}
                                            </span>
                                        )}
                                        {activity.score && (
                                            <span className={`text-xs px-2 py-1 rounded-full ${getActivityColor(activity.result || 'quiz_completed')}`}>
                                                Score: {activity.score}%
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Time */}
                            <div className="ml-4 flex-shrink-0">
                                <span className="text-xs text-gray-500">
                                    {getTimeAgo(activity.createdAt)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default SupervisorRecentActivity;
