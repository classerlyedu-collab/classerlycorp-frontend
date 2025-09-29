
import {
    Navbar,
    SideDrawer
} from "../../../components";
import { useState, useEffect } from "react";
import { Get } from "../../../config/apiMethods";
import { displayMessage } from "../../../config";
import { useNavigate } from "react-router-dom";
import { RouteName } from "../../../routes/RouteNames";
import { getRandomColor } from "../../../utils/randomColorGenerator";

const Subjects = () => {
    const navigate = useNavigate();

    // State for enrolled subjects assigned by HR-Admin
    const [enrolledSubjects, setEnrolledSubjects] = useState<any[]>([]);
    const [loadingSubjects, setLoadingSubjects] = useState(false);

    // Fetch enrolled subjects assigned by HR-Admin
    useEffect(() => {
        setLoadingSubjects(true);
        Get("/employee/mysubjects")
            .then((d) => {
                if (d.success) {
                    setEnrolledSubjects(d.data || []);
                } else {
                    displayMessage(d.message || "Failed to load subjects", "error");
                }
            })
            .catch((error) => {
                displayMessage("Failed to fetch enrolled subjects", "error");
            })
            .finally(() => {
                setLoadingSubjects(false);
            });
    }, []);

    const handleSubjectClick = (subject: any) => {
        localStorage.setItem("subject", JSON.stringify(subject));
        navigate(`${RouteName?.TOPICS_SUBJECTS}?subject=${subject._id}`);
    };

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
                    <Navbar title="Courses" hideSearchBar />
                </div>

                {/* Content */}
                <div className="flex-1 bg-gradient-to-br from-gray-50 to-blue-50 p-4 lg:p-6">
                    <div className="max-w-6xl mx-auto">
                        {/* Header Section */}
                        <div className="mb-8">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900">My Courses</h1>
                                    <p className="text-gray-600 mt-2">Courses assigned by your team lead</p>
                                </div>
                                <div className="flex items-center space-x-3 text-sm text-gray-600">
                                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-semibold">
                                        {enrolledSubjects.length} Course{enrolledSubjects.length !== 1 ? 's' : ''}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Subjects Grid */}
                        {loadingSubjects ? (
                            <div className="flex justify-center items-center py-20">
                                <div className="text-center">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                                    <p className="text-gray-600 font-medium">Loading your subjects...</p>
                                </div>
                            </div>
                        ) : enrolledSubjects.length === 0 ? (
                            <div className="text-center py-20">
                                <div className="max-w-md mx-auto">
                                    <div className="bg-gray-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                                        <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                        </svg>
                                    </div>
                                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No courses assigned yet</h3>
                                    <p className="text-gray-600">Your team lead hasn't assigned any courses to you yet. Please contact them for course assignments.</p>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {enrolledSubjects.map((subject: any, index: number) => (
                                    <div
                                        key={subject._id}
                                        onClick={() => handleSubjectClick(subject)}
                                        className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] cursor-pointer border border-gray-200"
                                    >
                                        <div className="p-6">
                                            {/* Subject Icon */}
                                            <div
                                                className="w-16 h-16 rounded-xl flex items-center justify-center mb-4 mx-auto"
                                                style={{ background: getRandomColor("light", index) }}
                                            >
                                                {subject.image ? (
                                                    <img
                                                        src={subject.image}
                                                        alt={subject.name}
                                                        className="w-10 h-10 object-contain"
                                                    />
                                                ) : (
                                                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                                    </svg>
                                                )}
                                            </div>

                                            {/* Subject Name */}
                                            <h3 className="text-lg font-bold text-gray-900 text-center mb-2 truncate">
                                                {subject.name}
                                            </h3>

                                            {/* Description */}
                                            <p className="text-gray-600 text-sm text-center mb-4">
                                                Click to view topics and lessons
                                            </p>

                                            {/* Learn More Button Visual Indicator */}
                                            <div className="flex items-center justify-center">
                                                <div className="inline-flex items-center text-blue-600 text-sm font-medium">
                                                    View Details
                                                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                    </svg>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Subjects;
