import { useState, useEffect } from "react";
import { Get } from "../../../../config/apiMethods";
import { displayMessage } from "../../../../config";

const TopicDetails = ({ topic, loading }: any) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [dynamicTopicsData, setDynamicTopicsData] = useState<any[]>([]);

    // Create dynamic topics data from the actual topic data
    useEffect(() => {
        if (topic && topic.length > 0) {
            const formattedTopics = topic.map((item: any, index: number) => ({
                id: item._id,
                title: item.name || `Topic ${index + 1}`,
                description: item.description || 'Training topic for skill development and knowledge enhancement.',
                image: item.image || require('../../../../images/students/topics/slider1.jpg'),
                difficulty: item.difficulty || 'Beginner',
                lessonsCount: item.lessons?.length || 0,
                quizzesCount: item.quizes?.length || 0
            }));
            setDynamicTopicsData(formattedTopics);
        }
    }, [topic]);

    // Use dynamic data or fallback to static data if no topics available
    const topicsSliderData = dynamicTopicsData.length > 0 ? dynamicTopicsData : [
        {
            id: 'default-1',
            title: 'No Topics Available',
            description: 'Contact your HR-Admin to get training topics assigned.',
            image: require('../../../../images/students/topics/slider1.jpg'),
            difficulty: 'Beginner',
            lessonsCount: 0,
            quizzesCount: 0
        }
    ];


    // const [searchParams] = useSearchParams();

    const [subject, setSubject] = useState<any>({})
    useEffect(() => {

        // const subject = searchParams.get('subject');
        let sub: any = localStorage.getItem("subject")
        setSubject(JSON.parse(sub))


        // Get(`/subject/grade/${subject}`).then((d)=>{
        //     if(d.success){
        //         // setTopics(d.data)
        //     }else{
        //         displayMessage(d.message)
        //     }
        // })
        // Function to update the current index every 4 seconds
        const interval = setInterval(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % topicsSliderData?.length);
        }, 4000);

        // Cleanup interval on component unmount
        return () => clearInterval(interval);
    }, []);

    const currentTopic = topicsSliderData[currentIndex]; // Get the current topic data

    // Loading skeleton for TopicDetails
    if (loading) {
        return (
            <div className="w-full rounded-xl pb-6">
                <div className="animate-pulse">
                    <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
                    <div className="w-full h-64 bg-gray-200 rounded-lg mb-4"></div>
                    <div className="flex justify-center gap-3">
                        <div className="w-3 h-3 bg-gray-200 rounded-full"></div>
                        <div className="w-3 h-3 bg-gray-200 rounded-full"></div>
                        <div className="w-3 h-3 bg-gray-200 rounded-full"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full rounded-2xl pb-6 bg-gradient-to-br from-pink-50 to-blue-50 shadow-lg border border-pink-100">
            {/* Kid-friendly header */}
            <div className="bg-gradient-to-r from-pink-500 to-blue-500 rounded-t-2xl p-4">
                <div className="flex items-center space-x-3">
                    <div className="text-2xl">🌟</div>
                    <div>
                        <h1 className="font-bold text-lg md:text-xl text-white">
                            {subject.name || "Featured Topics"}
                        </h1>
                        <p className="text-pink-100 text-sm">
                            Discover amazing learning adventures! 🚀
                        </p>
                    </div>
                </div>
            </div>

            <div className="p-4">
                {/* Enhanced carousel container */}
                <div className="relative bg-white rounded-xl shadow-md overflow-hidden">
                    {/* Main carousel image */}
                    <div className="relative h-48 md:h-56">
                        <img
                            src={currentTopic?.image}
                            alt={currentTopic?.title}
                            className="w-full h-full object-cover transition-all duration-500"
                        />

                        {/* Gradient overlay for better text readability */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>

                        {/* Enhanced text overlay */}
                        <div className="absolute bottom-0 left-0 right-0 p-4">
                            <div className="flex items-center space-x-2 mb-2">
                                <div className="w-6 h-6 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                                    <span className="text-white text-sm">📚</span>
                                </div>
                                <span className="text-white text-xs font-medium bg-white bg-opacity-20 px-2 py-1 rounded-full">
                                    Topic {currentIndex + 1} of {topicsSliderData.length}
                                </span>
                            </div>

                            <h2 className="text-lg md:text-xl font-bold text-white mb-1 drop-shadow-lg">
                                {currentTopic?.title}
                            </h2>

                            <p className="text-white text-xs md:text-sm opacity-90 leading-relaxed line-clamp-2">
                                {currentTopic?.description}
                            </p>
                        </div>

                        {/* Navigation arrows */}
                        <button
                            onClick={() => setCurrentIndex(currentIndex === 0 ? topicsSliderData.length - 1 : currentIndex - 1)}
                            className="absolute left-2 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full flex items-center justify-center text-white transition-all duration-200 backdrop-blur-sm"
                        >
                            <span className="text-lg">←</span>
                        </button>

                        <button
                            onClick={() => setCurrentIndex(currentIndex === topicsSliderData.length - 1 ? 0 : currentIndex + 1)}
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full flex items-center justify-center text-white transition-all duration-200 backdrop-blur-sm"
                        >
                            <span className="text-lg">→</span>
                        </button>
                    </div>

                    {/* Enhanced navigation dots */}
                    <div className="p-3 bg-gradient-to-r from-pink-50 to-blue-50">
                        <div className="flex justify-center items-center space-x-3">
                            {topicsSliderData?.map((item, index) => (
                                <button
                                    key={index}
                                    onClick={() => setCurrentIndex(index)}
                                    className={`transition-all duration-300 ${index === currentIndex
                                        ? 'w-8 h-3 bg-gradient-to-r from-pink-500 to-blue-500 rounded-full shadow-md'
                                        : 'w-3 h-3 bg-gray-300 hover:bg-gray-400 rounded-full'
                                        }`}
                                />
                            ))}
                        </div>

                        {/* Topic preview thumbnails */}
                        <div className="flex justify-center space-x-2 mt-3">
                            {topicsSliderData?.slice(0, 3).map((item, index) => (
                                <div
                                    key={index}
                                    className={`w-12 h-8 rounded-lg overflow-hidden cursor-pointer transition-all duration-200 ${index === currentIndex
                                        ? 'ring-2 ring-pink-500 shadow-md'
                                        : 'opacity-60 hover:opacity-80'
                                        }`}
                                    onClick={() => setCurrentIndex(index)}
                                >
                                    <img
                                        src={item.image}
                                        alt={item.title}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default TopicDetails;
