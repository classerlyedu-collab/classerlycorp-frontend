import { useState, useEffect } from "react";
import {
  BodySoloQuiz,
  FooterSoloQuiz,
  HeaderSoloQuiz,
} from "../../../components";
import { quizQuestionsData } from "../../../constants/employee/Quiz";
import { useLocation, useNavigate } from "react-router-dom";
import { Post } from "../../../config/apiMethods";
import { displayMessage } from "../../../config";
import { RouteName } from "../../../routes/RouteNames";
import { Navbar } from "../../../components";
import { MdTimer, MdQuestionAnswer, MdCheckCircle, MdArrowForward } from "react-icons/md";

const SoloQuiz = () => {
  const [currentQuestion, setCurrentQuestion] = useState<number>(0);
  const [timeRemaining, setTimeRemaining] = useState<number>(15);
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
  const navigate = useNavigate();

  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const location = useLocation();
  const [quizdata, setQuizData] = useState<any>(location.state);
  const [randomQuestions, setRandomQuestions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [questionTime, setQuestionTime] = useState<number>(30); // Default fallback time

  // Helper function to calculate time per question
  const calculateTimePerQuestion = (startTime: Date, endTime: Date, questionCount: number): number => {
    const totalTimeInSeconds = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);

    if (totalTimeInSeconds <= 0) {
      console.warn('Invalid time range: end time is not after start time');
      return 30; // Default fallback
    }

    // Divide by actual number of questions (not hardcoded 10)
    const timePerQuestion = Math.floor(totalTimeInSeconds / questionCount);

    // Set minimum time of 30 seconds per question and maximum of 300 seconds (5 minutes)
    return Math.max(30, Math.min(300, timePerQuestion));
  };

  // Calculate dynamic time per question based on teacher's start/end times
  // BACKWARD COMPATIBILITY: Supports both formats:
  // - OLD FORMAT: Full date/time objects (existing quizzes in database)
  // - NEW FORMAT: Time-only strings (new quizzes created with time inputs)
  useEffect(() => {
    if (quizdata?.startsAt && quizdata?.endsAt) {
      let startTime: Date;
      let endTime: Date;

      // Check if we have the new time-only format (time strings) or old format (full dates)
      const startsAtStr = quizdata.startsAt.toString();
      const endsAtStr = quizdata.endsAt.toString();

      // Detect format: if it's a time string (HH:MM format), it's the new format
      // Also check if it's already a Date object (old format)
      const isNewFormat = /^\d{2}:\d{2}$/.test(startsAtStr) || /^\d{2}:\d{2}$/.test(endsAtStr);
      const isOldFormat = quizdata.startsAt instanceof Date || quizdata.endsAt instanceof Date;

      // If neither format is detected, try to parse as date (fallback to old format)
      if (!isNewFormat && !isOldFormat) {
        console.log('Format not clearly detected, attempting to parse as date (old format)');
      }

      if (isNewFormat) {
        // New format: time-only strings, convert to today's date with the specified time
        const today = new Date();
        const todayStr = today.toDateString();

        startTime = new Date(`${todayStr} ${startsAtStr}`);
        endTime = new Date(`${todayStr} ${endsAtStr}`);

        console.log('Using new time-only format:', { startsAtStr, endsAtStr });
      } else {
        // Old format: full date/time objects
        startTime = new Date(quizdata.startsAt);
        endTime = new Date(quizdata.endsAt);

        console.log('Using old date/time format:', {
          startsAt: quizdata.startsAt,
          endsAt: quizdata.endsAt
        });
      }

      // Validate dates
      if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
        console.warn('Invalid start or end time in quiz data, using default time');
        return;
      }

      // Calculate actual number of questions (min of 10 or available questions)
      const availableQuestions = quizdata.questions?.length || 0;
      const questionsToShow = Math.min(10, availableQuestions);

      // Calculate time per question using helper function with actual question count
      const finalTimePerQuestion = calculateTimePerQuestion(startTime, endTime, questionsToShow);

      // Calculate total time for logging
      const totalTimeInSeconds = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);

      console.log(`Quiz time calculation (${isNewFormat ? 'NEW' : 'OLD'} format): Total time: ${totalTimeInSeconds}s, Questions: ${questionsToShow}, Per question: ${finalTimePerQuestion}s`);
      console.log('Quiz data format details:', {
        startsAt: quizdata.startsAt,
        endsAt: quizdata.endsAt,
        startsAtType: typeof quizdata.startsAt,
        endsAtType: typeof quizdata.endsAt,
        isNewFormat,
        isOldFormat,
        availableQuestions,
        questionsToShow
      });

      setQuestionTime(finalTimePerQuestion);
      setTimeRemaining(finalTimePerQuestion);
    } else {
      console.log('No start/end time found in quiz data, using default 30 seconds per question');
    }
  }, [quizdata]);

  // Select random questions when component mounts
  useEffect(() => {
    if (quizdata?.questions && quizdata.questions.length > 0) {
      // Calculate how many questions to select (min of 10 or available questions)
      const availableQuestions = quizdata.questions.length;
      const questionsToSelect = Math.min(10, availableQuestions);

      // Shuffle and select random questions
      const shuffled = [...quizdata.questions].sort(() => 0.5 - Math.random());
      const selectedQuestions = shuffled.slice(0, questionsToSelect);

      console.log(`Selected ${questionsToSelect} random questions from ${availableQuestions} available`);

      setRandomQuestions(selectedQuestions);
      setIsLoading(false);
    }
  }, [quizdata]);

  useEffect(() => {
    // Don't start timer if we're at the end of questions
    if (currentQuestion >= randomQuestions?.length) {
      return;
    }

    const timer = setInterval(() => {
      setTimeRemaining((prevTime) => {
        if (prevTime > 1) {
          return prevTime - 1;
        } else {
          handleNextQuestion();
          return questionTime; // Reset timer for next question
        }
      });
    }, 1000);

    return () => clearInterval(timer); // Cleanup the timer
  }, [currentQuestion, randomQuestions?.length, questionTime]);

  const handleSelectAnswer = (answer: string) => {
    setSelectedAnswer(answer);
  };

  const handleNextQuestion = () => {
    // Early return if we're already at the end of questions
    if (currentQuestion >= randomQuestions?.length) {
      return;
    }

    setSelectedAnswers((prev) => [
      ...prev,
      selectedAnswer ? selectedAnswer : "",
    ]);

    // Find the original index of the current random question in the original questions array
    const currentRandomQuestion = randomQuestions[currentQuestion];

    // Check if currentRandomQuestion exists and has _id property
    if (!currentRandomQuestion || !currentRandomQuestion._id) {
      // If we're at the end of questions or question is invalid, proceed to end quiz
      if (currentQuestion >= randomQuestions?.length - 1) {
        Post(`/quiz/student/${quizdata._id}?status=end`).then((d) => {
          if (d.success) {
            // Navigate to result page with quiz data and results
            navigate(RouteName?.QUIZ_RESULT, {
              state: {
                marks: d.data?.marks,
                score: d.data?.score,
                result: d.data?.result,
                quizData: quizdata,
                totalQuestions: d.data?.totalQuestions,
                totalQuizQuestions: d.data?.totalQuizQuestions
              }
            });
          } else {
            displayMessage(d.message);
          }
        });
      }
      return;
    }

    const originalIndex = quizdata.questions?.findIndex((q: any) => q._id === currentRandomQuestion._id) || currentQuestion;

    Post(`/quiz/student/a/${quizdata._id}`, {
      answer: selectedAnswer,
      index: originalIndex,
    }).then((d) => {
      if (d.success) {
        setSelectedAnswer(null);
        //   navigate(RouteName?.SOLO_QUIZ,{state:quizdata})
      } else {
        displayMessage(d.message);
      }
    });

    if (currentQuestion < randomQuestions?.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
      setTimeRemaining(questionTime); // Reset timer for next question
      setSelectedAnswer(null); // Clear selected answer for next question
    } else {
      Post(`/quiz/student/${quizdata._id}?status=end`).then((d) => {
        if (d.success) {
          // Navigate to result page with quiz data and results
          navigate(RouteName?.QUIZ_RESULT, {
            state: {
              marks: d.data?.marks,
              score: d.data?.score,
              result: d.data?.result,
              quizData: quizdata,
              totalQuestions: d.data?.totalQuestions,
              totalQuizQuestions: d.data?.totalQuizQuestions
            }
          });
        } else {
          displayMessage(d.message);
        }
      });
      // Calculate score and alert result
      //   const score = selectedAnswers.reduce((total, answer, index) => {
      //     const question = quizQuestionsData[index];
      //     if (question && answer === question.correctAnswer) {
      //       return total + 1;
      //     }
      //     return total;
      //   }, 0);
    }
  };

  // Show loading screen while selecting random questions
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mx-auto mb-4"></div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Preparing Your Quiz</h2>
          <p className="text-gray-600">Selecting {Math.min(10, quizdata?.questions?.length || 0)} random questions for you...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-screen h-screen bg-mainBg">
      {/* Main Content */}
      <div className="flex flex-col h-screen w-full px-4 py-6 bg-mainBg">
        {/* Header */}
        <div className="w-full h-fit bg-mainBg mb-4 md:mb-6 flex">
          <Navbar title="Professional Assessment" hideSearchBar />
        </div>

        {/* Content */}
        <div className="flex-1 bg-gradient-to-br from-slate-50 to-blue-50 p-6 rounded-2xl overflow-auto">
          <div className="max-w-5xl mx-auto h-full flex flex-col">
            {/* Corporate Header - Ultra Compact */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-3 mb-4">
              {/* Title and Timer */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <div className="bg-blue-100 p-1.5 rounded-md">
                    <MdQuestionAnswer className="text-blue-600 text-lg" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-gray-900">Assessment in Progress</h2>
                  </div>
                </div>

                {/* Timer */}
                <div className="bg-red-50 border border-red-200 rounded-md p-2 flex items-center space-x-1">
                  <MdTimer className="text-red-600 text-sm" />
                  <div>
                    <div className="text-sm font-bold text-red-600">{timeRemaining}s</div>
                  </div>
                </div>
              </div>

              {/* Question count on new line */}
              <div className="flex justify-center mb-2">
                <div className="flex items-center space-x-1 text-sm">
                  <span className="font-bold text-blue-600">{currentQuestion + 1}</span>
                  <span className="text-gray-500">of</span>
                  <span className="font-bold text-gray-800">{randomQuestions?.length || 0}</span>
                </div>
              </div>

              {/* Compact Progress Bar */}
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-600 font-medium">Progress</span>
                <div className="flex-1 mx-3">
                  <div className="bg-gray-200 rounded-full h-1.5">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-blue-600 h-1.5 rounded-full transition-all duration-500"
                      style={{ width: `${((currentQuestion + 1) / (randomQuestions?.length || 1)) * 100}%` }}
                    />
                  </div>
                </div>
                <span className="text-xs text-gray-600 font-semibold">
                  {Math.round(((currentQuestion + 1) / (randomQuestions?.length || 1)) * 100)}%
                </span>
              </div>
            </div>

            {/* Question Content - Compact */}
            <div className="flex-1 flex flex-col">
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-5 flex-1">
                {randomQuestions?.length > 0 && randomQuestions[currentQuestion] && (
                  <div className="h-full flex flex-col justify-between">
                    {/* Question */}
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 mb-5 leading-relaxed">
                        {randomQuestions[currentQuestion]?.question}
                      </h3>

                      {/* Options */}
                      <div className="space-y-3">
                        {randomQuestions[currentQuestion]?.options?.map((option: string, index: number) => (
                          <button
                            key={index}
                            onClick={() => handleSelectAnswer(option)}
                            className={`w-full p-4 rounded-xl border-2 transition-all duration-200 text-left 
                              ${selectedAnswer === option
                                ? 'border-blue-500 bg-blue-50 shadow-md'
                                : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                              }`}
                          >
                            <div className="flex items-center space-x-3">
                              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedAnswer === option
                                ? 'border-blue-500 bg-blue-500'
                                : 'border-gray-300'
                                }`}>
                                {selectedAnswer === option && (
                                  <MdCheckCircle className="text-white text-sm" />
                                )}
                              </div>
                              <span className="text-base text-gray-800 font-medium">{option}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Navigation */}
                    <div className="mt-6 pt-4 border-t border-gray-200">
                      <div className="flex justify-between items-center">
                        <div className="text-xs text-gray-500">
                          Question {currentQuestion + 1} of {randomQuestions?.length || 0}
                        </div>
                        <button
                          onClick={handleNextQuestion}
                          disabled={!selectedAnswer}
                          className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold text-base transition-all duration-200 ${selectedAnswer
                            ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl transform hover:scale-105'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            }`}
                        >
                          <span>
                            {currentQuestion >= (randomQuestions?.length || 0) - 1 ? 'Complete Assessment' : 'Next Question'}
                          </span>
                          <MdArrowForward className="text-lg" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default SoloQuiz;
