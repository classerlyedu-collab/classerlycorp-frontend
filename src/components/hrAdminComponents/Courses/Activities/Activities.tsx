import { buildStyles, CircularProgressbarWithChildren } from 'react-circular-progressbar';
import { SlArrowDown } from "react-icons/sl";

const Activities = () => {
    return (
        <div className="bg-white w-full flex flex-col items-center rounded-xl">
            {/* Header */}
            <div className="flex justify-between px-3 w-full py-6">
                <div className="flex justify-center items-center">
                    <h1 className="font-ubuntu font-medium text-lg md:text-lg text-greyBlack">Activities</h1>
                </div>
                <div className="flex justify-center items-center cursor-pointer md:pr-3">
                    <h6 className="text-sm md:text-base font-ubuntu font-normal text-greyBlack">Week</h6>
                    <SlArrowDown className="pl-1 text-xs text-greyBlack" size={15} />
                </div>
            </div>

            {/* Circular Progress Bar */}
            <div className='w-full flex justify-center mt-6'>
                <div className='w-2/5 md:w-1/3 xl:w-2/5 flex items-center justify-center mb-5'>
                    <CircularProgressbarWithChildren
                        value={76}
                        maxValue={100}
                        minValue={0}
                        strokeWidth={8}
                        styles={buildStyles({
                            strokeLinecap: 'round',
                            pathColor: '#FFA818',
                            trailColor: '#E56490',
                            backgroundColor: '#3e98c7',
                        })}
                    >
                        <div className='flex flex-col w-full h-full justify-center items-center'>
                            <h1 className="font-ubuntu text-3xl md:text-xl xl:text-3xl font-semibold text-greyBlack">76 %</h1>
                        </div>
                    </CircularProgressbarWithChildren>
                </div>
            </div>

            {/* Activity Details */}
            <div className="w-full px-10">
                {/* Study Section */}
                <div className="flex flex-row justify-between items-center border-b border-grey py-3 px-4 md:px-6">
                    <div className='flex justify-center items-center'>
                        <div className="w-3 h-3 md:w-4 md:h-4 bg-purple mr-1 rounded-sm" />
                        <p className="text-base font-ubuntu font-medium text-greyBlack">Study</p>
                    </div>
                    <div>
                        <p className='text-base font-ubuntu font-medium text-greyBlack'>57%</p>
                    </div>
                </div>
                {/* Exams Section */}
                <div className="flex flex-row justify-between items-center py-3 px-4 md:px-6">
                    <div className='flex justify-center items-center'>
                        <div className="w-3 h-3 md:w-4 md:h-4 mr-1 rounded-sm" style={{ backgroundColor: '#FFA818' }} />
                        <p className="text-base font-ubuntu font-medium text-greyBlack">Exams</p>
                    </div>
                    <div>
                        <p className='text-base font-ubuntu font-medium text-greyBlack'>19%</p>
                    </div>
                </div>
            </div>
        </div>
    )
};

export default Activities;
