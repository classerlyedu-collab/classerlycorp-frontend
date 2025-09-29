import { useState } from 'react';
import { DatePicker, RadioGroup, Radio } from 'rsuite';
// import 'rsuite/DatePicker/styles/index.css';

const Schedule = () => {
    const [weekStart, setWeekStart] = useState<number>(0);
    const [startDate, setStartDate] = useState<Date>(new Date());

    const getWeekDates = (startDate: Date, weekStart: number): number[] => {
        const weekDates: number[] = [];
        const startDay = startDate.getDay();
        const startOfWeek = new Date(startDate);

        // Adjust to the start of the week based on the selected week start
        startOfWeek.setDate(startDate.getDate() - startDay + weekStart);

        for (let i = 0; i < 7; i++) {
            const currentDate = new Date(startOfWeek);
            currentDate.setDate(startOfWeek.getDate() + i);
            weekDates.push(currentDate.getDate());
        }

        return weekDates;
    };

    const handleDateChange = (value: Date | null) => {
        if (value) {
            setStartDate(value);
            // Optionally adjust week start based on new date if needed
        }
    };

    const weekDates = getWeekDates(startDate, weekStart);

    return (
        <div className="w-full h-full bg-white rounded-lg">
            <DatePicker
                appearance="subtle"
                placeholder="Schedule"
                className="w-full"
                onChange={handleDateChange}
            />

            <RadioGroup
                inline
                appearance="picker"
                value={weekStart}
                onChange={(value: any) => setWeekStart(value)}
                className="w-full justify-around"
            >
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((dayName, index) => (
                    <div key={index} className="flex flex-col items-center justify-center">
                        <Radio value={index}>{dayName}</Radio>
                        <div className={`h-6 w-6 my-2 ${weekStart === index ? 'bg-blue-700 rounded-full shadow-lg text-mainBg' : 'text-grey'} flex items-center justify-center`}>
                            <h6 className='text-sm' >{weekDates[index]}</h6>
                        </div>
                    </div>
                ))}
            </RadioGroup>
        </div>
    );
};

export default Schedule;
