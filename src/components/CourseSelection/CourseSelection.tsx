import { Dispatch, SetStateAction } from "react";

export type dropDownItemsType = {
    label: string;
    value: number | string;
};

interface stylesProps {
    wrapper?: string;
    label?: string;
    inputWrapper?: string;
    placeholder?: string;
    listWrapper?: string;
}

type customInputProps = {
    value: Array<string>;
    setValue: Dispatch<SetStateAction<any>>;
    error?: string;
    label?: string;
    placeholder?: string;
    required?: boolean;
    data?: dropDownItemsType[];
    style?: stylesProps;
};

const CourseSelection = ({
    value,
    setValue,
    error,
    label,
    placeholder,
    required,
    data,
    style
}: customInputProps) => {

    const handleCheckboxChange = (itemValue: string) => {
        if (value.includes(itemValue)) {
            // If item is already in the value array, remove it
            setValue(value.filter((val) => val !== itemValue));
        } else {
            // If item is not in the value array, add it
            setValue([...value, itemValue]);
        }
    };

    return (
        <div className={`${error ? 'mb-0 md:mb-0' : style?.wrapper ? style?.wrapper : 'mb-3 md:mb-5'}`}>

            <div className={`flex flex-row justify-start`}>
                <label className={`block text-sm font-medium leading-6 text-label mr-1  ${style?.label && style?.label}`}>
                    {label}
                </label>

                {required && (
                    <label className="block text-sm font-medium leading-6 text-labelRequired mr-1">*</label>
                )}
            </div>

            <div className="w-full">
                <div className={`w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 ${style?.listWrapper ? style?.listWrapper : ''}`}>
                    {
                        data?.map((item: dropDownItemsType, index: number) => (
                            <div
                                key={index}
                                className={`flex items-center p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer ${value.includes(item.value.toString())
                                        ? 'bg-gradient-to-r from-green-50 to-blue-50 border-green-300 shadow-md'
                                        : 'bg-white border-gray-200 hover:border-green-200 hover:shadow-sm'
                                    }`}
                                onClick={() => handleCheckboxChange(item.value.toString())}
                            >
                                <div className="relative">
                                    <input
                                        type="checkbox"
                                        checked={value.includes(item.value.toString())}
                                        onChange={() => handleCheckboxChange(item.value.toString())}
                                        className="sr-only"
                                    />
                                    <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all duration-200 ${value.includes(item.value.toString())
                                            ? 'bg-gradient-to-r from-green-500 to-blue-500 border-green-500'
                                            : 'border-gray-300 bg-white'
                                        }`}>
                                        {value.includes(item.value.toString()) && (
                                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                            </svg>
                                        )}
                                    </div>
                                </div>
                                <label className={`ml-3 text-sm font-medium cursor-pointer transition-colors duration-200 ${value.includes(item.value.toString())
                                        ? 'text-green-700'
                                        : 'text-gray-700 hover:text-green-600'
                                    }`}>
                                    {item.label}
                                </label>
                            </div>
                        ))
                    }
                </div>
            </div>

            {error && (
                <label className="block font-medium leading-6 text-labelRequired mr-1 text-xs">
                    {error}
                </label>
            )}

        </div>
    );
};

export default CourseSelection;