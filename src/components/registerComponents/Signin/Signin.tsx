import { CustomInput } from "../../../components";

type SigninProps = {
    setScreenStatus: any;
    userName: string;
    setUserName: any;
    password: string;
    setPassword: any;
    userNameError: string;
    setUserNameError: any;
    passwordError: string;
    setPasswordError: any;
};

const Signin = ({
    setScreenStatus,
    userName,
    setUserName,
    password,
    setPassword,
    userNameError,
    setUserNameError,
    passwordError,
    setPasswordError

}: SigninProps) => {

    return (
        <div className="w-11/12 h-full" >
            <CustomInput
                value={userName}
                setValue={setUserName}
                error={userNameError}
                setError={setUserNameError}
                required={true}
                label="User Name"
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
                placeholder="6+ Characters"
                
            />
            <div
                className="flex justify-end font-normal text-sm pt-5 cursor-pointer"
                onClick={() => setScreenStatus('Forgot')}
            >
                <p className="bg-gradient-to-r from-primary to-secondary inline-block text-transparent bg-clip-text">Forgot Password?</p>
            </div>

        </div>

    );
};

export default Signin;