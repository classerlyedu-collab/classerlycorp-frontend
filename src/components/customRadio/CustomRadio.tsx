import { Dispatch, SetStateAction } from "react";

type customInputProps = {
    value?: any;
    setValue: Dispatch<SetStateAction<any>>;
    error?: string;
    setError?: Dispatch<SetStateAction<string>>;
    label?: string;
    required?: boolean;
    name: string;
};

const CustomRadio = ({
    value,
    setValue,
    error,
    setError,
    label,
    required,
    name
}: customInputProps) => {

    const isClicked = name === value;

    const hanleClick = () => {
        try {
            if (!isClicked) {
                setValue(name);
            } else {
                setValue(null);
            }
        } catch (error) {

        }
    }

    return (
        <div
            className={`flex flex-row justify-center items-center w-auto cursor-pointer mb-3  md:mb-5`}
            onClick={hanleClick}
        >
            <div className={`border-2 border-radio rounded-full p-0.5 `} >
                <div className={`${isClicked ? 'bg-radio' : 'bg-transparent'} w-full h-full rounded-full p-1.5`} />
            </div>

            <p className="text-sm font-ubuntu font-medium ml-1" >{label}</p>

        </div>


    );
};

export default CustomRadio;