import { useState, useEffect } from "react";
import { Get } from "../../../../config/apiMethods";
import { displayMessage } from "../../../../config";

const SupervisorWelcomeNotice = () => {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [user, setUser] = useState<any>({});

    useEffect(() => {
        // Update time every minute
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 60000);

        // Get user data
        const getStoredUser = () => {
            try {
                const raw = localStorage.getItem("user");
                return raw ? JSON.parse(raw) : {};
            } catch {
                return {};
            }
        };
        setUser(getStoredUser());

        return () => clearInterval(timer);
    }, []);

    const getGreeting = () => {
        const hour = currentTime.getHours();
        if (hour < 12) return "Good Morning";
        if (hour < 18) return "Good Afternoon";
        return "Good Evening";
    };

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    return (
        <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 rounded-2xl shadow-xl overflow-hidden">
            <div className="px-8 py-12 relative">
                <div className="absolute inset-0 bg-black opacity-10"></div>
                <div className="relative z-10">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                        {/* Welcome Content */}
                        <div className="flex-1 mb-6 md:mb-0">
                            <div className="flex items-center mb-4">
                                <div className="flex-shrink-0">
                                    <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center backdrop-blur-sm">
                                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="ml-4">
                                    <h1 className="text-3xl font-bold text-white mb-1">
                                        {getGreeting()}, {user.userName?.charAt(0).toUpperCase() + user.userName?.slice(1) || 'Supervisor'}!
                                    </h1>
                                    <p className="text-blue-100 text-lg">
                                        Welcome to your supervisor dashboard
                                    </p>
                                </div>
                            </div>

                            {/* Date and Time */}
                            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-6 space-y-2 sm:space-y-0">
                                <div className="flex items-center text-blue-100">
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    <span className="text-sm font-medium">{formatDate(currentTime)}</span>
                                </div>
                                <div className="flex items-center text-blue-100">
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span className="text-sm font-medium">{formatTime(currentTime)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                            <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-xl px-6 py-4 text-center">
                                <div className="text-2xl font-bold text-white">
                                    {new Date().getHours() < 12 ? '🌅' : new Date().getHours() < 18 ? '☀️' : '🌙'}
                                </div>
                                <div className="text-blue-100 text-sm mt-1">
                                    {getGreeting()}
                                </div>
                            </div>
                            <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-xl px-6 py-4 text-center">
                                <div className="text-2xl font-bold text-white">
                                    📊
                                </div>
                                <div className="text-blue-100 text-sm mt-1">
                                    Dashboard
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Motivational Message */}
                    <div className="mt-6 bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-4">
                        <div className="flex items-start">
                            <svg className="w-5 h-5 text-yellow-300 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                            </svg>
                            <div>
                                <p className="text-white font-medium mb-1">Stay Connected & Informed</p>
                                <p className="text-blue-100 text-sm">
                                    Keep track of your team's progress, manage training schedules, and stay updated with the latest announcements to ensure continuous growth and development.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SupervisorWelcomeNotice;
