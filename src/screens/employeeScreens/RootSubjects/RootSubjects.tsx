
import { Outlet, useLocation } from "react-router-dom";
import {
    Navbar,
    SideDrawer
} from "../../../components";
import { getLastRoute } from "../../../utils/getLastRoute";

const RootSubjects = () => {

    const location = useLocation();

    const lastRoute = getLastRoute(location?.pathname);

    const routesToHideNavbar = ['Singleplayer_Quiz', 'Multiplayer_Quiz', 'Games'];
    const routesToHideSideDrawer = ['Singleplayer_Quiz', 'Multiplayer_Quiz'];

    const shouldHideNavbar = routesToHideNavbar.includes(lastRoute);
    const shouldHideSideDrawer = routesToHideSideDrawer.includes(lastRoute);

    return (
        <div className="flex flex-row w-screen h-screen max-w-[2200px] justify-center items-center mx-auto bg-mainBg flex-wrap" >

            {/* for left side  */}
            <div className={`lg:w-1/6 h-full bg-transparent transition-all delay-100 ${shouldHideSideDrawer ? 'hidden' : 'flex'}`}>
                <SideDrawer />
            </div>

            {/* for right side */}
            <div className="flex flex-col h-screen w-screen lg:w-10/12 px-2 py-2 md:px-4 md:py-6 xl:pr-16 bg-mainBg" >

                {/* 1st Navbar*/}
                <div className={`w-full h-fit bg-mainBg mb-2 md:mb-6 ${shouldHideNavbar ? 'hidden' : 'flex'}`} >
                    <Navbar title={lastRoute} hideSearchBar />
                </div>

                <Outlet />

            </div>

        </div>
    )
};

export default RootSubjects;
