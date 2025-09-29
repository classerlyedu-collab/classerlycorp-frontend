import { MdOutlineArrowDropDown } from "react-icons/md";
import { getRandomColor } from "../../../../utils/randomColorGenerator";

type footerPropsType = {
    currentQuestion: number;
    totalQuestions: number;
};

const Footer = ({
    currentQuestion,
    totalQuestions
}: footerPropsType) => {

    return (
        <div className="relative pt-4" >

            <div className="w-full bg-white shadow-[inset_0_-2px_4px_rgba(0,0,0,0.2)] py-3 mt-3 px-1 sm:px-4 rounded-full flex flex-row justify-around items-center">

                {Array.from({ length: totalQuestions }).map((_, index) => (
                    <div key={index} className={`w-5 h-5 sm:h-8 sm:w-8 md:w-12 md:h-12 lg:w-12 lg:h-12 rounded-full flex items-center justify-center`} style={{
                        background: getRandomColor('dark', index, 0.8)
                    }}>
                        <h1 className="font-ubuntu font-medium text-xs sm:text-sm md:text-base  2xl:text-lg text-white">{index + 1}</h1>

                        <MdOutlineArrowDropDown className={`text-xl sm:text-4xl md:text-6xl text-greyBlack top-2 sm:top-1 md:-top-3 ${index === currentQuestion ? 'absolute' : 'hidden'}`} />

                    </div>
                ))}

            </div>

        </div>
    )
}
export default Footer;