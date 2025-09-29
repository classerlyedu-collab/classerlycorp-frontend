
import {
    Navbar,
    SideDrawer,
    AnalyticsComponent,
    PendingHomework,
    Courses,
    TasksComponent,
    UpcomingEvents,
    UpcomingEventsTeachers,
    Lessons,
    Schedule,
    Notifications
} from "../../../components";
import { UseStateContext } from "../../../context/ContextProvider";
import { useSubscriptionStatus } from "../../../hooks/useSubscriptionStatus.hook";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { RouteName } from "../../../routes/RouteNames";

const Dashboard = () => {
    const { dashboardRefreshTrigger } = UseStateContext();
    const navigate = useNavigate();
    const { loading, allowed } = useSubscriptionStatus();

    useEffect(() => {
        // Only redirect if we've checked and user is not allowed (not while loading)
        if (!loading && !allowed) {
            navigate(RouteName.SUBSCRIPTION, { replace: true });
        }
    }, [loading, allowed, navigate]);

    // Don't render content if not allowed (will redirect silently)
    if (!loading && !allowed) return null;
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
                <div className="flex flex-col lg:flex-row gap-3 md:gap-5 w-full mb-2 md:mb-6 bg-mainBg h-fit" >

                    {/* analytics cards - takes 2/3 of the width */}
                    <div className="flex-1 lg:w-2/3" >
                        <AnalyticsComponent refreshTrigger={dashboardRefreshTrigger} />
                    </div>

                    {/* notifications - takes 1/3 of the width */}
                    <div className="lg:w-1/3 h-fit" >
                        <Notifications maxNotifications={3} />
                    </div>

                </div>

            </div>

        </div>
    )
};

export default Dashboard;
