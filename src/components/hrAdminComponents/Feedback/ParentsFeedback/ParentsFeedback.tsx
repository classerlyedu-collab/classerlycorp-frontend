import { FaStar, FaQuoteLeft, FaQuoteRight } from "react-icons/fa";

const ParentsFeedback = ({ feedbacks }: any) => {
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getRatingColor = (rating: number) => {
        if (rating >= 4) return "text-green-500";
        if (rating === 3) return "text-yellow-500";
        return "text-red-500";
    };

    const RATING_LABELS = ["Needs improvement", "Okay", "Good", "Very good", "Excellent"] as const;
    const getRatingText = (rating: number) => {
        const r = Number(rating);
        if (r >= 1 && r <= 5) return RATING_LABELS[r - 1];
        return "Not rated";
    };

    return (
        <div className="space-y-4">
            {feedbacks?.map((item: any, index: any) => (
                <div key={index} className="bg-gray-50 rounded-xl p-6 border border-gray-100 hover:shadow-md transition-shadow duration-200">
                    <div className="flex items-start space-x-4">
                        {/* Avatar */}
                        <div className="flex-shrink-0">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                                <img
                                    src={item?.from?.auth?.image || "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQOv_u8GVtyFUAmcyf-CYkzQLm1F8eLCAZpEw&s"}
                                    alt={item?.from?.auth?.userName || "User"}
                                    className="w-12 h-12 rounded-full object-cover"
                                />
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-2">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        {item?.from?.auth?.userName || "Anonymous Student"}
                                    </h3>
                                    <p className="text-sm text-gray-500">
                                        {formatDate(item?.createdAt)}
                                    </p>
                                </div>

                                {/* Rating */}
                                <div className="flex items-center space-x-2">
                                    <div className="flex items-center">
                                        {Array.from({ length: 5 }).map((_, starIndex) => (
                                            <FaStar
                                                key={starIndex}
                                                className={`w-4 h-4 ${starIndex < (item?.star || 0)
                                                    ? "text-yellow-400"
                                                    : "text-gray-300"
                                                    }`}
                                            />
                                        ))}
                                    </div>
                                    <span className={`text-sm font-medium ${getRatingColor(item?.star || 0)}`}>
                                        {item?.star || 0}/5
                                    </span>
                                </div>
                            </div>

                            {/* Rating Badge */}
                            <div className="mb-3">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${(item?.star || 0) >= 4
                                    ? "bg-green-100 text-green-800"
                                    : (item?.star || 0) === 3
                                        ? "bg-yellow-100 text-yellow-800"
                                        : "bg-red-100 text-red-800"
                                    }`}>
                                    {getRatingText(item?.star || 0)}
                                </span>
                            </div>

                            {/* Feedback Text */}
                            <div className="relative">
                                <FaQuoteLeft className="absolute -top-2 -left-2 text-gray-300 text-lg" />
                                <p className="text-gray-700 leading-relaxed pl-4 pr-2">
                                    {item.feedback || "No feedback provided"}
                                </p>
                                <FaQuoteRight className="absolute -bottom-2 -right-2 text-gray-300 text-lg" />
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}
export default ParentsFeedback