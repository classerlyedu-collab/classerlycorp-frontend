import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Navbar,
    SideDrawer
} from "../../../components";
import { Get } from "../../../config/apiMethods";
import { displayMessage } from "../../../config";
import { RouteName } from "../../../routes/RouteNames";

// Type definitions for the data structures
interface MonthlyTrend {
    month: string;
    total: number;
    passed: number;
    failed: number;
    successRate: number;
}

interface SubjectPerformance {
    name: string;
    image?: string;
    total: number;
    passed: number;
    failed: number;
    successRate: number;
}

interface PerformanceInsights {
    overallPerformance: 'excellent' | 'good' | 'needs_improvement';
    consistency: 'high' | 'medium' | 'low';
    recentTrend: 'improving' | 'declining' | 'stable';
    strongestSubject?: string;
    improvementAreas?: string[];
}

const Result = () => {
    const navigate = useNavigate();
    const [myresult, setMyResult] = useState<any>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        Get("/employee/myresult").then((d) => {
            if (d.success) {
                setMyResult(d.data);
            } else {
                displayMessage(d.message, "error");
            }
            setLoading(false);
        }).catch(() => {
            setLoading(false);
        });
    }, []);

    const totalQuizzes = myresult?.totalquizes || 0;
    const successRate = myresult?.successRate || 0;
    const recentSuccessRate = myresult?.recentSuccessRate || 0;
    const totalSubjects = myresult?.totalSubjects || 0;
    const insights: PerformanceInsights = myresult?.insights || {};
    const subjectPerformance: SubjectPerformance[] = myresult?.subjectPerformance || [];
    const monthlyTrend: MonthlyTrend[] = myresult?.monthlyTrend || [];
    const recentQuizzes = myresult?.recentQuizzes || 0;

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
                <div className="fixed left-0 top-0 h-full w-64 z-10">
                    <SideDrawer />
                </div>
                <div className="ml-64 flex items-center justify-center h-screen">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading your results...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
            {/* Sidebar */}
            <div className="fixed left-0 top-0 h-full w-64 z-10">
                <SideDrawer />
            </div>

            {/* Main Content */}
            <div className="ml-64 p-6">
                {/* Header */}
                <div className="mb-8">
                    <Navbar title="Performance Results" hideSearchBar={true} />
                </div>

                {/* Performance Overview Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                    {/* Success Rate Card */}
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300">
                        <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-green-100 text-sm font-medium">Success Rate</p>
                                    <p className="text-white text-3xl font-bold">{successRate}%</p>
                                </div>
                                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                        <div className="p-6">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-1000"
                                    style={{ width: `${successRate}%` }}
                                ></div>
                            </div>
                            <p className="text-gray-600 text-sm mt-2">Overall performance across all assessments</p>
                        </div>
                    </div>

                    {/* Passed Quizzes Card */}
                    <div
                        onClick={() => navigate(RouteName.QUIZZES_DETAILS, { state: { title: 'pass' } })}
                        className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer group"
                    >
                        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-blue-100 text-sm font-medium">Passed Quizzes</p>
                                    <p className="text-white text-3xl font-bold">{myresult?.passquizes || 0}</p>
                                </div>
                                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                        <div className="p-6">
                            <div className="flex items-center justify-between">
                                <span className="text-gray-600 text-sm">Completed successfully</span>
                                <svg className="w-4 h-4 text-blue-500 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Failed Quizzes Card */}
                    <div
                        onClick={() => navigate(RouteName.QUIZZES_DETAILS, { state: { title: 'fail' } })}
                        className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer group"
                    >
                        <div className="bg-gradient-to-r from-orange-500 to-red-500 px-6 py-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-orange-100 text-sm font-medium">Need Improvement</p>
                                    <p className="text-white text-3xl font-bold">{myresult?.failquizes || 0}</p>
                                </div>
                                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                        <div className="p-6">
                            <div className="flex items-center justify-between">
                                <span className="text-gray-600 text-sm">Require attention</span>
                                <svg className="w-4 h-4 text-orange-500 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Recent Performance Card */}
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300">
                        <div className="bg-gradient-to-r from-cyan-600 to-blue-600 px-6 py-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-cyan-100 text-sm font-medium">Recent Performance</p>
                                    <p className="text-white text-3xl font-bold">{recentSuccessRate}%</p>
                                </div>
                                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                        <div className="p-6">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full transition-all duration-1000"
                                    style={{ width: `${recentSuccessRate}%` }}
                                ></div>
                            </div>
                            <p className="text-gray-600 text-sm mt-2">Last 30 days ({recentQuizzes} quizzes)</p>
                        </div>
                    </div>

                    {/* Total Subjects Card */}
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300">
                        <div className="bg-gradient-to-r from-indigo-600 to-blue-600 px-6 py-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-indigo-100 text-sm font-medium">Assigned Subjects</p>
                                    <p className="text-white text-3xl font-bold">{totalSubjects}</p>
                                </div>
                                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                        <div className="p-6">
                            <p className="text-gray-600 text-sm">Active training subjects</p>
                        </div>
                    </div>
                </div>

                {/* Performance Analysis Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    {/* Monthly Performance Trend */}
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
                            <h3 className="text-xl font-bold text-white flex items-center">
                                <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                                Monthly Performance Trend
                            </h3>
                        </div>
                        <div className="p-6">
                            {monthlyTrend.length > 0 ? (
                                <div className="space-y-4">
                                    {monthlyTrend.map((month: MonthlyTrend, index: number) => (
                                        <div key={month.month} className="bg-gray-50 rounded-lg p-4">
                                            <div className="flex items-center justify-between mb-2">
                                                <h4 className="font-semibold text-gray-800">
                                                    {new Date(month.month + '-01').toLocaleDateString('en-US', {
                                                        month: 'short',
                                                        year: 'numeric'
                                                    })}
                                                </h4>
                                                <span className="text-sm font-bold text-indigo-600">
                                                    {month.successRate}%
                                                </span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div
                                                    className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all duration-1000"
                                                    style={{ width: `${month.successRate}%` }}
                                                ></div>
                                            </div>
                                            <div className="flex justify-between text-xs text-gray-600 mt-1">
                                                <span>{month.passed} passed</span>
                                                <span>{month.total} total</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="h-32 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl">
                                    <div className="text-center">
                                        <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                        </svg>
                                        <p className="text-gray-500 text-sm">No data available for the last 6 months</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                        <div className="bg-gradient-to-r from-teal-600 to-cyan-600 px-6 py-4">
                            <h3 className="text-xl font-bold text-white flex items-center">
                                <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                                Quick Actions
                            </h3>
                        </div>
                        <div className="p-6">
                            <div className="space-y-4">
                                <button
                                    onClick={() => navigate(RouteName.SUBJECTS_SCREEN)}
                                    className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 rounded-xl border border-blue-200 transition-all duration-200 group"
                                >
                                    <div className="flex items-center">
                                        <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center mr-4">
                                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                            </svg>
                                        </div>
                                        <div className="text-left">
                                            <p className="font-semibold text-gray-800">View Subjects</p>
                                            <p className="text-sm text-gray-600">Browse available training subjects</p>
                                        </div>
                                    </div>
                                    <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>

                                <button
                                    onClick={() => navigate(RouteName.DASHBOARD_SCREEN_EMPLOYEE)}
                                    className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 rounded-xl border border-green-200 transition-all duration-200 group"
                                >
                                    <div className="flex items-center">
                                        <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center mr-4">
                                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z" />
                                            </svg>
                                        </div>
                                        <div className="text-left">
                                            <p className="font-semibold text-gray-800">Dashboard</p>
                                            <p className="text-sm text-gray-600">Return to main dashboard</p>
                                        </div>
                                    </div>
                                    <svg className="w-5 h-5 text-gray-400 group-hover:text-green-500 group-hover:translate-x-1 transition-all duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Subject Performance */}
                {subjectPerformance.length > 0 && (
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden mb-8">
                        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-4">
                            <h3 className="text-xl font-bold text-white flex items-center">
                                <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                                Subject Performance Breakdown
                            </h3>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {subjectPerformance.map((subject: SubjectPerformance, index: number) => (
                                    <div key={index} className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4">
                                        <div className="flex items-center mb-3">
                                            {subject.image ? (
                                                <img
                                                    src={subject.image}
                                                    alt={subject.name}
                                                    className="w-12 h-12 rounded-lg object-cover mr-3"
                                                />
                                            ) : (
                                                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center mr-3">
                                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                                    </svg>
                                                </div>
                                            )}
                                            <div>
                                                <h4 className="font-semibold text-gray-800">{subject.name}</h4>
                                                <p className="text-sm text-gray-600">{subject.total} quizzes</p>
                                            </div>
                                        </div>
                                        <div className="mb-3">
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="text-sm font-medium text-gray-600">Success Rate</span>
                                                <span className="text-sm font-bold text-emerald-600">{subject.successRate}%</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div
                                                    className="bg-gradient-to-r from-emerald-500 to-teal-500 h-2 rounded-full transition-all duration-1000"
                                                    style={{ width: `${subject.successRate}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                        <div className="flex justify-between text-xs text-gray-600">
                                            <span className="text-green-600">{subject.passed} passed</span>
                                            <span className="text-red-500">{subject.failed} failed</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Performance Insights */}
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                    <div className="bg-gradient-to-r from-gray-700 to-gray-800 px-6 py-4">
                        <h3 className="text-xl font-bold text-white flex items-center">
                            <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                            </svg>
                            AI-Powered Performance Insights
                        </h3>
                    </div>
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
                                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                    </svg>
                                </div>
                                <h4 className="font-semibold text-gray-800 mb-1">Overall Performance</h4>
                                <p className="text-sm text-gray-600 mb-2">
                                    {insights.overallPerformance === 'excellent' ? "🌟 Excellent! Outstanding performance across all assessments." :
                                        insights.overallPerformance === 'good' ? "👍 Good work! Continue building on your success." :
                                            "📈 Focus on improvement areas to boost your performance."}
                                </p>
                                <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                    {insights.overallPerformance?.replace('_', ' ').toUpperCase()}
                                </span>
                            </div>

                            <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
                                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <h4 className="font-semibold text-gray-800 mb-1">Consistency Level</h4>
                                <p className="text-sm text-gray-600 mb-2">
                                    {insights.consistency === 'high' ? "🎯 High consistency! Great dedication to learning." :
                                        insights.consistency === 'medium' ? "📊 Medium consistency. Try to maintain regular practice." :
                                            "💪 Low consistency. Consider setting regular study goals."}
                                </p>
                                <span className="inline-block px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                    {insights.consistency?.toUpperCase()}
                                </span>
                            </div>

                            <div className="text-center p-4 bg-gradient-to-br from-rose-50 to-pink-100 rounded-xl">
                                <div className="w-12 h-12 bg-gradient-to-r from-rose-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <h4 className="font-semibold text-gray-800 mb-1">Performance Trend</h4>
                                <p className="text-sm text-gray-600 mb-2">
                                    {insights.recentTrend === 'improving' ? "📈 Improving! Your recent performance is getting better." :
                                        insights.recentTrend === 'declining' ? "⚠️ Declining trend. Focus on recent areas of weakness." :
                                            "📊 Stable performance. Maintain your current level of effort."}
                                </p>
                                <span className="inline-block px-2 py-1 bg-rose-100 text-rose-800 text-xs rounded-full">
                                    {insights.recentTrend?.toUpperCase()}
                                </span>
                            </div>
                        </div>

                        {/* Additional Insights */}
                        <div className="mt-6 pt-6 border-t border-gray-200">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {insights.strongestSubject && (
                                    <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-200">
                                        <h5 className="font-semibold text-gray-800 mb-2 flex items-center">
                                            <svg className="w-4 h-4 mr-2 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                            </svg>
                                            Strongest Subject
                                        </h5>
                                        <p className="text-sm text-gray-600">{insights.strongestSubject}</p>
                                    </div>
                                )}

                                {insights.improvementAreas && insights.improvementAreas.length > 0 && (
                                    <div className="p-4 bg-gradient-to-r from-red-50 to-pink-50 rounded-xl border border-red-200">
                                        <h5 className="font-semibold text-gray-800 mb-2 flex items-center">
                                            <svg className="w-4 h-4 mr-2 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            Focus Areas
                                        </h5>
                                        <p className="text-sm text-gray-600">{insights.improvementAreas.join(', ')}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
};

export default Result;