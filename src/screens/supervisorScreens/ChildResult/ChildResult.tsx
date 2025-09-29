import { Navbar, SideDrawer } from "../../../components";
import "react-datepicker/dist/react-datepicker.css";
import { ChildResultType } from "../../../types/parent/ChildOverview";
import { useEffect, useState, useRef } from "react";
import { LessonStatus, QuizResults } from "../../../components/supervisorComponents/ChildResult";
import { FaArrowLeft, FaChartBar, FaBookOpen, FaTrophy, FaUser, FaChevronDown } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { RouteName } from "../../../routes/RouteNames";

const ChildResult = () => {
  const [result, setResult] = useState<ChildResultType[] | null>(null);
  const [title, setTitle] = useState<string>('Result');
  const [childName, setChildName] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'topics' | 'quizzes' | null>(null);
  const navigate = useNavigate();


  useEffect(() => {
    let ch: any = localStorage.getItem('childResult');
    let title: any = localStorage.getItem('resultHeaderTitle');
    setTitle(title);
    setChildName(title?.replace(' Result', '') || 'Child');
    ch = JSON.parse(ch);
    ch = ch.map((i: any) => {
      i.read = ((i.lessons.filter((j: any) => { return j.read }).length / i.lessons.length) * 100).toFixed(2)
      return i
    })
    setResult(ch);
  }, [])

  // Calculate overall statistics
  const getOverallStats = () => {
    if (!result || result.length === 0) return { totalTopics: 0, completedLessons: 0, totalLessons: 0, averageProgress: 0 };

    let totalLessons = 0;
    let completedLessons = 0;

    result.forEach(topic => {
      totalLessons += topic.lessons.length;
      completedLessons += topic.lessons.filter(lesson => lesson.read).length;
    });

    const averageProgress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

    return {
      totalTopics: result.length,
      completedLessons,
      totalLessons,
      averageProgress
    };
  };

  const stats = getOverallStats();

  return (
    <div className="flex flex-row w-screen h-screen max-w-[2200px] justify-center items-center mx-auto bg-gradient-to-br from-blue-50 to-indigo-100 flex-wrap">
      {/* Left Sidebar */}
      <div className="lg:w-1/6 h-full bg-transparent">
        <SideDrawer />
      </div>

      {/* Main Content */}
      <div className="flex flex-col h-screen w-screen lg:w-10/12 px-2 py-2 md:px-4 md:py-6 md:pr-16 bg-transparent overflow-y-auto">

        {/* Header Section */}
        <div className="w-full bg-white rounded-2xl shadow-lg mb-6 p-4 md:p-6">
          {/* Desktop Layout */}
          <div className="hidden md:flex flex-row justify-between items-center gap-4">
            {/* Back Button and Title */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(RouteName.MYEMPLOYEES_SCREEN)}
                className="p-3 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors duration-200"
              >
                <FaArrowLeft className="text-gray-600 text-lg" />
              </button>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-r from-green-500 to-blue-600 rounded-full">
                  <FaUser className="text-white text-xl" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-800 font-ubuntu">
                    {childName}'s Results
                  </h1>
                  <p className="text-gray-600 font-ubuntu">
                    Academic performance overview
                  </p>
                </div>
              </div>
            </div>

            {/* Overall Progress */}
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-gray-500 font-ubuntu">Overall Progress</p>
                <p className="text-2xl font-bold text-gray-800 font-ubuntu">{stats.averageProgress}%</p>
              </div>
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
                    className="text-green-500"
                    stroke="currentColor"
                    strokeWidth="3"
                    fill="none"
                    strokeDasharray={`${stats.averageProgress}, 100`}
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Mobile Layout */}
          <div className="md:hidden">
            {/* Top Row - Back Button and Title */}
            <div className="flex items-center gap-3 mb-4">
              <button
                onClick={() => navigate(RouteName.MYEMPLOYEES_SCREEN)}
                className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors duration-200"
              >
                <FaArrowLeft className="text-gray-600 text-base" />
              </button>
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="p-2 bg-gradient-to-r from-green-500 to-blue-600 rounded-full">
                  <FaUser className="text-white text-base" />
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="text-lg font-bold text-gray-800 font-ubuntu truncate">
                    {childName}'s Results
                  </h1>
                  <p className="text-sm text-gray-600 font-ubuntu">
                    Academic performance overview
                  </p>
                </div>
              </div>
            </div>

            {/* Bottom Row - Overall Progress */}
            <div className="flex items-center justify-center gap-4">
              <div className="text-center">
                <p className="text-xs text-gray-500 font-ubuntu">Overall Progress</p>
                <p className="text-xl font-bold text-gray-800 font-ubuntu">{stats.averageProgress}%</p>
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
                    className="text-green-500"
                    stroke="currentColor"
                    strokeWidth="3"
                    fill="none"
                    strokeDasharray={`${stats.averageProgress}, 100`}
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 md:p-6 shadow-lg">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="p-2 md:p-3 bg-blue-100 rounded-full">
                <FaBookOpen className="text-blue-600 text-base md:text-lg" />
              </div>
              <div>
                <p className="text-xs md:text-sm text-gray-500 font-ubuntu">Total Topics</p>
                <p className="text-lg md:text-2xl font-bold text-gray-800 font-ubuntu">{stats.totalTopics}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 md:p-6 shadow-lg">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="p-2 md:p-3 bg-green-100 rounded-full">
                <FaChartBar className="text-green-600 text-base md:text-lg" />
              </div>
              <div>
                <p className="text-xs md:text-sm text-gray-500 font-ubuntu">Completed Lessons</p>
                <p className="text-lg md:text-2xl font-bold text-gray-800 font-ubuntu">{stats.completedLessons}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 md:p-6 shadow-lg">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="p-2 md:p-3 bg-purple-100 rounded-full">
                <FaBookOpen className="text-purple-600 text-base md:text-lg" />
              </div>
              <div>
                <p className="text-xs md:text-sm text-gray-500 font-ubuntu">Total Lessons</p>
                <p className="text-lg md:text-2xl font-bold text-gray-800 font-ubuntu">{stats.totalLessons}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 md:p-6 shadow-lg">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="p-2 md:p-3 bg-yellow-100 rounded-full">
                <FaTrophy className="text-yellow-600 text-base md:text-lg" />
              </div>
              <div>
                <p className="text-xs md:text-sm text-gray-500 font-ubuntu">Success Rate</p>
                <p className="text-lg md:text-2xl font-bold text-gray-800 font-ubuntu">{stats.averageProgress}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Content Sections with Accordion Structure */}
        <div className="flex flex-col gap-6 pb-8">
          {/* Topics Progress Accordion */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <button
              onClick={() => setActiveTab(activeTab === 'topics' ? null : 'topics')}
              className="w-full flex items-center justify-between p-6 bg-gradient-to-r from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 transition-all duration-200"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-full">
                  <FaBookOpen className="text-blue-600 text-lg" />
                </div>
                <div className="text-left">
                  <h3 className="text-xl font-bold text-gray-800 font-ubuntu">Topics Progress</h3>
                  <p className="text-sm text-gray-600 font-ubuntu">
                    {stats.totalTopics} topics • {stats.completedLessons}/{stats.totalLessons} lessons completed
                  </p>
                </div>
              </div>
              <div className={`transform transition-transform duration-200 ${activeTab === 'topics' ? 'rotate-180' : ''}`}>
                <FaChevronDown className="text-gray-600 text-xl" />
              </div>
            </button>

            {activeTab === 'topics' && (
              <div className="p-6 border-t border-gray-100">
                <LessonStatus result={result} />
              </div>
            )}
          </div>

          {/* Quiz Results Accordion */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <button
              onClick={() => setActiveTab(activeTab === 'quizzes' ? null : 'quizzes')}
              className="w-full flex items-center justify-between p-6 bg-gradient-to-r from-green-50 to-blue-50 hover:from-green-100 hover:to-blue-100 transition-all duration-200"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-full">
                  <FaTrophy className="text-green-600 text-lg" />
                </div>
                <div className="text-left">
                  <h3 className="text-xl font-bold text-gray-800 font-ubuntu">Quiz Results</h3>
                  <p className="text-sm text-gray-600 font-ubuntu">
                    View quiz performance and results
                  </p>
                </div>
              </div>
              <div className={`transform transition-transform duration-200 ${activeTab === 'quizzes' ? 'rotate-180' : ''}`}>
                <FaChevronDown className="text-gray-600 text-xl" />
              </div>
            </button>

            {activeTab === 'quizzes' && (
              <div className="p-6 border-t border-gray-100">
                <QuizResults result={result} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChildResult;
