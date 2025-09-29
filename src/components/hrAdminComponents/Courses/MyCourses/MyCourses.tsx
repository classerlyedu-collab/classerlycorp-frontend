import { getRandomColor } from "../../../../utils/randomColorGenerator";

const MyCourses = ({ myCourses }: any) => {
  return (

    <div className="flex flex-col bg-white px-3 w-full rounded-xl py-3">
      {/* for heading */}
      <div className="flex flex-row justify-between items-center pt-2" >

        <div className="flex justify-center items-center">
          <h1 className="font-ubuntu font-medium text-lg md:text-xl text-greyBlack">My Courses</h1>
        </div>

        {/* <div className="border border-grey rounded-2xl flex justify-center items-center py-0.5 px-2 hover:bg-bluecolor group transition-all delay-100">
          <h6 className="font-ubuntu text-sm text-grey font-medium cursor-pointer group-hover:text-white" 
          >See All </h6>
        </div> */}

      </div>
      <div className="grid grid-cols-10 py-2">

        <div className="col-span-4">
          <h6 className="text-sm text-grey font-ubuntu font-medium">Course Name</h6>
        </div>
        {/* <div className="col-span-2">
          <h6 className="text-sm text-grey font-ubuntu font-medium">Start</h6>
        </div> */}
        {/* <div className="col-span-2">
          <h6 className="text-sm text-grey font-ubuntu font-medium">Rate</h6>
        </div>
        <div className="col-span-2">
          <h6 className="text-xs text-grey font-ubuntu font-medium">Level</h6>
        </div> */}

        {
          myCourses?.map((item: any, index: any) => (
            <div id={index?.toString()} className="grid grid-cols-10 col-span-10 mt-2">
              <div className="col-span-4">
                <div className="flex flex-row items-start">
                  <div className="flex justify-center items-center p-2.5 rounded-md mr-3"
                    style={{ background: getRandomColor('dark', index, 0.2) }}
                  >
                    <img className="w-7 h-6" src={item.image} alt={item.name} />
                  </div>
                  <div className="flex flex-col">
                    <h6 className="text-sm text-greyBlack font-ubuntu font-medium">{item.name}</h6>
                    <h6 className="text-xs text-grey font ubuntu font-normal">{item.topics?.length}
                      <span> Lessons</span>
                    </h6>

                  </div>
                </div>

              </div>
              {/* <div className="col-span-2">
                <h6 className="text-xs text-greyBlack font-ubuntu font-medium">{item.createdAt}</h6>
              </div> */}
              {/* <div className="col-span-2">
                <h6 className="text-xs text-greyBlack font-ubuntu font-medium">{item.Rate}</h6>
              </div>
              <div className="col-span-2">
                <h6 className="text-xs text-greyBlack font-ubuntu font-medium">{item.level}</h6>
              </div> */}
            </div>
          ))
        }


      </div>




    </div >
  );
};

export default MyCourses;
