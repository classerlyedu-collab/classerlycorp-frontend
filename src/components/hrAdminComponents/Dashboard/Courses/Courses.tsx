import { grey } from "@mui/material/colors";
import { BsCalendar4 } from "react-icons/bs";
import { CiClock2 } from "react-icons/ci";
import { MdOutlineQuiz } from "react-icons/md";
const Courses = () => {

    return (
        <div >
            <h1 className="font-ubuntu font-medium text-base md:text-xl text-greyBlack  mb-2">Courses</h1>
            <div className="bg-white shadow-md rounded-lg w-full h-full py-2 px-2">
                <div className="px-2">
                    <img className="rounded-xl object-cover" src="https://images.spiceworks.com/wp-content/uploads/2022/12/01134007/Data-Integration-Function.jpg" alt="Course" />
                    <p className="font-ubuntu text-sm font-semibold text-greyBlack">Teaching Integers and Fractional Method</p>
                </div>
                <div className="flex w-full justify-between items-center mt-3 px-2">

                    <div className="flex justify-center items-center">
                        <BsCalendar4 className="text-xs mr-1" style={{ color: '#8C8C8C' }} />
                        <p className="text-xs text-grey font-ubuntu font-normal"> 4 Weeks</p>
                    </div>
                    <div className="flex justify-center items-center">
                        <CiClock2 className="text-sm mr-1" style={{ color: '#8C8C8C' }} />
                        <p className="text-xs text-grey font-ubuntu font-normal"> 15 hours</p>
                    </div>
                    <div className="flex justify-center items-center">
                        <MdOutlineQuiz className="text-sm mr-1" style={{ color: '#8C8C8C' }} />
                        <p className="text-xs text-grey font-ubuntu font-normal"> 5 quiz</p>
                    </div>

                </div>
            </div>
        </div>
    )
};
export default Courses;