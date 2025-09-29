import { NewCoursesData } from "../../../../constants/HRAdmin/courses";
import { SlArrowRight } from "react-icons/sl";
import { getRandomColor } from "../../../../utils/randomColorGenerator";

const NewCourses = ({ newCourses }: any) => {
    return (
        <div className="h-full w-full overflow-y-auto max-h-72 sm:max-h-72 md:max-h-96">

            <h1 className="font-ubuntu font-medium text-lg md:text-xl text-greyBlack mb-3 md:mb-5">New Courses</h1>

            <div className="flex justify-around sm:justify-start gap-3 md:gap-5 h-full flex-wrap items-start">
                {newCourses?.map((item: any, index: any) => (
                    <div id={index?.toString()} className="relative w-36 h-full sm:w-48 min-h-60 sm:min-h-64 lg:min-h-72 md:w-48 lg:w-52 p-2.5 rounded-md" style={{
                        background: getRandomColor('dark', index, 0.2)
                    }}>

                        <div className=" flex justify-center items-center w-full  rounded-md" style={{
                            background: getRandomColor('dark', index)
                        }}>
                            <img className="w-1/2 py-2 rounded-md object-contain" src={item?.image} alt="img" />
                        </div>

                        <div className="pt-3">
                            <p className="text-xs text-grey font-ubuntu font-medium">{item.topics?.length} Topics</p>
                            <h4 className="text-greyBlack font-ubuntu font-medium text-sm md:text-base">{item.name} </h4>
                            {/* <p className="text-grey font-ubuntu font-semibold text-xs md:text-sm">{item.status}</p> */}
                        </div>

                        <div className="flex justify-end absolute bottom-2 right-2" >

                            <div className="flex justify-center items-center w-10 h-10 hover:w-12 transition-all delay-50 bg-blue-400 rounded-md hover:p-2 cursor-pointer" style={{
                                background: getRandomColor('dark', index)
                            }}>
                                <SlArrowRight className="text-white font-bold text-lg " style={{ fontWeight: 'bold' }} />
                            </div>

                        </div>
                    </div>

                ))}
            </div>
        </div>
    );
};

export default NewCourses;
