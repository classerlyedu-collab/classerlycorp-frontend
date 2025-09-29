import { useEffect, useState } from 'react';
import { Progress, Container } from 'rsuite';
import { buildStyles, CircularProgressbarWithChildren } from 'react-circular-progressbar';
import { getRandomColor } from '../../../../utils/randomColorGenerator';

const Quizzes = ({ quiz }: any) => {


    const [quizData, setQuizdata] = useState<any[]>([]);
    const [averageProgress, setAverageProgress] = useState<number>(0);


    useEffect(() => {
        const groupedData = quiz.reduce((acc: any, item: any) => {
            // Get the key by which you want to group the data (in this case, 'color')
            const key = item.quiz?.subject?.name;

            // If the key doesn't exist in the accumulator, initialize it with an empty array
            if (!acc[key]) {
                acc[key] = [];
            }

            // Push the current item into the corresponding group
            acc[key].push(item);

            // Return the accumulator for the next iteration
            return acc;
        }, {});
        const keys = Object.keys(groupedData)
        const values = Object.values(groupedData)

        setQuizdata(values.map((j: any, index: any) => {
            let marks = 0, score = 0;
            return (j.map((k: any, index2: any) => {
                marks += k.marks
                score += k.score
                if (!j[index2 + 1]) {

                    return {
                        name: keys[index],
                        count: j?.length,
                        per: marks / score * 100
                    }
                }
                return null;
            }))[0]
        }));
    }, [quiz]);

    useEffect(() => {
        let totalObtained = 0;
        let count = 0;
        quizData?.map((item) => {
            totalObtained += item?.per;
            count += 100;
            return null;
        });

        setAverageProgress((totalObtained / count) * 100);
    }, [quizData]);

    return (
        <div className='w-full'>

            <div className="grid grid-cols-1 lg:grid-cols-10 2xl:grid-cols-12 w-full gap-3 md:gap-4">

                {/* first */}
                <div className=" 2xl:col-span-4 lg:col-span-6">
                    <h1 className="font-ubuntu font-medium text-base md:text-xl text-greyBlack mb-3 md:mb-5">Subjectivce Result</h1>
                    <div className="flex flex-col w-full border border-grey rounded-2xl shadow-md p-3 md:p-5" >
                        {
                            quizData?.map((item, index) => (
                                <div id={index?.toString()} className="flex flex-row justify-between w-full items-center mb-2 flex-wrap">
                                    <div className="w-1/3 md:w-1/4" >
                                        <h3 className="font-ubuntu font-medium text-sm md:text-base 2xl:text-lg text-greyBlack">{item.name}</h3>
                                        <h3 className="font-ubuntu font-medium text-xs text-grey">Quiz {item.count}</h3>
                                    </div>
                                    <div className='flex justify-end items-center w-2/3 md:w-3/4 pl-2' >
                                        <Container>
                                            <Progress.Line
                                                percent={item?.per}
                                                strokeColor={getRandomColor('dark', index)}
                                                color="#E7FBEF"
                                                strokeWidth={12}
                                                trailColor="#E7FBEF"
                                                showInfo={false}
                                            />
                                        </Container>
                                        <h3 className={`font-ubuntu font-semibold text-xs md:text-sm ml-2 ${item?.per < 50 ? 'text-red-700' : 'text-greyBlack'}`}>{item?.per}%</h3>

                                    </div>
                                </div>
                            ))
                        }
                    </div>
                </div>

                {/* second */}
                {/* <div className="lg:col-span-4 grid grid-cols-1 gap-3">
                    <div>
                        <h1 className="font-ubuntu font-medium text-base md:text-xl text-greyBlack mb-3 md:mb-5">Discuss your confusion</h1>
                        <div className="border border-[#D1CFF7] shadow-sm shadow-[#D1CFF7] rounded-2xl flex flex-col" >
                            <div className="flex flex-row items-start justify-between border-b border-[#D1CFF7] p-3 md:p-4" >
                                <img className="w-9 h-9 md:h-12 md:w-12 rounded-full mr-3 md:mr-4" src="https://pics.craiyon.com/2023-07-15/dc2ec5a571974417a5551420a4fb0587.webp" alt="Profile" />
                                <div className="border border-[#D1CFF7] rounded-2xl w-full p-3 md:p-4" >
                                    <textarea
                                        value={confusion}
                                        onChange={(e) => setConfusion(e.currentTarget.value)}
                                        className='focus:outline-none text-sm md:text-base w-full'
                                        placeholder='Write your paragraph'
                                        maxLength={1000}
                                        rows={4}
                                    />
                                </div>
                            </div>
                            <div className="flex flex-row items-center justify-between  px-3 pt-3 md:px-4 md:pt-4 flex-wrap mb-3 md:mb-5" >

                                <div className='rounded-full min-w-20 w-1/3 max-w-32 lg:w-1/3 xl:w-1/4 2xl:w-1/5 flex items-center justify-center py-1 md:py-1.5 cursor-pointer' >
                                    <RoundedDropDown
                                        value={selectedCourse}
                                        setValue={setSelectedCourse}
                                        data={coursesDropdown}
                                        placeholder="Courses"
                                        style={{
                                            wrapper: 'bg-[#D1CFF7] rounded-full',
                                            inputWrapper: 'bg-[#D1CFF7]',
                                            listWrapper: 'bg-white shadow-lg'
                                        }}
                                    />
                                </div>
                                <div className='rounded-full bg-[#4640E0] min-w-20 w-1/3 max-w-32 lg:w-1/3 xl:w-1/4 2xl:w-1/5 flex items-center justify-center py-1 md:py-1.5 cursor-pointer' >
                                    <h4 className='text-sm md:text-base font-semibold text-mainBg' >Post</h4>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div  >
                        <h1 className="font-ubuntu font-medium text-base md:text-xl text-greyBlack mb-3 md:mb-5">Upcoming Quiz</h1>
                        <div className="border border-[#E5B1C7] shadow-sm shadow-[#E5B1C7] rounded-2xl grid grid-cols-6" >
                            <div className='bg-[#E5B1C7] rounded-xl col-span-2 py-5 md:py-10 lg:py-12 flex items-center justify-center' >
                                <img src={require('../../../../images/myChildren/upcomingQuiz.png')} className='w-20 h-20 md:w-32 md:h-32 lg:h-32 lg:w-32' />
                            </div>
                            <div className='col-span-4 flex flex-col items-start justify-start px-2 overflow-y-auto scrollbar scrollbar-thin scrollbar-thumb-gray-400 max-h-52 my-2' >
                                {
                                    upcomingQuizData?.map((item, index) => (
                                        <div className={`py-2 md:py-3 w-full ${upcomingQuizData?.length - 1 === index ? 'border-none' : 'border-b border-b-label'}`} id={index?.toString()} >
                                            <h3 className="font-ubuntu font-medium text-sm md:text-sm lg:text-base text-greyBlack">{item.title}</h3>
                                            <h3 className="font-ubuntu font-medium text-[#E5B1C7] text-xs">Quiz {item.date}</h3>
                                        </div>
                                    ))
                                }
                            </div>
                        </div>
                    </div>
                </div> */}


                {/* third */}
                <div className=" 2xl:col-span-3 lg:col-span-10 grid 2xl:grid-cols-1 sm:grid-cols-1 md:grid-cols-2 gap-3">

                    <div className="flex flex-col justify-start items-start" >
                        <h1 className="font-ubuntu font-medium text-base md:text-xl text-greyBlack mb-3 md:mb-5">Average Quiz Progress</h1>
                        <div className='flex justify-center items-center sm:w-full w-full 2xl:w-4/5 border-2 border-[#E5D1FF] shadow-sm shadow-[#E5D1FF] rounded-2xl' >
                            <div className=' w-1/2 flex items-center justify-center py-14 xl:py-15 2xl:py-11' >
                                <CircularProgressbarWithChildren
                                    value={averageProgress}
                                    maxValue={100}
                                    minValue={0}
                                    strokeWidth={8}
                                    styles={buildStyles({
                                        strokeLinecap: 'round',
                                        pathColor: `#7000FF`,
                                        trailColor: '#8C8C8C',
                                        backgroundColor: '#3e98c7',
                                    })}
                                >
                                    <div className='flex flex-col w-full h-full justify-center items-center' >
                                        <h1 className="font-ubuntu text-sm md:text-base lg:text-lg font-semibold text-[#7000FF]" >{averageProgress} %</h1>
                                        <h1 className="font-ubuntu text-sm md:text-base lg:text-lg font-semibold text-[#7000FF]" >Success</h1>
                                    </div>
                                </CircularProgressbarWithChildren>
                            </div>
                        </div>
                    </div>

                    {/* <div >
                        <h1 className="font-ubuntu font-medium text-base md:text-xl text-greyBlack mb-3 md:mb-5">Quiz Leaderboard</h1>
                        <div className='flex flex-col justify-center items-center sm:w-full w-full border-2 border-[#E5D1FF] shadow-sm shadow-[#E5D1FF] rounded-2xl p-2 md:p-3 max-h-72 overflow-y-auto scrollbar scrollbar-thin scrollbar-thumb-gray-400 ' >
                            <div className='flex flex-row w-full justify-between items-center' >
                                <h1 className="font-ubuntu text-sm text-greyBlack font-semibold" >Top Students</h1>
                                <h1 className="font-ubuntu text-sm text-greyBlack font-semibold" >Grade 3</h1>
                            </div>
                            {
                                TopStudents?.map((item, index) => (
                                    <div id={index.toString()} className='w-full flex justify-start items-center bg-mainBg mt-2 rounded-lg px-3 py-2'>

                                        <img className="w-9 h-9 md:h-12 md:w-12 rounded-full mr-3 md:mr-4" src={item?.image} alt="Profile" />
                                        <div className='h-full flex-col justify-between items-start' >
                                            <h1 className="font-ubuntu text-sm text-greyBlack font-semibold mb-1" >{item?.name}</h1>
                                            <h1 className="font-ubuntu text-xs text-[#FB9296] font-semibold" >Allover score: {item?.score}%</h1>

                                        </div>

                                    </div>
                                ))
                            }
                        </div>
                    </div> */}

                </div>

            </div>

            {/* <div className='w-full py-3 bg-[#FFEDE9] mt-5 rounded-md flex items-center justify-between px-3 md:px-4' >
                <div className='flex items-center justify-start' >
                    <FaCircleExclamation className='text-[#F44336] text-2xl mr-2' />
                    <h1 className="font-ubuntu text-xs md:ext-sm text-[#F68683] font-medium" >Your child least progress subject is History</h1>
                </div>
                <div className='flex items-center justify-center bg-[#F44336] px-4 md:px-6 cursor-pointer py-1 rounded-full' >
                    <h1 className="font-ubuntu text-sm text-mainBg font-medium" >View</h1>
                </div>
            </div> */}

        </div>
    )
};

export default Quizzes;