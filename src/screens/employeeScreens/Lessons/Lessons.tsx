import { Navbar, SideDrawer } from "../../../components";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Get } from "../../../config/apiMethods";
import { displayMessage } from "../../../config";
import { useEffect, useState } from "react";
import { MdArrowBack } from "react-icons/md";
import { RouteName } from "../../../routes/RouteNames";

interface lessontypeORM {
    name: String;
    image: string;
    content: String;
    words: Number;
    pages: Number;
    lang: String;
    _id: any;
    per: String;
    status: String;
}

interface LessonProgress {
    progress: number;
    notes: string;
    lastAccessed: string | null;
}

const Lessons = () => {
    const [lessons, setLessons] = useState<lessontypeORM[]>([]);
    const [loading, setLoading] = useState(true);
    const [lessonProgress, setLessonProgress] = useState<{ [lessonId: string]: LessonProgress }>({});
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    let user = JSON.parse(localStorage.getItem("user") || "");

    // Fetch progress for each lesson
    const fetchLessonsProgress = async (lessonsList: lessontypeORM[]) => {
        const progressData: { [lessonId: string]: LessonProgress } = {};

        try {
            for (const lesson of lessonsList) {
                try {
                    const response = await Get(`/topic/lesson/progress/${lesson._id}`);
                    if (response?.success && response.data) {
                        progressData[lesson._id] = {
                            progress: response.data.progress || 0,
                            notes: response.data.notes || '',
                            lastAccessed: response.data.lastAccessed || null
                        };
                    } else {
                        progressData[lesson._id] = {
                            progress: 0,
                            notes: '',
                            lastAccessed: null
                        };
                    }
                } catch (error) {
                    console.error(`Failed to fetch progress for lesson ${lesson._id}:`, error);
                    progressData[lesson._id] = {
                        progress: 0,
                        notes: '',
                        lastAccessed: null
                    };
                }
            }
        } catch (error) {
            console.error("Error fetching lessons progress:", error);
        }

        setLessonProgress(progressData);
    };

    useEffect(() => {
        const topic = searchParams.get('topic');
        setLoading(true);

        Get(`/topic/lesson`, topic).then(async (d) => {
            if (d.success) {
                if (d.data?.length == 0) {
                    displayMessage("No lessons available", "error");
                }
                const lessonsList = d.data || [];
                setLessons(lessonsList);
                // Fetch progress for all lessons
                await fetchLessonsProgress(lessonsList);
            } else {
                displayMessage(d.message || "Failed to load lessons", "error");
            }
        }).catch((error) => {
            displayMessage("Failed to load lessons", "error");
        }).finally(() => {
            setLoading(false);
        });
    }, [searchParams]);

    const handleLessonClick = (lesson: lessontypeORM) => {
        if (user.userType !== "Parent") {
            localStorage.setItem("lesson", JSON.stringify(lesson));
            localStorage.setItem("lessonid", JSON.stringify(lesson._id));
            navigate(`${RouteName?.MATERIAL_EMPLOYEE}?content=${lesson.content}`);
        }
    };

    // Loading skeleton component
    const LoadingSkeleton = () => (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white rounded-xl shadow-md h-48 animate-pulse">
                    <div className="p-4 h-full">
                        <div className="bg-gray-200 rounded-lg h-16 mb-4"></div>
                        <div className="space-y-2">
                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );

    return (
        <div className="flex flex-row w-screen h-screen max-w-[2200px] justify-center items-center mx-auto bg-mainBg flex-wrap">
            {/* Sidebar */}
            <div className="lg:w-1/6 h-full bg-transparent transition-all delay-100 flex">
                <SideDrawer />
            </div>

            {/* Main Content */}
            <div className="flex flex-col h-screen w-screen lg:w-10/12 px-2 py-2 md:px-4 md:py-6 xl:pr-16 bg-mainBg">
                {/* Header */}
                <div className="w-full h-fit bg-mainBg mb-2 md:mb-6 flex">
                    <Navbar title="Lessons" hideSearchBar />
                </div>

                {/* Content */}
                <div className="flex-1 bg-gradient-to-br from-gray-50 to-blue-50 p-4 lg:p-6">
                    <div className="max-w-6xl mx-auto">
                        {/* Header Section */}
                        <div className="mb-8">
                            {loading ? (
                                <div className="animate-pulse">
                                    <div className="h-8 bg-gray-200 rounded-lg mb-4 w-64"></div>
                                    <div className="h-4 bg-gray-200 rounded w-96"></div>
                                </div>
                            ) : (
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                        <button
                                            onClick={() => navigate(-1)}
                                            className="group flex items-center gap-2 bg-white border-2 border-gray-200 rounded-xl px-4 py-3 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 shadow-sm hover:shadow-md"
                                        >
                                            <MdArrowBack className="text-gray-600 group-hover:text-blue-600 transition-colors duration-200" size={20} />
                                            <span className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors duration-200">Back</span>
                                        </button>
                                        <div>
                                            <h1 className="text-3xl font-bold text-gray-900">Available Lessons</h1>
                                            <p className="text-gray-600 mt-2">Select a lesson to begin your learning journey</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-3 text-sm text-gray-600">
                                        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-semibold">
                                            {lessons.length} Lesson{lessons.length !== 1 ? 's' : ''}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Lessons Content */}
                        <div className="w-full">
                            {loading ? (
                                <LoadingSkeleton />
                            ) : lessons.length === 0 ? (
                                <div className="text-center py-20">
                                    <div className="max-w-md mx-auto">
                                        <div className="bg-gray-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                                            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                            </svg>
                                        </div>
                                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No lessons available</h3>
                                        <p className="text-gray-600">There are no lessons available in this topic yet.</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                    {lessons.map((lesson, index) => {
                                        const progressData = lessonProgress[lesson._id];
                                        return (
                                            <div
                                                key={lesson._id}
                                                onClick={() => handleLessonClick(lesson)}
                                                className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] cursor-pointer border border-gray-100 overflow-hidden"
                                            >
                                                {/* Lesson Header */}
                                                <div className="bg-gradient-to-r from-sky-500 to-indigo-600 p-4 text-white">
                                                    <div className="flex items-center space-x-3">
                                                        <div className="flex-shrink-0 w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-xl font-bold">
                                                            {String(lesson.name).substring(0, 2).toUpperCase()}
                                                        </div>
                                                        <div className="flex-1">
                                                            <h3 className="font-bold text-base sm:text-lg truncate">
                                                                {String(lesson.name)}
                                                            </h3>
                                                            <div className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-white/20 text-white">
                                                                Lesson {index + 1}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Lesson Content */}
                                                <div className="p-4 bg-white">
                                                    {/* Metadata */}
                                                    <div className="grid grid-cols-3 gap-3 mb-4">
                                                        <div className="text-center">
                                                            <div className="text-lg font-bold text-gray-700">{String(lesson.words || 0)}</div>
                                                            <div className="text-xs text-gray-500">Words</div>
                                                        </div>
                                                        <div className="text-center">
                                                            <div className="text-lg font-bold text-gray-700">{String(lesson.pages || 0)}</div>
                                                            <div className="text-xs text-gray-500">Pages</div>
                                                        </div>
                                                        <div className="text-center">
                                                            <div className="text-lg font-bold text-gray-700">{String(lesson.lang || 'N/A')}</div>
                                                            <div className="text-xs text-gray-500">Language</div>
                                                        </div>
                                                    </div>

                                                    {/* Progress Bar for Employee Progress */}
                                                    <div className="mb-4">
                                                        <div className="flex justify-between items-center mb-2">
                                                            <span className="text-xs text-gray-600 font-medium">Progress</span>
                                                            <span className="text-xs text-gray-600 font-semibold">
                                                                {progressData?.progress || 0}%
                                                            </span>
                                                        </div>
                                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                                            <div
                                                                className="bg-gradient-to-r from-sky-500 to-indigo-600 h-2 rounded-full transition-all duration-300"
                                                                style={{ width: `${progressData?.progress || 0}%` }}
                                                            ></div>
                                                        </div>
                                                        {progressData?.lastAccessed && (
                                                            <p className="text-xs text-gray-400 mt-1">
                                                                Last accessed: {new Date(progressData.lastAccessed).toLocaleDateString()}
                                                            </p>
                                                        )}
                                                    </div>

                                                    {/* Status Badge */}
                                                    {user.userType === 'Student' && lesson.status && (
                                                        <div className="mb-4">
                                                            <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${String(lesson.status).includes('Complete')
                                                                ? 'bg-green-500 text-white'
                                                                : String(lesson.status).includes('In progress')
                                                                    ? 'bg-yellow-500 text-white'
                                                                    : 'bg-blue-400 text-white'
                                                                }`}>
                                                                {String(lesson.status)}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Start Lesson Button */}
                                                    <div className="flex items-center justify-center">
                                                        <div className="w-full bg-gradient-to-r from-sky-500 to-indigo-600 text-white py-2 px-4 rounded-lg font-medium hover:from-sky-600 hover:to-indigo-700 transition-all duration-200 text-center">
                                                            📖 {
                                                                progressData?.progress && progressData.progress > 0
                                                                    ? progressData.progress === 100 ? 'Review Lesson' : 'Continue Lesson'
                                                                    : 'Start Lesson'
                                                            }
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
};

export default Lessons;
