import { IoArrowForwardCircle } from "react-icons/io5";

type BodyProps = {
    currentQuestionData: {
        question: string;
        options: string[];
        // answers:string[],
        correctAnswer: string;
        image: string;
    };
    quizQuestionsData: any,
    currentQuestion: number;
    selectedAnswer: string | null;
    handleSelectAnswer: (answer: string) => void;
    handleNextQuestion: any;
    dataLength: number;
};

const Body = ({
    currentQuestionData,
    currentQuestion,
    selectedAnswer,
    quizQuestionsData,
    handleSelectAnswer,
    handleNextQuestion,
    dataLength
}: BodyProps) => {

    return (
        <div className="grid grid-cols-2 gap-4 sm:gap-0 w-full overflow-hidden py-2 lg:py-3 h-fit">

            {/* question */}
            <div className="col-span-2 sm:col-span-1 h-fit">
                <h1 className="font-ubuntu font-medium text-sm md:text-base  2xl:text-lg text-greyBlack  mb-2">
                    {currentQuestion + 1}. {currentQuestionData?.question}
                </h1>
                <div className="mt-5 flex flex-col gap-3 w-4/5">
                    {currentQuestionData?.options?.map((item, index) => (
                        <div
                            key={index}
                            onClick={() => handleSelectAnswer(item)}
                            className={`py-3 sm:py-4 2xl:py-5 2xl:px-8 rounded-xl ${selectedAnswer === item ? 'bg-primary text-white' : 'bg-[#EDEDED] hover:bg-gray-300'} group px-3 sm:px-6 cursor-pointer transition-all delay-50`}
                        >
                            <h1 className={`font-ubuntu font-normal text-xs md:text-sm 2xl:text-base ${selectedAnswer === item ? 'text-white' : 'text-label'} transition-all delay-50`}>
                                {item}
                            </h1>
                        </div>
                    ))}
                </div>
            </div>

            {/* image */}
            <div className="col-span-2 sm:col-span-1 row-start-1 sm:row-start-auto h-fit">
                <img src={quizQuestionsData[currentQuestion % quizQuestionsData?.length]?.image} alt="Question" className="w-full h-44 sm:h-96 md:h-96 lg:h-96 xl:h-96 2xl:h-[450px] object-cover" />
            </div>

            {/* next question button */}
            <div className={`col-span-2 flex items-center justify-end gap-3 cursor-pointer mt-3 lg:mt-5 transition-all delay-200 ${selectedAnswer ? 'visible' : 'invisible disabled'}`} onClick={handleNextQuestion}>
                <h1 className="font-ubuntu font-semibold text-xs md:text-sm 2xl:text-base text-secondary transition-all delay-50">
                    {currentQuestion < dataLength - 1 ? 'Next Question' : 'End Quiz'}
                </h1>
                <IoArrowForwardCircle className="text-xl sm:text-4xl md:text-3xl text-secondary" />
            </div>
        </div>
    );
};

export default Body;
