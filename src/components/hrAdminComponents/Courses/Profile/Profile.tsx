import { IoCheckmarkCircleSharp } from "react-icons/io5";
import { homeWorkData } from "../../../../constants/HRAdmin/courses";
import { buildStyles, CircularProgressbarWithChildren } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { SlArrowRight } from "react-icons/sl";

const Profile = () => {
    const getStoredUser = () => {
        try {
            const raw = localStorage.getItem("user");
            return raw ? JSON.parse(raw) : {};
        } catch {
            return {} as any;
        }
    };
    let user = getStoredUser();

    return (
        <div className="bg-white rounded-xl relative pt-4 w-full h-full">
            {/* Profile header */}
            <h1 className="font-ubuntu font-medium text-base md:text-lg text-greyBlack mb-3 md:mb-5 ml-5">Profile</h1>

            {/* Profile section */}
            <div className="border-b border-black flex flex-col items-center justify-center pb-3 mx-3">
                <div className="flex flex-col justify-center items-center">
                    {/* Profile picture */}
                    <img className="w-24 h-24 md:w-32 md:h-32 rounded-full" src=
                        {user?.image
                            || "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQOv_u8GVtyFUAmcyf-CYkzQLm1F8eLCAZpEw&s"
                        }
                        alt="teacher pic" />

                    <div className="flex flex-row items-center justify-center">
                        {/* Profile name */}
                        <h1 className="font-ubuntu font-medium text-lg md:text-xl text-greyBlack">{user?.userName}</h1>
                        < IoCheckmarkCircleSharp className="font-ubuntu font-medium text-lg md:text-xl text-purple ml-2 " />
                    </div>
                    {/* Profile role */}
                    {/* <h3 className="font-ubuntu font-medium md:text-sm text-xs text-gray-600">Elementary</h3> */}
                </div>
            </div>

            {/* Homework progress header */}
            <div className="mt-2">
                {/* <h1 className="font-ubuntu font-medium text-lg md:text-xl text-greyBlack mb-3 md:mb-5 ml-5">Homework progress</h1> */}
            </div>

            {/* Homework progress list */}
            <div className="bg-white w-full overflow-y-auto max-h-80">
                {/* {homeWorkData?.map((item, index) => (
                    <div
                        className="group flex flex-row justify-start items-center mb-4 mx-5 rounded-xl shadow-md cursor-pointer hover:bg-purple transition-all duration-200 transform hover:scale-105"
                        key={index}
                    >
                        
                        <div className="flex justify-center items-center w-10 h-10 md:w-10 md:h-10 lg:w-12 lg:h-12 xl:w-14 xl:h-14 my-2 mx-3">
                            <CircularProgressbarWithChildren
                                value={item.percentage}
                                maxValue={100}
                                minValue={0}
                                strokeWidth={6}
                                styles={buildStyles({
                                    strokeLinecap: 'round',
                                    pathColor: '#8A70D6',
                                    trailColor: '#E9E3FF',
                                    backgroundColor: '#8A70D6',
                                })}
                            >
                                
                                <h1 className="font-ubuntu text-xs font-base text-greyBlack group-hover:text-white">{56}%</h1>
                            </CircularProgressbarWithChildren>
                        </div>

                        
                        <div className="flex flex-row justify-between w-full items-center">
                            <div className="flex flex-col justify-center items-start pl-2 md:pl-0">
                                
                                <h1 className="font-ubuntu font-medium text-sm lg:text-md text-black group-hover:text-white">{item.title}</h1>
                                
                                <p className="text-xs text-greyBlack font-ubuntu font-medium group-hover:text-white">{item.tasks}</p>
                            </div>
                            
                            <div className="pr-3">
                                <SlArrowRight className="group-hover:text-white" />
                            </div>
                        </div>
                    </div>
                ))} */}
            </div>
        </div>
    );
};

export default Profile;
