import { IoCheckmarkCircleSharp } from "react-icons/io5";
const TeacherProfile = () => {
  let user = JSON.parse(localStorage.getItem("user") || "");

    return (
        <div className="bg-white rounded-xl relative pt-4">
            <div>
                <img className="md:h-14 md:w-14 h-20 w-20 absolute top-0 right-0 rounded-tr-xl " src={require('../../../../images/Teacher/colour.png')} alt="" />
            </div>
            <div>
            <img className="md:h-8 md:w-8 h-8 w-8 absolute bottom-0 left-0 rotate-180 rounded-tr-xl " src={require('../../../../images/Teacher/colour.png')} alt="" />

            </div>
                <h1 className="font-ubuntu font-medium text-lg md:text-xl text-greyBlack mb-3 md:mb-5 ml-5">Profile</h1>
            {/* for profile */}
            <div className="border-b border-black flex flex-col items-center justify-center pb-3 mx-3">

                <div className="flex flex-col justify-center items-center">
                    <img className="w-24 h-24 md:w-32 md:h-32 rounded-full" src={user?.image|| "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQOv_u8GVtyFUAmcyf-CYkzQLm1F8eLCAZpEw&s"} alt="" />
                   
                    <div className="flex flex-row items-center justify-center">
                        <h1 className="font-ubuntu font-medium text-lg md:text-xl text-greyBlack ">{user?.userName}</h1>
                        <h1 className="font-ubuntu font-medium text-lg md:text-xl text-purple ml-2 "><IoCheckmarkCircleSharp /></h1>
                    </div>
                        {/* <h3 className="font-ubuntu font-medium md:text-sm text-xs text-gray-600">Elementary</h3> */}
                </div>

            </div>
            {/* for grade */}
            <div className="flex justify-center items-center pt-4 pb-3">
                <h3 className="font-ubuntu font-medium text-[#AD6E79] text-sm">{user?.profile?.grade?.grade}</h3>
            </div>
        </div>

    )
};

export default TeacherProfile;