import { useState } from "react";
import { ChildResultType } from "../../../../types/parent/ChildOverview";
import { getRandomColor } from "../../../../utils/randomColorGenerator";
import { FaTrophy, FaMedal, FaTimesCircle, FaCheckCircle, FaChartBar, FaChevronLeft, FaChevronRight } from "react-icons/fa";

interface PropsTypes {
    result: ChildResultType[] | null
};

const QuizResults = ({
    result
}: PropsTypes) => {
    const [currentPage, setCurrentPage] = useState<number>(1);
    const topicsPerPage = 4; // Show 4 topics per page for quizzes
    let cusomindex = 1;

    // Calculate quiz statistics
    const getQuizStats = () => {
        if (!result || result.length === 0) return { totalQuizzes: 0, passedQuizzes: 0, totalMarks: 0, obtainedMarks: 0 };

        let totalQuizzes = 0;
        let passedQuizzes = 0;
        let totalMarks = 0;
        let obtainedMarks = 0;

        result.forEach(topic => {
            topic.quizes?.forEach(quiz => {
                quiz.studentQuizData?.forEach(quizData => {
                    totalQuizzes++;
                    if (quizData.result === 'pass') passedQuizzes++;
                    totalMarks += quizData.score || 0;
                    obtainedMarks += quizData.marks || 0;
                });
            });
        });

        return { totalQuizzes, passedQuizzes, totalMarks, obtainedMarks };
    };

    const quizStats = getQuizStats();
    const passRate = quizStats.totalQuizzes > 0 ? Math.round((quizStats.passedQuizzes / quizStats.totalQuizzes) * 100) : 0;

    // Pagination logic
    const totalPages = result ? Math.ceil(result.length / topicsPerPage) : 0;
    const startIndex = (currentPage - 1) * topicsPerPage;
    const endIndex = startIndex + topicsPerPage;
    const currentTopics = result ? result.slice(startIndex, endIndex) : [];

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    return (
        <div className="w-full">

            {/* Quiz Statistics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-3 md:p-4">
                    <div className="flex items-center gap-2 md:gap-3">
                        <FaChartBar className="text-blue-600 text-base md:text-lg" />
                        <div>
                            <p className="text-xs md:text-sm text-blue-600 font-ubuntu">Total Quizzes</p>
                            <p className="text-lg md:text-xl font-bold text-blue-800 font-ubuntu">{quizStats.totalQuizzes}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-3 md:p-4">
                    <div className="flex items-center gap-2 md:gap-3">
                        <FaCheckCircle className="text-green-600 text-base md:text-lg" />
                        <div>
                            <p className="text-xs md:text-sm text-green-600 font-ubuntu">Passed</p>
                            <p className="text-lg md:text-xl font-bold text-green-800 font-ubuntu">{quizStats.passedQuizzes}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-3 md:p-4">
                    <div className="flex items-center gap-2 md:gap-3">
                        <FaMedal className="text-purple-600 text-base md:text-lg" />
                        <div>
                            <p className="text-xs md:text-sm text-purple-600 font-ubuntu">Pass Rate</p>
                            <p className="text-lg md:text-xl font-bold text-purple-800 font-ubuntu">{passRate}%</p>
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl p-3 md:p-4">
                    <div className="flex items-center gap-2 md:gap-3">
                        <FaTrophy className="text-orange-600 text-base md:text-lg" />
                        <div>
                            <p className="text-xs md:text-sm text-orange-600 font-ubuntu">Total Score</p>
                            <p className="text-lg md:text-xl font-bold text-orange-800 font-ubuntu">{quizStats.obtainedMarks}/{quizStats.totalMarks}</p>
                        </div>
                    </div>
                </div>
            </div>

            {result?.length === 0 && (
                <div className="text-center py-8">
                    <FaTrophy className="text-gray-300 text-4xl mx-auto mb-3" />
                    <h3 className="text-lg font-semibold text-gray-500 font-ubuntu mb-1">No Quiz Results Yet</h3>
                    <p className="text-gray-400 font-ubuntu text-sm">Quiz results will appear here once completed.</p>
                </div>
            )}

            {/* Pagination Info */}
            {result && result.length > topicsPerPage && (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    {/* Desktop Layout */}
                    <div className="hidden md:flex items-center justify-between">
                        <p className="text-sm text-gray-600 font-ubuntu">
                            Showing {startIndex + 1}-{Math.min(endIndex, result.length)} of {result.length} topics
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="p-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <FaChevronLeft className="text-gray-600" />
                            </button>
                            <span className="px-3 py-1 text-sm font-medium text-gray-700 bg-white rounded-lg border border-gray-200">
                                {currentPage} of {totalPages}
                            </span>
                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="p-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <FaChevronRight className="text-gray-600" />
                            </button>
                        </div>
                    </div>

                    {/* Mobile Layout */}
                    <div className="md:hidden">
                        <p className="text-xs text-gray-600 font-ubuntu text-center mb-3">
                            {startIndex + 1}-{Math.min(endIndex, result.length)} of {result.length} topics
                        </p>
                        <div className="flex items-center justify-center gap-3">
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="p-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <FaChevronLeft className="text-gray-600 text-sm" />
                            </button>
                            <span className="px-4 py-2 text-sm font-medium text-gray-700 bg-white rounded-lg border border-gray-200">
                                {currentPage} / {totalPages}
                            </span>
                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="p-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <FaChevronRight className="text-gray-600 text-sm" />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="space-y-4">
                {currentTopics.map((topic, index) => {
                    const topicIndex = startIndex + index; // Use original index for display
                    return (
                        <div key={topicIndex} className="border border-gray-200 rounded-xl overflow-hidden">
                            <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4">
                                <h4 className="font-semibold text-gray-800 font-ubuntu text-lg">
                                    {topic?.name ?? "N/A"}
                                </h4>
                            </div>

                            <div className="p-4">
                                {topic?.quizes?.some(quiz => quiz?.studentQuizData?.length > 0) ? (
                                    topic?.quizes?.map((quiz, quizIndex) => (
                                        <div key={quizIndex} className="space-y-3">
                                            {quiz?.studentQuizData?.map((quizData, dataIndex) => (
                                                <div key={dataIndex} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200">
                                                    {/* Desktop Layout */}
                                                    <div className="hidden md:flex items-center justify-between">
                                                        <div className="flex items-center gap-4">
                                                            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${quizData.result === 'pass' ? 'bg-green-100' : 'bg-red-100'
                                                                }`}>
                                                                {quizData.result === 'pass' ?
                                                                    <FaCheckCircle className="text-green-600 text-lg" /> :
                                                                    <FaTimesCircle className="text-red-600 text-lg" />
                                                                }
                                                            </div>
                                                            <div>
                                                                <p className="font-semibold text-gray-800 font-ubuntu">
                                                                    Quiz {dataIndex + 1}
                                                                </p>
                                                                <p className="text-sm text-gray-500 font-ubuntu">
                                                                    {quizData.result === 'pass' ? 'Passed' : 'Failed'}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center gap-6">
                                                            <div className="text-center">
                                                                <p className="text-sm text-gray-500 font-ubuntu">Obtained</p>
                                                                <p className="text-lg font-bold text-gray-800 font-ubuntu">{quizData?.marks ?? 'N/A'}</p>
                                                            </div>
                                                            <div className="text-center">
                                                                <p className="text-sm text-gray-500 font-ubuntu">Total</p>
                                                                <p className="text-lg font-bold text-gray-800 font-ubuntu">{quizData?.score ?? 'N/A'}</p>
                                                            </div>
                                                            <div className={`px-4 py-2 rounded-full text-sm font-semibold ${quizData.result === 'pass'
                                                                ? 'bg-green-100 text-green-800'
                                                                : 'bg-red-100 text-red-800'
                                                                }`}>
                                                                {quizData?.result === 'pass' ? 'Passed' : 'Failed'}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Mobile Layout */}
                                                    <div className="md:hidden">
                                                        <div className="flex items-center gap-3 mb-3">
                                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${quizData.result === 'pass' ? 'bg-green-100' : 'bg-red-100'
                                                                }`}>
                                                                {quizData.result === 'pass' ?
                                                                    <FaCheckCircle className="text-green-600 text-sm" /> :
                                                                    <FaTimesCircle className="text-red-600 text-sm" />
                                                                }
                                                            </div>
                                                            <div className="flex-1">
                                                                <p className="font-semibold text-gray-800 font-ubuntu text-sm">
                                                                    Quiz {dataIndex + 1}
                                                                </p>
                                                                <p className="text-xs text-gray-500 font-ubuntu">
                                                                    {quizData.result === 'pass' ? 'Passed' : 'Failed'}
                                                                </p>
                                                            </div>
                                                            <div className={`px-3 py-1 rounded-full text-xs font-semibold ${quizData.result === 'pass'
                                                                ? 'bg-green-100 text-green-800'
                                                                : 'bg-red-100 text-red-800'
                                                                }`}>
                                                                {quizData?.result === 'pass' ? 'Passed' : 'Failed'}
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center justify-between ml-11">
                                                            <div className="text-center">
                                                                <p className="text-xs text-gray-500 font-ubuntu">Obtained</p>
                                                                <p className="text-sm font-bold text-gray-800 font-ubuntu">{quizData?.marks ?? 'N/A'}</p>
                                                            </div>
                                                            <div className="text-center">
                                                                <p className="text-xs text-gray-500 font-ubuntu">Total</p>
                                                                <p className="text-sm font-bold text-gray-800 font-ubuntu">{quizData?.score ?? 'N/A'}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ))
                                ) : (
                                    <div className="flex items-center justify-center py-2 bg-gray-50 rounded-lg">
                                        <FaTrophy className="text-gray-300 text-sm mr-2" />
                                        <span className="text-gray-500 font-ubuntu text-xs">No quizzes taken yet</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    )
};

export default QuizResults;