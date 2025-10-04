import { Dispatch, SetStateAction } from "react";
import { useState } from 'react';
import { BiChevronDown, BiChevronUp } from "react-icons/bi";
import { returnMatchingLabel } from "../../constants/register";


export type dropDownItemsType = {
    label: string;
    value: string | number;
    image?: string;
};

interface stylesProps {
    wrapper?: string;
    inputWrapper?: string;
    placeholder?: string;
    arrow?: string;
    listWrapper?: string;

};

type customInputProps = {
    // Single-select
    value?: string | number | null;
    setValue?: Dispatch<SetStateAction<string | number>>;
    // Multi-select
    values?: Array<string | number>;
    setValues?: Dispatch<SetStateAction<Array<string | number>>>;
    isMulti?: boolean;
    // Common
    placeholder?: string;
    required?: boolean;
    type?: 'text' | 'email' | 'password' | 'number';
    data?: dropDownItemsType[];
    options?: dropDownItemsType[]; // alias for data
    style?: stylesProps;
    imagePath?: any;
};

const RoundedDropDown = ({
    value,
    setValue,
    values,
    setValues,
    isMulti,
    placeholder,
    data,
    options,
    style,
    imagePath
}: customInputProps) => {

    const [isExpanded, setIsExpanded] = useState<boolean>(false);
    const items: dropDownItemsType[] = (data || options) || [];

    return (
        <div className={`${style?.wrapper ? style?.wrapper : 'rounded-full'}`} >

            <div className="w-full relative" >
                <div
                    onClick={() => setIsExpanded(!isExpanded)}
                    className={`block w-full ${isExpanded ? 'rounded-t-lg' : 'rounded-full'} border-0 px-1 min-w-24 text-gray-900  h-8 md:h-9 flex flex-row ${(isMulti ? (values && values.length > 0) : value) || placeholder || imagePath ? 'justify-between' : 'justify-end'} items-center ${style?.inputWrapper ? style?.inputWrapper : 'ring-1 ring-inset ring-inputBorder bg-inputBackground'}`} >

                    {
                        imagePath && (
                            <img src={imagePath} alt="img" className="w-9" />
                        )
                    }

                    {
                        (isMulti ? (values && values.length > 0) : value) ?
                            (
                                <p className={`text-black sm:text-sm sm:leading-6 font-ubuntu font-medium ${style?.placeholder && style?.placeholder}`}>
                                    {isMulti
                                        ? `${values?.length} selected`
                                        : returnMatchingLabel({ arrayOfObject: items as any, value: value as any })}
                                </p>
                            )
                            :
                            (
                                <>
                                    {
                                        placeholder && (
                                            <p className={`text-greyBlack sm:text-sm sm:leading-6 font-ubuntu font-medium ${style?.placeholder && style?.placeholder}`}>{placeholder}</p>
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
                        <div className={`max-h-52 w-36 absolute overflow-x-hidden overflow-y-auto scrollbar scrollbar-thin scrollbar-thumb-gray-400 rounded-b-md ${style?.listWrapper ? style?.listWrapper : 'bg-inputBackground ring-inputBorder ring-1 ring-inset'}`} >
                            {
                                items?.map((item: dropDownItemsType, index: number) => (
                                    <div id={index?.toString()} className={`h-auto w-full md:px-5 cursor-pointer ${item?.image ? 'py-1 md:py-1.5 pb-2 flex items-center px-2' : 'py-0.5 md:py-1 px-4'}`}
                                        onClick={() => {
                                            if (isMulti && setValues) {
                                                const current = new Set(values || []);
                                                if (current.has(item.value)) {
                                                    current.delete(item.value);
                                                } else {
                                                    current.add(item.value);
                                                }
                                                setValues(Array.from(current));
                                            } else if (setValue) {
                                                setValue(item?.value);
                                                setIsExpanded(false);
                                            }
                                        }}
                                    >
                                        {
                                            item?.image && (
                                                <img src={item?.image} alt="img" className="w-5 mr-2" />
                                            )
                                        }
                                        <p className={`text-sm ${(isMulti ? (values || []).includes(item.value) : item?.value === value) ? 'text-radio' : 'text-neutral-600'} md:text-md font-medium`} >{item?.label}</p>
                                    </div>
                                ))
                            }
                        </div>
                    )
                }
            </div>

        </div >


    );
};

export default RoundedDropDown;