
import { useEffect, useState } from "react";
import {
  MyCourses,
  Navbar,
  SideDrawer,
  NewCourses,
  Profile,
  Activities
} from "../../../components";
import { Get } from "../../../config/apiMethods";
import { displayMessage } from "../../../config";

const Courses = () => {
  const [newCourses, setNewCourses] = useState<any[]>([])
  const [myCourses, setMyCourses] = useState<any[]>([])
  useEffect(() => {
    Get("/hr-admin/mycourses").then((d) => {
      if (d.success) {
        setMyCourses(d.data.mycourses)
        setNewCourses(d.data.newcourses)
      } else {
        displayMessage(d.message, "error")
      }
    })
  }, [])

  return (
    <div className="flex flex-row w-screen h-screen max-w-[2200px] justify-center items-center mx-auto bg-mainBg flex-wrap" >

      {/* for left side  */}
      <div className="lg:w-1/6 h-full bg-transparent">
        <SideDrawer />
      </div>

      {/* for right side */}
      <div className="flex flex-col h-screen w-screen lg:w-10/12 px-2 py-2 md:px-4 md:py-6  md:pr-16 bg-mainBg" >

        {/* 1st Navbar*/}
        <div className="w-full h-fit bg-mainBg mb-2 md:mb-6" >
          <Navbar title="Courses" />
        </div>

        {/* center */}
        <div className="grid grid-cols-1 md:grid-cols-9 gap-3 md:gap-5 w-full mb-2 md:mb-6 bg-mainBg h-fit" >

          {/* new courses, my courses & activites */}
          <div className="grid grid-cols-2 md:grid-cols-10 gap-3 md:gap-5 col-span-1 md:col-span-6 h-fit" >

            {/* new courses */}
            <div className="col-span-2 md:col-span-10 h-fit" >
              <NewCourses newCourses={newCourses} />
            </div>

            {/* my courses */}
            <div className="col-span-2 md:col-span-10 2xl:col-span-6 h-fit" >
              <MyCourses myCourses={myCourses} />
            </div>

            {/* activites */}
            <div className="col-span-2 sm:col-span-1 md:col-span-6 2xl:col-span-4 h-fit" >
              {/* <Activities /> */}
            </div>

          </div>

          {/* profile */}
          <div className="col-span-1 md:col-span-3 row-start-1 md:row-start-auto h-fit" >
            <Profile />
          </div>

        </div>

      </div>

    </div>
  )
};

export default Courses;
