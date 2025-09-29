import { recentResults } from "../../../../constants/employee/Subjects";
import { getRandomColor } from "../../../../utils/randomColorGenerator";
import { Progress, Container } from 'rsuite';
const RecentResults = () => {

    return (
        <div className="w-full px-4 rounded-2xl ">

            <h1 className="font-ubuntu font-medium text-base md:text-xl text-greyBlack mb-3">Recent Results</h1>

            <div className="flex flex-row flex-wrap justify-start gap-4 items-center w-full max-h-72 sm:max-h-96 overflow-y-auto">
                {
                    recentResults?.map((item, index) => (
                        <div
                            id={index?.toString()}
                            className="grid grid-cols-10 rounded-xl p-3 w-full sm:w-[18rem] md:w-[20rem] lg:w-[14rem] xl:w-[17rem] 2xl:w-[21rem] cursor-pointer gap-3"
                            style={{
                                background: getRandomColor('dark', index, 0.3)
                            }}
                        >
                            <div className="col-span-3 flex justify-center items-center">
                                <div className="col-span-1 w-14 h-14 rounded-full flex justify-center items-center"
                                    style={{
                                        background: getRandomColor('dark', index)
                                    }}
                                >
                                    <h6 className="font-ubuntu text-white">1</h6>
                                </div>
                            </div>

                            <div className="col-span-5 flex items-center justify-center" >
                                <div className="flex flex-col justify-center items-start w-full">

                                    <h4 className="font-ubuntu  text-greyBlack text-sm font-medium text-start pl-3">{item.title}</h4>

                                    <div className='flex justify-start items-start w-full' >
                                        <Container>
                                            <Progress.Line
                                                percent={item?.percentage}
                                                strokeColor={getRandomColor('dark', index)}
                                                color="#E7FBEF"
                                                strokeWidth={8}
                                                trailColor={getRandomColor('light', index)}
                                                showInfo={false}
                                            />
                                        </Container>

                                    </div>
                                </div>
                            </div>

                            <div className="col-span-2 flex items-center justify-center" >
                                <img src={require('../../../../images/students/idea.png')} className="w-12 h-w-12 object-contain" alt="idea" />
                            </div>

                        </div>
                    ))
                }
            </div>



        </div>
    )
}
export default RecentResults;