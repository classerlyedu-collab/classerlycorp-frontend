import { useState, useEffect } from "react";
import { PieChart } from "@mui/x-charts";
import { FaCalendarAlt } from "react-icons/fa";
import { Get } from "../../../../config/apiMethods";
import { displayMessage } from "../../../../config";

interface ProgressData {
    completed: number;
    inProgress: number;
    notStarted: number;
}

const ClassProgress = () => {
    const [progressData, setProgressData] = useState<ProgressData>({ completed: 0, inProgress: 0, notStarted: 0 });
    const [loading, setLoading] = useState(true);
    const [daysLeft, setDaysLeft] = useState(0);

    const fetchProgressData = () => {
        setLoading(true);
        Get("/employee/classprogress").then((d) => {
            if (d.success) {
                setProgressData({
                    completed: d.data.completed || 0,
                    inProgress: d.data.inProgress || 0,
                    notStarted: d.data.notStarted || 0
                });
                setDaysLeft(d.data.daysLeft || 0);
            } else {
                console.warn("Failed to fetch class progress:", d.message);
                // Use fallback data
                setProgressData({ completed: 25, inProgress: 75, notStarted: 0 });
                setDaysLeft(143);
            }
        }).catch((error) => {
            console.error("Error fetching class progress:", error);
            displayMessage("Failed to load progress data", "error");
            // Use fallback data
            setProgressData({ completed: 25, inProgress: 75, notStarted: 0 });
            setDaysLeft(143);
        }).finally(() => {
            setLoading(false);
        });
    };

    useEffect(() => {
        fetchProgressData();
    }, []);

    const totalSubjects = progressData.completed + progressData.inProgress + progressData.notStarted;
    const pieData = [
        { id: 0, value: progressData.inProgress, label: 'In Progress', color: '#F59E0B' },
        { id: 1, value: progressData.completed, label: 'Completed', color: '#10B981' },
        { id: 2, value: progressData.notStarted, label: 'Not Started', color: '#EF4444' },
    ].filter(item => item.value > 0); // Only show categories with data

    if (loading) {
        return (
            <div className="w-full bg-white py-5 h-72 px-4 rounded-2xl flex flex-col justify-center items-center">
                <h1 className="font-ubuntu font-medium text-base md:text-xl text-greyBlack mb-3 w-full">Class Progress</h1>
                <div className="flex justify-center items-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full bg-white py-5 h-72 px-4 rounded-2xl flex flex-col justify-center items-center">
            <h1 className="font-ubuntu font-medium text-base md:text-xl text-greyBlack mb-3 w-full">Class Progress</h1>

            {pieData.length > 0 ? (
                <PieChart
                    series={[
                        {
                            data: pieData,
                        },
                    ]}
                    width={400}
                    height={200}
                />
            ) : (
                <div className="flex flex-col items-center justify-center h-32">
                    <svg className="w-16 h-16 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <p className="text-gray-500 text-sm">No progress data available</p>
                </div>
            )}

            <div className="border-2 border-[#F9AF4E] bg-[#FFF4E9] py-2 px-3 mt-5 flex items-center justify-center rounded-md w-full mx-auto max-w-72">
                <FaCalendarAlt className="text-md mr-3 text-[#F9AF4E]" />
                <h1 className="font-ubuntu font-medium text-xs md:text-sm text-[#F9AF4E]">
                    {daysLeft > 0 ? `${daysLeft} days left in training` : 'Training completed!'}
                </h1>
            </div>
        </div>
    );
};
export default ClassProgress;