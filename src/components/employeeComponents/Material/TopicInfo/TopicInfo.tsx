import { useEffect, useState } from "react";
import { IoIosStar } from "react-icons/io";
import { RouteName } from "../../../../routes/RouteNames";
import { useNavigate } from "react-router-dom";
import { Get } from "../../../../config/apiMethods";
import { displayMessage } from "../../../../config";

const TopicInfo = () => {
  const [lesson, setLesson] = useState<any>({});
  // const [timeLeft, setTimeLeft] = useState<number>(1200); // 20 minutes in seconds (20 * 60)
  // const [completed, setCompleted] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    let sub = localStorage.getItem("lesson");
    if (sub) setLesson(JSON.parse(sub));

    let lessonid = localStorage.getItem("lessonid");
    if (lessonid) {
      Get(`/topic/lesson/content`, JSON.parse(lessonid)).then((d) => {
        if (d.success) {
          if (!d.data) {
            displayMessage("No lessons available", "error");
          } else {
            setLesson(d.data);
          }
        } else {
          displayMessage(d.message, "error");
        }
      });
    };

    // update time spent in database
    // const updateTimeEveryMinte = () => {

    // }

    // Timer logic
    // const interval = setInterval(() => {
    //   setTimeLeft((prev) => {
    //     if (prev === 1) {
    //       setCompleted(true);
    //       clearInterval(interval);
    //       return 0;
    //     }
    //     return prev - 1;
    //   });
    //   updateTimeEveryMinte();
    // }, 1000); // Decrease by 1 second every 1000 ms (1 second)

    //   return () => clearInterval(interval); // Cleanup on component unmount
  }, []);

  const formatTime = (time: number) => {
    const hours = Math.floor(time / 3600); // Get hours
    const minutes = Math.floor((time % 3600) / 60); // Get remaining minutes after hours
    const seconds = time % 60; // Get remaining seconds

    const paddedHours = hours < 10 ? `0${hours}` : hours;
    const paddedMinutes = minutes < 10 ? `0${minutes}` : minutes;
    const paddedSeconds = seconds < 10 ? `0${seconds}` : seconds;

    return `${paddedHours}:${paddedMinutes}:${paddedSeconds}`; // Ensure two-digit display for hours, minutes, and seconds
  };


  return (
    <div className="w-full bg-white h-full py-5 px-4 rounded-2xl">
      <div className="flex flex-row items-center justify-between w-full">
        <h1 className="font-ubuntu font-medium text-base md:text-xl text-greyBlack mb-2">
          {lesson?.name}
        </h1>
        {/* <h1 className="font-ubuntu font-medium text-base md:text-xl text-greyBlack mb-2">
          {completed ? 'Completed' : formatTime(timeLeft)}
        </h1> */}
      </div>

      <div className="grid grid-cols-2 rounded-lg gap-3 bg-white">
        <img
          className="col-span-2 sm:col-span-1 w-full h-28 sm:h-44 md:h-60 2xl:h-72 rounded-lg object-cover p-2 sm:p-0"
          src={process.env.REACT_APP_DEFAULT_LESSON_IMAGE || "https://res.cloudinary.com/deiylfley/image/upload/v1724794943/image_2024-08-28_024217681_gkya4q.png"}
          alt="Lesson"
        />

        <div className="col-span-2 sm:col-span-1 flex flex-col w-full justify-center items-center">
          <div className="justify-center items-center w-4/5">
            <div className="flex flex-row justify-between items-center mb-2">
              <h1 className="font-ubuntu font-medium md:text-xl text-base text-greyBlack">
                Continue reading
              </h1>
              {/* Add a rating or any other necessary info */}
            </div>

            <div className="flex flex-row justify-start items-center mb-2">
              <h1 className="font-ubuntu font-medium md:text-base text-sm text-[#7000FF] min-w-14">
                {lesson?.words}
              </h1>
              <span className="font-ubuntu font-medium md:text-sm text-xs text-[#737373]">Words</span>
            </div>

            <div className="flex flex-row justify-start items-center mb-2">
              <h1 className="font-ubuntu font-medium md:text-base text-sm text-[#7000FF] min-w-14">
                {lesson?.lang}
              </h1>
              <span className="font-ubuntu font-medium md:text-sm text-xs text-[#737373]">Language</span>
            </div>

            <div className="flex flex-row justify-start items-center">
              <h1 className="font-ubuntu font-medium md:text-base text-sm text-[#7000FF] min-w-14">
                {lesson?.pages}
              </h1>
              <span className="font-ubuntu font-medium md:text-sm text-xs text-[#737373]">Pages</span>
            </div>

            {/* Uncomment to use Quiz navigation */}
            {/* <div
              onClick={() => navigate(`${RouteName?.QUIZ_CONFIRMATION}?lesson=${lesson._id}`)}
              className={`w-50 h-7 md:h-10 bg-gradient-to-r from-primary to-secondary flex justify-center items-center rounded-md cursor-pointer`}
            >
              <p className="text-white text-sm md:text-base font-normal">Start Quiz</p>
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopicInfo;