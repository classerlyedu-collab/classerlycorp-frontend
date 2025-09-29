import { useEffect, useState } from "react";
import { Get } from "../../../../config/apiMethods";
import { FaStar, FaUser, FaComment, FaCalendarAlt, FaHeart, FaQuoteLeft } from "react-icons/fa";

const TeacherRemarks = ({ childernValue }: any) => {
    const [remarks, setRemarks] = useState<any[]>([]);
    const [feedback, setFeedback] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Get current logged in user (parent)
        const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
        console.log("Current user:", currentUser);
        console.log("Child value:", childernValue);

        const fetchData = async () => {
            try {
                // Fetch teacher remarks
                const remarksResponse = await Get(`/parent/feedback/${childernValue}`);
                console.log("Remarks response:", remarksResponse);
                if (remarksResponse.success) {
                    setRemarks(remarksResponse.data);
                }

                // Fetch teacher feedback with parent ID - try different user ID paths
                const parentId = currentUser.profile?._id || currentUser._id || currentUser.id;
                console.log("Parent ID:", parentId);

                if (parentId) {
                    const feedbackResponse = await Get(`/teacher/parent-feedbacks/${childernValue}/${parentId}`);
                    console.log("Feedback response:", feedbackResponse);
                    if (feedbackResponse.success) {
                        setFeedback(feedbackResponse.data);
                    }
                }
            } catch (err) {
                console.error("Failed to fetch data:", err);
            } finally {
                setLoading(false);
            }
        };

        if (childernValue) {
            fetchData();
        }
    }, [childernValue]);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="w-full flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    const allRemarks = [...remarks, ...feedback];

    return (
        <div className="w-full space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-r from-sky-500 to-indigo-600 rounded-full">
                    <FaComment className="text-white text-lg" />
                </div>
                <h1 className="text-2xl font-bold text-gray-800 font-ubuntu">Teacher Remarks & Feedback</h1>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl p-3 md:p-4 shadow-lg">
                    <div className="flex items-center gap-2 md:gap-3">
                        <div className="p-2 bg-blue-100 rounded-full">
                            <FaUser className="text-blue-600 text-sm md:text-base" />
                        </div>
                        <div>
                            <p className="text-xs md:text-sm text-gray-500 font-ubuntu">Total Remarks</p>
                            <p className="text-lg md:text-xl font-bold text-gray-800 font-ubuntu">{allRemarks.length}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl p-3 md:p-4 shadow-lg">
                    <div className="flex items-center gap-2 md:gap-3">
                        <div className="p-2 bg-green-100 rounded-full">
                            <FaStar className="text-green-600 text-sm md:text-base" />
                        </div>
                        <div>
                            <p className="text-xs md:text-sm text-gray-500 font-ubuntu">Average Rating</p>
                            <p className="text-lg md:text-xl font-bold text-gray-800 font-ubuntu">
                                {allRemarks.length > 0
                                    ? (allRemarks.reduce((sum, item) => sum + (item.stars || item.star || 0), 0) / allRemarks.length).toFixed(1)
                                    : '0.0'
                                }
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl p-3 md:p-4 shadow-lg col-span-2 md:col-span-1">
                    <div className="flex items-center gap-2 md:gap-3">
                        <div className="p-2 bg-purple-100 rounded-full">
                            <FaHeart className="text-purple-600 text-sm md:text-base" />
                        </div>
                        <div>
                            <p className="text-xs md:text-sm text-gray-500 font-ubuntu">Recent Activity</p>
                            <p className="text-lg md:text-xl font-bold text-gray-800 font-ubuntu">
                                {allRemarks.filter(item => {
                                    const date = new Date(item.createdAt);
                                    const weekAgo = new Date();
                                    weekAgo.setDate(weekAgo.getDate() - 7);
                                    return date > weekAgo;
                                }).length}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Remarks List */}
            {allRemarks.length > 0 ? (
                <div className="space-y-4">
                    {allRemarks
                        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                        .map((item: any, index: number) => (
                            <div key={index} className="bg-white rounded-2xl p-4 md:p-6 shadow-lg hover:shadow-xl transition-shadow duration-200">
                                {/* Desktop Layout */}
                                <div className="hidden md:flex items-start gap-4">
                                    {/* Teacher Avatar */}
                                    <div className="flex-shrink-0">
                                        <img
                                            src={item?.from?.auth?.image || item?.teacherId?.auth?.image || "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQOv_u8GVtyFUAmcyf-CYkzQLm1F8eLCAZpEw&s"}
                                            className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                                            alt="teacher"
                                        />
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-3">
                                            <div>
                                                <h3 className="font-semibold text-gray-800 font-ubuntu text-lg">
                                                    {item?.from?.auth?.userName || item?.teacherId?.auth?.userName || "Teacher"}
                                                </h3>
                                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                                    <FaCalendarAlt className="text-xs" />
                                                    <span className="font-ubuntu">{formatDate(item.createdAt)}</span>
                                                </div>
                                            </div>

                                            {/* Rating */}
                                            {(item.stars || item.star) && (
                                                <div className="flex items-center gap-1">
                                                    {Array.from({ length: 5 }).map((_, starIndex) => (
                                                        <FaStar
                                                            key={starIndex}
                                                            className={`h-4 w-4 ${starIndex < (item.stars || item.star || 0)
                                                                ? 'text-yellow-400'
                                                                : 'text-gray-300'
                                                                }`}
                                                        />
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {/* Comment */}
                                        <div className="bg-gray-50 rounded-lg p-4 relative">
                                            <FaQuoteLeft className="absolute top-2 left-2 text-gray-300 text-lg" />
                                            <p className="font-ubuntu text-gray-700 pl-6 italic">
                                                "{item.comment || item.feedback}"
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Mobile Layout */}
                                <div className="md:hidden">
                                    {/* Top Row - Avatar and Info */}
                                    <div className="flex items-start gap-3 mb-3">
                                        <img
                                            src={item?.from?.auth?.image || item?.teacherId?.auth?.image || "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQOv_u8GVtyFUAmcyf-CYkzQLm1F8eLCAZpEw&s"}
                                            className="w-12 h-12 rounded-full object-cover border-2 border-gray-200 flex-shrink-0"
                                            alt="teacher"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold text-gray-800 font-ubuntu text-base truncate">
                                                {item?.from?.auth?.userName || item?.teacherId?.auth?.userName || "Teacher"}
                                            </h3>
                                            <div className="flex items-center gap-1 text-xs text-gray-500">
                                                <FaCalendarAlt className="text-xs" />
                                                <span className="font-ubuntu truncate">{formatDate(item.createdAt)}</span>
                                            </div>
                                        </div>
                                        {/* Rating */}
                                        {(item.stars || item.star) && (
                                            <div className="flex items-center gap-1 flex-shrink-0">
                                                {Array.from({ length: 5 }).map((_, starIndex) => (
                                                    <FaStar
                                                        key={starIndex}
                                                        className={`h-3 w-3 ${starIndex < (item.stars || item.star || 0)
                                                            ? 'text-yellow-400'
                                                            : 'text-gray-300'
                                                            }`}
                                                    />
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Comment */}
                                    <div className="bg-gray-50 rounded-lg p-3 relative">
                                        <FaQuoteLeft className="absolute top-1 left-1 text-gray-300 text-sm" />
                                        <p className="font-ubuntu text-gray-700 pl-4 italic text-sm leading-relaxed">
                                            "{item.comment || item.feedback}"
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                </div>
            ) : (
                <div className="text-center py-12">
                    <FaComment className="text-gray-300 text-6xl mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-500 font-ubuntu mb-2">No Remarks Yet</h3>
                    <p className="text-gray-400 font-ubuntu">Teacher remarks and feedback will appear here once they are provided.</p>
                </div>
            )}
        </div>
    );
};

export default TeacherRemarks;