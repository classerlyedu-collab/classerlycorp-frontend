import { useNavigate } from "react-router-dom";
import { yourTopicsData } from "../../../../constants/employee/Subjects"; // Importing topics data from the constants
import { getRandomColor } from "../../../../utils/randomColorGenerator"; // Importing a utility function to get a random color
import { RouteName } from "../../../../routes/RouteNames";
import { useEffect, useState } from "react";

import { useSearchParams } from "react-router-dom";
import { Get } from "../../../../config/apiMethods";
import { displayMessage } from "../../../../config";

// interface topictypeORM {
//   name: String;
//   image: string;
//   lessons: any;
//   quizes: any;
//   practices: any;
//   difficulty: String;
//   _id: any;
// }

const YourTopics = ({ topic, loading, topicProgress = {} }: any) => {
  const navigate = useNavigate();

  // Kid-friendly colors for different difficulty levels
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty?.toLowerCase()) {
      case 'beginner':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'advanced':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  // Fun emojis for different content types
  const getContentEmoji = (type: string) => {
    switch (type) {
      case 'lessons':
        return '📚';
      case 'practice':
        return '✏️';
      case 'quizzes':
        return '🧠';
      default:
        return '📖';
    }
  };

  // Progress bar color based on completion
  const getProgressColor = (status: string) => {
    if (status?.includes('100%')) return 'bg-green-500';
    if (status?.includes('0%')) return 'bg-gray-300';
    return 'bg-blue-500';
  };

  // Extract progress percentage from status string
  const getProgressPercentage = (status: string) => {
    const match = status?.match(/(\d+)%/);
    return match ? parseInt(match[1]) : 0;
  };
  // const [topic, setTopics] = useState<topictypeORM[]>([]);
  // const [searchParams] = useSearchParams();

  // useEffect(() => {
  //   const subject = searchParams.get("subject");

  //   Get(`/topic?subject=${subject}`).then((d) => {

  //     if (d.success) {
  //       setTopics(d.data);
  //     } else {
  //       displayMessage(d.message);
  //     }
  //   });
  //   // Function to update the current index every 4 seconds

  //   // Cleanup interval on component unmount
  //   // return () => clearInterval(interval);
  // }, []);

  const user = JSON.parse(localStorage.getItem("user") || "{}");


  // Loading skeleton component
  const LoadingSkeleton = () => (
    <div className="w-full h-full bg-white rounded-2xl shadow-md p-6">
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded-lg mb-6 w-48"></div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-gray-100 rounded-xl p-4 h-32">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="w-20 h-8 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="w-full h-full bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl shadow-lg border border-purple-100">
      {/* Topics Grid */}
      <div className="p-6 rounded-2xl">
        {topic?.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              No Topics Found
            </h3>
            <p className="text-gray-500">
              It looks like there are no topics available right now.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topic?.map((item: any, index: any) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 overflow-hidden"
              >
                {/* Topic Header */}
                <div className="bg-gradient-to-r from-sky-500 to-indigo-600 p-4 text-white">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0 w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-2xl font-bold">
                      {item.name?.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-base sm:text-lg">
                        {item.name}
                      </h3>
                      <div className={`inline-block px-2 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(item.difficulty)}`}>
                        {item.difficulty}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Content Stats */}
                <div className="p-4">
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-2xl mb-1">{getContentEmoji('lessons')}</div>
                      <div className="text-sm font-semibold text-gray-700">
                        {item.lessons?.length || 0}
                      </div>
                      <div className="text-xs text-gray-500">Lessons</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl mb-1">{getContentEmoji('practice')}</div>
                      <div className="text-sm font-semibold text-gray-700">
                        {item.practices?.length || 0}
                      </div>
                      <div className="text-xs text-gray-500">Practice</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl mb-1">{getContentEmoji('quizzes')}</div>
                      <div className="text-sm font-semibold text-gray-700">
                        {item.quizes?.length || 0}
                      </div>
                      <div className="text-xs text-gray-500">Quizzes</div>
                    </div>
                  </div>

                  {/* Progress Bar for Employee Progress */}
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">Progress</span>
                      <span className="text-sm font-bold text-gray-900">
                        {topicProgress[item._id] || 0}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ${getProgressColor(`${topicProgress[item._id] || 0}%`)}`}
                        style={{ width: `${topicProgress[item._id] || 0}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-2">
                    <button
                      onClick={() => navigate(`${RouteName?.LESSONS_EMPLOYEE}?topic=${item._id}`)}
                      className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:from-blue-600 hover:to-blue-700 transition-all duration-200 transform hover:scale-105"
                    >
                      📖 Start Learning
                    </button>
                    {(user.userType === "Student" || user.userType === "Employee") && item.quizes?.length > 0 && item.quizes.some((quiz: any) => quiz._id && quiz.type !== 'private') && (() => {
                      const nonPrivateQuizzes = item.quizes.filter((quiz: any) => quiz._id && quiz.type !== 'private');
                      const firstQuiz = nonPrivateQuizzes[0];

                      const quizParams = new URLSearchParams({
                        topic: item._id,
                        quiz: firstQuiz._id
                      });

                      return (
                        <button
                          onClick={() => navigate(`${RouteName?.QUIZ_CONFIRMATION}?${quizParams.toString()}`)}
                          className="bg-gradient-to-r from-green-500 to-green-600 text-white py-2 px-4 rounded-lg font-medium hover:from-green-600 hover:to-green-700 transition-all duration-200 transform hover:scale-105"
                        >
                          🧠 Quiz
                        </button>
                      );
                    })()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default YourTopics;
