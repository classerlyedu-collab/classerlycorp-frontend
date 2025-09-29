import { useState, useEffect } from "react";
import { Get } from "../../../../config/apiMethods";
import { displayMessage } from "../../../../config";
import { useNavigate } from "react-router-dom";
import { RouteName } from "../../../../routes/RouteNames";

interface Employee {
    _id: string;
    auth: {
        fullName: string;
        email: string;
        image?: string;
    };
    subjects: any[];
    overallProgress: {
        total: number;
        completed: number;
        percentage: number;
    };
    lastActive?: string;
}

interface SupervisorTeamOverviewProps {
    refreshTrigger?: number;
}

const SupervisorTeamOverview: React.FC<SupervisorTeamOverviewProps> = ({ refreshTrigger }) => {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchTeamData = () => {
        setLoading(true);
        Get("/supervisor/mychildren").then((d) => {
            if (d.success) {
                setEmployees(d.data || []);
            } else {
                console.warn("Failed to fetch team data:", d.message);
                setEmployees([]);
            }
        }).catch((error) => {
            console.error("Error fetching team data:", error);
            displayMessage("Failed to load team data", "error");
            setEmployees([]);
        }).finally(() => {
            setLoading(false);
        });
    };

    useEffect(() => {
        fetchTeamData();
    }, []);

    useEffect(() => {
        if (refreshTrigger && refreshTrigger > 0) {
            fetchTeamData();
        }
    }, [refreshTrigger]);

    const getProgressColor = (percentage: number) => {
        if (percentage >= 80) return "text-green-600 bg-green-100";
        if (percentage >= 60) return "text-yellow-600 bg-yellow-100";
        if (percentage >= 40) return "text-orange-600 bg-orange-100";
        return "text-red-600 bg-red-100";
    };

    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase();
    };

    const getTimeAgo = (dateString?: string) => {
        if (!dateString) return "Unknown";
        const date = new Date(dateString);
        const now = new Date();
        const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

        if (diffInHours < 1) return "Just now";
        if (diffInHours < 24) return `${diffInHours}h ago`;
        const diffInDays = Math.floor(diffInHours / 24);
        return `${diffInDays}d ago`;
    };

    if (loading) {
        return (
            <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse">
                        <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                            <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                            <div className="ml-4 flex-1">
                                <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                            </div>
                            <div className="w-20 h-8 bg-gray-200 rounded"></div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (employees.length === 0) {
        return (
            <div className="text-center py-12">
                <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No Team Members Yet</h3>
                <p className="text-gray-500">Your team members will appear here once they are assigned to you.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {employees.slice(0, 5).map((employee) => (
                <div key={employee._id} className="flex items-center p-4 bg-gradient-to-r from-white to-gray-50 rounded-lg border border-gray-200 hover:shadow-md transition-all duration-200">
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                        <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                            {employee.auth?.image ? (
                                <img
                                    src={employee.auth.image}
                                    alt={employee.auth.fullName}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <span className="text-white font-semibold text-sm">
                                    {getInitials(employee.auth?.fullName || "U")}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Employee Info */}
                    <div className="ml-4 flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 truncate">
                                    {employee.auth?.fullName || "Unknown Employee"}
                                </h3>
                                <p className="text-sm text-gray-500 truncate">
                                    {employee.auth?.email || "No email"}
                                </p>
                            </div>
                            <div className="flex items-center space-x-4">
                                {/* Progress */}
                                <div className="text-right">
                                    <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getProgressColor(employee.overallProgress?.percentage || 0)}`}>
                                        {employee.overallProgress?.percentage || 0}% Complete
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {employee.overallProgress?.completed || 0}/{employee.overallProgress?.total || 0} lessons
                                    </p>
                                </div>

                                {/* Action Button */}
                                <button
                                    onClick={() => navigate(RouteName.MYEMPLOYEES_SCREEN)}
                                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                                >
                                    View Details
                                </button>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="mt-3">
                            <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                                <span>Progress</span>
                                <span>{employee.overallProgress?.completed || 0}/{employee.overallProgress?.total || 0}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className={`h-2 rounded-full transition-all duration-300 ${(employee.overallProgress?.percentage || 0) >= 80 ? 'bg-green-500' :
                                            (employee.overallProgress?.percentage || 0) >= 60 ? 'bg-yellow-500' :
                                                (employee.overallProgress?.percentage || 0) >= 40 ? 'bg-orange-500' : 'bg-red-500'
                                        }`}
                                    style={{ width: `${employee.overallProgress?.percentage || 0}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>
                </div>
            ))}

            {/* View All Button */}
            {employees.length > 5 && (
                <div className="pt-4 border-t border-gray-200">
                    <button
                        onClick={() => navigate(RouteName.MYEMPLOYEES_SCREEN)}
                        className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                    >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        View All Team Members ({employees.length})
                    </button>
                </div>
            )}
        </div>
    );
};

export default SupervisorTeamOverview;
