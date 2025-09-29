import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FaUser, FaChevronDown, FaGraduationCap, FaChartLine, FaIdCard, FaCalendarAlt, FaArrowLeft } from "react-icons/fa";
import { UseStateContext } from "../../../context/ContextProvider";
import { RouteName } from "../../../routes/RouteNames";
import { displayMessage } from "../../../config";
import { Get } from "../../../config/apiMethods";
import SideDrawer from "../../../components/sideDrawer/SideDrawer";
import Navbar from "../../../components/supervisorComponents/Navbar/Navbar";
import Grades from "../../../components/supervisorComponents/MyChildren/Grades/Grades";
import TeacherRemarks from "../../../components/supervisorComponents/MyChildren/TeacherRemarks/TeacherRemarks";

const MyEmployees = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const searchParams = new URLSearchParams(location.search);
    const employeeValue = searchParams.get('employee')

    const [currentState, setCurrentState] = useState<number>(0);
    const [mystd, setMyStd] = useState<any>({})
    const [per, setPer] = useState<any>('')
    const [employeeData, setEmployeeData] = useState<any[]>([]);
    const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
    const [showEmployeeSelector, setShowEmployeeSelector] = useState<boolean>(false);
    const [showEmployeeCards, setShowEmployeeCards] = useState<boolean>(true);
    const [isInitialLoading, setIsInitialLoading] = useState<boolean>(true);

    let ch: any = localStorage.getItem("myemployee")
    ch = JSON.parse(ch)

    const fetchEmployeeData = () => {
        setIsInitialLoading(true);
        // Fetch employee data
        Get("/supervisor/mychilds")
            .then((d) => {
                console.log("=== BACKEND RESPONSE DEBUG ===");
                console.log("Full response:", d);
                if (d.data?.length > 0) {
                    console.log("First employee data:", d.data[0]);
                    console.log("First employee subjects:", d.data[0]?.subjects);
                    if (d.data[0]?.subjects?.length > 0) {
                        console.log("First subject:", d.data[0].subjects[0]);
                        console.log("First subject topics:", d.data[0].subjects[0]?.topics);
                    }
                }
                console.log("=============================");

                if (d.success) {
                    setEmployeeData(d.data);
                    if (d.data?.length > 0) {
                        const currentEmployee = ch || d.data[0];
                        setSelectedEmployee(currentEmployee);
                        setMyStd(currentEmployee);
                    }
                } else {
                    displayMessage(d.message, "error");
                }
            })
            .catch((err) => {
                displayMessage(err.message, "error");
            })
            .finally(() => {
                setIsInitialLoading(false);
            });
    };

    useEffect(() => {
        fetchEmployeeData();
    }, [])

    useEffect(() => {
        if (ch) {
            setMyStd(ch)
            setSelectedEmployee(ch)
        }
    }, [employeeValue])

    const handleEmployeeSelect = (employee: any) => {
        setSelectedEmployee(employee);
        setMyStd(employee);
        setShowEmployeeCards(false);
        localStorage.setItem("myemployee", JSON.stringify(employee));
        navigate(RouteName.MYEMPLOYEES_SCREEN + `?employee=${employee._id}`);
        setShowEmployeeSelector(false);
    };

    const renderToggleEmployees = () => {
        try {
            switch (currentState) {
                case 0:
                    return <SubjectsAndTopics mystd={mystd} />
                case 1:
                    return <TopicStatistics mystd={mystd} />
                default:
                    return <SubjectsAndTopics mystd={mystd} />
            }
        } catch (error) {
            console.error("Error rendering toggle employees:", error);
        }
    };

    // Subjects and Topics Component
    const SubjectsAndTopics = ({ mystd }: { mystd: any }) => {
        const [subjectsData, setSubjectsData] = useState<any[]>([]);
        const [loading, setLoading] = useState(true);

        useEffect(() => {
            if (mystd?.subjects) {
                console.log("Subjects data received:", mystd.subjects);
                mystd.subjects.forEach((subject: any, index: number) => {
                    console.log(`Subject ${index + 1}:`, subject);
                    console.log(`  - Name: ${subject.name}`);
                    console.log(`  - Topics:`, subject.topics);
                    console.log(`  - Topics count: ${subject.topics?.length || 0}`);
                });
                setSubjectsData(mystd.subjects);
                setLoading(false);
            }
        }, [mystd]);

        if (loading) {
            return (
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
            );
        }

        return (
            <div className="space-y-6">
                <h3 className="text-xl font-bold text-gray-800 font-ubuntu mb-4">Assigned Subjects & Topics</h3>

                {subjectsData.length === 0 ? (
                    <div className="text-center py-8">
                        <FaGraduationCap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 font-ubuntu">No subjects assigned to this employee</p>
                    </div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {subjectsData.map((subject: any, index: number) => (
                            <div key={index} className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
                                <div className="flex items-center gap-3 mb-4">
                                    {subject.image ? (
                                        <img src={subject.image} alt={subject.name} className="w-12 h-12 rounded-lg object-cover" />
                                    ) : (
                                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                                            <FaGraduationCap className="text-white text-lg" />
                                        </div>
                                    )}
                                    <div>
                                        <h4 className="font-bold text-gray-800 font-ubuntu">{subject.name}</h4>
                                        <p className="text-sm text-gray-500 font-ubuntu">Subject</p>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-gray-600 font-ubuntu">Topics</span>
                                        <span className="text-sm font-semibold text-blue-600 font-ubuntu">
                                            {subject.topics?.length || 0} topics
                                        </span>
                                    </div>

                                    {subject.topics && subject.topics.length > 0 && (
                                        <div className="space-y-2">
                                            <p className="text-xs font-medium text-gray-500 font-ubuntu">Topic List:</p>
                                            <div className="max-h-32 overflow-y-auto">
                                                {subject.topics.slice(0, 3).map((topic: any, topicIndex: number) => (
                                                    <div key={topicIndex} className="text-xs text-gray-600 font-ubuntu py-1">
                                                        • {topic.name}
                                                    </div>
                                                ))}
                                                {subject.topics.length > 3 && (
                                                    <div className="text-xs text-blue-500 font-ubuntu py-1">
                                                        +{subject.topics.length - 3} more topics
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    // Topic Statistics Component
    const TopicStatistics = ({ mystd }: { mystd: any }) => {
        const [statsData, setStatsData] = useState<any[]>([]);
        const [loading, setLoading] = useState(true);
        const [error, setError] = useState<string>('');

        useEffect(() => {
            const fetchTopicStatistics = async () => {
                if (!mystd?._id) {
                    setLoading(false);
                    return;
                }

                try {
                    setLoading(true);
                    setError('');

                    // Fetch detailed employee data with progress
                    const response = await Get(`/supervisor/mychild/${mystd._id}`);

                    if (response.success && response.data) {
                        const employee = response.data;
                        console.log("Employee progress data:", employee);

                        if (employee.subjects && employee.subjects.length > 0) {
                            const stats = await Promise.all(employee.subjects.map(async (subject: any) => {
                                const totalTopics = subject.topics?.length || 0;
                                const totalLessons = subject.topics?.reduce((sum: number, topic: any) => sum + (topic.lessons?.length || 0), 0) || 0;

                                // Calculate completed topics and lessons
                                let completedTopics = 0;
                                let completedLessons = 0;

                                if (subject.topics && subject.topics.length > 0) {
                                    for (const topic of subject.topics) {
                                        if (topic.lessons && topic.lessons.length > 0) {
                                            let topicCompleted = true;
                                            for (const lesson of topic.lessons) {
                                                // Check if lesson is completed (progress >= 100)
                                                if (lesson.userProgress && lesson.userProgress.length > 0) {
                                                    const userProgress = lesson.userProgress.find(
                                                        (progress: any) => progress.user.toString() === mystd._id.toString()
                                                    );
                                                    if (userProgress && userProgress.progress >= 100) {
                                                        completedLessons++;
                                                    } else {
                                                        topicCompleted = false;
                                                    }
                                                } else {
                                                    topicCompleted = false;
                                                }
                                            }
                                            if (topicCompleted && topic.lessons.length > 0) {
                                                completedTopics++;
                                            }
                                        }
                                    }
                                }

                                return {
                                    subjectName: subject.name,
                                    subjectImage: subject.image,
                                    totalTopics,
                                    totalLessons,
                                    completedTopics,
                                    completedLessons,
                                    topicProgress: totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0,
                                    lessonProgress: totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0
                                };
                            }));

                            setStatsData(stats);
                        } else {
                            setStatsData([]);
                        }
                    } else {
                        setError('Failed to fetch employee progress data');
                    }
                } catch (err: any) {
                    console.error('Error fetching topic statistics:', err);
                    setError(err.message || 'Failed to load statistics');

                    // Fallback to basic stats from current data
                    if (mystd?.subjects) {
                        const fallbackStats = mystd.subjects.map((subject: any) => {
                            const totalTopics = subject.topics?.length || 0;
                            const totalLessons = subject.topics?.reduce((sum: number, topic: any) => sum + (topic.lessons?.length || 0), 0) || 0;

                            return {
                                subjectName: subject.name,
                                subjectImage: subject.image,
                                totalTopics,
                                totalLessons,
                                completedTopics: 0,
                                completedLessons: 0,
                                topicProgress: 0,
                                lessonProgress: 0
                            };
                        });
                        setStatsData(fallbackStats);
                    }
                } finally {
                    setLoading(false);
                }
            };

            fetchTopicStatistics();
        }, [mystd]);

        if (loading) {
            return (
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
            );
        }

        if (error) {
            return (
                <div className="space-y-6">
                    <h3 className="text-xl font-bold text-gray-800 font-ubuntu mb-4">Topic Statistics</h3>
                    <div className="text-center py-8">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FaChartLine className="w-8 h-8 text-red-500" />
                        </div>
                        <p className="text-red-500 font-ubuntu mb-2">Error loading statistics</p>
                        <p className="text-gray-500 font-ubuntu text-sm">{error}</p>
                    </div>
                </div>
            );
        }

        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-gray-800 font-ubuntu">Topic Statistics</h3>
                    {mystd?.auth?.fullName && (
                        <p className="text-sm text-gray-500 font-ubuntu">for {mystd.auth.fullName}</p>
                    )}
                </div>

                {statsData.length === 0 ? (
                    <div className="text-center py-8">
                        <FaChartLine className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 font-ubuntu">No statistics available</p>
                        <p className="text-gray-400 font-ubuntu text-sm mt-2">No subjects assigned or no progress data found</p>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {statsData.map((stat: any, index: number) => (
                            <div key={index} className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
                                <div className="flex items-center gap-4 mb-6">
                                    {stat.subjectImage ? (
                                        <img src={stat.subjectImage} alt={stat.subjectName} className="w-16 h-16 rounded-lg object-cover" />
                                    ) : (
                                        <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                                            <FaGraduationCap className="text-white text-2xl" />
                                        </div>
                                    )}
                                    <div>
                                        <h4 className="text-xl font-bold text-gray-800 font-ubuntu">{stat.subjectName}</h4>
                                        <p className="text-gray-600 font-ubuntu">Subject Overview</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                                        <div className="text-2xl font-bold text-blue-600 font-ubuntu">{stat.totalTopics}</div>
                                        <div className="text-sm text-gray-600 font-ubuntu">Total Topics</div>
                                    </div>

                                    <div className="text-center p-4 bg-green-50 rounded-lg">
                                        <div className="text-2xl font-bold text-green-600 font-ubuntu">{stat.completedTopics}</div>
                                        <div className="text-sm text-gray-600 font-ubuntu">Completed Topics</div>
                                    </div>

                                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                                        <div className="text-2xl font-bold text-purple-600 font-ubuntu">{stat.totalLessons}</div>
                                        <div className="text-sm text-gray-600 font-ubuntu">Total Lessons</div>
                                    </div>

                                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                                        <div className="text-2xl font-bold text-orange-600 font-ubuntu">{stat.completedLessons}</div>
                                        <div className="text-sm text-gray-600 font-ubuntu">Completed Lessons</div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {stat.totalTopics > 0 && (
                                        <div>
                                            <div className="flex justify-between text-sm font-medium text-gray-600 font-ubuntu mb-2">
                                                <span>Topic Completion</span>
                                                <span>{stat.topicProgress}%</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-3">
                                                <div
                                                    className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-500"
                                                    style={{ width: `${stat.topicProgress}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    )}

                                    {stat.totalLessons > 0 && (
                                        <div>
                                            <div className="flex justify-between text-sm font-medium text-gray-600 font-ubuntu mb-2">
                                                <span>Lesson Completion</span>
                                                <span>{stat.lessonProgress}%</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-3">
                                                <div
                                                    className="bg-gradient-to-r from-purple-500 to-orange-500 h-3 rounded-full transition-all duration-500"
                                                    style={{ width: `${stat.lessonProgress}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    const toggleObject = [
        {
            title: "Subjects & Topics",
            image: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
        },
        {
            title: "Topic Statistics",
            image: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
        }
    ];

    return (
        <div className="flex flex-row w-screen h-screen max-w-[2200px] justify-center items-center mx-auto bg-gradient-to-br from-blue-50 to-indigo-100 flex-wrap">
            {/* Left Sidebar */}
            <div className="lg:w-1/6 h-full bg-transparent">
                <SideDrawer />
            </div>

            {/* Main Content */}
            <div className="flex flex-col h-screen w-screen lg:w-10/12 px-2 py-2 md:px-4 md:py-6 md:pr-16 bg-transparent">
                {/* Navbar */}
                <div className="w-full h-fit bg-transparent mb-2 md:mb-6">
                    <Navbar title="My Employees" mystd={mystd} onEmployeeAdded={fetchEmployeeData} />
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-6">
                    {/* Back Button - Only show when an employee is selected */}
                    {selectedEmployee && !showEmployeeCards && (
                        <div className="mb-6">
                            <button
                                onClick={() => {
                                    setShowEmployeeCards(true);
                                    setSelectedEmployee(null);
                                    setMyStd({});
                                    localStorage.removeItem("myemployee");
                                    navigate(RouteName.MYEMPLOYEES_SCREEN);
                                }}
                                className="flex items-center gap-2 bg-white border-2 border-gray-200 rounded-xl px-4 py-3 hover:border-blue-300 transition-all duration-200 shadow-sm"
                            >
                                <FaArrowLeft className="text-gray-600" />
                                <span className="font-semibold text-gray-800 font-ubuntu">Back to Employees</span>
                            </button>
                        </div>
                    )}

                    {/* Show Employee Cards when no employee is selected */}
                    {showEmployeeCards && (
                        <div className="w-full">
                            <div className="mb-6">
                                <h2 className="text-2xl font-bold text-gray-800 font-ubuntu mb-2">Select an Employee to View Progress</h2>
                                <p className="text-gray-600 font-ubuntu">Click on any employee card below to view their detailed progress</p>
                            </div>

                            {/* Loading State */}
                            {isInitialLoading ? (
                                <div className="flex flex-col items-center justify-center py-16">
                                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mb-6"></div>
                                    <h3 className="text-xl font-semibold text-gray-700 font-ubuntu mb-2">Loading Employees...</h3>
                                    <p className="text-gray-500 font-ubuntu text-center max-w-md">
                                        Please wait while we fetch your team members and their progress data.
                                    </p>
                                </div>
                            ) : employeeData && employeeData.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {employeeData.map((employee: any, index: number) => (
                                        <div
                                            key={index}
                                            onClick={() => handleEmployeeSelect(employee)}
                                            className="group bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-blue-300 cursor-pointer hover:scale-[1.02] overflow-hidden relative"
                                        >
                                            {/* Background Gradient */}
                                            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                                            {/* Content */}
                                            <div className="relative p-6">
                                                {/* Header Section */}
                                                <div className="flex items-start justify-between mb-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className="relative">
                                                            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                                                                <img
                                                                    src={employee?.auth?.image || "https://st2.depositphotos.com/3889193/6856/i/450/depositphotos_68564721-Beautiful-young-student-posing.jpg"}
                                                                    alt={employee?.auth?.fullName}
                                                                    className="w-16 h-16 rounded-xl object-cover"
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="flex-1">
                                                            <h3 className="font-bold text-gray-800 font-ubuntu text-xl mb-1 group-hover:text-blue-700 transition-colors duration-200">
                                                                {employee?.auth?.fullName || "Employee Name"}
                                                            </h3>
                                                            <p className="text-sm font-medium text-blue-600 font-ubuntu mb-2">
                                                                {employee?.auth?.email || "No email"}
                                                            </p>
                                                            <div className="flex items-center gap-2">
                                                                <div className={`w-2 h-2 rounded-full ${employee?.isBlocked ? 'bg-red-400' : 'bg-green-400'}`}></div>
                                                                <span className={`text-xs font-ubuntu ${employee?.isBlocked ? 'text-red-500' : 'text-gray-500'}`}>
                                                                    {employee?.isBlocked ? 'Not Active' : 'Active'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Action Button */}
                                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                        <div className="w-10 h-10 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center shadow-lg transition-all duration-200">
                                                            <FaChartLine className="w-4 h-4 text-white" />
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Info Section */}
                                                <div className="space-y-3 mb-6">
                                                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl group-hover:bg-blue-50 transition-colors duration-200">
                                                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                                            <FaIdCard className="text-blue-600 text-sm" />
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-gray-500 font-ubuntu">Employee Code</p>
                                                            <p className="text-sm font-semibold text-gray-800 font-ubuntu">{employee?.code || "N/A"}</p>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl group-hover:bg-blue-50 transition-colors duration-200">
                                                        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                                                            <FaCalendarAlt className="text-purple-600 text-sm" />
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-gray-500 font-ubuntu">Joined</p>
                                                            <p className="text-sm font-semibold text-gray-800 font-ubuntu">{new Date().getFullYear()}</p>
                                                        </div>
                                                    </div>
                                                </div>


                                                {/* Footer */}
                                                <div className="pt-4 border-t border-gray-100">
                                                    <div className="flex items-center justify-center gap-2 text-blue-600 font-ubuntu">
                                                        <FaChartLine className="w-4 h-4" />
                                                        <span className="text-sm font-semibold group-hover:text-blue-700 transition-colors duration-200">
                                                            View Progress Details
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <FaUser className="text-gray-300 text-6xl mx-auto mb-4" />
                                    <h3 className="text-xl font-semibold text-gray-500 font-ubuntu mb-2">No Employees Found</h3>
                                    <p className="text-gray-400 font-ubuntu">Employees will appear here once they are assigned to you.</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Show Tabs and Content when an employee is selected */}
                    {selectedEmployee && !showEmployeeCards && (
                        <>
                            {/* Selected Employee Info */}
                            <div className="bg-white rounded-2xl shadow-lg mb-6 p-6">
                                <div className="flex items-center gap-4">
                                    <img
                                        src={selectedEmployee?.auth?.image || "https://st2.depositphotos.com/3889193/6856/i/450/depositphotos_68564721-Beautiful-young-student-posing.jpg"}
                                        alt={selectedEmployee?.auth?.fullName}
                                        className="w-16 h-16 rounded-full object-cover"
                                    />
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-800 font-ubuntu">
                                            {selectedEmployee?.auth?.fullName}
                                        </h2>
                                        <p className="text-gray-600 font-ubuntu">
                                            {selectedEmployee?.grade?.grade} • Employee Code: {selectedEmployee?.code}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Navigation Tabs */}
                            <div className="w-full bg-white rounded-2xl shadow-lg mb-6 overflow-hidden">
                                <div className="flex flex-wrap border-b border-gray-200">
                                    {toggleObject?.map((item, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setCurrentState(index)}
                                            className={`flex-1 flex flex-col items-center justify-center p-4 md:p-6 transition-all duration-200 ${currentState === index
                                                ? 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white'
                                                : 'text-gray-600 hover:bg-gray-50'
                                                }`}
                                        >
                                            <div className="flex items-center gap-3 mb-2">
                                                <img
                                                    src={item?.image}
                                                    className="w-6 h-6 md:w-8 md:h-8"
                                                    alt={item?.title}
                                                />
                                                <span className="font-semibold text-sm md:text-base font-ubuntu">
                                                    {item?.title}
                                                </span>
                                            </div>
                                            <div className={`w-full h-1 rounded-full transition-all duration-200 ${currentState === index ? 'bg-white' : 'bg-transparent'
                                                }`} />
                                        </button>
                                    ))}
                                </div>

                                {/* Content Area */}
                                <div className="p-6">
                                    {renderToggleEmployees()}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
};

export default MyEmployees;