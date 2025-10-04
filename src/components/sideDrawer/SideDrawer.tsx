import { AiFillGift, AiOutlineClose, AiOutlineHome } from "react-icons/ai";
import {
  MdOutlineCalendarMonth
} from "react-icons/md";
import { AiOutlineSetting } from "react-icons/ai";
import { MdOutlineSubscriptions } from "react-icons/md";
import { FaChildren } from "react-icons/fa6";
import { UseStateContext } from "../../context/ContextProvider";
import { useEffect } from "react";
import { RouteName } from "../../routes/RouteNames";
import { useLocation, useNavigate } from "react-router-dom";
import { IoBookOutline } from "react-icons/io5";
import { PiBooksDuotone, PiStudentFill } from "react-icons/pi";
import { RiFileList3Line } from "react-icons/ri";
import { FiGrid } from "react-icons/fi";
import { IoMdLogOut } from "react-icons/io";
import { Post } from "../../config/apiMethods";
import { useSubscriptionStatus } from "../../hooks/useSubscriptionStatus.hook";
import { displayMessage } from "../../config";
// import { MdOutlineSubscriptions } from "react-icons/md"; // Removed - subscription no longer needed
// import { useSubscriptionStatus } from "../../hooks/useSubscriptionStatus"; // Removed - subscription no longer needed

// Define interface for menu items
interface MenuItem {
  icon: React.ReactElement;
  text: string;
  route?: string;
  onClick?: () => void;
}

