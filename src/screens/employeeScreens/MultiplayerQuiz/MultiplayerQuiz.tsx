import { useEffect, useState } from "react";
import { HeaderMultiplayerQuiz, ImageSectionMultiplayerQuiz, QuestionMultiplayerQuiz } from "../../../components";
import { quizQuestionsData } from "../../../constants/employee/Quiz";
import { IoArrowForwardCircle } from "react-icons/io5";

const MultiplayerQuiz = () => {

    const [currentQuestion, setCurrentQuestion] = useState<number>(0);
    const [timeRemaining, setTimeRemaining] = useState<number>(15);
    const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const questionTime = 15;

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeRemaining(prevTime => {
                if (prevTime > 1) {
                    return prevTime - 1;
                } else {
                    handleNextQuestion();
                    return questionTime; // Reset timer for next question
                }
            });
        }, 1000);

        return () => clearInterval(timer); // Cleanup the timer
    }, [currentQuestion]);

    const handleSelectAnswer = (answer: string) => {
        setSelectedAnswer(answer);
    };

    const handleNextQuestion = () => {
        setSelectedAnswers(prev => [...prev, selectedAnswer ? selectedAnswer : '']);
        setSelectedAnswer(null);
        if (currentQuestion < quizQuestionsData?.length - 1) {
            setCurrentQuestion(prev => prev + 1);
            setTimeRemaining(questionTime); // Reset timer for next question
        } else {
            // Calculate score and alert result
            const score = selectedAnswers.reduce((total, answer, index) => {
                const question = quizQuestionsData[index];
                if (question && answer === question.correctAnswer) {
                    return total + 1;
                }
                return total;
            }, 0);
            alert(`You scored ${score} out of ${quizQuestionsData?.length}`);
        }
    };

    const handleSkip = () => {
        // Record a skipped question as an empty string
        setSelectedAnswers(prev => [...prev, '']);
        setSelectedAnswer(null);
        if (currentQuestion < quizQuestionsData?.length - 1) {
            setCurrentQuestion(prev => prev + 1);
            setTimeRemaining(questionTime); // Reset timer for next question
        } else {
            // Calculate score and alert result
            const score = selectedAnswers.reduce((total, answer, index) => {
                const question = quizQuestionsData[index];
                if (question && answer === question.correctAnswer) {
                    return total + 1;
                }
                return total;
            }, 0);
            alert(`You scored ${score} out of ${quizQuestionsData?.length}`);
        }
    };

    return (
        <div className="select-none grid grid-cols-1 gap-5 md:gap-5 w-full mb-2 md:mb-6 h-fit bg-white rounded-2xl p-5 xl:p-8 2xl:p-10" >

            {/* header */}
            <div className="col-span-1" >
                <HeaderMultiplayerQuiz
                    currentQuestion={currentQuestion}
                    totalQuestions={quizQuestionsData?.length}
                    timeRemaining={timeRemaining}
                />
            </div>

            {/* question */}
            <div className="col-span-1" >
                <QuestionMultiplayerQuiz
                    currentQuestionData={quizQuestionsData[currentQuestion]}
                    currentQuestion={currentQuestion}
                    selectedAnswer={selectedAnswer}
                    handleSelectAnswer={handleSelectAnswer}
                    handleNextQuestion={handleNextQuestion}
                    dataLength={quizQuestionsData?.length}
                />
            </div>

            {/* image section */}
            <div className="col-span-1" >
                <ImageSectionMultiplayerQuiz />
            </div>

            {/* footer */}
            <div className="col-span-1 w-full py-5 px-4 rounded-2xl grid grid-cols-2 sm:grid-cols-3" >

                <div className="col-span-1 hidden sm:flex" />

                <div
                    onClick={handleSkip}
                    className={`col-span-1 h-8 md:h-10  bg-gradient-to-r  from-primary to-secondary flex justify-center items-center rounded-full cursor-pointer hover:opacity-80`}>
                    <p className="text-white text-sm md:text-base font-normal">Skip</p>
                </div>

                {/* next question button */}
                <div className={`col-span-1 flex items-center justify-end gap-3 cursor-pointer hover:opacity-80 transition-transform delay-200 ${selectedAnswer ? 'visible' : 'invisible disabled'}`} onClick={handleNextQuestion}>
                    <h1 className="font-ubuntu font-semibold text-xs md:text-sm 2xl:text-base text-secondary transition-all delay-50">
                        {currentQuestion < quizQuestionsData?.length - 1 ? 'Next Question' : 'End Quiz'}
                    </h1>
                    <IoArrowForwardCircle className="text-xl sm:text-4xl md:text-3xl text-secondary" />
                </div>

            </div>


        </div>
    )
};

export default MultiplayerQuiz;
