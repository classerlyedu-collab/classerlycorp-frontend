import { useNavigate } from "react-router-dom";
import { RouteName } from "../../../../routes/RouteNames";

const FeaturedCategories = () => {

    const navigate = useNavigate();

    return (
        <div className="w-full">
            <h3 className="font-ubuntu font-medium text-base md:text-xl text-greyBlack py-3 mb-2">
                Featured Category
            </h3>
            <div className="flex flex-row gap-4 flex-wrap sm:flex-nowrap">
                <div className="relative">
                    <img
                        className=""
                        src={require("../../../../images/students/quiz/single.png")}
                        alt="Solo Quiz"
                    />

                    <div
                        onClick={() => navigate(RouteName?.SOLO_QUIZ)}
                        className="flex justify-center items-center absolute top-16 left-12 sm:top-8 sm:left-6 md:top-12 md:left-10 lg:top-14 lg:left-12 xl:top-16  xl:left-12 py-2 px-6 rounded-2xl bg-[rgba(255,255,255,0.3)] hover:bg-[rgba(255,255,255,0.5)] cursor-pointer transition duration-200">
                        <h4 className="text-white text-sm font-ubuntu font-normal">Play</h4>
                    </div>
                </div>


                {/* <div className="relative">
                    <img
                        className=""
                        src={require("../../../../images/students/quiz/multi.png")}
                        alt="image"
                    />

                    <div
                        onClick={() => navigate(RouteName?.MULTIPLAYER_QUIZ)}
                        className="flex justify-center items-center absolute top-16 left-12 sm:top-8 sm:left-6 md:top-12 md:left-10 lg:top-14 lg:left-12 xl:top-16  xl:left-12 py-2 px-6 rounded-2xl bg-[rgba(255,255,255,0.3)] hover:bg-[rgba(255,255,255,0.5)] cursor-pointer transition duration-200">
                        <h4 className="text-white text-sm font-ubuntu font-normal">Play</h4>
                    </div>

                </div> */}

                <div className="relative">

                    <img
                        className=""
                        src={require("../../../../images/students/quiz/ranking.png")}
                        alt="Ranking"
                    />

                    <div className="flex justify-center items-center absolute top-16 left-12 sm:top-8 sm:left-6 md:top-12 md:left-10 lg:top-14 lg:left-12 xl:top-16  xl:left-12 py-2 px-6 rounded-2xl bg-[rgba(255,255,255,0.3)] hover:bg-[rgba(255,255,255,0.5)] cursor-pointer transition duration-200">
                        <h4 className="text-white text-sm font-ubuntu font-normal">View</h4>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FeaturedCategories;
