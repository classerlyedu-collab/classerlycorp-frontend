import { useEffect, useState } from "react";
import { DropDown } from "../../../components";
import 'react-datepicker/dist/react-datepicker.css';
import { FaStar } from 'react-icons/fa'; // Importing the star icon from react-icons
import { Get, Post } from "../../../config/apiMethods";
import { displayMessage } from "../../../config";
import { useLocation, useNavigate } from "react-router-dom";
import { RouteName } from "../../../routes/RouteNames";
import {
  Navbar,
  SideDrawer
} from "../../../components";
import { getLastRoute } from "../../../utils/getLastRoute";

const TeacherFeedback = () => {
  const [feedback, setFeedback] = useState<string>('');
  const [selectedTeacher, setSelectedTeacher] = useState<string | number | null>(null);
  const [rating, setRating] = useState<number | null>(null);
  const [teachers, setTeachers] = useState<any[]>([])
  useEffect(() => {
    Get("/hr-admin/mystudents")
      .then((d) => {

        if (d.success) {
          setTeachers(d.data);


        } else {
          displayMessage(d.message, "error");
        }
      })
      .catch((err) => {
        displayMessage(err.message, "error");
      });
  }, [])
  // Separate Errors
  const [feedbackError, setFeedbackError] = useState<string>('');

  const teachersData = [
    { label: 'Sir Williams', value: 1 },
    { label: 'Sir Johnson', value: 2 },
    { label: 'Sir Bob', value: 3 },
    { label: 'Sir Anthony', value: 4 },
  ];
  let navigate = useNavigate()
  const submitFeedback = () => {
    try {
      Post("/hr-admin/feedback", {
        student: selectedTeacher,
        feedback,
        star: rating
      }).then((d) => {

        if (d.success) {


          navigate(RouteName.DASHBOARD_SCREEN)
        } else {
          displayMessage(d.message, "error");
        }
      })
        .catch((err) => {
          displayMessage(err.message, "error");
        });
      // Feedback submission logic
    } catch (error) {
      // Error handling logic
    }
  }

  const handleRating = (rate: number) => {
    setRating(rate);
  }

  const ratings = ['Worse', 'Bad', 'Good', 'Great', 'Awesome'];
  const location = useLocation();

  const lastRoute = getLastRoute(location?.pathname);

  const routesToHideNavbar = ['Singleplayer_Quiz', 'Multiplayer_Quiz', 'Games'];
  const routesToHideSideDrawer = ['Singleplayer_Quiz', 'Multiplayer_Quiz'];

  const shouldHideNavbar = routesToHideNavbar.includes(lastRoute);
  const shouldHideSideDrawer = routesToHideSideDrawer.includes(lastRoute);

  return (
    <div className="flex flex-row w-screen h-screen max-w-[2200px] justify-center items-center mx-auto bg-mainBg flex-wrap" >

      {/* for left side  */}
      <div className={`lg:w-1/6 h-full bg-transparent transition-all delay-100 ${shouldHideSideDrawer ? 'hidden' : 'flex'}`}>
        <SideDrawer />
      </div>

      {/* for right side */}
      <div className="flex flex-col h-screen w-screen lg:w-10/12 px-2 py-2 md:px-4 md:py-6 xl:pr-16 bg-mainBg" >

        {/* 1st Navbar*/}
        <div className={`w-full h-fit bg-mainBg mb-2 md:mb-6 ${shouldHideNavbar ? 'hidden' : 'flex'}`} >
          <Navbar title={lastRoute} hideSearchBar />
        </div>



        <div className="w-full flex-col gap-5 px-5 mb-2 md:mb-6 bg-mainBg h-fit pb-10">
          <div className="w-full border-b border-gray-300 py-5">
            <div className="xl:w-3/4">

              <div className="w-full sm:w-1/2">
                <DropDown
                  value={selectedTeacher}
                  setValue={setSelectedTeacher}
                  data={teachers.map((i) => {
                    return {
                      label: i.auth.userName?.slice(0, 12),
                      value: i._id
                    }

                  })}
                  placeholder="e.g Sir Williams"
                  label="Select Student"
                />
              </div>

              <div className="mb-5 md:mb-5">
                <label className="block text-sm font-medium text-gray-700">
                  Feedback
                </label>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="e.g. Provide your feedback here..."
                  className={`mt-1 px-2 py-3 block w-full rounded-md bg-inputBackground border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${feedbackError ? 'border-red-500' : ''}`}
                  rows={4}
                  onFocus={() => {
                    if (feedbackError) {
                      setFeedbackError('');
                    }
                  }}
                />
                {feedbackError && (
                  <p className="mt-2 text-sm text-red-600">{feedbackError}</p>
                )}
              </div>

              <div className="mb-5 md:mb-5">
                <label className="block text-sm font-medium text-gray-700">
                  Rate the Student <span className="ml-2 text-sm text-grey" >({rating === null ? 'Your Ratings' : ratings[rating - 1]})</span>
                </label>
                <div className="flex mt-2 flex-row items-start">
                  {Array.from({ length: 5 }, (_, index) => (
                    <div className="group w-10" >
                      <FaStar
                        key={index}
                        size={30}
                        onClick={() => handleRating(index + 1)}
                        className={`cursor-pointer group-hover:animate-pulse ${index < (rating ?? 0) ? 'text-yellow-500' : 'text-gray-400'}`}
                      />
                      <span className="ml-2 invisible group-hover:visible text-sm text-grey" >{ratings[index]}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <button
            className={`py-2 mt-5 px-2 w-fit h-fit bg-primary text-white rounded-lg opacity-60 hover:opacity-100 transition-all delay-100`}
            onClick={submitFeedback}
          >
            Submit Feedback
          </button>
        </div>
      </div>

    </div>
  );
};

export default TeacherFeedback;