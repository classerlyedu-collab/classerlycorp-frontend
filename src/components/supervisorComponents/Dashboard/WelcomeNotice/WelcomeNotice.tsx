import { useEffect, useState } from "react";
import { IoIosAlert } from "react-icons/io";
import { WelcomeImagesArray } from "../../../../constants/supervisor/dashdoard";


const WelcomeNotice = () => {

    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const getStoredUser = () => {
        try {
            const raw = localStorage.getItem("user");
            return raw ? JSON.parse(raw) : {};
        } catch {
            return {} as any;
        }
    };
    let user = getStoredUser();

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentImageIndex((prevIndex: number) =>
                prevIndex === WelcomeImagesArray?.length - 1 ? 0 : prevIndex + 1
            );
        }, 4000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="w-full bg-lightbrown h-full py-5 px-4 rounded-2xl flex flex-row justify-between items-center">
            <div className="w-full md:w-1/2" >
                <div className="w-full">
                    <div className="justify-center items-center flex sm:hidden">
                        <img className="w-36 mb-4" src={WelcomeImagesArray[currentImageIndex]} alt="Welcome" />
                    </div>
                    <h1 className="font-ubuntu text-lg md:text-xl font-bold">Hi, {user.userName}!</h1>
                    <div className="py-3 flex flex-col">
                        <p className="text-sm md:text-base font-ubuntu text-greyBlack ">Welcome to the parent portal.</p>
                        <p className="text-sm md:text-base font-ubuntu text-greyBlack">Please stay connected and keep yourself updated with the latest announcements.</p>
                    </div>
                    <div className="flex flex-row justify-start items-center py-2 ">
                        < IoIosAlert className="text-red-500" size={25} /> <h6 className="px-1 text-xs md:text-sm font-bold">Don’t forget to check out daily notices!</h6>
                    </div>
                </div>
            </div>
            <div className="justify-center items-center hidden sm:flex">
                <img className="h-52 w-72 object-contain" src={WelcomeImagesArray[currentImageIndex]} alt="Welcome" />
            </div>
        </div>
    )
}
export default WelcomeNotice;