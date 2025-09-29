
import { useEffect, useState } from "react";
import {
    Navbar,
    SideDrawer
} from "../../../components";
import { Get, Post } from "../../../config/apiMethods";
import { displayMessage } from "../../../config";
import { useLocation, useNavigate } from "react-router-dom";
import { RouteName } from "../../../routes/RouteNames";

const QuizzesDetails = () => {

    const location = useLocation();
    const { state } = location || {}; // Access the passed state
    const navigate = useNavigate();

    const headerArray = [
        "#",
        "Subject",
        "Topic",
        "Lesson",
        "Score",
        "Marks",
        "Action",
    ];

    const dummyQuizzes = [
        {
            score: 9,
            subject: 'Science',
            Topic: 'Topic Name',
            Lesson: 'Lesson name'
        },
        {
            score: 9,
            subject: 'Science',
            Topic: 'Topic Name',
            Lesson: 'Lesson name'
        },
        {
            score: 9,
            subject: 'Science',
            Topic: 'Topic Name',
            Lesson: 'Lesson name'
        },
        {
            score: 9,
            subject: 'Science',
            Topic: 'Topic Name',
            Lesson: 'Lesson name'
        },
    ];

    const [myresult, setMyResult] = useState<any>([])

    useEffect(() => {
        Get(`/quiz/employee/myquiz?result=${state.title}`).then((d) => {

            if (d.success) {
                setMyResult(d.data)

            } else {
                displayMessage(d.message, "error")
            }
        })
    }, [])
    const isPassed = state?.title === "pass";

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
                    <Navbar title={isPassed ? "Quizzes Completed Successfully" : "Quizzes Need Improvement"} hideSearchBar={true} />
                </div>

                {/* Back Button */}
                <div className="mb-6">
                    <button
                        onClick={() => navigate(-1)}
                        className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
                    >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                        </svg>
                        Back to Results
                    </button>
                </div>

                {/* Quiz Results Table */}
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                    {/* Table Header */}
                    <div className={`px-6 py-4 ${isPassed ? 'bg-gradient-to-r from-green-600 to-emerald-600' : 'bg-gradient-to-r from-orange-500 to-red-500'}`}>
                        <h2 className="text-xl font-bold text-white flex items-center">
                            <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                {isPassed ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                )}
                            </svg>
                            {isPassed ? "Successfully Completed Quizzes" : "Quizzes Requiring Improvement"}
                        </h2>
                        <p className="text-green-100 text-sm mt-1">
                            {isPassed ? "Review your successful quiz attempts" : "Focus on these areas for better performance"}
                        </p>
                    </div>

                    {/* Table Content */}
                    <div className="overflow-x-auto">
                        {myresult?.length > 0 ? (
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        {headerArray?.map((header, index) => (
                                            <th key={index} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                {header}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {myresult?.map((item: any, index: number) => (
                                        <tr key={index} className="hover:bg-gray-50 transition-colors duration-200">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {index + 1}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-8 w-8">
                                                        <div className={`h-8 w-8 rounded-full flex items-center justify-center ${isPassed ? 'bg-green-100' : 'bg-orange-100'}`}>
                                                            <svg className={`h-4 w-4 ${isPassed ? 'text-green-600' : 'text-orange-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                                            </svg>
                                                        </div>
                                                    </div>
                                                    <div className="ml-3">
                                                        <div className="text-sm font-medium text-gray-900">{item?.quiz?.subject?.name || 'N/A'}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {item?.quiz?.topic?.name || 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {item?.quiz?.lesson?.name || 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${isPassed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                    {item?.marks || 0}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {item?.score || 0}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <button
                                                    onClick={() => {
                                                        // Navigate to quiz confirmation page with topic and quiz parameters
                                                        const quizParams = new URLSearchParams({
                                                            topic: item?.quiz?.topic?._id || '',
                                                            quiz: item?.quiz?._id || ''
                                                        });
                                                        navigate(`${RouteName?.QUIZ_CONFIRMATION}?${quizParams.toString()}`);
                                                    }}
                                                    className={`inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md transition-all duration-200 ${isPassed
                                                        ? 'text-blue-700 bg-blue-100 hover:bg-blue-200'
                                                        : 'text-orange-700 bg-orange-100 hover:bg-orange-200'
                                                        }`}
                                                >
                                                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    Retake Quiz
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div className="text-center py-12">
                                <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-semibold text-gray-600 mb-2">No Quizzes Found</h3>
                                <p className="text-gray-500">
                                    {isPassed
                                        ? "You haven't completed any quizzes successfully yet."
                                        : "No quizzes need improvement at this time."
                                    }
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
};

export default QuizzesDetails;
