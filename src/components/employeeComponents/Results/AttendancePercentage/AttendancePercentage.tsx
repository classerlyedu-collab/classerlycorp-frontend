const AttendancePercentage = () => {

    return (
        <div className="w-full rounded-2xl relative flex flex-row justify-between bg-[#6749E8] items-end">

            <div className="w-full flex flex-col justify-start items-start py-3 px-3 md:py-5 md:px-4" >
                <h1 className="font-ubuntu font-medium text-sm md:text-base text-[#E8D8FA] mb-1 md:mb-2">Attendance Percentage</h1>
                <h1 className="font-semibold text-xl md:text-3xl 2xl:text-5xl text-white mb-3 md:mb-4 tracking-widest md:tracking-wider">90 %</h1>
                <h1 className="font-ubuntu font-normal text-sm md:text-base text-[#E8D8FA] mb-4 md:mb-6">Averga of 5 courses</h1>
            </div>

            <img
                src={require('../../../../images/students/attendancePercentage.png')}
                className="object-contain absolute w-16 sm:w-18 md:w-20 lg:w-24 lg:right-1 bottom-0 right-2"
                alt="Illustration"
            />

        </div>
    )
}
export default AttendancePercentage;