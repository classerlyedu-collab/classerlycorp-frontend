import { useNavigate } from "react-router-dom";
import { ChooseLessonsArray } from "../../../../constants/employee/Lessons";
import { getRandomColor } from "../../../../utils/randomColorGenerator";
import { RouteName } from "../../../../routes/RouteNames";
import { useLocation, useSearchParams } from 'react-router-dom';
import { Get } from "../../../../config/apiMethods";
import { displayMessage } from "../../../../config";
import { useEffect, useState } from "react";

interface lessontypeORM {
  name: String;
  image: string;
  content: String;
  words: Number;
  pages: Number;
  lang: String,
  _id: any,
  per: String,
  status: String,

}

const ChooseLessons = () => {
  const [searchParams] = useSearchParams();

  const [lessons, setLessons] = useState<lessontypeORM[]>([])

  const navigate = useNavigate();

  let user = JSON.parse(localStorage.getItem("user") || "");


  useEffect(() => {

    const topic = searchParams.get('topic');



    Get(`/topic/lesson`, topic).then((d) => {

      if (d.success) {
        if (d.data?.length == 0) {
          displayMessage("No any lessons exist", "error")

        }
        setLessons(d.data)
      } else {
        displayMessage(d.message, "error")
      }
    })
    // Function to update the current index every 4 seconds

    // Cleanup interval on component unmount
    // return () => clearInterval(interval);
  }, []);
  return (
    <div className="w-full h-full py-5 px-4 rounded-2xl">
      <h1 className="font-ubuntu font-medium text-base md:text-xl text-greyBlack  mb-2">
        Choose Lesson
      </h1>
      <div className="flex flex-row flex-wrap gap-5 mt-6">
        {lessons?.map((item, index) => (
          <div
            id={index?.toString()}
            onClick={() => {
              if (user.userType !== "Parent") {
                localStorage.setItem("lesson", JSON.stringify(item))
                localStorage.setItem("lessonid", JSON.stringify(item._id))

                navigate(`${RouteName?.MATERIAL_EMPLOYEE}?content=${item.content}`)
              }
            }}
            className="cursor-pointer w-28 h-28 md:w-28 md:h-28 2xl:w-36 2xl:h-36 flex flex-col items-center justify-center rounded-xl flex-wrap"
            style={{
              background: getRandomColor("dark", index),
            }}
          >
            {/* <img
              className="md:h-16 md:w-16 h-12 w-12 pb-2 2xl:w-20 2xl:h-20"
              src={item.image|| ChooseLessonsArray[index%ChooseLessonsArray?.length]?.image}
              alt="image"
            /> */}
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                //   backgroundColor: '#ccc',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '10px',
                fontSize: '18px',
                fontWeight: 'bold',
                color: '#fff'
              }}
            >
              {item.name.substring(0, 2)}
            </div>
            <h1 className="font-ubuntu font-medium md:text-sm text-xs text-center text-white">
              {item?.name.substring(0, 10)}
            </h1>
            {
              user.userType === 'Student' && (
                <p className="font-ubuntu font-medium md:text-sm text-xs text-center text-white">
                  {item?.status}
                </p>
              )
            }

          </div>
        ))}
      </div>
    </div>
  );
};
export default ChooseLessons;
