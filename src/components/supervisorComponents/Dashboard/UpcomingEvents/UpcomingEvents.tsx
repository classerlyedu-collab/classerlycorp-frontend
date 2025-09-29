import { UpcomingEventsArray } from "../../../../constants/supervisor/dashdoard";
const UpcomingEvents = () => {
    return (
        <div className="flex flex-col justify-start items-start" >
            <h1 className="text-sm sm:text-base md:text-lg font-ubuntu font-medium text-greyBlack">Upcoming Event</h1>
            <div className="w-full h-full flex flex-row items-center justify-start flex-wrap">
                {
                    UpcomingEventsArray?.map((item: any, index: number) => (
                        <div key={index?.toString()}>
                            <img src={item} alt="Upcoming event" className="w-30 h-20 md:w-36 md:h-24 lg:w-48 lg:h-28 xl:h-36 xl:w-56 md:mt-3 mt-2 mx-2 rounded-md " />
                        </div>

                    ))
                }
            </div>
        </div>

    )


};

export default UpcomingEvents;