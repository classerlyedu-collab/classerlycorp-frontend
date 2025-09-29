import { useNavigate } from "react-router-dom";
import { PendingHomeworkData } from "../../../../constants/HRAdmin/Dashboard";
import { RouteName } from "../../../../routes/RouteNames";

const PendingHomework = () => {

    const navigate = useNavigate();

    const getCorrespondingColor = (action: string) => {
        switch (action) {
            case 'Quiz':
                return '#A658F5';
            case 'Test':
                return '#52B161';
            case 'Games':
                return '#3AAFFF';

            default:
                return '#A557F5';
        }
    }

    return (
        <div className="w-full h-full bg-mainBg" >

            <div className="flex flex-row items-center justify-between" >
                <h1 className="font-ubuntu font-medium text-base md:text-xl text-greyBlack mb-3 md:mb-5">Pending Homework</h1>
                <button
                    onClick={() => navigate(RouteName.ADD_QUIZ)}
                    className="py-1 px-3 text-base font-medium border border-greyBlack text-greyBlack rounded-md hover:border-none hover:bg-secondary hover:text-white transition-all delay-100" >
                    Add Quiz
                </button>
            </div>
            <div className="flex flex-col items-center justify-start overflow-y-auto max-h-52 sm:max-h-96">
                {
                    PendingHomeworkData?.map((item: any, index: number) => (
                        <div
                            id={index?.toString()}
                            className={`flex items-center w-full justify-between px-2 md:px-4 py-2 last:mb-0 mb-3 bg-white rounded-lg md:rounded-xl shadow-lg`}
                        >
                            <div className="flex flex-row items-center justify-start min-w-32 md:min-w-40" >
                                <img src={item?.image} alt="img" className="w-8 h-8 md:w-11 md:h-11 rounded-full object-cover mr-2" />
                                <h6 className="text-xs md:text-sm font-ubuntu font-medium">{item?.name}</h6>
                            </div>
                            <h6 className="text-xs md:text-sm font-ubuntu font-medium">Grade {item?.grade}</h6>
                            <h6 className="text-xs md:text-sm font-ubuntu font-medium">{item?.subject}</h6>
                            <h6 className="text-xs md:text-sm font-ubuntu font-medium">{item?.topic}</h6>
                            <div className={`border py-1 w-14 md:min-w-20 flex items-center justify-center rounded-lg cursor-pointer hover:bg-mainBg transition-all delay-150`}
                                style={{
                                    borderColor: getCorrespondingColor(item?.action)
                                }}
                            >
                                <h6 className="text-xs md:text-sm font-ubuntu font-semibold hover:text-mainBg"
                                    style={{
                                        color: getCorrespondingColor(item?.action),
                                    }}
                                >{item?.action}</h6>
                            </div>
                        </div>
                    ))
                }
            </div>
        </div>
    )
};

export default PendingHomework;