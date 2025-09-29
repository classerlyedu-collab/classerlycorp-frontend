import { LineChart } from "@mui/x-charts";

const Progress = () => {

    return (
        <div className="w-full px-2 bg-white md:pl-8 flex flex-col justify-between py-3 md:py-8 items-start rounded-2xl">

            <div className="w-full flex flex-row justify-between items-center">
                <h1 className="font-ubuntu font-medium text-base md:text-xl text-greyBlack">Progress</h1>


                <div className="flex flex-row justify-between items-center flex-wrap">

                    <div className="flex flex-row justify-center items-center mr-2 md:mr-6">

                        <div className="w-2 h-2 md:w-3 md:h-3 bg-purple mr-1 rounded-sm" />
                        <p className="text-xs md:text-base text-greyBlack">Lectures</p>

                    </div>

                    <div className="flex flex-row justify-center items-center mr-2 md:mr-6">

                        <div className="w-2 h-2 md:w-3 md:h-3 bg-orangeBrown mr-1 rounded-sm" />
                        <p className="text-xs md:text-base text-greyBlack">Qizzes</p>

                    </div>

                    <div className="flex flex-row justify-center items-center">

                        <div className="w-2 h-2 md:w-3 md:h-3 bg-fadeBlue mr-1 rounded-sm" />
                        <p className="text-xs md:text-base text-greyBlack">Games</p>

                    </div>


                </div>
            </div>

            <div className='w-full' >
                <LineChart
                    xAxis={[{ data: [1, 2, 3, 5, 8, 10] }]}
                    series={[
                        {
                            data: [2, 3, 4, 3, 2, 1],
                            area: false,
                        },
                        {
                            data: [6, 5, 4, 3, 2, 1],
                            area: false,
                        },
                        {
                            data: [1, 2, 3, 4, 5, 6],
                            area: false,
                        },
                    ]}

                    // width={500}
                    height={300}
                />
            </div>

        </div>
    )
}
export default Progress;