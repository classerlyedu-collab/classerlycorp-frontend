import { ExploreTopicsDailyQuiz, FeaturedCategoriesDailyQuiz, WelcomeDailyQuiz } from "../../../components";

const DailyQuiz = () => {

    return (
        <div className="grid grid-cols-1 gap-5 md:gap-5 w-full mb-2 md:mb-6 h-fit" >

            {/* Welcome */}
            <div className="col-span-1" >
                <WelcomeDailyQuiz />
            </div>

            {/* Featured category */}
            <div className="col-span-1" >
                <FeaturedCategoriesDailyQuiz />
            </div>

            {/* Explore Topics */}
            <div className="col-span-1" >
                <ExploreTopicsDailyQuiz />
            </div>


        </div>
    )
};

export default DailyQuiz;
