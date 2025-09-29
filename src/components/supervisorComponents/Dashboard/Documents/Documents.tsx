import { DocumentsArray } from "../../../../constants/supervisor/dashdoard";

const Documents = () => {
    return (
        <div className="w-full h-full bg-white flex flex-col justify-start items-start rounded-2xl py-2 px-3 md:px-2">
            <div className="flex flex-row w-full justify-between items-center mb-2 md:mb-3">
                <h1 className="text-seagreen text-xs font-medium">Documents</h1>
                <h1 className="text-seagreen text-xs font-medium cursor-pointer">View More</h1>
            </div>
            <div className="w-full overflow-y-auto scrollbar scrollbar-thin scrollbar-thumb-gray-400 pb-2"> {/* Adjust the height as needed */}
                {
                    DocumentsArray?.map((item, index) => (
                        <div key={index} className="flex flex-row items-center justify-start w-full">
                            <img src={item?.image} alt="format" className="w-5 md:w-7 h-5 md:h-7 mr-1" />
                            <div className={`flex flex-col w-full justify-center items-start ${index === DocumentsArray?.length - 1 ? 'border-none' : 'border-b border-gray-300'} mr-2 py-3`}>
                                <div className="flex flex-row items-center justify-between flex-wrap w-full">
                                    <h5 className="text-sm font-medium font-ubuntu text-greyBlack">{item?.title}</h5>
                                    <h5 className="text-sm text-lightPurple font-medium cursor-pointer">View</h5>
                                </div>
                                <div className="flex flex-row items-center justify-between flex-wrap w-full mt-1">
                                    <h5 className="text-xs font-medium font-ubuntu text-greyBlack">{item.pages}</h5>
                                    <h5 className="text-sm text-lightGreen font-medium cursor-pointer">Download</h5>
                                </div>
                            </div>
                        </div>
                    ))
                }
            </div>
        </div>
    );
};

export default Documents;