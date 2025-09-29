import { useNavigate } from "react-router-dom";
import { RouteName } from "../../../../routes/RouteNames";

const SupervisorQuickActions = () => {
    const navigate = useNavigate();

    const quickActions = [
        {
            title: "View My Employees",
            description: "Manage and monitor your team members",
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
            ),
            bgColor: "bg-blue-100",
            textColor: "text-blue-600",
            hoverColor: "hover:bg-blue-200",
            route: RouteName.MYEMPLOYEES_SCREEN
        },
        {
            title: "Calendar",
            description: "Schedule and view meetings",
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
            ),
            bgColor: "bg-green-100",
            textColor: "text-green-600",
            hoverColor: "hover:bg-green-200",
            route: RouteName.CALENDAR_SCREEN
        },
        {
            title: "Settings",
            description: "Manage your account settings",
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
            ),
            bgColor: "bg-purple-100",
            textColor: "text-purple-600",
            hoverColor: "hover:bg-purple-200",
            route: RouteName.SETTING_SCREEN
        },
        {
            title: "View Results",
            description: "Check team performance",
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
            ),
            bgColor: "bg-orange-100",
            textColor: "text-orange-600",
            hoverColor: "hover:bg-orange-200",
            route: RouteName.EMPLOYEE_RESULT_SCREEN
        }
    ];

    return (
        <div className="space-y-3">
            {quickActions.map((action, index) => (
                <button
                    key={index}
                    onClick={() => navigate(action.route)}
                    className={`w-full flex items-center p-4 rounded-lg border border-gray-200 transition-all duration-200 hover:shadow-md group ${action.bgColor} ${action.hoverColor}`}
                >
                    {/* Icon */}
                    <div className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center ${action.bgColor} ${action.textColor} group-hover:scale-110 transition-transform duration-200`}>
                        {action.icon}
                    </div>

                    {/* Content */}
                    <div className="ml-4 flex-1 text-left">
                        <h3 className="text-sm font-semibold text-gray-900 group-hover:text-gray-700">
                            {action.title}
                        </h3>
                        <p className="text-xs text-gray-600 group-hover:text-gray-500">
                            {action.description}
                        </p>
                    </div>

                    {/* Arrow */}
                    <div className="flex-shrink-0">
                        <svg className={`w-5 h-5 ${action.textColor} group-hover:translate-x-1 transition-transform duration-200`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </div>
                </button>
            ))}

            {/* Additional Info */}
            <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                <div className="flex items-start">
                    <svg className="w-5 h-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                        <h4 className="text-sm font-semibold text-blue-900 mb-1">Quick Tips</h4>
                        <p className="text-xs text-blue-700">
                            Use these quick actions to efficiently manage your team and stay organized with your supervisory tasks.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SupervisorQuickActions;
