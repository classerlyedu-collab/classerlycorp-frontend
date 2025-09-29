import { Dispatch, SetStateAction, useState } from "react";
import './customInput.css';
import { FiEye, FiEyeOff } from 'react-icons/fi';

interface stylesProps {
    wrapper?: string;
    label?: string;
    input?: string;
    error?: string;

};


type customInputProps = {
    value: string;
    setValue: Dispatch<SetStateAction<string>>;
    error?: string;
    setError?: Dispatch<SetStateAction<string>>;
    label?: string;
    placeholder: string;
    required?: boolean;
    type?: 'text' | 'email' | 'password' | 'number';
    outlined?: boolean;
    style?: stylesProps;

};

const CustomInput = ({
    value,
    setValue,
    error,
    setError,
    label,
    placeholder,
    required,
    type,
    outlined,
    style,

}: customInputProps) => {

    const [isPasswordVisible, setIsPasswordVisible] = useState<boolean>(false);
    const isPassword = type === 'password';
    const inputType = isPassword ? (isPasswordVisible ? 'text' : 'password') : (type ? type : 'text');

    return (
        <div className={`${error ? 'mb-0 md:mb-0' : style?.wrapper ? style.wrapper : 'mb-3 md:mb-5 '}`} >

            <div className={`flex flex-row justify-start`} >
                <label className={`block text-sm font-medium leading-6 text-label mr-1  ${style?.label ? style?.label : ''}`}>{label}</label>

                {
                    required && (
                        <label className="block text-sm font-medium leading-6 text-labelRequired mr-1">*</label>

                    )
                }

            </div>

            <div className="relative">
                <input
                    type={inputType}
                    value={value}
                    disabled={placeholder === "e.g user@gmail.com"}
                    required={required ? required : false}
                    onChange={(e) => setValue(e.target.value)}
                    className={`block w-full  py-1.5 pl-7 ${isPassword ? 'pr-10' : 'pr-20'} text-gray-900 ${outlined ? "border-b bg-transparent" : "border border-inputBorder rounded-md bg-inputBackground"} ${error ? 'border-labelRequired' : 'border-inputBorder'} placeholder:text-inputPlaceholder focus:border-black-600 sm:text-sm sm:leading-6 font-ubuntu font-medium  ${style?.input ? style?.input : ''}`}
                    placeholder={placeholder}
                    onFocus={() => {
                        if (error && setError) {
                            setError('');
                        }
                    }}
                />
                {isPassword && (
                    <button
                        type="button"
                        onClick={() => setIsPasswordVisible((v) => !v)}
                        className="absolute inset-y-0 right-2 flex items-center justify-center text-gray-500 hover:text-gray-700"
                        aria-label={isPasswordVisible ? 'Hide password' : 'Show password'}
                    >
                        {isPasswordVisible ? <FiEyeOff /> : <FiEye />}
                    </button>
                )}
            </div>
            {
                error && (
                    <label className={`block font-medium leading-6 text-labelRequired mr-1 text-xs  ${style?.error ? style?.error : ''}`}>{error}</label>

                )
            }

        </div>


    );
}

export default CustomInput;