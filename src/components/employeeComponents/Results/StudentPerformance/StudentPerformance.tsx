const StudentPerformance = () => {

    return (
        <div className="w-full rounded-2xl relative flex flex-row justify-between bg-purple items-end">

            <div className="w-full flex flex-col justify-start items-start py-3 px-3 md:py-5 md:px-4" >
                <h1 className="font-ubuntu font-medium text-sm md:text-base text-[#E8D8FA] mb-1 md:mb-2">Student Performance</h1>
                <h1 className="font-semibold text-xl md:text-3xl 2xl:text-5xl text-white mb-3 md:mb-4 tracking-widest md:tracking-wider">88 %</h1>
                <h1 className="font-ubuntu font-normal text-sm md:text-base text-[#E8D8FA] mb-4 md:mb-6">Averga of 5 courses</h1>
            </div>

            <img
                src={require('../../../../images/students/studentPerformance.png')}
                className="object-contain absolute w-32 sm:w-32 md:w-40 lg:w-40 lg:right-1 -bottom-1.5 md:-bottom-2 right-2"
                alt="Illustration"
            />

        </div>
    )
}
export default StudentPerformance;