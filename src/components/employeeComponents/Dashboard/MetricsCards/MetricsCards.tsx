import { useState, useEffect } from "react";
import { Get } from "../../../../config/apiMethods";
import { displayMessage } from "../../../../config";

interface EmployeeStats {
    completedQuizzes: number;
    successRate: number;
    totalSubjects: number;
    inProgressSubjects: number;
}

const MetricsCards = () => {
    const [stats, setStats] = useState<EmployeeStats>({
        completedQuizzes: 0,
        successRate: 0,
        totalSubjects: 0,
        inProgressSubjects: 0
    });
    const [loading, setLoading] = useState(true);

    const fetchEmployeeStats = () => {
        setLoading(true);
        Get("/employee/mystats").then((d) => {
            if (d.success) {
                setStats({
                    completedQuizzes: d.data.completedQuizzes || 0,
                    successRate: d.data.successRate || 0,
                    totalSubjects: d.data.totalSubjects || 0,
                    inProgressSubjects: d.data.inProgressSubjects || 0
                });
            } else {
                console.warn("Failed to fetch employee stats:", d.message);
                // Keep default values (0) for failed requests
            }
        }).catch((error) => {
            console.error("Error fetching employee stats:", error);
            displayMessage("Failed to load statistics", "error");
            // Keep default values (0) for failed requests
        }).finally(() => {
            setLoading(false);
        });
    };

    useEffect(() => {
        fetchEmployeeStats();
    }, []);

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2].map((i) => (
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

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Completed Quizzes */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                    <div className="p-3 bg-blue-100 rounded-lg">
                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                    </div>
                    <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Completed Quizzes</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.completedQuizzes}</p>
                    </div>
                </div>
            </div>

            {/* Success Rate */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                    <div className="p-3 bg-green-100 rounded-lg">
                        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Success Rate</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.successRate}%</p>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default MetricsCards;
