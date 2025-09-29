import { UpcomingMeetingsObject } from "../../../../constants/supervisor/dashdoard";

const UpcomingMeetings = () => {
    return (
        <div className="w-full h-full border-2 bg-white flex flex-col justify-start items-start rounded-xl" >
            <div className="flex flex-row w-full justify-between py-3 px-3">
                <h1 className="text-bluecolor text-xs md:text-sm font-ubuntu font-medium" >Upcoming Meetings</h1>
                <h1 className="text-bluecolor text-xs md:text-sm font-ubuntu font-medium cursor-pointer">View More</h1>
            </div>
            {
                UpcomingMeetingsObject?.map((item: any, index: number) => (
                    <div className="w-full flex flex-col justify-between rounded-lg  justify-items-center px-6 mb-4" >
                        <h1 className="text-xs md:text-sm font-ubuntu font-bold text-[#4D4D4D]">{item?.title}</h1>
                        <div className="flex flex-row justify-between">
                            <h1 className="text-xs md:text-sm font-ubuntu font-semibold text-[#FF4242]">{item?.grade}</h1>
                            <h1 className="text-xs md:text-sm font-ubuntu font-medium text-[#9791D0]">{item?.time}</h1>
                        </div>
                        <div className={` ${index === UpcomingMeetingsObject?.length - 1 ? 'border-none' : 'border-b border-grey-300 '} w-full flex flex-row justify-between pb-2 md:pb-3`}>
                            <h1 className="text-xs md:text-sm font-ubuntu font-bold text-[#4BBDBD]">{item?.teacherName}</h1>
                            <h1 className="text-xs md:text-sm font-ubuntu font-medium text-[#219562]">{item?.date}</h1>
                        </div>
                    </div>
                ))
            }
        </div>
    )
};

export default UpcomingMeetings;