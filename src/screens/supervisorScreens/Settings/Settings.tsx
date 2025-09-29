
import { useState } from "react";
import {
    Navbar,
    SideDrawer,
    Information,
    Email,
    Password,
    Notification,

} from "../../../components";

import { sideBarData } from "../../../constants/supervisor/settings"
import { UseStateContext } from "../../../context/ContextProvider";

const Settings = () => {
    const {
        hasChanges,
        setIsModalOpen
    } = UseStateContext();

    const [currentState, setCurrentState] = useState<number>(0);

    const handleClick = (index: any) => {
        try {
            if (hasChanges) {
                setIsModalOpen(true);
            } else {
                setCurrentState(index);
            }
        } catch (error) {
            setCurrentState(index);
        }
    }

    const renderToggleChildren = () => {
        try {

            switch (currentState) {
                case 0:
                    return <Information />
                case 1:
                    return <Password />
                case 2:
                    return <Email />
                case 3:
                    return <Notification />

                default:
                    return <Information />
            }

        } catch (error) {


        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
            {/* Mobile Sidebar Overlay */}
            <div className="lg:hidden">
                <SideDrawer />
            </div>

            {/* Desktop Sidebar */}
            <div className="hidden lg:block fixed left-0 top-0 h-full w-64 bg-white shadow-lg z-10">
                <SideDrawer />
            </div>

            {/* Main Content */}
            <div className="lg:ml-64 flex flex-col min-h-screen">
                {/* Navbar */}
                <div className="bg-white shadow-sm border-b border-gray-200">
                    <div className="px-4 sm:px-6 py-4">
                        <Navbar title="Settings" />
                    </div>
                </div>

                {/* Settings Content */}
                <div className="flex-1 flex flex-col lg:flex-row">
                    {/* Tab Navigation */}
                    <div className="w-full lg:w-64 bg-white border-b lg:border-b-0 lg:border-r border-gray-200 shadow-sm">
                        <div className="p-4">
                            <nav className="flex flex-row lg:flex-col space-x-2 lg:space-x-0 lg:space-y-2 overflow-x-auto lg:overflow-x-visible">
                                {sideBarData?.map((item: any, index: number) => (
                                    <button
                                        key={index}
                                        onClick={() => handleClick(index)}
                                        className={`flex-shrink-0 lg:w-full flex items-center px-3 py-2 text-sm font-medium rounded-full border transition-all duration-200 whitespace-nowrap ${currentState === index
                                            ? 'bg-gray-100 text-gray-900 border-gray-300 shadow-sm'
                                            : 'text-gray-700 border-gray-200 hover:bg-gray-50 hover:text-gray-900'
                                            }`}
                                    >
                                        <span className="flex-1 text-left">{item?.title}</span>
                                        {currentState === index && (
                                            <span className="ml-2 inline-block w-2 h-2 rounded-full bg-blue-500" />
                                        )}
                                    </button>
                                ))}
                            </nav>
                        </div>
                    </div>

                    {/* Tab Content */}
                    <div className="flex-1 overflow-auto">
                        {renderToggleChildren()}
                    </div>
                </div>
            </div>
        </div>
    )
};

export default Settings;
