
import { useEffect, useState } from "react";
import { FormControlLabel } from "@mui/material";
import { IOSSwitch } from "../../../../utils/settings";
import { Post } from "../../../../config/apiMethods";
import { displayMessage } from "../../../../config";
import { UseStateContext } from "../../../../context/ContextProvider";

const Email = () => {
  const { updateUser } = UseStateContext();
  let user = JSON.parse(localStorage.getItem("user") || "null");

  // data states
  const [emailNotifications, setEmailNotifications] = useState<boolean>(!!user?.emailNotification);
  const [profileImage] = useState(user?.image);

  useEffect(() => {

    if (
      user.emailNotification !== emailNotifications
    ) {
      Post("/auth/updateuser", {
        emailNotification: emailNotifications,
      }).then((res) => {
        if (res.success) {
          localStorage.setItem("token", res.data.token);
          const updatedUser = res.data.data;
          // persist user to localStorage for immediate UI sync
          localStorage.setItem("user", JSON.stringify(updatedUser));
          delete res.data.token;
          updateUser(updatedUser);
          setEmailNotifications(!!updatedUser.emailNotification);
        }
        displayMessage(res.message, "success");
      });
    }
  }, [emailNotifications, user.emailNotification]);


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-sky-500 to-indigo-600 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">Email Settings</h1>
          <p className="text-sm sm:text-base md:text-lg text-white/90 mt-2 max-w-2xl">
            Manage your email notification preferences
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
                src={profileImage || require('../../../../images/settings/profile.png')}
                className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                alt="Profile"
              />
              <div className="ml-4">
                <h2 className="text-lg font-semibold text-gray-900">{user?.userName}</h2>
                <p className="text-sm text-gray-600">Manage your email preferences</p>
              </div>
            </div>
          </div>

          {/* Email Settings */}
          <div className="p-4 sm:p-6">
            <div className="space-y-6">
              {/* Email Notifications Toggle */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900 mb-1">Email Notifications</h3>
                  <p className="text-sm text-gray-600">
                    Receive email notifications from Classerly.com about important updates, announcements, and activities.
                  </p>
                </div>
                <div className="ml-4">
                  <FormControlLabel
                    control={
                      <IOSSwitch
                        sx={{ m: 1 }}
                        checked={emailNotifications}
                        onChange={(e) => {
                          setEmailNotifications(!emailNotifications);
                        }}
                      />
                    }
                    label=""
                    value={emailNotifications}
                  />
                </div>
              </div>

              {/* Additional Email Settings */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <h4 className="text-sm font-medium text-blue-900 mb-1">Email Preferences</h4>
                    <p className="text-xs text-blue-800">
                      You can change your email notification preferences at any time. When enabled, you'll receive updates about:
                    </p>
                    <ul className="text-xs text-blue-800 mt-2 space-y-1">
                      <li>• Course announcements and updates</li>
                      <li>• Assignment deadlines and reminders</li>
                      <li>• Grade notifications</li>
                      <li>• System updates and maintenance</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
};

export default Email;