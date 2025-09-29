import { Navigate, useNavigate } from "react-router-dom";
import { SubjectsData } from "../../../../constants/employee/Dashboard";
import { getRandomColor } from "../../../../utils/randomColorGenerator";
import { RouteName } from "../../../../routes/RouteNames";
import { useEffect, useState } from "react";
import { Get, ImageLink } from "../../../../config/apiMethods";
import { displayMessage } from "../../../../config";

interface subjecttypeORM {
  createdAt: String;
  grade: any;
  image: string;
  name: String;
  topics: any;
  updatedAt: any;
  _id: any
}

const Subjects = () => {
  // const [subjects, setSubjects] = useState([]);
  const [subjects, setSubjects] = useState<subjecttypeORM[]>([]);

  const [loading, setLoading] = useState(false);

  const getStoredUser = () => {
    try {
      const raw = localStorage.getItem("user");
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {} as any;
    }
  };
  let user = getStoredUser();
  useEffect(() => {
    setLoading(true);
    if (user?.userType === "HR-Admin") {
      Get("/hr-admin/mysubjects").then((d) => {
        if (d.success) {
          setSubjects(d.data);
          setLoading(false);
        } else {
          displayMessage(d.message, "error");
        }
      })
    } else {
      Get("/employee/mysubjects").then((d) => {
        if (d.success) {
          setSubjects(d.data);
          setLoading(false);
        } else {
          displayMessage(d.message, "error");
        }
      });
    }
  }, [user?.userType]);
  const navigate = useNavigate();

  return (
    <div className="w-full h-full py-5 px-4 rounded-2xl flex flex-col max-h-96 overflow-y-auto">
      <div className="flex flex-row items-center justify-between mb-3">
        <div className="flex flex-row justify-center items-center">
          <h1 className="font-ubuntu font-medium text-base md:text-xl text-greyBlack  mb-2">
            Subjects
          </h1>
          <span className="font-ubuntu font-medium text-sm pl-1 text-greyBlack">
            (class {user?.profile?.grade?.grade})
          </span>
        </div>
        {/* <div className="border rounded-lg border-[#6A6E6F] cursor-pointer hover:bg-bluecolor group hover:border-transparent transition-all delay-100">
          <h1 className="font-ubuntu font-medium w-fit text-sm text-[#6A6E6F] px-2 py-1 group-hover:text-white">
            See All
          </h1>
        </div> */}
      </div>
      <div className="flex flex-row flex-wrap gap-1 md:gap-3 xl:gap-5">
        {subjects?.length === 0 &&
          <p>No subjects found</p>
        }
        {
          subjects?.length > 0 && subjects?.map((items, index) => (
            <div
              id={index?.toString()}
              onClick={() => {
                // if(user.userType!="Teacher"){
                localStorage.setItem("subject", JSON.stringify(items))
                navigate(`${RouteName?.TOPICS_SUBJECTS}?subject=${items._id}`)
              }
                // }
              }
              className="py-4 flex flex-col justify-center items-center border rounded-xl w-36  hover:opacity-80 cursor-pointer"
              style={{
                background: getRandomColor("dark", index),
              }}
            // onClick={()=> navigate(RouteName?.)}
            >
              <img
                className="w-14 lg:w-20 h-14 lg:h-20 mb-4"
                // src={ImageLink+items?.image}
                src={items.image || SubjectsData[index % SubjectsData?.length]?.image}
                alt="subject-image"
              />

              <h1 className="font-ubuntu font-medium md:text-sm text-sm text-center px-2 text-white">
                {items?.name}
              </h1>
            </div>
          ))}
      </div>
    </div>
  );
};
export default Subjects;
