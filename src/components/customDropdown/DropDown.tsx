import { Dispatch, SetStateAction } from "react";
import { useState } from 'react';
import { BiChevronDown, BiChevronUp } from "react-icons/bi";
import { returnMatchingLabel } from "../../constants/register";

// this is new
export type dropDownItemsType = {
    label: string;
    value: number | string;
};

interface stylesProps {
    wrapper?: string;
    label?: string;
    inputWrapper?: string;
    placeholder?: string;
    arrow?: string;
    listWrapper?: string;

};

type customInputProps = {
    value: number | null | string;
    setValue: Dispatch<SetStateAction<number | null | string>>;
    error?: string;
    setError?: Dispatch<SetStateAction<string>>;
    label?: string;
    placeholder?: string;
    required?: boolean;
    type?: 'text' | 'email' | 'password' | 'number';
    data?: dropDownItemsType[];
    style?: stylesProps;
};

const DropDown = ({
    value,
    setValue,
    error,
    setError,
    label,
    placeholder,
    required,
    data,
    style
}: customInputProps) => {

    const [isExpanded, setIsExpanded] = useState<boolean>(false);

    return (
        <div className={`${error ? 'mb-0 md:mb-0' : style?.wrapper ? style?.wrapper : 'mb-3 md:mb-5'}`} >

            <div className={`flex flex-row justify-start`} >
                <label className={`block text-sm font-medium leading-6 text-label mr-1  ${style?.label && style?.label}`}>{label}</label>

                {
                    required && (
                        <label className="block text-sm font-medium leading-6 text-labelRequired mr-1">*</label>

                    )
                }

            </div>

            <div className="w-full relative" >
                <div
                    onClick={() => setIsExpanded(!isExpanded)}
                    className={`block w-full ${isExpanded ? 'rounded-t-md' : 'rounded-md'} border-0 pl-7 pr-7 text-gray-900 ring-1 ring-inset ${error ? 'ring-labelRequired' : 'ring-inputBorder'} bg-inputBackground focus:ring-2 focus:ring-inset focus:ring-black-600 h-8 md:h-9 flex flex-row  ${value || placeholder ? 'justify-between' : 'justify-end'} items-center ${style?.inputWrapper && style?.inputWrapper}`} >

                    {
                        value ?
                            (
                                <p className={`text-black sm:text-sm sm:leading-6 font-ubuntu font-medium ${style?.placeholder && style?.placeholder}`}>{returnMatchingLabel({ arrayOfObject: data, value })}</p>
                            )
                            :
                            (
                                <>
                                    {
                                        placeholder && (
                                            <p className={`text-inputPlaceholder sm:text-sm sm:leading-6 font-ubuntu font-medium ${style?.placeholder && style?.placeholder}`}>{placeholder}</p>
                                        )
                                    }
                                </>
                            )
                    }

                    {
                        isExpanded ?
                            (
                                <BiChevronUp className={`text-xl md:text-2xl ${style?.arrow && style?.arrow}`} />
                            )
                            :
                            (
                                <BiChevronDown className={`text-xl md:text-2xl ${style?.arrow && style?.arrow}`} />
                            )
                    }
                </div>

                {
                    isExpanded && (
                        <div className={`h-50 z-10 w-full absolute rounded-b-md bg-inputBackground ring-inputBorder ring-1 ring-inset max-h-40 overflow-y-auto ${style?.listWrapper ? style?.listWrapper : ''}`} >
                            {
                                data?.map((item: dropDownItemsType, index: number) => (
                                    <div id={index?.toString()} className={`h-full w-full px-4 md:px-5 cursor-pointer py-0.5 md:py-1 ${data?.length - 1 !== index && 'border-b'} border-inputBorder`}
                                        onClick={() => {
                                            setValue(item?.value);
                                            setIsExpanded(false);
                                        }}
                                    >
                                        <p className={`text-sm ${item?.value === value ? 'text-radio' : 'text-neutral-600'} md:text-md font-medium`} >{item?.label}</p>
                                    </div>
                                ))
                            }
                        </div>
                    )
                }
            </div>


            {
                error && (
                    <label className="block font-medium leading-6 text-labelRequired mr-1 text-xs">{error}</label>

                )
            }

        </div >


    );
};

export default DropDown;