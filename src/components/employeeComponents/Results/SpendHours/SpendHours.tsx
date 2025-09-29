import { BarChart } from "@mui/x-charts";

const SpendHours = () => {

    return (
        <div className="w-full bg-white h-full py-5 px-4 rounded-2xl">

            {/* header */}
            <div className="mb-4 flex items-center justify-between" >
                <h1 className="font-ubuntu font-medium text-base md:text-xl text-greyBlack">Spend Hours</h1>

                <div className="flex flex-row justify-between items-center flex-wrap">

                    <div className="flex flex-row justify-center items-center mr-2 md:mr-6">

                        <div className="w-2 h-2 md:w-3 md:h-3 bg-orangeBrown mr-1 rounded-full" />
                        <p className="text-xs md:text-sm font-medium text-grey font-ubuntu ">Qizzes</p>

                    </div>

                    <div className="flex flex-row justify-center items-center">

                        <div className="w-2 h-2 md:w-3 md:h-3 bg-fadeBlue mr-1 rounded-full" />
                        <p className="text-xs md:text-sm font-medium text-grey font-ubuntu ">Games</p>

                    </div>


                </div>
            </div>

            {/* chart */}
            <div className=" bg-white text-lg w-full h-52 md:h-80" >
                <BarChart
                    xAxis={[{ scaleType: 'band', data: ['Mon', 'Tues', 'Wed', 'Thur', 'Fri', 'Sat', 'Sun'] }]}
                    series={[{ data: [4, 3, 5, 5, 3, 6, 5] }, { data: [1, 6, 3, 5, 3, 6, 5] }]}
                />
            </div >

            {/* child stats */}
            <div className="grid gap-5 grid-cols-3 rounded-lg border border-greyBlack mt-5 md:mt-8 py-3 md:py-5 px-2" >

                <div className="col-span-1 flex flex-col items-center justify-center w-full" >
                    <div className="flex flex-row items-center justify-center" >
                        <h1 className="font-ubuntu text-sm md:text-base mr-1 md:mr-2 lg:text-2xl font-medium text-bluecolor" >24</h1>
                        <h1 className="font-ubuntu text-xs md:text-sm lg:text-md font-medium text-green-400" >56%</h1>
                    </div>
                    <h3 className="font-ubuntu text-xs md:text-sm text-greyBlack font-medium text-center">Total hours in a week.</h3>
                </div>

                <div className="col-span-1 flex flex-col items-center justify-center w-full" >
                    <div className="flex flex-row items-center justify-center" >
                        <h1 className="font-ubuntu text-sm md:text-base mr-1 md:mr-2 lg:text-2xl font-medium text-bluecolor" >9</h1>
                        <h1 className="font-ubuntu text-xs md:text-sm lg:text-md font-medium text-green-400" >56%</h1>
                    </div>
                    <h3 className="font-ubuntu text-xs md:text-sm text-greyBlack font-medium text-center">Total quiz hours in a week.</h3>
                </div>

                <div className="col-span-1 flex flex-col items-center justify-center w-full" >
                    <div className="flex flex-row items-center justify-center" >
                        <h1 className="font-ubuntu text-sm md:text-base mr-1 md:mr-2 lg:text-2xl font-medium text-bluecolor" >14</h1>
                        <h1 className="font-ubuntu text-xs md:text-sm lg:text-md font-medium text-green-400" >56%</h1>
                    </div>
                    <h3 className="font-ubuntu text-xs md:text-sm text-greyBlack font-medium text-center">Total gaming hours in a week.</h3>
                </div>
            </div>

        </div >
    )
}
export default SpendHours;