import { useState } from "react";
import { Progress } from "rsuite";
import { ChildResultType } from "../../../../types/parent/ChildOverview";
import { getRandomColor } from "../../../../utils/randomColorGenerator";
import { FaChevronDown, FaChevronRight, FaBookOpen, FaClock, FaCheckCircle, FaChevronLeft, FaChevronRight as FaChevronRightIcon } from "react-icons/fa";

interface PropsTypes {
    result: ChildResultType[] | null;
}

const LessonStatus = ({ result }: PropsTypes) => {
    const [openTopicIndex, setOpenTopicIndex] = useState<number | null>(null);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const topicsPerPage = 5; // Show 5 topics per page

    const handleToggleLessons = (index: number) => {
        // Toggle the clicked topic, collapse others
        setOpenTopicIndex((prevIndex) => (prevIndex === index ? null : index));
    };

    // Pagination logic
    const totalPages = result ? Math.ceil(result.length / topicsPerPage) : 0;
    const startIndex = (currentPage - 1) * topicsPerPage;
    const endIndex = startIndex + topicsPerPage;
    const currentTopics = result ? result.slice(startIndex, endIndex) : [];

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        setOpenTopicIndex(null); // Close any open topics when changing pages
    };

    return (
        <div className="w-full">

            {result?.length === 0 && (
                <div className="text-center py-8">
                    <FaBookOpen className="text-gray-300 text-4xl mx-auto mb-3" />
                    <p className="text-gray-500 font-ubuntu">No topics available yet!</p>
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
                                <FaChevronRightIcon className="text-gray-600" />
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
                                <FaChevronRightIcon className="text-gray-600 text-sm" />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="space-y-4">
                {currentTopics.map((topic, index) => {
                    const topicIndex = startIndex + index; // Use original index for display
                    const progress = topic.lessons && topic.lessons.length > 0
                        ? Math.round((topic.lessons.filter(lesson => lesson?.read === true).length / topic.lessons.length) * 100)
                        : 0;

                    const completedLessons = topic.lessons?.filter(lesson => lesson?.read === true).length || 0;
                    const totalLessons = topic.lessons?.length || 0;

                    return (
                        <div key={topicIndex} className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow duration-200">
                            {/* Topic Header */}
                            <div
                                className="p-4 cursor-pointer"
                                onClick={() => handleToggleLessons(topicIndex)}
                            >
                                {/* Desktop Layout */}
                                <div className="hidden md:flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                                            {topicIndex + 1}
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-gray-800 font-ubuntu text-lg">
                                                {topic?.name ?? "N/A"}
                                            </h4>
                                            <p className="text-sm text-gray-500 font-ubuntu">
                                                {completedLessons} of {totalLessons} lessons completed
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <div className="w-16 h-16 relative">
                                            <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
                                                <path
                                                    className="text-gray-200"
                                                    stroke="currentColor"
                                                    strokeWidth="3"
                                                    fill="none"
                                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                                />
                                                <path
                                                    className="text-blue-500"
                                                    stroke="currentColor"
                                                    strokeWidth="3"
                                                    fill="none"
                                                    strokeDasharray={`${progress}, 100`}
                                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                                />
                                            </svg>
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <span className="text-xs font-bold text-gray-800 font-ubuntu">{progress}%</span>
                                            </div>
                                        </div>
                                        <div className="p-2 bg-gray-100 rounded-full">
                                            {openTopicIndex === topicIndex ?
                                                <FaChevronDown className="text-gray-600" /> :
                                                <FaChevronRight className="text-gray-600" />
                                            }
                                        </div>
                                    </div>
                                </div>

                                {/* Mobile Layout */}
                                <div className="md:hidden">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                                {topicIndex + 1}
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-semibold text-gray-800 font-ubuntu text-base">
                                                    {topic?.name ?? "N/A"}
                                                </h4>
                                                <p className="text-xs text-gray-500 font-ubuntu">
                                                    {completedLessons} of {totalLessons} lessons completed
                                                </p>
                                            </div>
                                        </div>
                                        <div className="w-12 h-12 relative">
                                            <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 36 36">
                                                <path
                                                    className="text-gray-200"
                                                    stroke="currentColor"
                                                    strokeWidth="3"
                                                    fill="none"
                                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                                />
                                                <path
                                                    className="text-blue-500"
                                                    stroke="currentColor"
                                                    strokeWidth="3"
                                                    fill="none"
                                                    strokeDasharray={`${progress}, 100`}
                                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                                />
                                            </svg>
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <span className="text-xs font-bold text-gray-800 font-ubuntu">{progress}%</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex justify-center">
                                        <div className="p-2 bg-gray-100 rounded-full">
                                            <FaChevronDown className={`text-gray-600 transition-transform duration-200 ${openTopicIndex === topicIndex ? 'rotate-180' : ''}`} />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Lessons List */}
                            {openTopicIndex === topicIndex && (
                                <div className="border-t border-gray-200 bg-gray-50">
                                    <div className="p-4">
                                        <h5 className="font-semibold text-gray-700 font-ubuntu mb-3">Lessons</h5>
                                        <div className="space-y-3">
                                            {topic?.lessons?.map((lesson, lessonIndex) => (
                                                <div key={lessonIndex} className="bg-white rounded-lg p-3 shadow-sm">
                                                    {/* Desktop Layout */}
                                                    <div className="hidden md:flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${lesson.read ? 'bg-green-100' : 'bg-gray-100'
                                                                }`}>
                                                                {lesson.read ?
                                                                    <FaCheckCircle className="text-green-600 text-sm" /> :
                                                                    <span className="text-gray-500 text-sm font-bold">{lessonIndex + 1}</span>
                                                                }
                                                            </div>
                                                            <div>
                                                                <p className="font-medium text-gray-800 font-ubuntu">
                                                                    {lesson?.name ?? "N/A"}
                                                                </p>
                                                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                                                    <FaClock className="text-xs" />
                                                                    <span>{lesson.read ? "20" : "0"} minutes spent</span>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center gap-3">
                                                            <div className="w-20">
                                                                <Progress.Line
                                                                    strokeColor={lesson.read ? "#10B981" : "#E5E7EB"}
                                                                    percent={lesson.read ? 100 : 0}
                                                                    showInfo={false}
                                                                />
                                                            </div>
                                                            <span className={`text-sm font-medium ${lesson.read ? 'text-green-600' : 'text-gray-400'
                                                                }`}>
                                                                {lesson.read ? 'Completed' : 'Pending'}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* Mobile Layout */}
                                                    <div className="md:hidden">
                                                        <div className="flex items-center gap-3 mb-2">
                                                            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${lesson.read ? 'bg-green-100' : 'bg-gray-100'
                                                                }`}>
                                                                {lesson.read ?
                                                                    <FaCheckCircle className="text-green-600 text-xs" /> :
                                                                    <span className="text-gray-500 text-xs font-bold">{lessonIndex + 1}</span>
                                                                }
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="font-medium text-gray-800 font-ubuntu text-sm truncate">
                                                                    {lesson?.name ?? "N/A"}
                                                                </p>
                                                            </div>
                                                            <span className={`text-xs font-medium px-2 py-1 rounded-full ${lesson.read ? 'text-green-600 bg-green-50' : 'text-gray-400 bg-gray-50'
                                                                }`}>
                                                                {lesson.read ? 'Completed' : 'Pending'}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-2 text-xs text-gray-500 ml-9">
                                                            <FaClock className="text-xs" />
                                                            <span>{lesson.read ? "20" : "0"} minutes spent</span>
                                                        </div>
                                                        <div className="mt-2 ml-9">
                                                            <Progress.Line
                                                                strokeColor={lesson.read ? "#10B981" : "#E5E7EB"}
                                                                percent={lesson.read ? 100 : 0}
                                                                showInfo={false}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default LessonStatus;