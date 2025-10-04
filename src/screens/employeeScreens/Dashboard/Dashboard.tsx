
import { useState, useCallback } from "react";
import {
    CompletionProgress,
    Navbar,
    QuizTopics,
    SideDrawer,
    Timeline,
    TopPerformingStudents,
    WelcomeNoticeStudent,
    Notifications
} from "../../../components";
import { MyTeachers } from "../../../components/employeeComponents/Dashboard/MyTeachers";
import { MetricsCards } from "../../../components/employeeComponents/Dashboard/MetricsCards";

const Dashboard = () => {
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [quizRefreshTrigger, setQuizRefreshTrigger] = useState(0);

    const triggerRefresh = useCallback(() => {
        setRefreshTrigger(prev => prev + 1);
        // Also refresh quizzes when a request is accepted
        setQuizRefreshTrigger(prev => prev + 1);
    }, []);

    const triggerQuizRefresh = useCallback(() => {
        setQuizRefreshTrigger(prev => prev + 1);
    }, []);

    return (
        <div className="min-h-screen w-screen bg-gradient-to-br from-slate-50 to-blue-50">
            <div className="flex w-full">
                {/* Sidebar */}
                <div className="lg:w-1/6 hidden lg:block">
                    <SideDrawer />
                </div>

                {/* Main Content */}
                <div className="flex-1 flex flex-col min-h-screen">
                    {/* Header */}
                    <div className="bg-white shadow-sm border-b border-gray-200">
                        <Navbar title="Dashboard" />
                    </div>

                    {/* Main Dashboard Content */}
                    <div className="flex-1 p-4 lg:p-6">
                        <div className="max-w-7xl mx-auto">
                            {/* Welcome Section */}
                            <div className="mb-6">
                                <WelcomeNoticeStudent />
                            </div>

                            {/* Dashboard Grid */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Left Column - Stats & Content */}
                                <div className="lg:col-span-1 space-y-6">
                                    {/* Dynamic Metrics Cards */}
                                    <MetricsCards />

                                    {/* Quiz Topics Section with Corporate Design */}
                                    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                                        <div className="p-6">
                                            <div className="flex items-center justify-between mb-4">
                                                <h2 className="text-xl font-semibold text-gray-900">Available Quizzes</h2>
                                                <div className="flex items-center space-x-2">
                                                    <button
                                                        onClick={triggerQuizRefresh}
                                                        className="text-sm text-blue-600 hover:text-blue-700 underline"
                                                    >
                                                        Refresh
                                                    </button>
                                                    <span className="text-sm text-gray-500">Continue learning</span>
                                                </div>
                                            </div>
                                            <QuizTopics refreshTrigger={quizRefreshTrigger} />
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column - Notifications & Team */}
                                <div className="space-y-6">
                                    {/* Notifications */}
                                    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                                        <div className="p-6">
                                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Updates</h3>
                                            <Notifications maxNotifications={5} />
                                        </div>
                                    </div>

                                    {/* My Team/Instructors */}
                                    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                                        <div className="p-6">
                                            <div className="flex items-center justify-between mb-4">
                                                <h3 className="text-lg font-semibold text-gray-900">My Team</h3>
                                                <span className="text-sm text-blue-600">View All</span>
                                            </div>
                                            <MyTeachers refreshTrigger={refreshTrigger} />
                                        </div>
                                    </div>

                                    {/* Timeline */}
                                    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                                        <div className="p-6">
                                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Activity Timeline</h3>
                                            <Timeline onRequestAccepted={triggerRefresh} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
};

export default Dashboard;
