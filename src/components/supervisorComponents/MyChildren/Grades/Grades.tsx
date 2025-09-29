import { buildStyles, CircularProgressbarWithChildren } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { getRandomColor } from "../../../../utils/randomColorGenerator";
import { useEffect, useState } from "react";
import { displayMessage } from "../../../../config";
import { Get } from "../../../../config/apiMethods";
import { RouteName } from "../../../../routes/RouteNames";
import { useNavigate } from "react-router-dom";
import { FaBookOpen, FaChartBar, FaArrowRight, FaGraduationCap, FaTrophy, FaClock } from "react-icons/fa";

const Grades = ({ mystd }: any) => {
    const navigate = useNavigate();
    const [subjects, setSubjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (mystd?._id) {
            Get(`/getMyChildsubjectdata/${mystd._id}`)
                .then((d) => {
                    if (d.success) {
                        setSubjects(d.data);
                    }
                })
                .catch((error) => {
                    console.error("Error fetching subjects:", error);
                })
                .finally(() => {
                    setLoading(false);
                });
        }
    }, [mystd]);

    const handleSubjectClick = (id: string) => {
        Get(`/mychildbysubject/${mystd._id}?subject=${id}`)
            .then((d) => {
                if (d?.success) {
                    localStorage.setItem('childResult', JSON.stringify(d.data));
                    localStorage.setItem('resultHeaderTitle', `${mystd?.auth?.fullName ?? 'Child'} Result`);
                    navigate(RouteName.EMPLOYEE_RESULT_SCREEN);
                } else {
                    displayMessage('Something went wrong! Please try again later.');
                }
            })
            .catch((e) => {
                displayMessage(e.message);
            });
    };

    const getSubjectProgress = (subject: any) => {
        // Use the actual progress field from the subject data
        return subject.progress || 0;
    };

    const getSubjectStats = (subject: any) => {
        // Use the actual fields from the subject data
        const totalLessons = subject.totalLessons || 0;
        const completedLessons = subject.completedLessons || 0;

        // Calculate study time based on completed lessons
        // Since we don't have individual lesson time data, estimate based on completed lessons
        const estimatedTimePerLesson = 20; // 20 minutes per lesson estimate
        const studyTime = completedLessons * estimatedTimePerLesson;

        return { totalLessons, completedLessons, studyTime };
    };

    const formatStudyTime = (minutes: number) => {
        if (minutes < 60) {
            return `${minutes}m`;
        } else {
            const hours = Math.floor(minutes / 60);
            const remainingMinutes = minutes % 60;
            return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
        }
    };


    if (loading) {
        return (
            <div className="w-full flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="w-full space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 rounded-full">
                    <FaGraduationCap className="text-blue-600 text-lg" />
                </div>
                <h1 className="text-2xl font-bold text-gray-800 font-ubuntu">Courses & Subjects</h1>
            </div>


            {subjects && subjects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-6">
                    {subjects.map((subject: any, index: number) => {
                        const progress = getSubjectProgress(subject);
                        const stats = getSubjectStats(subject);

                        return (
                            <div
                                key={index}
                                onClick={() => handleSubjectClick(subject._id)}
                                className="bg-white rounded-2xl p-4 md:p-6 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-100 hover:border-blue-200 group"
                            >
                                {/* Subject Header */}
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
                                        <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-r from-sky-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-sm md:text-lg flex-shrink-0">
                                            {index + 1}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold text-gray-800 font-ubuntu text-base md:text-lg group-hover:text-blue-600 transition-colors truncate">
                                                {subject.name}
                                            </h3>
                                            <p className="text-xs md:text-sm text-gray-500 font-ubuntu">
                                                {stats.totalLessons} lessons
                                            </p>
                                        </div>
                                    </div>
                                    <FaArrowRight className="text-gray-400 group-hover:text-blue-500 transition-colors text-sm md:text-base flex-shrink-0 ml-2" />
                                </div>

                                {/* Progress Circle */}
                                <div className="flex items-center justify-center mb-4">
                                    <div className="w-16 h-16 md:w-20 md:h-20">
                                        <CircularProgressbarWithChildren
                                            value={progress}
                                            maxValue={100}
                                            minValue={0}
                                            strokeWidth={6}
                                            styles={buildStyles({
                                                strokeLinecap: "round",
                                                pathColor: `#3B82F6`,
                                                trailColor: "#E5E7EB",
                                            })}
                                        >
                                            <div className="flex flex-col justify-center items-center">
                                                <span className="font-ubuntu text-sm md:text-lg font-bold text-gray-800">{progress}%</span>
                                                <span className="font-ubuntu text-xs text-gray-500 hidden md:block">Complete</span>
                                            </div>
                                        </CircularProgressbarWithChildren>
                                    </div>
                                </div>

                                {/* Stats */}
                                <div className="space-y-2 md:space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-1 md:gap-2">
                                            <FaBookOpen className="text-gray-400 text-xs md:text-sm" />
                                            <span className="text-xs md:text-sm text-gray-600 font-ubuntu">Lessons</span>
                                        </div>
                                        <span className="text-xs md:text-sm font-semibold text-gray-800 font-ubuntu">
                                            {stats.completedLessons}/{stats.totalLessons}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-1 md:gap-2">
                                            <FaClock className="text-gray-400 text-xs md:text-sm" />
                                            <span className="text-xs md:text-sm text-gray-600 font-ubuntu">Study Time</span>
                                        </div>
                                        <span className="text-xs md:text-sm font-semibold text-gray-800 font-ubuntu">
                                            {formatStudyTime(stats.studyTime)}
                                        </span>
                                    </div>
                                </div>

                                {/* Progress Bar */}
                                <div className="mt-3 md:mt-4">
                                    <div className="flex items-center justify-between mb-1 md:mb-2">
                                        <span className="text-xs md:text-sm text-gray-600 font-ubuntu">Progress</span>
                                        <span className="text-xs md:text-sm font-semibold text-gray-800 font-ubuntu">{progress}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-1.5 md:h-2">
                                        <div
                                            className="bg-gradient-to-r from-sky-500 to-indigo-600 h-1.5 md:h-2 rounded-full transition-all duration-300"
                                            style={{ width: `${progress}%` }}
                                        ></div>
                                    </div>
                                </div>

                                {/* Action Button */}
                                <div className="mt-3 md:mt-4 pt-3 md:pt-4 border-t border-gray-100">
                                    <div className="flex items-center justify-center gap-1 md:gap-2 text-blue-600 group-hover:text-blue-700 transition-colors">
                                        <span className="text-xs md:text-sm font-semibold font-ubuntu">View Details</span>
                                        <FaArrowRight className="text-xs md:text-sm" />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="text-center py-12">
                    <FaBookOpen className="text-gray-300 text-6xl mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-500 font-ubuntu mb-2">No Courses Available</h3>
                    <p className="text-gray-400 font-ubuntu">Courses will appear here once they are assigned to your child.</p>
                </div>
            )}
        </div>
    )
};

export default Grades;