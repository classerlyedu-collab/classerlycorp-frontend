import { useState } from "react";
import { CustomInput } from "../../../customInput";
import { DropDown } from "../../../customDropdown";
import { gradeObject } from "../../../../constants/register";
import { Post } from "../../../../config/apiMethods";
import { displayMessage } from "../../../../config";

const Password = () => {
  // data states
  let user = JSON.parse(localStorage.getItem("user") || "");
  const [oldPassword, setOldPassword] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [profileImage, setProfileImage] = useState(user?.image);

  // error states
  const [oldPasswordError, setOldPasswordError] = useState<string>("");
  const [passwordError, setPasswordError] = useState<string>("");
  const [confirmPasswordError, setConfirmPasswordError] = useState<string>("");

  const handleChangePasswordClick = () => {
    Post("/auth/changepassword", {
      oldPassword,
      password,
      confirmPassword,
    })
      .then((res) => {
        if (res.success) {
          localStorage.setItem("token", res.token);

          displayMessage(res.message, "success");
          setOldPassword("");
          setPassword("");
          setConfirmPassword("");
        } else {
          displayMessage(res.message, "error");
        }
      })
      .catch((err) => {
        displayMessage(err.message, "error");
      });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-sky-500 to-indigo-600 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">Password Settings</h1>
          <p className="text-sm sm:text-base md:text-lg text-white/90 mt-2 max-w-2xl">
            Update your password to keep your account secure
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-4 sm:-mt-6 mb-12 sm:mb-16">
        <div className="bg-white rounded-xl sm:rounded-2xl border shadow-sm">
          {/* Profile Section with Button */}
          <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <div className="flex items-center">
                <img
                  src={profileImage || require("../../../../images/settings/profile.png")}
                  className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                  alt="Profile"
                />
                <div className="ml-4">
                  <h2 className="text-lg font-semibold text-gray-900">{user?.userName}</h2>
                  <p className="text-sm text-gray-600">Change your account password</p>
                </div>
              </div>
              <button
                onClick={handleChangePasswordClick}
                className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
                Change Password
              </button>
            </div>
          </div>

          {/* Password Form */}
          <div className="p-4 sm:p-6 space-y-8">
            {/* Password Requirements Info */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h4 className="text-lg font-semibold text-blue-900 mb-3">Password Requirements</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex items-center text-sm text-blue-800">
                      <svg className="w-4 h-4 text-blue-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      At least 8 characters
                    </div>
                    <div className="flex items-center text-sm text-blue-800">
                      <svg className="w-4 h-4 text-blue-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Uppercase & lowercase
                    </div>
                    <div className="flex items-center text-sm text-blue-800">
                      <svg className="w-4 h-4 text-blue-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      At least one number
                    </div>
                    <div className="flex items-center text-sm text-blue-800">
                      <svg className="w-4 h-4 text-blue-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Special character
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Password Fields */}
            <div className="space-y-6">
              {/* Current Password */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Current Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <CustomInput
                    value={oldPassword}
                    setValue={setOldPassword}
                    type="password"
                    placeholder="Enter your current password"
                    error={oldPasswordError}
                    setError={setOldPasswordError}
                    style={{
                      wrapper: "mb-0",
                      input: "pl-10 pr-4 py-3 w-full border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-white shadow-sm",
                    }}
                  />
                </div>
              </div>

              {/* New Password */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                    </svg>
                  </div>
                  <CustomInput
                    value={password}
                    setValue={setPassword}
                    type="password"
                    placeholder="Enter your new password"
                    error={passwordError}
                    setError={setPasswordError}
                    style={{
                      wrapper: "mb-0",
                      input: "pl-10 pr-4 py-3 w-full border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-white shadow-sm",
                    }}
                  />
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Confirm New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <CustomInput
                    value={confirmPassword}
                    setValue={setConfirmPassword}
                    type="password"
                    placeholder="Confirm your new password"
                    error={confirmPasswordError}
                    setError={setConfirmPasswordError}
                    style={{
                      wrapper: "mb-0",
                      input: "pl-10 pr-4 py-3 w-full border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-white shadow-sm",
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Security Tips */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h4 className="text-lg font-semibold text-amber-900 mb-2">Security Tips</h4>
                  <ul className="text-sm text-amber-800 space-y-1">
                    <li>• Use a unique password that you haven't used elsewhere</li>
                    <li>• Consider using a password manager to generate secure passwords</li>
                    <li>• Never share your password with anyone</li>
                    <li>• Change your password regularly for better security</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Password;
