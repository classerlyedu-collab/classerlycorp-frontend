import { dropDownItemsType } from "../components/customDropdown/DropDown";

export const imagesArray = [
    require('../images/register/slider1.png'),
    require('../images/register/slider2.png'),
    require('../images/register/slider3.png')
];

export const gradeObject = [
    {
        label: "Grade 3",
        value: 3
    },
    {
        label: "Grade 4",
        value: 4
    },
    {
        label: "Grade 5",
        value: 5
    },
];

type propsMatchinLabel = {
    arrayOfObject: dropDownItemsType[] | undefined;
    value: any;
};

export const returnMatchingLabel = ({ arrayOfObject, value }: propsMatchinLabel) => {
    try {
        if (value) {
            const foundObject = arrayOfObject?.find((item: any) => item?.value === value);
            return foundObject ? foundObject.label : '';
        } else {
            return '';
        }
    } catch (error) {
        return '';
    }
};
