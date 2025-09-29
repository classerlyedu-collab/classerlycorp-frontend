import { CustomInput, OtpInput } from "../../../components";
import { Dispatch, SetStateAction, useState } from 'react';

type propsForgotPassword = {
    userName: string;
    setUserName: Dispatch<SetStateAction<string>>;
    userNameError: string;
    setUserNameError: Dispatch<SetStateAction<string>>;
    forgotPasswordState: "Email" | "Pin" | "Password" | "Done";
    password: string;
    setpassword: Dispatch<SetStateAction<string>>;
    confirmpassword: string;
    setconfirmpassword: Dispatch<SetStateAction<string>>;
    passwordError: string;
    setpasswordError: Dispatch<SetStateAction<string>>;
    confirmpasswordError: string;
    setconfirmpasswordError: Dispatch<SetStateAction<string>>;
    setForgotPasswordState: any;
    setScreenStatus: any;
    otp: string;
    setOtp: any;

};

const ForgotPassword = ({
    userName,
    setUserName,
    userNameError,
    setUserNameError,
    forgotPasswordState,
    password,
    setpassword,
    passwordError,
    setpasswordError,
    confirmpassword,
    setconfirmpassword,
    confirmpasswordError,
    setconfirmpasswordError,
    setForgotPasswordState,
    setScreenStatus,
    otp,
    setOtp
}: propsForgotPassword) => {


    const handleSubmit = (pin: string) => {
        setOtp(pin);
    }

    const renderContent = () => {
        switch (forgotPasswordState) {
            case 'Email':
                return (
                    <>
                        <img src={require('../../../images/register/lock.png')} alt="Lock icon" className="w-12 h-12 md:w-14 md:h-14 mt-4 mb-4 border-true" />

                        <h1 className="text-lg md:text-xl font-medium">Forgot Password?</h1>
                        <p className="text-base md:text-sm font-medium pt-4 text-black opacity-50 pb-12">No worries we'll send you reset instructions</p>

                        <CustomInput
                            value={userName}
                            setValue={setUserName}
                            error={userNameError}
                            setError={setUserNameError}
                            required={false}
                            placeholder="Enter Your Email or Username"
                            outlined={true}
                        />
                    </>
                );
            case 'Pin':
                return (
                    <div>
                        <img src={require('../../../images/register/pin.png')} alt="Pin icon" className="w-12 h-12 md:w-14 md:h-14 mt-4 mb-4 border-true" />

                        <h1 className="text-lg md:text-xl font-medium">Reset Password?</h1>
                        <div className="pt-3 md:pt-4 pb-8 md:pb-12 flex flex-row justify-start items-center" >
                            <p className="text-xs md:text-sm font-medium text-secondary opacity-50">We sent a code to </p>
                            <p className="text-xs md:text-sm text-secondary font-bold opacity-50 ml-1">{userName}</p>
                        </div>

                        <OtpInput length={6} onComplete={handleSubmit} />

                        <div className="pt-3 md:pt-4 pb-8 md:pb-12 flex flex-row justify-center items-center w-full" >
                            <p className="text-xs md:text-sm font-medium text-black opacity-50">Didn`t received the email? </p>
                            <p className="text-xs md:text-sm text-secondary font-bold opacity-50 ml-1 cursor-pointer" onClick={() => { setForgotPasswordState("Email") }}>Click to resend.</p>
                        </div>
                    </div>
                );
            case 'Password':
                return (
                    <div>
                        <img src={require('../../../images/register/password.png')} alt="Password icon" className="w-12 h-12 md:w14 md:h14 mt-3 mb-3" />
                        <h1 className="text-lg md:text-xl pt-3 font-medium ">Set new password</h1>
                        <p className="text-xs md:text-sm font-normal pt-2 pb-7 text-black opacity-50 ">Must be at least 8 characters.</p>

                        <CustomInput
                            value={password}
                            setValue={setpassword}
                            error={passwordError}
                            setError={setpasswordError}
                            required={true}
                            label="Password"
                            placeholder="********"
                            type='password'
                            outlined={true}
                        />
                        <CustomInput
                            value={confirmpassword}
                            setValue={setconfirmpassword}
                            error={confirmpasswordError}
                            setError={setconfirmpasswordError}
                            required={true}
                            label="Confirm Password"
                            placeholder="********"
                            type='password'
                            outlined={true}
                        />
                    </div>
                );
            case 'Done':
                return (
                    <div>
                        <img src={require('../../../images/register/all done.png')} alt="Success icon" className="w-12 h-12 md:w-14 md:h-14 mt-4 mb-4 border-true" />


                        <div>
                            <h1 className="mb-2 mt-5 text-lg md:text-2xl font-medium">All done!</h1>
                            <p className="text-base md:text-sm font-light">Your password has been reset.Would you like to setup <p className="bg-gradient-to-r from-primary to-secondary inline-block text-transparent bg-clip-text">recovery email</p> as well?</p>

                            <div className="bg-gradient-to-r from-primary to-secondary h-10 w-full rounded-md mt-16 text-center pt-2 text-white cursor-pointer">
                                <p className="font-normal text-sm md:base ">Set up recovery email</p>
                            </div>
                            <div className="h-10 w-full rounded-md mt-4 text-center pt-2 border-black cursor-pointer border " onClick={() => {
                                setForgotPasswordState('Email');
                                setScreenStatus('Signin');
                            }} >
                                <p className="font-normal text-base text-black ">I'll do this later</p>
                            </div>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="w-11/12 h-full">
            {renderContent()}
        </div>
    );
};

export default ForgotPassword;