const SideDrawer = () => {
  const {
    role,
    hasChanges,
    setIsModalOpen,
    setHasChanges
  } = UseStateContext();

  // Subscription status for HR-Admin access control
  const { allowed, loading } = useSubscriptionStatus();

  // const { isSubscribed, loading } = useSubscriptionStatus(); // Removed - subscription no longer needed

  const location = useLocation();
  const navigate = useNavigate();

  // Create a URLSearchParams object to extract the query parameters
  const searchParams = new URLSearchParams(location.search);

  // Get the value of the 'childern' query parameter
  const childernValue = searchParams.get("childern");
  const { showSideBar, setShowSideBar } = UseStateContext();

  // Removed handleSubscriptionPortal - subscription no longer needed

  const handleNavigate = (itemRoute: string | undefined, onClick?: (() => void) | undefined) => {
    try {
      // All routes are now accessible without subscription
      if (false) { // Removed subscription check
        // Subscription check removed - all routes now accessible
      }

      if (hasChanges) {
        setIsModalOpen(true);
      } else {
        if (onClick) {
          onClick();
        } else if (itemRoute) {
          navigate(itemRoute);
        }
      }
      setShowSideBar(false);
    } catch (error) {
      if (onClick) {
        onClick();
      } else if (itemRoute) {
        navigate(itemRoute);
      }
      setShowSideBar(false);
      setHasChanges(false);
    }
  };

  const isCurrentRoute = (itemRoute: string | undefined) => {
    if (!itemRoute) return false;
    if (itemRoute === RouteName.SUBJECTS_SCREEN) {
      return subjectRoutes.some((route) => location.pathname.startsWith(route));
    }
    return location.pathname.startsWith(itemRoute);
  };

  const parentMenuItems: MenuItem[] = [
    {
      icon: <AiOutlineHome className="mr-4 text-md md:text-base lg:text-2xl" />,
      text: "Dashboard",
      route: RouteName.DASHBOARD_SCREEN,
    },
    {
      icon: <RiFileList3Line className="mr-4 text-md md:text-base lg:text-2xl" />,
      text: "Discussion",
      route: RouteName.DISCUSSION,
    },
    {
      icon: <FaChildren className="mr-4 text-md md:text-base lg:text-2xl" />,
      text: "My Employees",
      route: RouteName.MYEMPLOYEES_SCREEN,
    },
    {
      icon: (
        <MdOutlineCalendarMonth className="mr-4 text-md md:text-base lg:text-2xl" />
      ),
      text: "Calendar",
      route: RouteName.CALENDAR_SCREEN,
    },
    // Removed subscription menu item - no longer needed
    {
      icon: (
        <AiOutlineSetting className="mr-4 text-md md:text-base lg:text-2xl" />
      ),
      text: "Settings",
      route: RouteName.SETTING_SCREEN,
    },
    // Removed coupon menu item - no longer needed
  ];

  // Reused for HR-Admin and Instructor (subscription item hidden for Instructor)
  const teacherMenuItems: MenuItem[] = [
    {
      icon: <AiOutlineHome className="mr-4 text-md md:text-base lg:text-2xl" />,
      text: "Dashboard",
      route: RouteName.DASHBOARD_SCREEN_HR_ADMIN,
    },
    {
      icon: <RiFileList3Line className="mr-4 text-md md:text-base lg:text-2xl" />,
      text: "Discussion",
      route: RouteName.DISCUSSION_HR,
    },
    // Subscription kept for HR-Admin; will be hidden for Instructor below
    {
      icon: <MdOutlineSubscriptions className="mr-4 text-md md:text-base lg:text-2xl" />,
      text: "Subscription",
      route: RouteName.SUBSCRIPTION,
    },
    {
      icon: <FiGrid className="mr-4 text-md md:text-base lg:text-2xl" />,
      text: "Content",
      route: RouteName.SUBJECT_TOPIC_MANAGEMENT,
    },
    {
      icon: <IoBookOutline className="mr-4 text-md md:text-base lg:text-2xl" />,
      text: "Quizzes",
      route: RouteName.MY_QUIZZES,
    },
    {
      icon: <PiStudentFill className="mr-4 text-md md:text-base lg:text-2xl" />,
      text: "Employees",
      route: RouteName.EMPLOYEES_SCREEN,
    },
    // Removed subscription menu item - no longer needed
    {
      icon: (
        <MdOutlineCalendarMonth className="mr-4 text-md md:text-base lg:text-2xl" />
      ),
      text: "Calendar",
      route: RouteName.CALENDAR_SCREEN,
    },
    {
      icon: (
        <AiOutlineSetting className="mr-4 text-md md:text-base lg:text-2xl" />
      ),
      text: "Settings",
      route: RouteName.SETTING_SCREEN,
    },
    // Removed coupon menu item - no longer needed
  ];

  const studentMenuItems: MenuItem[] = [
    {
      icon: <AiOutlineHome className="mr-4 text-md md:text-base lg:text-2xl" />,
      text: "Dashboard",
      route: RouteName.DASHBOARD_SCREEN_EMPLOYEE,
    },
    {
      icon: <RiFileList3Line className="mr-4 text-md md:text-base lg:text-2xl" />,
      text: "Discussion",
      route: RouteName.DISCUSSION_EMP,
    },
    {
      icon: (
        <PiBooksDuotone className="mr-4 text-md md:text-base lg:text-2xl" />
      ),
      text: "Courses",
      route: RouteName.SUBJECTS_SCREEN,
    },
    {
      icon: (
        <RiFileList3Line className="mr-4 text-md md:text-base lg:text-2xl" />
      ),
      text: "Results",
      route: RouteName.RESULTS_SCREEN,
    },
    {
      icon: (
        <MdOutlineCalendarMonth className="mr-4 text-md md:text-base lg:text-2xl" />
      ),
      text: "Calendar",
      route: RouteName.CALENDAR_SCREEN,
    },
    {
      icon: (
        <AiOutlineSetting className="mr-4 text-md md:text-base lg:text-2xl" />
      ),
      text: "Settings",
      route: RouteName.SETTING_SCREEN,
    },
    // Removed coupon menu item - no longer needed
  ];

  const getMenuItems = (): MenuItem[] | null => {
    switch (role) {
      case "Employee":
        return studentMenuItems;
      case "HR-Admin":
        return teacherMenuItems;
      case "Instructor": {
        // Hide Subscription for Instructor
        const filtered = teacherMenuItems.filter(mi => mi.route !== RouteName.SUBSCRIPTION);
        return filtered;
      }
      case "Supervisor":
        return parentMenuItems;

      default:
        return null;
    }
  };

  useEffect(() => {
    const handleResize = () => {
      if (showSideBar) {
        setShowSideBar(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [showSideBar, setShowSideBar]);

  const subjectRoutes = [
    RouteName.SUBJECTS_SCREEN,
    RouteName.TOPICS_SUBJECTS,
    RouteName.LESSONS_EMPLOYEE,
    RouteName.MATERIAL_EMPLOYEE,
    // RouteName.GAMES, // Removed - games no longer needed
    RouteName.DAILY_QUIZ_ROOT,
    RouteName.DAILY_QUIZ,
    RouteName.QUIZ_CONFIRMATION,
    RouteName.SOLO_QUIZ,
    RouteName.MULTIPLAYER_QUIZ,
  ];

  const handleSignout = () => {
    try {
      if (hasChanges) {
        setIsModalOpen(true);
      } else {
        navigate(RouteName?.AUTH_SCREEN, { replace: true });
      }
      setShowSideBar(false);
    } catch (error) {
      navigate(RouteName?.AUTH_SCREEN, { replace: true });
      setShowSideBar(false);
      setHasChanges(false);

    }
  };

  return (
    <div
      className={`${showSideBar
        ? "fixed top-0 left-0 h-screen w-4/6 md:w-1/4 z-50"
        : "hidden"
        }  lg:flex lg:fixed top-0 left-0 flex-col w-1/6 h-screen bg-white border-r border-gray-200 z-50`}
    >
      <AiOutlineClose
        onClick={() => setShowSideBar(false)}
        size={30}
        className="absolute right-4 top-4 cursor-pointer text-white lg:hidden"
      />

      <div
        onClick={() => setShowSideBar(false)}
        className={`${showSideBar ? "sm:flex lg:hidden hidden sm:w-1/3 md:w-3/4" : "hidden"
          } bg-black/80 fixed w-screen h-screen z-10 top-0 right-0`}
      />

      <div>
        <div
          className="flex items-center justify-center gap-3 p-4 cursor-pointer"
          onClick={() => {
            if (role === "Employee") {
              handleNavigate(studentMenuItems[0]?.route);
            }
            if (role === "HR-Admin") {
              handleNavigate(teacherMenuItems[0]?.route);
            }
            if (role === "Supervisor") {
              handleNavigate(parentMenuItems[0]?.route);
            }
          }}
        >
          <img
            src="/classerly.net.png"
            alt="Classerly Logo"
            className="h-8 w-auto"
          />
          <h2 className="text-sm md:text-base lg:text-md font-ubuntu font-semibold text-gray-900">
            Classerly
          </h2>
        </div>
        <nav>
          <ul className="flex flex-col py-4">
            {getMenuItems()?.map((item, index) => {
              // Disable all HR-Admin routes except Subscription when not allowed
              const isHr = role === 'HR-Admin';
              const isSubscriptionItem = item.route === RouteName.SUBSCRIPTION;
              // Disable by default for HR-Admin, only enable after verification
              const isDisabled = isHr && (!allowed || loading) && !isSubscriptionItem;

              // Debug logging removed - subscription no longer needed

              return (
                <div className="w-full h-full" key={index}>
                  <div
                    className={`px-3 py-2 rounded-md transition ${isCurrentRoute(item.route)
                      ? "bg-gray-200"
                      : isDisabled
                        ? "opacity-50 cursor-not-allowed"
                        : "hover:bg-gray-50"
                      }`}
                    onClick={() => {
                      if (isDisabled) {
                        handleNavigate(RouteName.SUBSCRIPTION);
                      } else {
                        handleNavigate(item.route, item.onClick);
                      }
                    }}
                  >
                    <li className={`text-xl flex mx-auto px-2 flex-row justify-start items-center ${isDisabled ? 'cursor-not-allowed' : 'cursor-pointer'} ${isCurrentRoute(item.route) ? 'text-gray-900 font-medium' : 'text-gray-800'}`}>
                      {item.icon}
                      <p className={`ml-2 text-sm md:text-base lg:text-md font-ubuntu`}>
                        {item.text}
                      </p>
                    </li>
                  </div>
                </div>
              );
            })}

            <div className="w-full absolute bottom-10 right-0 px-4">
              <button
                type="button"
                aria-label="Sign out"
                onClick={handleSignout}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-50 border border-red-200 text-red-700 rounded-lg shadow-sm hover:bg-red-100 hover:border-red-300 transition"
              >
                <IoMdLogOut className="text-lg md:text-xl" />
                <span className="text-sm md:text-base font-ubuntu font-semibold">Sign Out</span>
              </button>
            </div>
          </ul>
        </nav>
      </div>
    </div>
  );
};

export default SideDrawer;
