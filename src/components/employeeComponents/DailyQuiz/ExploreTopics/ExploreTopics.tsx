import { exploretopicsData } from "../../../../constants/employee/Quiz";
import { getRandomColor } from "../../../../utils/randomColorGenerator";
const ExploreTopics = () => {
    return (
        <div className="w-full mb-4">
            <h3 className="font-ubuntu font-medium text-base md:text-xl text-greyBlack py-3 mb-2">
                Explore Topics
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto max-h-96 md:max-h-96">
                {exploretopicsData?.map((item, index) => (
                    <div id={index?.toString()} key={index} className="flex flex-row justify-between items-center py-4 px-6 lg:px-6 lg:py-3
                    shadow-xl cursor-pointer hover:opacity-85" style={{
                        background: getRandomColor('dark', index, 0.9),
                        borderRadius: '60px'
                    }}>
                        <div className="h-5/6 flex flex-col justify-between">
                            <h4 className="font-ubuntu font-semibold text-lg text-white">{item.title}</h4>
                            <p className="font-ubuntu font-thin text-lg text-white">{item.quizzes} {item.quizzes > 1 ? 'Quizzes' : 'Quiz'}</p>
                        </div>
                        <img className="w-20 h-20 mt-2" src={item.image} alt="images" />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ExploreTopics;
