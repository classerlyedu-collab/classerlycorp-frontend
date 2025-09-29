import { useNavigate } from "react-router-dom";
import { featuredArray } from "../../../../constants/employee/Subjects";
import { getRandomColor } from "../../../../utils/randomColorGenerator";
import { RouteName } from "../../../../routes/RouteNames";
import { useEffect, useState } from "react";
import { Get, ImageLink } from "../../../../config/apiMethods";
import { displayMessage } from "../../../../config";

interface subjecttypeORM {
    createdAt: String;
    grade: any;
    image: string;
    name: String;
    topics: any;
    updatedAt: any;
    _id: any
}
const FeaturedCategories = () => {

    const navigate = useNavigate();
    const [subjects, setSubjects] = useState<subjecttypeORM[]>([]);

    const [loading, setLoading] = useState(false);

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
        setLoading(true);
        let grade = ""


        if (user?.userType == "Teacher") {

            grade = user?.profile?.grade.map((i: any) => { return i._id }).join(",")

        } else {
            grade = user?.profile?.grade?._id

        }



        // Grade-dependent subject fetching removed in corporate model
        // Fetch all subjects instead
        Get('/subject').then((d) => {
            if (d.success) {
                setSubjects(d.data);
                setLoading(false);
            } else {
                displayMessage(d.message, "error");
            }
        });
    }, []);
    return (
        <div className="w-full">
            {loading ? (
                <div className="flex justify-center items-center py-12">
                    <div className="flex flex-col items-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mb-4"></div>
                        <div className="text-purple-600 font-medium">Loading subjects...</div>
                    </div>
                </div>
            ) : subjects?.length === 0 ? (
                <div className="text-center py-12">
                    <div className="bg-gray-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                        <svg className="w-10 h-10 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                    <p className="text-gray-500 font-medium">No subjects available</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {subjects?.map((item, index) => (
                        <div
                            key={index}
                            onClick={() => {
                                localStorage.setItem("subject", JSON.stringify(item))
                                navigate(`${RouteName?.TOPICS_SUBJECTS}?subject=${item._id}`)
                            }}
                            className="group relative bg-gradient-to-br from-white to-gray-50 rounded-2xl p-4 shadow-md hover:shadow-xl cursor-pointer transition-all duration-300 transform hover:scale-105 border-2 border-transparent hover:border-purple-200"
                        >
                            <div className="flex flex-col items-center">
                                <div
                                    className="w-16 h-16 rounded-2xl flex items-center justify-center mb-3 shadow-lg"
                                    style={{ background: getRandomColor('light', index) }}
                                >
                                    <img
                                        className="w-10 h-10 object-contain"
                                        src={item.image || featuredArray[index % featuredArray?.length].img}
                                        alt="featured-category-image"
                                    />
                                </div>
                                <h3 className="font-bold text-sm text-center text-gray-800 group-hover:text-purple-600 transition-colors">
                                    {item.name?.length > 12 ? item.name.slice(0, 10) + "..." : item.name}
                                </h3>
                                <div className="absolute top-2 right-2 w-3 h-3 bg-blue-400 rounded-full border-2 border-white"></div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Feedback Button - Made more visible */}
            <div className="flex justify-end mt-6">
                {/* Feedback CTA removed */}
            </div>
        </div>
    )
}
export default FeaturedCategories;