import { NewsObject } from "../../../../constants/supervisor/dashdoard";

const News = () => {
    return (
        <div className="w-full h-full  bg-white flex flex-col justify-start items-start py-2 pt-4 px-3 md:px-2 rounded-2xl">
            <div className="flex flex-row w-full justify-between items-center mb-2 md:mb-3">
                <h1 className="text-bluecolor md:text-sm text-xs font-medium">Latest News</h1>
                <h1 className="text-bluecolor md:text-sm text-xs font-medium cursor-pointer">View More</h1>
            </div>
            <div className="w-full overflow-y-auto scrollbar scrollbar-thin scrollbar-thumb-gray-400 pb-2"> {/* Adjust the height as needed */}
                {
                    NewsObject?.map((item, index) => (
                        <div key={index} className="flex flex-row items-center justify-start w-full">
                            <img src={item?.image} alt="format" className="w-20 md:w-32 h-20 md:h-28 mr-2 md:mr-3" />
                            <div className={`flex flex-col w-full justify-center items-start ${index === NewsObject?.length - 1 ? 'border-none' : 'border-b border-gray-300'} mr-2 py-3`}>

                                <h5 className="text-xs md:text-sm font-bold font-ubuntu text-label">{item.date}</h5>
                                <h5 className="text-xs md:text-sm font-medium font-ubuntu text-lightGreen">{item?.title}</h5>
                                <h5 className="text-xs md:text-sm text-lightPurple font-medium cursor-pointer">{item?.description}</h5>
                            </div>
                        </div>
                    ))
                }
            </div>
        </div>
    );
};

export default News;