import { useNavigate } from "react-router-dom";
import { RouteName } from "../../../../routes/RouteNames";

const Challenges = () => {
    const navigate = useNavigate();

    return (
        <div className="w-full h-full rounded-2xl flex flex-row justify-center items-center relative">

            <img
                className="rounded-2xl w-full h-full object-contain"
                src={require('../../../../images/students/quizChallenge.png')}
                alt="Quiz Challenge"
            />

            <div className="absolute bg-blue-600 py-2 px-5 rounded-full cursor-pointer group hover:bg-white hover:border border-greyBlack bottom-10 sm:bottom-1 md:bottom-4 lg:bottom-3 xl:bottom-10 2xl:bottom-14 transition-all delay-100"
                onClick={() => navigate(RouteName?.DAILY_QUIZ)}
            >
                <h3 className="font-ubuntu text-mainBg font-medium text-sm md:text-xs lg:text-base 2xl:text-lg group-hover:text-greyBlack text-center transition-all delay-100" >Find Friends</h3>

            </div>

        </div>
    )
}
export default Challenges;