import { useNavigate, useSearchParams } from "react-router-dom";
import { GiTeacher } from "react-icons/gi";
import { RouteName } from "../../../routes/RouteNames";
import { useEffect, useState } from "react";
import { Get, Post } from "../../../config/apiMethods";
import { displayMessage } from "../../../config";
import { Navbar, SideDrawer } from "../../../components";

const QuizConfirmation = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [quizdata, setQuizData] = useState<any>({})
  const [quizes, setQuizes] = useState<any[]>([])
  const [calculatedTime, setCalculatedTime] = useState<number>(300); // Default 5 minutes
  const [actualQuestionCount, setActualQuestionCount] = useState<number>(10); // Default 10 questions
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Helper function to calculate time per question (same logic as SoloQuiz)
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

  // Calculate time when quiz data changes
  useEffect(() => {
    if (quizdata?.startsAt && quizdata?.endsAt && quizdata?.questions) {
      let startTime: Date;
      let endTime: Date;

      // Check if we have the new time-only format (time strings) or old format (full dates)
      const startsAtStr = quizdata.startsAt.toString();
      const endsAtStr = quizdata.endsAt.toString();

      // Detect format: if it's a time string (HH:MM format), it's the new format
      const isNewFormat = /^\d{2}:\d{2}$/.test(startsAtStr) || /^\d{2}:\d{2}$/.test(endsAtStr);

      if (isNewFormat) {
        // New format: time-only strings, convert to today's date with the specified time
        const today = new Date();
        const todayStr = today.toDateString();

        startTime = new Date(`${todayStr} ${startsAtStr}`);
        endTime = new Date(`${todayStr} ${endsAtStr}`);
      } else {
        // Old format: full date/time objects
        startTime = new Date(quizdata.startsAt);
        endTime = new Date(quizdata.endsAt);
      }

      // Validate dates
      if (!isNaN(startTime.getTime()) && !isNaN(endTime.getTime())) {
        // Calculate actual number of questions (min of 10 or available questions)
        const availableQuestions = quizdata.questions.length;
        const questionsToShow = Math.min(10, availableQuestions);

        // Calculate time per question
        const timePerQuestion = calculateTimePerQuestion(startTime, endTime, questionsToShow);

        setCalculatedTime(timePerQuestion);
        setActualQuestionCount(questionsToShow);

        console.log(`Quiz confirmation: ${questionsToShow} questions, ${timePerQuestion}s per question`);
      }
    }
  }, [quizdata]);

  useEffect(() => {

    const quiz = searchParams.get('quiz');
    const topic = searchParams.get('topic');
    const lesson = searchParams.get('lesson');
    setIsLoading(true);
    Get(`/quiz?_id=${quiz}&topic=${topic}&lesson=${lesson}`).then((d) => {
      if (d.success) {
        setQuizes(d.data)
        setQuizData(d.data[0])
        setIsLoading(false);
      } else {
        displayMessage(d.message)
        setIsLoading(false);
      }
    })
  }, []);

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
          <Navbar title="Quiz Confirmation" hideSearchBar />
        </div>

        {/* Content - Original Design */}
        <div className="flex-1 flex items-center justify-center">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#FF8000] mb-4"></div>
              <h2 className="font-ubuntu font-medium text-lg text-greyBlack">Loading Quiz...</h2>
              <p className="font-ubuntu text-sm text-grey mt-2">Please wait while we prepare your quiz</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 md:gap-5 w-full mb-2 md:mb-6 h-fit bg-mainBg rounded-2xl p-5 xl:p-8 2xl:p-10">
              {/* Lessons */}
              <div className="col-span-1 flex flex-row justify-between items-center p-4 shadow-lg bg-white">
                {quizes.length > 1 &&
                  <div className="border border-greyBlack rounded-lg p-2 sm:p-3 cursor-pointer hover:bg-bluecolor group hover:border-transparent transition-all delay-100">
                    <h1 className="font-ubuntu font-medium md:text-base text-xs text-greyBlack group-hover:text-white transition-all delay-100" onClick={(e) => {
                      let i = quizes.findIndex((j: any) => { return j._id === quizdata._id })

                      if (i !== 0) {
                        setQuizData(quizes[i - 1])
                      }
                    }}>
                      Prev Lesson
                    </h1>
                  </div>
                }

                <div className="w-1/2 sm:w-auto">
                  <h1 className="font-ubuntu font-medium md:text-base text-xs text-greyBlack">
                    Lesson : {quizdata?.lesson?.name}
                  </h1>
                </div>
                {quizes.length > 1 &&
                  <div className="border border-greyBlack rounded-lg p-2 sm:p-3 cursor-pointer hover:bg-bluecolor group hover:border-transparent transition-all delay-100">
                    <h1 className="font-ubuntu font-medium md:text-base text-xs text-greyBlack group-hover:text-white transition-all delay-100" onClick={(e) => {
                      let i = quizes.findIndex((j: any) => { return j._id === quizdata._id })
                      if (i !== quizes.length - 1) {
                        setQuizData(quizes[i + 1])
                      }
                    }}>
                      Next Lesson
                    </h1>
                  </div>
                }

              </div>

              {/* Confirmation */}
              <div className="col-span-1 bg-white h-full py-10">
                <div className="flex flex-col justify-center items-center w-full">
                  <GiTeacher className="w-32 h-32 md:w-40 md:h-40 mb-4 text-grey" />

                  <div className="flex flex-col justify-center items-center w-full">
                    <h1 className="font-ubuntu font-medium md:text-xl text-base text-black text-center">
                      Ready For Quiz
                    </h1>
                    <h1 className="font-ubuntu font-medium md:text-sm text-xs text-greyBlack text-center max-w-64">
                      Test yourself with {actualQuestionCount} randomly selected questions from this course and increase your knowledge for what
                      you already know.
                    </h1>
                    <h1 className="font-ubuntu font-medium md:text-sm text-xs text-black pt-3 text-center">
                      {actualQuestionCount} Random Questions (from {quizdata?.questions?.length} available)
                      <span className="pl-2">{calculatedTime} Seconds ({calculatedTime >= 60 ? `${(calculatedTime / 60).toFixed(1)} minutes` : `${calculatedTime} seconds`} per question)</span>
                    </h1>
                    <div className={`rounded-md px-3 py-2 mt-2 transition-all duration-200 ${isLoading || !quizdata?._id
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-[#FF8000] cursor-pointer hover:opacity-80'
                      }`}>
                      <h1 className="font-ubuntu font-medium text-sm text-white"
                        onClick={() => {
                          if (isLoading || !quizdata?._id) return;
                          Post(`/quiz/student/${quizdata._id}?status=start`).then((d) => {

                            if (d.success) {

                              navigate(RouteName?.SOLO_QUIZ, { state: quizdata })
                            } else {
                              displayMessage(d.message, "error")
                            }
                          })
                          // localStorage.setItem("quiz",JSON.stringify(quizdata))
                        }
                        }
                      >
                        {isLoading ? 'Loading...' : "Let's Start"}
                      </h1>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizConfirmation;
