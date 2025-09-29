import { useNavigate } from "react-router-dom";
import { RouteName } from "../../../../routes/RouteNames";

const FeaturedGame = () => {

    const navigate = useNavigate();

    return (
        <div className="w-full h-full rounded-2xl flex flex-row justify-start items-start relative">

            <img
                className="rounded-2xl w-full h-full object-contain"
                src={require('../../../../images/students/gamesStudent.png')}
                alt="Quiz Challenge"
            />

            <div className="absolute bottom-14 sm:top-8 md:top-10 lg:top-12 xl:top-16 2xl:top-20 left-10 lg:left-20" >
                <h3 className="font-ubuntu text-greyBlack font-semibold text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl 2xl:text-3xl" >Play Games</h3>
                <h6 className="font-ubuntu font-medium text-greyBlack text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl mt-2 md:mt-3" >Take part in playing games</h6>
            </div>

            <div className="absolute bg-sky-500 py-2 px-3 sm:px-12 rounded-full cursor-pointer group hover:bg-white hover:border border-greyBlack transition-all delay-100 bottom-3 sm:bottom-1 md:bottom-4 lg:bottom-3 xl:bottom-10 2xl:bottom-14 left-10 lg:left-20"
                onClick={() => navigate(RouteName?.DAILY_QUIZ_ROOT)}
            >
                <h3 className="font-ubuntu text-mainBg font-medium text-xs md:text-xs lg:text-base 2xl:text-lg group-hover:text-greyBlack text-center transition-all delay-100" >Play Now</h3>
            </div>

        </div>
    )
}
export default FeaturedGame;