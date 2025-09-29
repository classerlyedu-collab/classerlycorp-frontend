import { lessonsData } from "../../../../constants/HRAdmin/Dashboard";
import { HiOutlinePencil } from "react-icons/hi2";
import { getRandomColor } from "../../../../utils/randomColorGenerator";

const Lessons = () => {

    return (
        <div className="w-full px-3 h-full">

            <div className="flex justify-between items-start w-full h-full">

                <div>
                    <h1 className="font-ubuntu font-medium text-base md:text-xl text-greyBlack  mb-2">Lessons</h1>
                </div>

                {/* <div className="border border-greyBlack rounded-md py-1 px-1.5 cursor-pointer group hover:bg-greyBlack transition-all delay-100">
                    <p className="text-xs group-hover:text-white transition-all delay-150">See All</p>
                </div> */}

            </div>
            <div className="overflow-y-auto max-h-52 md:max-h-96 lg:max-h-56">
                {
                    lessonsData?.map((item: any, index: number) => (

                        <div id={index?.toString()} className="w-full h-20 bg-white shadow-md mb-2 rounded-md flex flex-row justify-start items-center">

                            <div className="w-1.5 h-full rounded-l-md"
                                style={{
                                    background: getRandomColor('light', index)
                                }} />

                            <div className="flex w-full h-full justify-between items-center p-2">
                                <div className="flex flex-col">
                                    <p className="text-xs text-grey font-ubuntu font-normal">{item.subjectName}</p>
                                    <h6 className="text-greyBlack text-sm md:text-base font-ubuntu font-semibold">{item.topic}</h6>
                                    <div className="flex justify-start items-center">
                                        <h6 className="text-sm text-grey font-ubuntu font-normal">{item.startTime}<span className="pl-1 text-xs">-</span> </h6>
                                        <h6 className="text-sm text-grey font-ubuntu font-normal">{item.endTime}</h6>
                                    </div>
                                </div>
                                <HiOutlinePencil className="text-2xl cursor-pointer hover:text-purple" />
                            </div>

                        </div>

                    ))
                }

            </div>
        </div>
    )
};
export default Lessons;