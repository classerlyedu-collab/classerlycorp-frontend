import { useState, useEffect } from "react";
import { Get } from "../../../../config/apiMethods";
import { displayMessage } from "../../../../config";

interface SupervisorStats {
    totalEmployees: number;
    activeEmployees: number;
    completedTrainings: number;
    pendingRequests: number;
    averagePerformance: number;
    totalQuizzes: number;
}

interface SupervisorMetricsCardsProps {
    refreshTrigger?: number;
}

const SupervisorMetricsCards: React.FC<SupervisorMetricsCardsProps> = ({ refreshTrigger }) => {
    const [stats, setStats] = useState<SupervisorStats>({
        totalEmployees: 0,
        activeEmployees: 0,
        completedTrainings: 0,
        pendingRequests: 0,
        averagePerformance: 0,
        totalQuizzes: 0
    });
    const [loading, setLoading] = useState(true);

    const fetchSupervisorStats = () => {
        setLoading(true);
        Get("/supervisor/mystats").then((d) => {
            if (d.success) {
                setStats({
                    totalEmployees: d.data.totalEmployees || 0,
                    activeEmployees: d.data.activeEmployees || 0,
                    completedTrainings: d.data.completedTrainings || 0,
                    pendingRequests: d.data.pendingRequests || 0,
                    averagePerformance: d.data.averagePerformance || 0,
                    totalQuizzes: d.data.totalQuizzes || 0
                });
            } else {
                console.warn("Failed to fetch supervisor stats:", d.message);
                // Keep default values (0) for failed requests
            }
        }).catch((error) => {
            console.error("Error fetching supervisor stats:", error);
            displayMessage("Failed to load statistics", "error");
            // Keep default values (0) for failed requests
        }).finally(() => {
            setLoading(false);
        });
    };

    useEffect(() => {
        fetchSupervisorStats();
    }, []);

    useEffect(() => {
        if (refreshTrigger && refreshTrigger > 0) {
            fetchSupervisorStats();
        }
    }, [refreshTrigger]);

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center">
                            <div className="p-3 bg-gray-100 rounded-lg animate-pulse">
                                <div className="w-6 h-6 bg-gray-300 rounded"></div>
                            </div>
                            <div className="ml-4">
                                <div className="h-4 bg-gray-200 rounded w-24 mb-2 animate-pulse"></div>
                                <div className="h-8 bg-gray-200 rounded w-12 animate-pulse"></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    const metrics = [
        {
            title: "Total Employees",
            value: stats.totalEmployees,
            icon: (
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
            ),
            bgColor: "bg-blue-100",
            textColor: "text-blue-600"
        },
        {
            title: "Active Employees",
            value: stats.activeEmployees,
            icon: (
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            bgColor: "bg-green-100",
            textColor: "text-green-600"
        },
        {
            title: "Completed Trainings",
            value: stats.completedTrainings,
            icon: (
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
            ),
            bgColor: "bg-purple-100",
            textColor: "text-purple-600"
        },
        {
            title: "Pending Requests",
            value: stats.pendingRequests,
            icon: (
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            bgColor: "bg-orange-100",
            textColor: "text-orange-600"
        },
        {
            title: "Average Performance",
            value: `${stats.averagePerformance}%`,
            icon: (
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
            ),
            bgColor: "bg-indigo-100",
            textColor: "text-indigo-600"
        },
        {
            title: "Total Quizzes",
            value: stats.totalQuizzes,
            icon: (
                <svg className="w-6 h-6 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
            ),
            bgColor: "bg-pink-100",
            textColor: "text-pink-600"
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {metrics.map((metric, index) => (
                <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
                    <div className="flex items-center">
                        <div className={`p-3 ${metric.bgColor} rounded-lg`}>
                            {metric.icon}
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">{metric.title}</p>
                            <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default SupervisorMetricsCards;
