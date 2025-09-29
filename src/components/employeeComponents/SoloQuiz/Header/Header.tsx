import { LuClock9 } from "react-icons/lu";

type headerPropsType = {
    currentQuestion: number;
    totalQuestions: number;
    timeRemaining: number;
};

const Header = ({
    currentQuestion,
    totalQuestions,
    timeRemaining
}: headerPropsType) => {

    return (
        <div className="w-full bg-white py-3 border-b border-grey md:py-5 flex flex-row justify-between items-center">

            <div className="flex items-end justify-start" >
                <h3 className="mr-2 text-base md:text-xl lg:text-2xl font-trykker font-semibold text-primary" >Question</h3>
                <h3 className="font-trykker text-xl md:text-4xl lg:text-5xl text-primary font-normal" >{currentQuestion+1}</h3>
                <h3 className="font-trykker text-lg md:text-3xl mlg:text-4xl text-primary font-normal" >/{totalQuestions}</h3>
            </div>

            <div className="flex items-center justify-end" >
                <LuClock9 className="text-lg md:text-2xl xl:text-3xl text-orange-400 mr-1" />
                <h1 className={`font-ubuntu text-sm xl:text-xl font-medium ${timeRemaining < 6 ? 'text-red-500 animate-pulse' : 'text-greyBlack'}`}>{timeRemaining}s</h1>
            </div>

        </div>
    )
}
export default Header;