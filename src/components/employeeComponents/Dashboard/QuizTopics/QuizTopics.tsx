import React, { useEffect, useState } from "react";
import { QuizTopicsData } from "../../../../constants/employee/Dashboard";
import { getRandomColor } from "../../../../utils/randomColorGenerator";
import { Get, ImageLink } from "../../../../config/apiMethods";
import { displayMessage } from "../../../../config";
import { useNavigate } from "react-router-dom";
import { RouteName } from "../../../../routes/RouteNames";

interface quiztypeORM {
  createdAt: string;
  createdBy: any;
  endsAt: string;
  grade: any;
  image: string,
  questions: any;
  score: string;
  startsAt: string;
  status: string;
  subject: any;
  topic: any;
  updatedAt: any;
  _id: string;
  type: string;
}

interface QuizTopicsProps {
  refreshTrigger?: number;
}

const QuizTopics: React.FC<QuizTopicsProps> = ({ refreshTrigger }) => {
  const navigate = useNavigate();
  const [quizes, setQuizes] = useState<quiztypeORM[]>([]);

  const [loading, setLoading] = useState(false);

  const getStoredUser = () => {
    try {
      const raw = localStorage.getItem("user");
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {} as any;
    }
  };
  let user = getStoredUser();

  const fetchQuizzes = async () => {
    setLoading(true);
    try {
      // Fetch available quizzes
      const quizzesResponse = await Get("/quiz", null, {});

      if (quizzesResponse.success) {
        // Filter out private quizzes - only show non-private quizzes from the user's HR-Admin
        let availableQuizzes = quizzesResponse.data.filter((quiz: quiztypeORM) => quiz.type !== 'private');

        // Fetch employee's quiz results to filter out passed quizzes
        try {
          const resultsResponse = await Get("/employee/myresult");
          console.log("Quiz results response:", resultsResponse); // Debug log

          if (resultsResponse.success && resultsResponse.data.allQuizzes) {
            // Get IDs of quizzes that have been passed
            const passedQuizIds = resultsResponse.data.allQuizzes
              .filter((quiz: any) => quiz.result === 'pass')
              .map((quiz: any) => {
                // Use the quizId field from the backend response, with fallback
                const quizId = quiz.quizId || quiz.id;
                console.log("Passed quiz ID:", quizId, "from quiz:", quiz); // Debug log
                return quizId;
              })
              .filter(Boolean); // Remove any undefined/null values

            console.log("Passed quiz IDs:", passedQuizIds); // Debug log
            console.log("Available quiz IDs before filtering:", availableQuizzes.map((q: any) => q._id)); // Debug log

            // Filter out quizzes that have been passed
            availableQuizzes = availableQuizzes.filter((quiz: quiztypeORM) => {
              const isPassed = passedQuizIds.some((passedId: any) =>
                passedId === quiz._id ||
                passedId.toString() === quiz._id.toString()
              );
              console.log(`Quiz ${quiz._id} (${quiz.subject?.name}) - Passed: ${isPassed}`); // Debug log
              return !isPassed;
            });

            console.log("Available quiz IDs after filtering:", availableQuizzes.map((q: any) => q._id)); // Debug log
          }
        } catch (resultsError) {
          console.warn("Could not fetch quiz results, showing all available quizzes:", resultsError);
          // Continue with all quizzes if results fetch fails
        }

        // Shuffle and select random 10 quizzes from available non-private, non-passed quizzes
        const shuffled = [...availableQuizzes].sort(() => 0.5 - Math.random());
        const randomQuizzes = shuffled.slice(0, 10);
        setQuizes(randomQuizzes);
      } else {
        // Don't show error message for expected cases
        if (quizzesResponse.message && !quizzesResponse.message.includes("No subjects assigned") && !quizzesResponse.message.includes("No quizzes available")) {
          displayMessage(quizzesResponse.message, "error");
        }
        setQuizes([]);
      }
    } catch (error) {
      console.error("Error fetching quizzes:", error);
      displayMessage("Failed to load quizzes", "error");
      setQuizes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizzes();
  }, []);

  useEffect(() => {
    if (refreshTrigger && refreshTrigger > 0) {
      fetchQuizzes();
    }
  }, [refreshTrigger]);
  return (
    <div className="w-full">
      {loading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : quizes.length === 0 ? (
        <div className="text-center py-8">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No quizzes available</h3>
          <p className="mt-1 text-sm text-gray-500">
            {user?.userType === "Employee"
              ? "You've completed all available quizzes or no quizzes are assigned to your subjects. Contact your HR-Admin for new content."
              : "No public quizzes are currently available. Check back later for updates."
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Info message about filtering */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center">
              <svg className="w-4 h-4 text-blue-600 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-blue-700">
                Showing only uncompleted quizzes. Passed quizzes are automatically filtered out.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
            {quizes?.slice(0, 6).map((quiz, index) => (
              <div
                key={String(quiz._id)}
                onClick={() => navigate(`${RouteName?.QUIZ_CONFIRMATION}?quiz=${quiz._id}`)}
                className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md hover:border-blue-300 transition-all duration-200 cursor-pointer group"
              >
                <div className="flex items-start space-x-4">
                  {/* Subject Image */}
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center overflow-hidden">
                      {quiz.image ? (
                        <img
                          src={quiz.image}
                          alt={quiz.subject?.name || 'Subject'}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                      )}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                          {quiz.subject?.name || 'Quiz'}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">{quiz.topic?.name || 'Topic'}</p>
                      </div>
                      <div className="flex items-center text-gray-400 group-hover:text-blue-500">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>

                    {/* Quiz Details */}
                    <div className="flex items-center space-x-4 mt-3">
                      <div className="flex items-center text-gray-600">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span className="text-sm">{quiz.questions?.length || 0} Questions</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-sm">{Math.max(5, quiz.questions?.length * 2 || 10)} min</span>
                      </div>
                      <div className="flex items-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${quiz.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                          }`}>
                          {quiz.status === 'active' ? 'Active' : 'Available'}
                        </span>
                      </div>
                    </div>

                    {/* Progress indicator */}
                    <div className="mt-3">
                      <div className="bg-gray-200 rounded-full h-1.5">
                        <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: '0%' }}></div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Ready to start</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {quizes.length > 6 && (
        <div className="mt-4 text-center">
          <button
            onClick={() => navigate(RouteName.DAILY_QUIZ)}
            className="text-blue-600 text-sm font-medium hover:text-blue-700"
          >
            View all {quizes.length} quizzes →
          </button>
        </div>
      )}
    </div>
  );
};

export default QuizTopics;
