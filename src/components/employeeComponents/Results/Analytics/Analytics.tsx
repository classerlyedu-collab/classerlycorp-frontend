import { useNavigate } from "react-router-dom";
import { RouteName } from "../../../../routes/RouteNames";

const Analytics = ({ myresult }: any) => {

    const navigate = useNavigate();

    return (
        <div className="w-full h-full rounded-2xl flex justify-start flex-wrap items-center gap-3">

            <div
                onClick={() => navigate(RouteName.QUIZZES_DETAILS, {
                    state: { title: 'pass' }, // Pass state data here
                })}
                className="bg-[#83C38B] Py-2 px-3 rounded-2xl flex items-center 2xl:rounded-3xl justify-between transition-all delay-100 py-2 w-40 sm:w-48 md:w-52 lg:py-4 xl:py-5 2xl:w-64 2xl:py-6 cursor-pointer hover:opacity-85" >
                <img src={require('../../../../images/students/quizzess.png')} alt="logo" className="w-10 md:w-12 lg:w-14 2xl:w-16 object-cover" />

                <div className="flex flex-col items-start justify-center" >
                    <h5 className="text-sm md:text-base 2xl:text-lg text-[#E8D8FA]" >Quizzes completed successfully</h5>
                    <h3 className="text-xl md:text-3xl font-trykker 2xl:text-5xl text-white font-medium" >{myresult?.passquizes || 0}</h3>
                </div>

                <div />

            </div>

            <div
                onClick={() => navigate(RouteName.QUIZZES_DETAILS, {
                    state: { title: 'fail' }, // Pass state data here
                })}
                className="bg-[#7000FF] Py-2 px-3 rounded-2xl flex items-center 2xl:rounded-3xl justify-between transition-all delay-100 py-2 w-40 sm:w-48 md:w-52 lg:py-4 xl:py-5 2xl:w-64 2xl:py-6 cursor-pointer hover:opacity-85" >
                <img src={require('../../../../images/students/games.png')} alt="logo" className="w-10 md:w-12 lg:w-14 2xl:w-16 object-cover" />

                <div className="flex flex-col items-start justify-center" >
                    <h5 className="text-sm md:text-base 2xl:text-lg text-[#E8D8FA]" >Quizzes need improvement</h5>
                    <h3 className="text-xl md:text-3xl font-trykker 2xl:text-5xl text-white font-medium" >{(myresult?.failquizes) || 0}</h3>
                </div>

                <div />

            </div>

            {/* <div className="bg-[#FF8300] Py-2 px-3 rounded-2xl flex items-center 2xl:rounded-3xl justify-between transition-all delay-100 py-2 w-40 sm:w-48 md:w-52 lg:py-4 xl:py-5 2xl:w-64 2xl:py-6 cursor-pointer hover:opacity-85" >
                <img src={require('../../../../images/students/remarks.png')} alt="logo" className="w-10 md:w-12 lg:w-14 2xl:w-16 object-cover" />

                <div className="flex flex-col items-start justify-center" >
                    <h5 className="text-sm md:text-base 2xl:text-lg text-[#E8D8FA]" >Remarks</h5>
                    <h3 className="text-xl md:text-3xl font-trykker 2xl:text-5xl text-white font-medium" >14/20</h3>
                </div>

                <div />

            </div> */}


        </div>
    )
}
export default Analytics;