import { CustomInput, CustomRadio } from "../../../components";

type SignupProps = {
    role: string | null;
    setRole: any;
    fullName: string;
    setFullName: any;
    userName: string;
    setUserName: any;
    password: string;
    setPassword: any;
    confirmPassword: string;
    setConfirmPassword: any;
    fullNameError: string;
    setFullNameError: any;
    userNameError: string;
    setUserNameError: any;
    passwordError: string;
    setPasswordError: any;
    confirmPasswordError: string;
    setConfirmPasswordError: any;
    roleError: string;
    setRoleError: any;
    email: string;
    setemail: any;
    termsAccepted: boolean;
    setTermsAccepted: any;
};

const Signup = ({
    role,
    setRole,
    fullName,
    setFullName,
    userName,
    setUserName,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    fullNameError,
    setFullNameError,
    userNameError,
    setUserNameError,
    passwordError,
    setPasswordError,
    confirmPasswordError,
    setConfirmPasswordError,
    roleError,
    setRoleError,
    email,
    setemail,
    termsAccepted,
    setTermsAccepted,
}: SignupProps) => {

    return (
        <>
            <div className="w-11/12" >
                <CustomInput
                    value={fullName}
                    setValue={setFullName}
                    error={fullNameError}
                    setError={setFullNameError}
                    required={true}
                    label="Full Name"
                    placeholder="e.g Mary Jackson"
                />
                <CustomInput
                    value={email}
                    setValue={setemail}
                    // error={userNameError}
                    // setError={setUserNameError}
                    required={true}
                    label="Email"
                    placeholder="e.g maryjackson123@gmail.com"
                />

                <CustomInput
                    value={userName}
                    setValue={setUserName}
                    error={userNameError}
                    setError={setUserNameError}
                    required={true}
                    label="Username"
                    placeholder="e.g maryjackson123"
                />

                <CustomInput
                    value={password}
                    setValue={setPassword}
                    error={passwordError}
                    setError={setPasswordError}
                    required={true}
                    type="password"
                    label="Password"
                    placeholder="6+ characters"

                />

                <CustomInput
                    value={confirmPassword}
                    setValue={setConfirmPassword}
                    error={confirmPasswordError}
                    setError={setConfirmPasswordError}
                    required={true}
                    label="Confirm Password"
                    placeholder="6+ characters"
                    type='password'
                />

                {/* role selection - inline, non-grid feel */}
                <div className="flex flex-wrap items-center gap-4 px-3">
                    <CustomRadio
                        value={role}
                        setValue={setRole}
                        name="Supervisor"
                        label="Supervisor"
                        error={roleError}
                        setError={setRoleError}
                    />
                    <CustomRadio
                        value={role}
                        setValue={setRole}
                        name="Employee"
                        label="Employee"
                        error={roleError}
                        setError={setRoleError}
                    />
                    <CustomRadio
                        value={role}
                        setValue={setRole}
                        name="HR-Admin"
                        label="HR-Admin"
                        error={roleError}
                        setError={setRoleError}
                    />
                    <CustomRadio
                        value={role}
                        setValue={setRole}
                        name="Instructor"
                        label="Instructor"
                        error={roleError}
                        setError={setRoleError}
                    />
                </div>



                {/* Grade, course selection, and parent code removed for Employee signup */}

                {/* <div className={`${role === null ? 'h-36 md:h-40' : (role === 'HR-Admin' ? 'hidden' : 'h-20')}`} /> */}
                {/* <div className="h-20" /> */}

            </div>

            {/* policies */}
            <div className="w-11/12 px-3 flex items-start gap-2 mb-3">
                <input
                    type="checkbox"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    className="h-3 sm:h-4 text-secondary bg-gray-100 border-gray-300 rounded mt-1" style={{ width: 20, minWidth: 20, maxWidth: 20 }}
                />
                <p className="text-[11px] sm:text-xs font-medium text-inputPlaceholder leading-snug max-w-[28rem]">
                    Creating an account means you're okay with our{" "}
                    <a
                        href="https://gamma.app/docs/Classerly-Terms-of-Use-e5vf07e83fahkw8?mode=present#card-ay2yzv05j51jqeu"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-secondary cursor-pointer hover:underline"
                    >
                        Terms of Use
                    </a>
                    {" "}(click to read), Privacy Policy, and our default{" "}
                    <span className="text-radio cursor-pointer">Notification Settings.</span>
                </p>
            </div>
        </>
    );
};

export default Signup;