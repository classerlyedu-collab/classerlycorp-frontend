import { TextEditor, TopicInfo, Navbar, SideDrawer } from "../../../components";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { MdArrowBack, MdAccessTime, MdLanguage, MdDescription, MdBook, MdNote } from "react-icons/md";
import { Get, Put } from "../../../config/apiMethods";

/**
 * Material Learning Component
 * 
 * Progress Tracking:
 * - Progress is stored in lesson model via API:
 *   - Endpoint: PUT /topic/lesson/progress/{lessonId}
 *   - Fields: progress (0-100%), notes (text), lastAccessed (timestamp)
 * - Button controls allow users to manually set progress (25%, 50%, 75%, 100%)
 * - Data persists per employee per lesson in database
 * 
 * Notes:
 * - Notes are saved to lesson model via API:
 *   - Same endpoint: PUT /topic/lesson/progress/{lessonId}
 *   - Modal interface with save/cancel functionality
 * 
 * API Integration:
 * - Load progress: GET /topic/lesson/progress/{lessonId}
 * - Save progress: PUT /topic/lesson/progress/{lessonId} { progress, notes }
 */
const Material = () => {
    const [searchParams] = useSearchParams();
    const [lesson, setLesson] = useState<any>({});
    const [progress, setProgress] = useState(0);
    const [notes, setNotes] = useState("");
    const [showNotes, setShowNotes] = useState(false);
    const [timeSpent, setTimeSpent] = useState(0);
    const [scrollPosition, setScrollPosition] = useState(0);
    const [maxScrollPosition, setMaxScrollPosition] = useState(0);
    const navigate = useNavigate();
    const content = searchParams.get('content');

    useEffect(() => {
        const lessonData = localStorage.getItem("lesson");

        if (lessonData) {
            try {
                const parsedLesson = JSON.parse(lessonData);
                setLesson(parsedLesson);

                // Load progress and notes from backend when lesson is set
                if (parsedLesson?._id) {
                    loadLessonProgress(parsedLesson._id);
                }
            } catch (parseErr) {
                console.error("Failed to parse lesson data from localStorage:", parseErr);
            }
        }
    }, []);

    const loadLessonProgress = async (lessonId: string) => {
        try {
            const response = await Get(`/topic/lesson/progress/${lessonId}`);

            if (response?.success) {
                const progressData = response.data || {};
                const currentProgress = progressData.progress || 0;
                const currentNotes = progressData.notes || "";

                setProgress(currentProgress);
                setNotes(currentNotes);
            } else {
                setProgress(0);
                setNotes("");
            }
        } catch (error) {
            console.error("Error loading lesson progress:", error);
            // Fallback to defaults
            setProgress(0);
            setNotes("");
        }
    };

    // Auto-save progress to backend (only when progress increases); underlying logic assures it is called only if higher
    const saveProgressToDatabase = async (newProgress: number, newNotes?: string) => {
        if (!lesson?._id) {
            console.warn("Cannot save: lesson ID not available");
            return;
        }

        try {
            const requestPayload = {
                progress: Math.round(newProgress),
                notes: newNotes !== undefined ? newNotes : notes || ""
            };

            const response = await Put(`/topic/lesson/progress/${lesson._id}`, requestPayload);
            return response;
        } catch (error) {
            console.error("Error auto-saving progress:", error);
        }
    };

    // Calculate progress based on time and scroll behavior
    const calculateProgress = () => {
        // Scroll-based progress (70% weight)
        const scrollRatio = maxScrollPosition > 0 ? Math.min(scrollPosition / maxScrollPosition, 1) : 0;
        const scrollProgress = scrollRatio * 100;

        // Time-based progress (30% weight) - up to 10 minutes
        const timeProgress = Math.min((timeSpent / 600) * 30, 30); // Cap time contribution at 30%

        // Combine both factors
        const combinedProgress = scrollProgress * 0.7 + timeProgress;

        // Cap at 100% and ensure confident reading (min 10% for engaged users)
        // Progress calculations will be validated elsewhere to never decrease
        return Math.max(Math.min(combinedProgress, 100), timeSpent > 300 ? 10 : 0); // 5min = 10% min
    };

    // Track activity and update progress (only upwards - never decrease)
    useEffect(() => {
        const updateProgress = async () => {
            const newProgress = calculateProgress();
            // Only increase progress if it's meaningfully higher (progress only goes up)
            if (newProgress > progress && newProgress >= progress + 2) { // 2 is measurable threshold
                setProgress(newProgress);
                await saveProgressToDatabase(Math.round(newProgress));
            }
        };

        // Update progress frequently for better tracking
        const progressInterval = setInterval(updateProgress, 3000); // Every 3 seconds  
        return () => clearInterval(progressInterval);
    }, [scrollPosition, maxScrollPosition, timeSpent, progress]);

    // Monitor time spent (active engagement tracking)
    useEffect(() => {
        let timeInterval: NodeJS.Timeout | null = null;
        let idleTimeout: NodeJS.Timeout | null = null;

        const handleUserActivity = () => {
            // Reset idle timeout  
            if (idleTimeout) clearTimeout(idleTimeout);

            // Reset inactivity timer
            idleTimeout = setTimeout(() => {
                // User inactive for 30+ seconds - pause timer
                if (timeInterval) {
                    clearInterval(timeInterval);
                    timeInterval = null;
                }
            }, 30000);

            // Start / resume timer if it was stopped
            if (!timeInterval) {
                timeInterval = setInterval(() => {
                    setTimeSpent(prev => prev + 1);
                }, 1000);
            }
        };

        // List event listeners for user activity 
        const activityEvents = ['mousemove', 'mousedown', 'keypress', 'keydown', 'scroll', 'touchstart'];

        const activityHandler = () => handleUserActivity();
        activityEvents.forEach(event => window.addEventListener(event, activityHandler));

        // Start timer immediately 
        handleUserActivity();

        // Clean up on unmount
        return () => {
            if (timeInterval) clearInterval(timeInterval);
            if (idleTimeout) clearTimeout(idleTimeout);
            activityEvents.forEach(event => window.removeEventListener(event, activityHandler));
        };
    }, []);

    // Monitor scroll position for automatic progress tracking  
    useEffect(() => {
        let scrollTimeout: NodeJS.Timeout;

        const handleScroll = () => {
            // Debounce scroll events
            if (scrollTimeout) clearTimeout(scrollTimeout);

            scrollTimeout = setTimeout(() => {
                const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                setScrollPosition(scrollTop);

                // Increase max scroll if we scroll past current max
                const documentHeight = document.documentElement.scrollHeight;
                if (documentHeight > maxScrollPosition) {
                    setMaxScrollPosition(documentHeight);
                }
            }, 100);
        };

        const handleDocumentVisibility = () => {
            // Update scroll info when tab becomes visible
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            setScrollPosition(scrollTop);
        };

        // Monitor scroll events globally 
        window.addEventListener('scroll', handleScroll, { passive: true });
        document.addEventListener('visibilitychange', handleDocumentVisibility);

        // Periodic scroll position confirmation (as fallback)
        const scrollInterval = setInterval(() => {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            setScrollPosition(scrollTop);

            const documentHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            if (documentHeight > 0 && documentHeight !== maxScrollPosition) {
                setMaxScrollPosition(Math.max(documentHeight, maxScrollPosition));
            }
        }, 5000);

        return () => {
            window.removeEventListener('scroll', handleScroll);
            document.removeEventListener('visibilitychange', handleDocumentVisibility);
            clearTimeout(scrollTimeout);
            clearInterval(scrollInterval);
        };
    }, []);

    const handleTakeNotes = () => {
        setShowNotes(!showNotes);
    };

    const handleSaveNotes = async () => {
        if (!lesson?._id) {
            console.error("Cannot save notes: Lesson ID not found", lesson);
            return;
        }

        try {
            const payload = {
                progress: Math.round(progress),
                notes: notes || ""
            };

            const response = await Put(`/topic/lesson/progress/${lesson._id}`, payload);

            if (response?.success !== false) {
                setShowNotes(false);
            }
        } catch (error) {
            console.error("Error saving notes:", error);
        }
    };

    // Manual progress override (Mark Complete functionality) - Only allows upward progress
    const handleProgressUpdate = async (percentage: number) => {
        if (!lesson?._id) {
            console.error("Cannot update progress: lesson ID not available");
            return;
        }

        // Only allow progress to increase, never decrease
        if (percentage < progress) {
            return;
        }

        try {
            // Update frontend immediately for responsive UI
            setProgress(percentage);

            // Send to database only if higher than current
            if (percentage > progress) {
                const response = await Put(`/topic/lesson/progress/${lesson._id}`, {
                    progress: percentage,
                    notes: notes || ""
                });

                // Progress marked as completed in database
            }
        } catch (error) {
            console.error("Error saving progress:", error);
            // Revert frontend if database save failed
            const currentProgress = await getCurrentProgressFromDB();
            if (currentProgress !== null) {
                setProgress(currentProgress);
            }
        }
    };

    // Helper function to get current progress from database 
    const getCurrentProgressFromDB = async () => {
        if (!lesson?._id) return null;

        try {
            const response = await Get(`/topic/lesson/progress/${lesson._id}`);
            return response?.success ? response.data.progress : null;
        } catch {
            return null;
        }
    };

    return (
        <div className="flex flex-row w-screen h-screen max-w-[2200px] justify-center items-center mx-auto bg-gray-50 flex-wrap">
            {/* Sidebar */}
            <div className="lg:w-1/6 h-full bg-transparent transition-all delay-100 flex">
                <SideDrawer />
            </div>

            {/* Main Content */}
            <div className="flex flex-col h-screen w-screen lg:w-10/12 px-2 py-2 md:px-4 md:py-6 xl:pr-16 bg-gray-50">
                {/* Header */}
                <div className="w-full h-fit bg-transparent mb-4 md:mb-6 flex items-center">
                    <button
                        onClick={() => navigate(-1)}
                        className="mr-4 flex items-center gap-2 bg-white border-2 border-gray-200 rounded-xl px-4 py-3 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 shadow-sm hover:shadow-md"
                    >
                        <MdArrowBack className="text-gray-600 hover:text-blue-600 transition-colors duration-200" size={20} />
                        <span className="font-semibold text-gray-800 hover:text-blue-600 transition-colors duration-200">Back</span>
                    </button>
                    <Navbar title="Learning Material" hideSearchBar />
                </div>

                {/* Content */}
                <div className="flex-1 bg-transparent">
                    <div className="max-w-7xl mx-auto h-full flex flex-col">
                        {/* Lesson Info Panel - Top */}
                        <div className="mb-6">
                            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden w-full">
                                {/* Header Section */}
                                <div className="bg-gradient-to-r from-slate-700 to-slate-800 p-6 text-white">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                                                <MdBook className="text-white text-xl" />
                                            </div>
                                            <div>
                                                <h1 className="text-xl font-bold text-white">
                                                    {lesson?.name || "Learning Material"}
                                                </h1>
                                                <p className="text-slate-300 text-sm">
                                                    Course Content
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Content Section */}
                                <div className="p-6">
                                    <div className="space-y-6">
                                        {/* Lesson Metadata */}
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                            <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                                <MdDescription className="text-blue-600" size={20} />
                                                <div>
                                                    <p className="text-sm text-gray-600">Words</p>
                                                    <p className="text-lg font-semibold text-blue-700">
                                                        {lesson?.words || "N/A"}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg border border-green-200">
                                                <MdLanguage className="text-green-600" size={20} />
                                                <div>
                                                    <p className="text-sm text-gray-600">Language</p>
                                                    <p className="text-lg font-semibold text-green-700">
                                                        {lesson?.lang || "N/A"}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                                                <MdAccessTime className="text-purple-600" size={20} />
                                                <div>
                                                    <p className="text-sm text-gray-600">Pages</p>
                                                    <p className="text-lg font-semibold text-purple-700">
                                                        {lesson?.pages || "N/A"}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex flex-col sm:flex-row gap-3">
                                            <button
                                                onClick={handleTakeNotes}
                                                className="border-2 border-gray-200 text-gray-600 py-3 px-4 rounded-lg font-medium flex items-center justify-center space-x-2 hover:bg-gray-50 transition-colors cursor-pointer w-full sm:flex-1"
                                            >
                                                <MdNote className="text-sm" />
                                                <span>{showNotes ? 'Hide Notes' : 'Take Notes'}</span>
                                            </button>

                                            {/* Mark Complete Button - appears when progress > 50% OR time > 5 minutes */}
                                            {/* Condition: (progress > 50% OR timeSpent >= 5min) AND progress < 100% */}
                                            {((progress > 50) || (timeSpent >= 300)) && progress < 100 && (
                                                <button
                                                    onClick={() => handleProgressUpdate(100)}
                                                    className="bg-green-600 text-white py-3 px-4 rounded-lg font-medium flex items-center justify-center space-x-2 hover:bg-green-700 transition-colors cursor-pointer w-full sm:flex-1"
                                                    title="Click to mark lesson as 100% complete"
                                                >
                                                    <span className="text-sm">✓</span>
                                                    <span>Mark as Complete</span>
                                                </button>
                                            )}
                                        </div>

                                        {/* Automatic Progress Section */}
                                        <div className="border-t border-gray-200 pt-4">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm font-medium text-gray-700">Auto Progress</span>
                                                <span className="text-sm text-gray-500">{Math.round(progress)}%</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div
                                                    className="bg-gradient-to-r from-blue-600 to-indigo-600 h-2 rounded-full transition-all duration-1000"
                                                    style={{ width: `${Math.min(progress, 100)}%` }}
                                                ></div>
                                            </div>
                                            <p className="text-xs text-gray-500 mt-2">
                                                Tracked automatically • Time: {Math.floor(timeSpent / 60)}min • Scroll progress: {maxScrollPosition > 0 ? Math.round((scrollPosition / maxScrollPosition) * 100) : 0}%
                                            </p>
                                            <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                                                <span>📖 Scrolling • ⏱️ Time-based • 🔄 Every 3s auto-save</span>
                                                <span className="text-green-600">Auto-saved ✓</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Document Viewer - Bottom */}
                        <div className="flex-1" style={{ minHeight: '85vh' }}>
                            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden h-full flex flex-col">
                                {/* Document Header */}
                                <div className="bg-gradient-to-r from-slate-800 to-gray-800 p-4 text-white flex-shrink-0">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                                                <span className="text-lg">📄</span>
                                            </div>
                                            <div>
                                                <h3 className="font-semibold">Course Material</h3>
                                                <p className="text-slate-300 text-xs">
                                                    Interactive Document Viewer
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <div className="w-6 h-6 bg-white/20 rounded flex items-center justify-center text-xs">⛔</div>
                                            <div className="w-6 h-6 bg-white/20 rounded flex items-center justify-center text-xs">⃞</div>
                                            <div className="w-6 h-6 bg-white/20 rounded flex items-center justify-center text-xs">✕</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Document Content */}
                                <div className="flex-1" style={{ minHeight: '750px' }}>
                                    <TextEditor />
                                </div>
                            </div>
                        </div>

                        {/* Notes Modal */}
                        {showNotes && (
                            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                                <div className="bg-white rounded-xl shadow-lg border border-gray-200 w-full max-w-2xl mx-4 h-96 flex flex-col">
                                    {/* Notes Header */}
                                    <div className="bg-gradient-to-r from-slate-700 to-slate-800 p-4 text-white rounded-t-xl">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-3">
                                                <MdNote className="text-white text-xl" />
                                                <h3 className="font-semibold">Take Notes</h3>
                                            </div>
                                            <button
                                                onClick={handleTakeNotes}
                                                className="text-gray-300 hover:text-white transition-colors"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    </div>

                                    {/* Notes Content */}
                                    <div className="flex-1 p-4">
                                        <textarea
                                            value={notes}
                                            onChange={(e) => setNotes(e.target.value)}
                                            placeholder="Write your notes about this lesson here..."
                                            className="w-full h-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                        />
                                    </div>

                                    {/* Notes Footer */}
                                    <div className="p-4 border-t border-gray-200 flex justify-end space-x-3">
                                        <button
                                            onClick={handleTakeNotes}
                                            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                handleSaveNotes();
                                            }}
                                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                        >
                                            Save Notes
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Material;
