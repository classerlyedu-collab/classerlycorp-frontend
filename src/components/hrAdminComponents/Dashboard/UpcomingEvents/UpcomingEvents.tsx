import { CiClock2 } from "react-icons/ci";
import { BsCalendar4 } from "react-icons/bs";
import { UpcomingEventsData } from "../../../../constants/HRAdmin/Dashboard";
const UpcomingEvents = () => {
    return (
        /*main div*/
        <div className="w-full px-3">

            <div className="flex justify-between items-start w-full ">

                <div>
                    <h1 className="font-ubuntu font-medium text-base md:text-xl text-greyBlack  mb-2">Upcoming events</h1>
                </div>

                {/* <div className="border border-greyBlack rounded-md py-1 px-1.5 cursor-pointer group hover:bg-greyBlack transition-all delay-100">
                    <p className="text-xs group-hover:text-white transition-all delay-150">See All</p>
                </div> */}

            </div>

            <div className="overflow-y-auto max-h-96" >
                <div className="w-full bg-white shadow-md"
                >
                    <h3 className="text-sm font-ubuntu font-medium">No any events availabel</h3>

                </div>
                {/* {
                    UpcomingEventsData?.map((item, index) => (
                        <div id={index?.toString()} className="w-full bg-white shadow-md
                        mb-2 rounded-md flex flex-row justify-start p-2 items-start">

                            
                            <img className="w-16 h-16 rounded-md mr-2 object-cover" src={item.image} alt="event image" />

                          
                            <div className="w-full h-full">

                                <h3 className="text-sm font-ubuntu font-medium">{item.meetingsName}</h3>

                                <div className="flex items-center justify-between w-full mt-1" >

                                    <div className="flex items-center" >
                                    <CiClock2 className="text-sm mr-1" style={{color: '#8C8C8C'}}/>
                                        <h6 className="text-xs mr-2 text-grey font-ubuntu font-normal" >{item.startTime} <span className="pl-1 text-xs">-</span></h6>
                                        <h6 className="text-xs text-grey font-ubuntu font-normal" >{item.endTime}</h6>
                                    </div>
                                    <div className="flex justify-center items-center ">
                                    <BsCalendar4 className="text-sm pr-1" style={{color: '#8C8C8C'}}/>
                                    <p className="text-xs text-grey font-ubuntu font-normal">{item.date}</p>
                                    </div>   
                                </div>

                            </div>

                        </div>




                    ))
                } */}

            </div>
        </div >


    )
};
export default UpcomingEvents;   