import { Outlet } from "react-router-dom";

const DailyQuizOverview = () => {

    return (
        <div className="w-full h-full" >
           <Outlet />
        </div>
    )
};

export default DailyQuizOverview;
