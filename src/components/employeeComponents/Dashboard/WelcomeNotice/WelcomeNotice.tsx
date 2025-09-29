import { useEffect, useState } from "react";
import { IoIosAlert } from "react-icons/io";
import { WelcomeStudentImagesArray } from "../../../../constants/employee/Dashboard";


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
                prevIndex === WelcomeStudentImagesArray?.length - 1 ? 0 : prevIndex + 1
            );
        }, 4000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div className="flex-1">
                    <div className="flex items-center mb-4">
                        <div className="flex-shrink-0">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                        </div>
                        <div className="ml-4">
                            <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user.userName?.charAt(0).toUpperCase() + user.userName?.slice(1) || 'Employee'}!</h1>
                            <p className="text-gray-600 mt-1">Ready to continue your professional development journey</p>
                        </div>
                    </div>


                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                        <div className="flex items-center">
                            <IoIosAlert className="text-amber-600 mr-2" size={20} />
                            <p className="text-sm text-gray-700">
                                <span className="font-medium text-gray-900">Stay updated:</span> Check your daily progress and completed tasks for continuous improvement.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Image section hidden on corporate version */}
            </div>
        </div>
    )
}
export default WelcomeNotice;