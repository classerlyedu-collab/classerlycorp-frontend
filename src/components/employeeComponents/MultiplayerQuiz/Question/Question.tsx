import { IoArrowForwardCircle } from "react-icons/io5";

type BodyProps = {
    currentQuestionData: {
        question: string;
        answers: string[];
        correctAnswer: string;
        image: string;
    };
    currentQuestion: number;
    selectedAnswer: string | null;
    handleSelectAnswer: (answer: string) => void;
    handleNextQuestion: any;
    dataLength: number;
};

const Question = ({
    currentQuestionData,
    currentQuestion,
    selectedAnswer,
    handleSelectAnswer,
    handleNextQuestion,
    dataLength
}: BodyProps) => {

    return (
        <div className="grid grid-cols-2 gap-4 xl:gap-6 w-full overflow-hidden py-2 lg:py-3 h-fit">

            {/* question */}
            <div className="col-span-2 sm:col-start-2 sm:row-start-1 sm:col-span-1 h-fit">
                <h1 className="font-ubuntu font-medium text-sm md:text-base  2xl:text-lg text-greyBlack  mb-2">
                    {currentQuestion + 1}. {currentQuestionData?.question}
                </h1>
                <div className="mt-5 flex flex-col gap-3 w-4/5">
                    {currentQuestionData?.answers?.map((item, index) => (
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
            <div className="col-span-2 sm:col-start-1 sm:col-span-1 row-start-1 h-fit">
                <img alt="Question" src={currentQuestionData?.image ? currentQuestionData?.image : require('../../../../images/register/slider1.png')} className="w-full h-44 sm:h-72 md:h-72 lg:h-72 xl:h-80 2xl:h-[400px] object-cover" />
            </div>


        </div>
    );
};

export default Question;
