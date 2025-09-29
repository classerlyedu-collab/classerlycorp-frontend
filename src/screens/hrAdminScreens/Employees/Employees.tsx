
import { useState, useCallback } from "react";
import {
    Navbar,
    SideDrawer,
    MyEmployees,
    AddEmployees,
    RequestManagement,

} from "../../../components";
import { UseStateContext } from "../../../context/ContextProvider";
import { useSubscriptionStatus } from "../../../hooks/useSubscriptionStatus.hook";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { RouteName } from "../../../routes/RouteNames";

const Employees = () => {
    const [refreshRequests, setRefreshRequests] = useState<number>(0);
    const { setDashboardRefreshTrigger } = UseStateContext();

    const triggerRequestsRefresh = useCallback(() => {
        setRefreshRequests(prev => prev + 1);
        // Also trigger dashboard refresh
        setDashboardRefreshTrigger(prev => prev + 1);
    }, [setDashboardRefreshTrigger]);

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
            <div className="flex flex-col h-screen w-screen lg:w-10/12 px-2 py-2 md:px-6 md:py-6 md:pr-16 bg-mainBg" >

                {/* 1st Navbar*/}
                <div className="w-full h-fit mb-4 md:mb-6" >
                    <Navbar title="My Employees" />
                </div>

                {/* center */}
                <div className="flex flex-col lg:flex-row gap-4 md:gap-6 w-full mb-6" >
                    {/* For Employees List */}
                    <div className="flex-1 lg:w-3/4">
                        <div className="bg-white border border-gray-200 rounded-lg shadow-sm h-full">
                            <MyEmployees />
                        </div>
                    </div>
                    {/* for Add Employees */}
                    <div className="w-full lg:w-1/4">
                        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-3 md:p-4 h-fit">
                            <AddEmployees onEmployeeAdded={triggerRequestsRefresh} />
                        </div>
                    </div>
                </div>

                {/* Employee Requests Section */}
                <div className="w-full">
                    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-3 md:p-4">
                        <RequestManagement refreshTrigger={refreshRequests} />
                    </div>
                </div>

            </div>

        </div>
    )
};

export default Employees;
