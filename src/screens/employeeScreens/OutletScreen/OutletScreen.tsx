
import { Outlet } from "react-router-dom";
import {
    Navbar,
    SideDrawer,
} from "../../../components";

const DashboardParent = () => {

    return (
        <div className="flex flex-row w-screen h-screen max-w-[2200px] justify-center items-center mx-auto bg-mainBg flex-wrap" >

            {/* for left side  */}
            <div className="lg:w-1/6 h-full bg-transparent">
                <SideDrawer />
            </div>

            {/* for right side */}
            <div className="flex flex-col h-screen w-screen lg:w-10/12 px-2 py-2 md:px-4 md:py-6  md:pr-16 bg-mainBg" >

                {/* 1st Navbar*/}
                <div className="w-full h-fit bg-mainBg mb-2 md:mb-6" >
                    <Navbar title="Dashboard" />
                </div>

                {/* center */}
                <div className="w-full h-full" >

                    <Outlet />

                </div>

            </div>


        </div>
    )
};

export default DashboardParent;
