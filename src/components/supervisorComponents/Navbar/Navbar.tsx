import { useEffect, useRef, useState } from 'react';
import { IoIosNotificationsOutline } from 'react-icons/io';
import { IoMenuOutline } from 'react-icons/io5';
import { FaUserPlus } from 'react-icons/fa';
import { UseStateContext } from '../../../context/ContextProvider';
// import { NavBarPropsType } from '../../../types/globalTypes';
import { useLocation, useNavigate } from 'react-router-dom';
import { RouteName } from '../../../routes/RouteNames';
// import { RoundedDropDown } from '../../roundedDropDown';
// import { coursesDropdown } from '../../../constants/parent/myChildren';
// import { returnMatchingLabel } from '../../../constants/register';
import { NotificationsModal } from '../NotificationsModal';
import { AddEmployeeModal } from '../MyChildernModal';
import { Get, Post } from '../../../config/apiMethods';
import { displayMessage } from '../../../config';

const Navbar = ({ title, hideSearchBar, hideTitle, mystd, onEmployeeAdded }: any) => {
    const location = useLocation();
    const { showSideBar, setShowSideBar, hasChanges, setIsModalOpen, setHasChanges, user } = UseStateContext();
    const navigate = useNavigate()
    // const [selectedCourse, setSelectedCourse] = useState<number>(0);
    const [subjects, setSubjects] = useState<any[]>([]);
    // const [mystd, setMyStd] = useState<any>({});
    const [isModalVisible, setModalVisible] = useState(false); // legacy modal (unused after dropdown)
    const [showNotifDropdown, setShowNotifDropdown] = useState(false); // New dropdown state
    const notifDropdownRef = useRef<HTMLDivElement | null>(null);
    const bellRef = useRef<HTMLDivElement | null>(null);
    const [notifications, setNotifications] = useState<any[]>([]); // State to store notifications
    const [isMarkingAll, setIsMarkingAll] = useState(false);
    const [notifDisabled, setNotifDisabled] = useState(false);
    const [notifAnim, setNotifAnim] = useState(false);

    // Check if there are unread notifications
    const hasUnreadNotifications = () => {
        try {
            const currentUser = JSON.parse(localStorage.getItem('user') || '');
            const currentUserId = currentUser?._id || currentUser?.id;

            if (!currentUserId) return false;

            return notifications.some(notification => {
                if (!notification.readBy) return true; // If no readBy array, it's unread
                return !notification.readBy.some((readEntry: any) =>
                    readEntry.userId === currentUserId || readEntry.userId._id === currentUserId
                );
            });
        } catch {
            return false;
        }
    };
    const [isAddEmployeeModalVisible, setIsAddEmployeeModalVisible] = useState(false)
    const [employeeCode, setEmployeeCode] = useState<string>("");

    const handleNavigate = (route: string) => {
        try {
            if (hasChanges) {
                setIsModalOpen(true);
            } else {
                navigate(route);
            }
        } catch (error) {
            navigate(route);
            setHasChanges(false);

        }
    }

    const handleNotificationClick = () => {
        // Toggle dropdown instead of opening modal
        setShowNotifDropdown((prev) => !prev);
    };

    const handleCloseNotificationsDropdown = () => {
        setShowNotifDropdown(false);
    };

    const markAllAsRead = async (e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        if (isMarkingAll) return;
        try {
            setIsMarkingAll(true);
            const resp = await Post('/auth/notifications/read-all', {});
            if (resp?.success) {
                displayMessage(resp?.message || 'All notifications marked as read', 'success');
                // refresh notifications
                const refreshed = await Get('/auth/notifications');
                if (refreshed?.success) {
                    setNotifications(refreshed.data);
                }
            } else {
                displayMessage(resp?.message || 'Failed to mark notifications as read', 'error');
            }
        } catch (err: any) {
            displayMessage(err?.message || 'Failed to mark notifications as read', 'error');
        } finally {
            setIsMarkingAll(false);
        }
    };

    // Close on outside click
    useEffect(() => {
        const onDocClick = (e: MouseEvent) => {
            if (!showNotifDropdown) return;
            const target = e.target as Node;
            const clickedInsideDropdown = notifDropdownRef.current?.contains(target);
            const clickedOnBell = bellRef.current?.contains(target);
            if (!clickedInsideDropdown && !clickedOnBell) {
                setShowNotifDropdown(false);
            }
        };
        document.addEventListener('mousedown', onDocClick);
        return () => document.removeEventListener('mousedown', onDocClick);
    }, [showNotifDropdown]);

    // animate dropdown on open
    useEffect(() => {
        if (showNotifDropdown) {
            setNotifAnim(false);
            // next frame to trigger transition
            requestAnimationFrame(() => setNotifAnim(true));
        } else {
            setNotifAnim(false);
        }
    }, [showNotifDropdown]);

    // Helper function to get the correct notification endpoint based on user role
    const getNotificationEndpoint = () => {
        switch (user?.userType) {
            case "HR-Admin":
                return "/hr-admin/getNotification";
            case "Employee":
                return "/employee/getNotification";
            case "Supervisor":
                return "/supervisor/getNotification";
            default:
                return "/supervisor/getNotification"; // Default fallback
        }
    };

    useEffect(() => {
        try {
            const raw = localStorage.getItem('user');
            const user = raw ? JSON.parse(raw) : null;
            if (user && user.notification === false) {
                setNotifDisabled(true);
                setNotifications([]);
                return;
            }
        } catch { }
        Get('/auth/notifications').then((d) => {
            if (d.success) {
                setNotifications(d.data || []);
                if (Array.isArray(d.data) && d.data.length === 0 && d.message === 'Notifications disabled for user') {
                    setNotifDisabled(true);
                } else {
                    setNotifDisabled(false);
                }
            }
        })
    }, []);
    // const [childData, setChildData] = useState<any[]>([]);
    // useEffect(()=>{
    //     navigate(RouteName.MYCHILDREN_SCREEN+`?childern=${selectedCourse}`)

    // },[selectedCourse])
    useEffect(() => {
        if (user.userType === "Supervisor") {
            Get("/supervisor/mychilds")
                .then((d) => {

                    if (d.success) {
                        setSubjects(d.data);
                        //   if(d.data?.length>0){
                        //     navigate(RouteName.MYCHILDREN_SCREEN+`?childern=${d.data[0]._id}`)
                        //     // localStorage.setItem("mychildern",JSON.stringify(d.data[0]))
                        //   }

                    } else {
                        displayMessage(d.message, "error");
                    }
                })
                .catch((err) => {
                    displayMessage(err.message, "error");
                });
        }
    }, []);

    const isMyChildrenRoute = () => {
        return location.pathname === RouteName?.MYEMPLOYEES_SCREEN;
    };

    // removed legacy notification click (modal). Using dropdown toggle defined above.

    const handleCloseModal = () => {
        setModalVisible(false);
        setIsAddEmployeeModalVisible(false)
    };

    const handleAddEmployeeClick = () => {
        setIsAddEmployeeModalVisible(true);
    };



    return (
        <div className="flex flex-row items-center justify-between w-full flex-wrap bg-white border-b border-gray-200 px-3 py-2 rounded-md shadow-sm">
            {isMyChildrenRoute() ? (
                <div className="w-full flex flex-col lg:flex-row lg:justify-between">
                    {/* 1st - Title and Actions on Mobile, Title only on Desktop */}
                    <div className="mt-2 md:mt-0 mb-3 lg:mt-0 flex justify-between lg:justify-start w-full lg:w-auto items-center">
                        <div className="flex items-center">
                            <IoMenuOutline
                                className="lg:hidden text-gray-700 mr-1 md:mr-2 text-xl md:text-2xl"
                                onClick={() => setShowSideBar(true)}
                            />
                            <h1 className="font-ubuntu font-semibold text-lg md:text-xl text-gray-900 ml-2 lg:ml-0">
                                My Employees
                            </h1>
                        </div>

                        {/* Actions - Show on mobile, hide on desktop */}
                        <div className="flex flex-row items-center justify-end lg:hidden">
                            {/* Notifications Icon */}
                            <button
                                onClick={handleAddEmployeeClick}
                                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm shadow-sm"
                            >
                                <FaUserPlus className="w-4 h-4" />
                                <span className="hidden sm:inline">Add Employee</span>
                            </button>
                            <div className="relative cursor-pointer" onClick={handleNotificationClick}>
                                <IoIosNotificationsOutline className="flex justify-center items-center text-2xl md:text-3xl text-gray-700" />
                                {hasUnreadNotifications() && (
                                    <div className={`w-2 h-2 bg-red-600 rounded-full absolute top-1 right-1 ${showSideBar ? 'sm:hidden md:flex' : 'flex'}`} />
                                )}
                            </div>
                            <div className="border border-gray-200 rounded-md p-0.5  ml-2 md:ml-3 cursor-pointer" >
                                <img className="w-9 h-9 md:h-10 md:w-10 rounded-md" src={user?.image || "https://st2.depositphotos.com/3889193/6856/i/450/depositphotos_68564721-Beautiful-young-student-posing.jpg"} alt="Profile" onClick={() => {

                                    handleNavigate(RouteName.SETTING_SCREEN)
                                }} />
                            </div>
                        </div>
                    </div>

                    {/* 2nd - Actions Section - Desktop only */}
                    <div className="hidden lg:flex flex-row items-center justify-end">
                        {/* Notifications Icon */}
                        <button
                            onClick={handleAddEmployeeClick}
                            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm shadow-sm"
                        >
                            <FaUserPlus className="w-4 h-4" />
                            <span className="hidden sm:inline">Add Employee</span>
                        </button>
                        <div ref={bellRef} className="relative cursor-pointer" onClick={handleNotificationClick}>
                            <IoIosNotificationsOutline className="flex justify-center items-center text-2xl md:text-3xl text-gray-700" />
                            {hasUnreadNotifications() && (
                                <div className={`w-2 h-2 bg-red-600 rounded-full absolute top-1 right-1 ${showSideBar ? 'sm:hidden md:flex' : 'flex'}`} />
                            )}
                            {showNotifDropdown && (
                                <div
                                    ref={notifDropdownRef}
                                    className={`fixed left-1/2 -translate-x-1/2 top-14 mt-0 w-[calc(100vw-2rem)] max-w-sm sm:absolute sm:right-0 sm:left-auto sm:translate-x-0 sm:top-auto sm:mt-2 sm:w-96 bg-white border border-gray-200 rounded-xl shadow-lg z-50 transform transition-all duration-200 ease-out ${notifAnim ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-2 scale-95'}`}
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                                        <div className="flex items-center gap-2">
                                            <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center">
                                                <IoIosNotificationsOutline className="text-blue-600" />
                                            </div>
                                            <h3 className="text-sm font-semibold text-gray-800">Notifications</h3>
                                        </div>
                                        <button onClick={(e) => { e.stopPropagation(); handleCloseNotificationsDropdown(); }} className="text-xs text-gray-500 hover:text-gray-700">Close</button>
                                    </div>
                                    <div className="max-h-80 overflow-y-auto">
                                        {notifDisabled ? (
                                            <div className="px-4 py-6 text-center text-sm text-gray-500">In-app notifications are disabled in your Settings. Enable to view updates.</div>
                                        ) : notifications && notifications.length > 0 ? (
                                            notifications.map((n: any, idx: number) => (
                                                <div key={idx} className="px-4 py-3 hover:bg-gray-50 transition-colors">
                                                    <p className="text-sm text-gray-900 font-medium truncate">{n?.title || n?.heading || 'Notification'}</p>
                                                    {n?.message || n?.body ? (
                                                        <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">{n?.message || n?.body}</p>
                                                    ) : null}
                                                </div>
                                            ))
                                        ) : (
                                            <div className="px-4 py-6 text-center text-sm text-gray-500">No notifications</div>
                                        )}
                                    </div>
                                    {notifications && notifications.some((n: any) => !n?.readBy || (Array.isArray(n.readBy) && n.readBy.length === 0)) && (
                                        <div className="px-4 py-2 border-t border-gray-100">
                                            <button
                                                onClick={markAllAsRead}
                                                disabled={isMarkingAll}
                                                className="w-full text-sm font-semibold text-blue-600 hover:text-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {isMarkingAll ? 'Marking as read...' : 'Mark all as read'}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                        <div className="border border-gray-200 rounded-md p-0.5  ml-2 md:ml-3 cursor-pointer" >
                            <img className="w-9 h-9 md:h-10 md:w-10 rounded-md" src={user?.image || "https://st2.depositphotos.com/3889193/6856/i/450/depositphotos_68564721-Beautiful-young-student-posing.jpg"} alt="Profile" onClick={() => {

                                handleNavigate(RouteName.SETTING_SCREEN)
                            }} />
                        </div>
                    </div>
                </div>
            ) : (
                <>
                    {/* 1st */}
                    <div className="flex justify-start items-center">
                        <IoMenuOutline
                            className="lg:hidden text-gray-700 mr-1 md:mr-2 text-xl md:text-2xl"
                            onClick={() => setShowSideBar(true)}
                        />
                        {!hideTitle && <h1 className="font-ubuntu font-semibold text-base md:text-xl text-gray-900">{title}</h1>}
                    </div>

                    {/* 2nd */}
                    <div className={`flex justify-between items-center md:w-auto flex-wrap`}>
                        {/* Notifications Icon */}
                        {title === "Feedback" && user.userType === "HR-Admin" &&
                            null
                        }
                        <div ref={bellRef} className="relative cursor-pointer" onClick={handleNotificationClick}>
                            <IoIosNotificationsOutline className="flex justify-center items-center text-2xl md:text-3xl text-gray-700" />
                            {hasUnreadNotifications() && (
                                <div className={`w-2 h-2 bg-red-600 rounded-full absolute top-1 right-1 ${showSideBar ? 'sm:hidden md:flex' : 'flex'}`} />
                            )}
                            {showNotifDropdown && (
                                <div
                                    ref={notifDropdownRef}
                                    className={`fixed left-1/2 -translate-x-1/2 top-14 mt-0 w-[calc(100vw-2rem)] max-w-sm sm:absolute sm:right-0 sm:left-auto sm:translate-x-0 sm:top-auto sm:mt-2 sm:w-96 bg-white border border-gray-200 rounded-xl shadow-lg z-50 transform transition-all duration-200 ease-out ${notifAnim ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-2 scale-95'}`}
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                                        <div className="flex items-center gap-2">
                                            <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center">
                                                <IoIosNotificationsOutline className="text-blue-600" />
                                            </div>
                                            <h3 className="text-sm font-semibold text-gray-800">Notifications</h3>
                                        </div>
                                        <button onClick={(e) => { e.stopPropagation(); handleCloseNotificationsDropdown(); }} className="text-xs text-gray-500 hover:text-gray-700">Close</button>
                                    </div>
                                    <div className="max-h-80 overflow-y-auto">
                                        {notifications && notifications.length > 0 ? (
                                            notifications.map((n: any, idx: number) => (
                                                <div key={idx} className="px-4 py-3 hover:bg-gray-50 transition-colors">
                                                    <p className="text-sm text-gray-900 font-medium truncate">{n?.title || n?.heading || 'Notification'}</p>
                                                    {n?.message || n?.body ? (
                                                        <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">{n?.message || n?.body}</p>
                                                    ) : null}
                                                </div>
                                            ))
                                        ) : (
                                            <div className="px-4 py-6 text-center text-sm text-gray-500">No notifications</div>
                                        )}
                                    </div>
                                    {notifications && notifications.some((n: any) => !n?.readBy || (Array.isArray(n.readBy) && n.readBy.length === 0)) && (
                                        <div className="px-4 py-2 border-t border-gray-100">
                                            <button
                                                onClick={markAllAsRead}
                                                disabled={isMarkingAll}
                                                className="w-full text-sm font-semibold text-blue-600 hover:text-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {isMarkingAll ? 'Marking as read...' : 'Mark all as read'}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="border border-gray-200 rounded-md p-0.5  ml-2 md:ml-3 cursor-pointer">
                            <img className="w-9 h-9 md:h-10 md:w-10 rounded-md" src={user?.image || "https://st2.depositphotos.com/3889193/6856/i/450/depositphotos_68564721-Beautiful-young-student-posing.jpg"} alt="Profile"
                                onClick={() => {

                                    handleNavigate(RouteName.SETTING_SCREEN)
                                }} />
                        </div>
                    </div>
                </>
            )}
            <AddEmployeeModal isVisible={isAddEmployeeModalVisible} onClose={handleCloseModal} employeeCode={employeeCode} setEmployeeCode={setEmployeeCode} onEmployeeAdded={onEmployeeAdded} />
            {/* Notification Dropdown replaces modal; keeping modal import for legacy but not rendering */}
        </div>
    );
};

export default Navbar;