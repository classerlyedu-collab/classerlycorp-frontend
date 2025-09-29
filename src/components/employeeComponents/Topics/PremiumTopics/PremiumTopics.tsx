import { Rating } from "@mui/material";
import { premiumTopicsArray } from "../../../../constants/employee/Subjects";

const PremiumTopics = () => {

    return (
        <div className="w-full bg-white rounded-2xl pb-2 ">

            <h1 className="font-ubuntu font-medium text-base md:text-xl text-greyBlack pl-3 py-3 mb-2">PremiumTopics</h1>

            <div className="max-h-96 overflow-y-auto px-3 " >

                {
                    premiumTopicsArray?.map((item, index) => (
                        <div id={index?.toString()} className="group cursor-pointer flex flex-row mb-2 border-b last:border-b-0 sm:border-b-0 border-grey pb-2 sm:pb-0">


                            <img className="w-20 h-20 lg:w-24 lg:h-24 rounded-xl object-cover" src={item.image} alt="img" />
                            <div className="flex flex-col sm:flex-row items-start sm:items-center w-full justify-start sm:justify-between pl-4 flex-wrap">

                                <div className="flex flex-col sm:w-3/5">
                                    <h3 className="text-sm md:text-base text-greyBlack font ubuntu font-bold group-hover:text-purple transition-all delay-50">{item.title}</h3>
                                    <p className="text-sm md:text-base text-grey font ubuntu font-thin">{item.Description}</p>
                                </div>

                                <div className="flex flex-row-reverse sm:flex-col justify-end sm:justify-center items-center sm:items-end self-end sm:self-auto">
                                    <p className="ml-2 sm:ml-0" >{item.Rating} <span>({item.totalRating})</span></p>
                                    <Rating name="half-rating-read" defaultValue={item.Rating} precision={0.5} readOnly />
                                    
                                </div>

                            </div>


                        </div>
                    ))
                }



            </div>

        </div>
    )
}
export default PremiumTopics;