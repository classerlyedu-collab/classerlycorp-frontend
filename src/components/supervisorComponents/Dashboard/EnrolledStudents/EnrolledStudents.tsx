
const EnrolledStudents = () => {
    return (
        <div className="w-full h-full flex flex-col justify-center items-start bg-white rounded-xl">
            <img src={require('../../../../images/drawer/Dashboard/teacherpic.png')} alt="Teacher" className=" w-full md:h-4/5" />

            <div className="flex flex-row w-full px-2 justify-between items-center">
                <p className="font-ubuntu text-bluecolor font-medium text-xs md:text-sm">5,957 Enrolled Students</p>
                <p className="font-ubuntu text-bluecolor font-medium text-xs md:text-sm">See Details</p>
            </div>

            <div className="justify-center justify-items-center mt-2 px-2">
                <h1 className="font-ubuntu text font-bold text-sm md:text-base">Want to hire a teacher for your child?</h1>
            </div>

            <div className="border-bluecolor border rounded-2xl flex justify-center items-center w-1/3 min-w-32 mt-4 md:px-3 md:py-1 cursor-pointer group hover:bg-bluecolor mx-auto mb-4 md:mb-4 transition-all duration-200 delay-200">
                <h1 className="font-ubuntu text-bluecolor group-hover:text-white font-medium text-sm md:text-base transition-all duration-200 delay-200">Hire Now</h1>
            </div>


        </div>
    )
}

export default EnrolledStudents;