import {
  Signup,
  Signin,
  ForgotPassword,
} from "../../../components";
import { useEffect, useRef, useState } from "react";
import { FaArrowRightLong } from "react-icons/fa6";
import { useNavigate, useLocation } from "react-router-dom";
import { UseStateContext } from "../../../context/ContextProvider";
import { RouteName } from "../../../routes/RouteNames";
import { Get, Post } from "../../../config/apiMethods";
import { displayMessage } from "../../../config/index";

const Register = () => {
  const { setRole, updateUser } = UseStateContext();

  const navigate = useNavigate();
  const location = useLocation();

  // conditional states
  const [screenStatus, setScreenStatus] = useState<
    "Signin" | "Register" | "Forgot"
  >("Signin");

  const [userRole, setUserRole] = useState<
    "Supervisor" | "Employee" | "HR-Admin" | "Instructor" | null
  >("Supervisor");
  const [forgotPasswordState, setForgotPasswordState] = useState<
    "Email" | "Pin" | "Password" | "Done"
  >("Email");
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [formAnim, setFormAnim] = useState<boolean>(false);
  const [formHeight, setFormHeight] = useState<number | null>(null);
  const formContentRef = useRef<HTMLDivElement | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // inputs
  const [fullName, setFullName] = useState<string>("");
  const [email, setemail] = useState<string>("");
  const [userName, setUserName] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");

  const [otp, setOtp] = useState<string>("");

  // errors
  const [fullNameError, setFullNameError] = useState<string>("");
  const [userNameError, setUserNameError] = useState<string>("");
  const [passwordError, setPasswordError] = useState<string>("");
  const [confirmPasswordError, setConfirmPasswordError] = useState<string>("");
  const [roleError, setRoleError] = useState<string>("");
  const [termsAccepted, setTermsAccepted] = useState<boolean>(false);
  // Grade API removed in corporate model
  useEffect(() => {
    localStorage.clear();
  }, []);
  // Grade-dependent subject fetching removed in corporate model
  useEffect(() => {
    // No longer fetching subjects based on grades
  }, []);

  // trigger a small enter animation whenever the visible form changes
  useEffect(() => {
    setFormAnim(false);
    const id = requestAnimationFrame(() => setFormAnim(true));
    return () => cancelAnimationFrame(id);
  }, [screenStatus, forgotPasswordState]);

  // smoothly animate container height between forms
  useEffect(() => {
    const measure = () => {
      if (formContentRef.current) {
        setFormHeight(formContentRef.current.offsetHeight);
      }
    };
    // measure on next frame after content switch
    const raf = requestAnimationFrame(measure);
    window.addEventListener('resize', measure);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', measure);
    };
  }, [screenStatus, forgotPasswordState]);

  const handleClick = () => {
    try {
      if (isSubmitting) return;
      if (screenStatus === "Signin") {
        setIsSubmitting(true);
        Post("/auth/login", {
          userName: userName,
          password: password,
        })
          .then((res) => {
            if (res.success) {
              if (res.data.isBlocked) {
                displayMessage("Admin has blocked your access to Classerly!", "error");
                return;
              }

              localStorage.setItem("token", res.data.token);
              delete res.data.token;

              // Use updateUser to properly set both user and role state
              updateUser(res.data);

              displayMessage(res.message, "success");

              // Add small delay to allow success message to be seen before navigation
              setTimeout(() => {
                // Check if there's a redirect path from protected route
                const from = location.state?.from?.pathname;

                // If user was redirected from a protected route, go back there
                if (from && from !== RouteName.AUTH_SCREEN) {
                  navigate(from, { replace: true });
                  return;
                }

                // Otherwise, navigate to appropriate dashboard based on role
                switch (res.data.userType) {
                  case "Employee":
                    navigate(RouteName?.DASHBOARD_SCREEN_EMPLOYEE);
                    break;
                  case "Supervisor":
                    navigate(RouteName?.DASHBOARD_SCREEN);
                    break;
                  case "HR-Admin":
                    navigate(RouteName?.DASHBOARD_SCREEN_HR_ADMIN);
                    break;
                  case "Instructor":
                    navigate(RouteName?.DASHBOARD_SCREEN_HR_ADMIN);
                    break;
                  default:
                    navigate(RouteName?.DASHBOARD_SCREEN);
                    break;
                }
              }, 1500);
            } else {
              displayMessage(res.message, "error");
            }
          })
          .catch((err) => {
            displayMessage(err.message, "error");
          })
          .finally(() => setIsSubmitting(false));
      } else if (screenStatus === "Register") {
        setRole(userRole);
        if (password != confirmPassword) {
          displayMessage("password must be same", "error");
          return;
        }
        if (!termsAccepted) {
          displayMessage("You must accept the Terms of Use to continue", "error");
          return;
        }
        let payload: any;
        // grade and subject logic removed - no longer needed in corporate model
        payload = {
          userType: userRole,
          userName: userName,
          password: password,
          fullName,
          email,
        };

        if (userRole == "Supervisor") {
          // Only set childIds if rollNo is provided (for existing students)
          // This section maintained for Supervisor role - they may still need childIds
          // Additional rollNo variable might be needed for supervisors
        }
        // Parent code logic removed for Employee registration
        // if(userRole=="HR-Admin"){
        //     payload.subject= course
        // }

        // return;
        setIsSubmitting(true);
        Post("/auth/register", payload)
          .then((res) => {
            if (res.success) {
              localStorage.setItem("token", res.data.token);

              // Use updateUser to properly set both user and role state
              updateUser(res.data);

              // Use the backend message or a fallback
              const successMessage = res.message || "Account created successfully!";
              displayMessage(successMessage, "success");

              // Add small delay to allow success message to be seen before navigation
              setTimeout(() => {
                // Check if there's a redirect path from protected route
                const from = location.state?.from?.pathname;

                // If user was redirected from a protected route, go back there
                if (from && from !== RouteName.AUTH_SCREEN) {
                  navigate(from, { replace: true });
                  return;
                }

                // Otherwise, navigate to appropriate dashboard based on role
                switch (userRole) {
                  case "Employee":
                    navigate(RouteName?.DASHBOARD_SCREEN_EMPLOYEE);
                    break;
                  case "Supervisor":
                    navigate(RouteName?.DASHBOARD_SCREEN);
                    break;
                  case "HR-Admin":
                    navigate(RouteName?.DASHBOARD_SCREEN_HR_ADMIN);
                    break;
                  case "Instructor":
                    navigate(RouteName?.DASHBOARD_SCREEN_HR_ADMIN);
                    break;
                  default:
                    navigate(RouteName?.DASHBOARD_SCREEN);
                    break;
                }
              }, 1500);
            } else {
              displayMessage(res.message, "error");
            }
          })
          .catch((err) => {
            displayMessage(err.message, "error");
          })
          .finally(() => setIsSubmitting(false));
      } else if (screenStatus === "Forgot") {
        switch (forgotPasswordState) {
          case "Email": {
            setIsSubmitting(true);
            Post("/auth/forgotpassword", {
              userName,
            })
              .then((res) => {
                if (res.success) {
                  localStorage.setItem("token", res.token);

                  displayMessage(res.message, "success");

                  setForgotPasswordState("Pin");
                } else {
                  displayMessage(res.message, "error");
                }
              })
              .catch((err) => {
                displayMessage(err.message, "error");
              })
              .finally(() => setIsSubmitting(false));

            break;
          }
          case "Pin": {
            setIsSubmitting(true);
            Post("/auth/verify", {
              otp,
            })
              .then((res) => {
                if (res.success) {
                  localStorage.setItem("token", res.token);

                  displayMessage(res.message, "success");

                  setForgotPasswordState("Password");
                } else {
                  displayMessage(res.message, "error");
                }
              })
              .catch((err) => {
                displayMessage(err.message, "error");
              })
              .finally(() => setIsSubmitting(false));
            break;
          }
          case "Password": {
            setIsSubmitting(true);
            Post("/auth/restepassword", {
              password,
            })
              .then((res) => {
                if (res.success) {
                  displayMessage(res.message, "success");

                  setScreenStatus("Signin");

                  // setForgotPasswordState("Done");
                } else {
                  displayMessage(res.message, "error");
                }
              })
              .catch((err) => {
                displayMessage(err.message, "error");
              })
              .finally(() => setIsSubmitting(false));
            break;
          }
          default:
            setForgotPasswordState("Email");
            break;
        }
      }
    } catch (error) { }
  };

  const handleDialog = () => {
    setForgotPasswordState("Email");
    setScreenStatus("Signin");
    setShowDialog(false);
  };

  return (
    <div className="relative min-h-screen w-full bg-gradient-to-br from-blue-200/60 via-indigo-100/60 to-purple-200/60 px-4 py-10 md:py-12">
      {/* subtle gradient blobs */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-28 -left-28 h-96 w-96 rounded-full bg-gradient-to-br from-blue-400/30 to-indigo-300/30 blur-3xl" />
        <div className="absolute -bottom-28 -right-28 h-96 w-96 rounded-full bg-gradient-to-br from-purple-400/30 to-pink-300/30 blur-3xl" />
      </div>
      <div className="w-full max-w-2xl mx-auto">
        {/* Auth Card */}
        <div className="w-full mx-auto">
          <div className="bg-white border border-gray-200 rounded-2xl shadow-md p-5 md:p-6 lg:p-8 auth-card">
            {/* Branding Header */}
            <div className="flex items-center justify-center mb-6">
              <div className="flex items-center gap-3">
                <img
                  src="/classerly.net.png"
                  alt="Classerly Logo"
                  className="h-12 w-auto"
                />
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                  Classerly
                </h1>
              </div>
            </div>

            {/* Form Heading */}
            <div className="mb-4 md:mb-5">
              <h2 className="text-xl md:text-2xl font-semibold text-gray-900">
                {screenStatus === 'Signin' && 'Welcome back'}
                {screenStatus === 'Register' && 'Create your account'}
                {screenStatus === 'Forgot' && (
                  forgotPasswordState === 'Email' ? 'Forgot password' :
                    forgotPasswordState === 'Pin' ? 'Verify code' :
                      forgotPasswordState === 'Password' ? 'Set new password' : 'All done'
                )}
              </h2>
              <p className="mt-1 text-sm text-gray-600">
                {screenStatus === 'Signin' && 'Sign in to continue to your dashboard.'}
                {screenStatus === 'Register' && 'Fill in your details to get started with Classerly.'}
                {screenStatus === 'Forgot' && (
                  forgotPasswordState === 'Email' ? 'Enter your email or username to receive a reset code.' :
                    forgotPasswordState === 'Pin' ? 'Enter the 6‑digit code we sent to your email.' :
                      forgotPasswordState === 'Password' ? 'Choose a strong password you can remember.' : 'You can now sign in with your new password.'
                )}
              </p>
            </div>
            <style dangerouslySetInnerHTML={{
              __html: `
                .auth-card input, .auth-card select, .auth-card textarea {
                  width: 100%;
                  border: 1px solid #E5E7EB;
                  border-radius: 0.75rem; /* rounded-xl */
                  padding: 0.75rem 1rem; /* py-3 px-4 */
                  outline: none;
                  background-color: #FAFAFA; /* gray-50 */
                  transition: box-shadow 0.2s ease, border-color 0.2s ease, background-color 0.2s ease;
                }
                .auth-card input:focus, .auth-card select:focus, .auth-card textarea:focus {
                  border-color: #2563EB; /* blue-600 */
                  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.25);
                  background-color: #FFFFFF;
                }
                .auth-card input::placeholder, .auth-card textarea::placeholder {
                  color: #9CA3AF; /* gray-400 */
                }
                .auth-card label { color: #374151; font-weight: 600; font-size: 0.875rem; }

                /* form enter animation */
                @keyframes formFadeInUp {
                  from { opacity: 0; transform: translateY(8px) scale(0.98); }
                  to { opacity: 1; transform: translateY(0) scale(1); }
                }
                .animate-form-enter { animation: formFadeInUp 300ms ease-out both; }
              `
            }} />
            {/* Tabs */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 p-1 rounded-xl border border-gray-200 bg-white">
                <button
                  onClick={() => { setScreenStatus("Signin"); setForgotPasswordState("Email"); }}
                  className={`${screenStatus === 'Signin'
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-sm'
                    : 'text-gray-700 hover:bg-gray-50'} px-4 py-2 rounded-lg text-sm font-semibold transition-colors`}
                >
                  Sign In
                </button>
                <button
                  onClick={() => { setScreenStatus("Register"); setForgotPasswordState("Email"); }}
                  className={`${screenStatus === 'Register'
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-sm'
                    : 'text-gray-700 hover:bg-gray-50'} px-4 py-2 rounded-lg text-sm font-semibold transition-colors`}
                >
                  Sign Up
                </button>
              </div>
              <div />
            </div>

            {/* Forms + Submit (form element enables Enter-to-submit) */}
            <form
              onSubmit={(e) => { e.preventDefault(); handleClick(); }}
              className="mt-6"
            >
              <fieldset disabled={isSubmitting} aria-busy={isSubmitting} className={`${isSubmitting ? 'opacity-90' : ''}`}>
                <div
                  style={{ height: formHeight ? `${formHeight}px` : undefined, transition: 'height 300ms ease' }}
                  className="overflow-hidden"
                >
                  <div
                    ref={formContentRef}
                    key={`${screenStatus}-${screenStatus === 'Forgot' ? forgotPasswordState : 'form'}`}
                    className={`animate-form-enter ${screenStatus === 'Signin' ? 'flex flex-col justify-center' : ''}`}
                  >
                    {screenStatus === "Register" ? (
                      <Signup
                        role={userRole}
                        setRole={setUserRole}
                        roleError={roleError}
                        setRoleError={setRoleError}
                        fullName={fullName}
                        email={email}
                        setemail={setemail}
                        setFullName={setFullName}
                        fullNameError={fullNameError}
                        setFullNameError={setFullNameError}
                        userName={userName}
                        setUserName={setUserName}
                        userNameError={userNameError}
                        setUserNameError={setUserNameError}
                        password={password}
                        setPassword={setPassword}
                        passwordError={passwordError}
                        setPasswordError={setPasswordError}
                        confirmPassword={confirmPassword}
                        setConfirmPassword={setConfirmPassword}
                        confirmPasswordError={confirmPasswordError}
                        setConfirmPasswordError={setConfirmPasswordError}
                        termsAccepted={termsAccepted}
                        setTermsAccepted={setTermsAccepted}
                      />
                    ) : screenStatus === "Signin" ? (
                      <Signin
                        setScreenStatus={setScreenStatus}
                        userName={userName}
                        setUserName={setUserName}
                        password={password}
                        setPassword={setPassword}
                        userNameError={userNameError}
                        setUserNameError={setUserNameError}
                        passwordError={passwordError}
                        setPasswordError={setPasswordError}
                      />
                    ) : (
                      <ForgotPassword
                        userName={userName}
                        setUserName={setUserName}
                        userNameError={userNameError}
                        setUserNameError={setUserNameError}
                        forgotPasswordState={forgotPasswordState}
                        password={password}
                        setpassword={setPassword}
                        passwordError={passwordError}
                        setpasswordError={setPasswordError}
                        confirmpassword={confirmPassword}
                        setconfirmpassword={setConfirmPassword}
                        confirmpasswordError={confirmPasswordError}
                        setconfirmpasswordError={setConfirmPasswordError}
                        setScreenStatus={setScreenStatus}
                        setForgotPasswordState={setForgotPasswordState}
                        otp={otp}
                        setOtp={setOtp}
                      />
                    )}
                  </div>
                </div>
              </fieldset>

              {/* Primary Action */}
              {!(screenStatus === "Forgot" && forgotPasswordState === "Done") && (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`mt-6 w-full inline-flex items-center justify-center px-5 py-3 rounded-xl text-white font-semibold text-sm shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-opacity ${isSubmitting ? 'opacity-70 cursor-not-allowed bg-blue-600' : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800'}`}
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    screenStatus === "Signin"
                      ? "Sign In"
                      : screenStatus === "Forgot"
                        ? forgotPasswordState === "Pin"
                          ? "Continue"
                          : "Reset Password"
                        : "Create Account"
                  )}
                </button>
              )}
            </form>

            {/* Forgot pagination */}
            {screenStatus === "Forgot" && (
              <div className="flex mt-4 md:mt-5 flex-row justify-center items-center ">
                <div
                  className={`w-7 h-7 mx-1 flex justify-center items-center rounded-full border ${forgotPasswordState === "Email"
                    ? "border-black"
                    : "border-inputBorder"
                    }`}
                >
                  <p
                    className={`text-xs md:text-sm ${forgotPasswordState === "Email"
                      ? "text-black"
                      : "text-inputBorder"
                      } `}
                  >
                    1
                  </p>
                </div>
                <div
                  className={`w-7 h-7 mx-1 flex justify-center items-center rounded-full border ${forgotPasswordState === "Pin"
                    ? "border-black"
                    : "border-inputBorder"
                    }`}
                >
                  <p
                    className={`text-xs md:text-sm ${forgotPasswordState === "Pin"
                      ? "text-black"
                      : "text-inputBorder"
                      } `}
                  >
                    2
                  </p>
                </div>
                <div
                  className={`w-7 h-7 mx-1 flex justify-center items-center rounded-full border ${forgotPasswordState === "Password"
                    ? "border-black"
                    : "border-inputBorder"
                    }`}
                >
                  <p
                    className={`text-xs md:text-sm ${forgotPasswordState === "Password"
                      ? "text-black"
                      : "text-inputBorder"
                      } `}
                  >
                    3
                  </p>
                </div>
                <div
                  className={`w-7 h-7 mx-1 flex justify-center items-center rounded-full border ${forgotPasswordState === "Done"
                    ? "border-black"
                    : "border-inputBorder"
                    }`}
                >
                  <p
                    className={`text-xs md:text-sm ${forgotPasswordState === "Done"
                      ? "text-black"
                      : "text-inputBorder"
                      } `}
                  >
                    {forgotPasswordState === "Done" ? (
                      <FaArrowRightLong className="text-xs md:text-sm" />
                    ) : (
                      "4"
                    )}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {showDialog && (
          <div
            className={`fixed inset-0 flex flex-row justify-center items-center z-50 bg-black bg-opacity-40 px-4`}
            onClick={handleDialog}
          >
            <img
              onClick={handleDialog}
              src={require("../../../images/register/created.png")}
              alt="Success"
              className="cursor-pointer w-full max-w-md h-auto rounded-xl shadow-xl"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Register;
