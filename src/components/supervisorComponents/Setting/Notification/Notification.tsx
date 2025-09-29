import { useEffect, useState } from "react";
import { CustomInput } from "../../../customInput";
import { DropDown } from "../../../customDropdown";
import { gradeObject } from "../../../../constants/register";
import { FormControlLabel } from "@mui/material";
import { IOSSwitch } from "../../../../utils/settings";
import { Post } from "../../../../config/apiMethods";
import { displayMessage } from "../../../../config";
import { UseStateContext } from "../../../../context/ContextProvider";

const Notification = () => {
  const { updateUser } = UseStateContext();
  let user = JSON.parse(localStorage.getItem("user") || "null");

  // data states
  const [notifications, setNotifications] = useState<boolean>(!!user?.notification);
  const [profileImage, setProfileImage] = useState(user?.image);
  useEffect(() => {

    if (user && notifications !== !!user?.notification) {
      Post("/auth/updateuser", {
        notification: notifications,
      }).then((res) => {
        if (res.success) {
          localStorage.setItem("token", res.data.token);
          const updatedUser = res.data.data;
          localStorage.setItem("user", JSON.stringify(updatedUser));
          delete res.data.token;
          updateUser(updatedUser);
          setNotifications(!!updatedUser.notification);
        }
        displayMessage(res.message, "success");
      });
    }
  }, [notifications]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-sky-500 to-indigo-600 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">Notification Settings</h1>
          <p className="text-sm sm:text-base md:text-lg text-white/90 mt-2 max-w-2xl">
            Manage your in-app notification preferences
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-4 sm:-mt-6 mb-12 sm:mb-16">
        <div className="bg-white rounded-xl sm:rounded-2xl border shadow-sm">
          {/* Profile Section */}
          <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-200">
            <div className="flex items-center">
              <img
                src={profileImage || require("../../../../images/settings/profile.png")}
                className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                alt="Profile"
              />
              <div className="ml-4">
                <h2 className="text-lg font-semibold text-gray-900">{user?.userName}</h2>
                <p className="text-sm text-gray-600">Manage your notification preferences</p>
              </div>
            </div>
          </div>

          {/* Notification Settings */}
          <div className="p-4 sm:p-6">
            <div className="space-y-6">
              {/* General Notifications Toggle */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900 mb-1">In-App Notifications</h3>
                  <p className="text-sm text-gray-600">
                    Receive notifications within the application about important updates, activities, and announcements.
                  </p>
                </div>
                <div className="ml-4">
                  <FormControlLabel
                    control={
                      <IOSSwitch
                        sx={{ m: 1 }}
                        checked={notifications}
                        onChange={(e) => {
                          setNotifications(!notifications);
                        }}
                      />
                    }
                    label=""
                    value={notifications}
                  />
                </div>
              </div>

              {/* Notification Types */}
              <div className="space-y-4">
                <h4 className="text-md font-medium text-gray-900">Notification Types</h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center mb-2">
                      <svg className="w-5 h-5 text-indigo-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <h5 className="text-sm font-medium text-gray-900">Assignment Reminders</h5>
                    </div>
                    <p className="text-xs text-gray-600">Get notified about upcoming assignment deadlines</p>
                  </div>

                  <div className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center mb-2">
                      <svg className="w-5 h-5 text-indigo-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <h5 className="text-sm font-medium text-gray-900">Grade Updates</h5>
                    </div>
                    <p className="text-xs text-gray-600">Receive notifications when grades are posted</p>
                  </div>

                  <div className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center mb-2">
                      <svg className="w-5 h-5 text-indigo-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4 19h6v-6H4v6z" />
                      </svg>
                      <h5 className="text-sm font-medium text-gray-900">Course Updates</h5>
                    </div>
                    <p className="text-xs text-gray-600">Stay informed about course announcements and changes</p>
                  </div>

                  <div className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center mb-2">
                      <svg className="w-5 h-5 text-indigo-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <h5 className="text-sm font-medium text-gray-900">System Alerts</h5>
                    </div>
                    <p className="text-xs text-gray-600">Important system updates and maintenance notifications</p>
                  </div>
                </div>
              </div>

              {/* Info Box */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <h4 className="text-sm font-medium text-blue-900 mb-1">Notification Preferences</h4>
                    <p className="text-xs text-blue-800">
                      You can enable or disable notifications at any time. When enabled, you'll receive real-time updates about important activities and changes in your courses.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notification;
