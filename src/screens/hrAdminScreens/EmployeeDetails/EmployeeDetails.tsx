import { useLocation, useNavigate } from "react-router-dom";
import { Navbar, SideDrawer } from "../../../components";
import { useEffect, useState } from "react";
import { getRandomColor } from "../../../utils/randomColorGenerator";
import { Get, Post } from "../../../config/apiMethods";
import { displayMessage } from "../../../config";
import { buildStyles, CircularProgressbarWithChildren } from "react-circular-progressbar";
import { IoClose } from "react-icons/io5";
import { FaStar } from "react-icons/fa";
import { StudentsData } from "../../../constants/HRAdmin/MyStudents";

// Define the type for each subject within the grade
type SubjectType = {
  _id: string;
  name: string;
  image: string;
};

// Define the type for the grade, including an array of subjects
type GradeType = {
  _id: string;
  grade: string;
  subjects: SubjectType[];
};

// Define the type for the auth object
type AuthType = {
  _id: string;
  fullName: string;
  userName: string;
  email: string;
  fullAddress: string;
  image: string;
};

// Define the type for supervisor
type SupervisorType = {
  _id: string;
  auth: AuthType;
};

// Define the main type that includes auth and grade
type MainType = {
  _id: string;
  code: string;
  auth: AuthType;
  grade: GradeType;
  quiz: any,
  subjects: any,
  supervisor?: SupervisorType;
};

interface SupervisorFeedback {
  _id: string;
  teacherId: string;
  supervisorId: string;
  studentId: string;
  comment: string;
  stars: number;
  createdAt: string;
}

const EmployeeDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [std, setStd] = useState<MainType | null>(null);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [existingFeedback, setExistingFeedback] = useState<SupervisorFeedback | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (std != null) {
      Get(`/hr-admin/employees/${std._id}/subjectdata`).then((d) => {
        if (d.success) {
          setSubjects(d.data);
        }
      });
    }
  }, [std]);


  useEffect(() => {
    setStd(location.state);
  }, []);

  const fetchExistingFeedback = async () => {
    if (!std?.supervisor?._id || !std?._id) return;

    try {
      const response = await Get(`/hr-admin/supervisor-feedback/${std._id}/${std.supervisor._id}`);
      if (response.success) {
        setExistingFeedback(response.data);
        // setRating(response.data.stars);
        // setFeedback(response.data.comment);
      }
    } catch (error) {
      console.error("Failed to fetch feedback:", error);
    }
  };

  const handleOpenFeedback = () => {
    setShowFeedback(true);
    fetchExistingFeedback();
  };

  const handleSubmitFeedback = async () => {
    if (!rating) {
      displayMessage("Please select a rating", "error");
      return;
    }
    if (!feedback.trim()) {
      displayMessage("Please enter feedback", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        supervisorId: std?.supervisor?._id,
        studentId: std?._id,
        comment: feedback,
        stars: rating
      };

      const response = await Post("/hr-admin/supervisor-feedback", payload);
      if (response.success) {
        displayMessage("Feedback submitted successfully", "success");
        setShowFeedback(false);
        setExistingFeedback(response.data);
        setRating(0);
        setFeedback('');
      } else {
        displayMessage(response.message || "Failed to submit feedback", "error");
      }
    } catch (error) {
      displayMessage("Failed to submit feedback", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-64 z-10">
        <SideDrawer />
      </div>

      {/* Main Content */}
      <div className="ml-64 p-6">
        {/* Header */}
        <div className="mb-4">
          <Navbar title="Employee Details" />
        </div>

        {/* Back Button */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
        </div>

        {/* Employee Profile Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden mb-8">
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 px-8 py-12 relative">
            <div className="absolute inset-0 bg-black opacity-10"></div>
            <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-6">
              {/* Avatar */}
              <div className="relative">
                <div className="w-32 h-32 rounded-full border-4 border-white shadow-2xl overflow-hidden bg-white">
                  <img
                    className="w-full h-full object-cover"
                    src={std?.auth?.image || StudentsData[0].image}
                    alt={std?.auth?.fullName || "Employee"}
                  />
                </div>
              </div>

              {/* Employee Info */}
              <div className="text-white text-center md:text-left">
                <h1 className="text-3xl font-bold mb-2">{std?.auth?.fullName || "Unknown Employee"}</h1>
                <p className="text-blue-100 text-lg mb-4">{std?.auth?.email}</p>
                <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                    <span className="text-sm text-blue-100">Employee ID</span>
                    <p className="font-semibold">{std?.code || "N/A"}</p>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                    <span className="text-sm text-blue-100">Supervisor</span>
                    <p className="font-semibold">{std?.supervisor?.auth?.fullName || "Not Assigned"}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          {std?.supervisor && (
            <div className="px-8 py-6 bg-gray-50 border-t border-gray-200">
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={handleOpenFeedback}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                  Leave Feedback
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Subjects Section */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-6">
            <h2 className="text-2xl font-bold text-white flex items-center">
              <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              Training Subjects
            </h2>
            <p className="text-indigo-100 mt-1">Click on any subject to view detailed progress and results</p>
          </div>

          <div className="p-8">
            {subjects && subjects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {subjects.map((item: any, index: any) => (
                  <div
                    key={index}
                    className="group bg-gradient-to-br from-white to-gray-50 rounded-xl border border-gray-200 shadow-lg overflow-hidden"
                  >
                    {/* Subject Header */}
                    <div className="p-6 pb-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-gray-800 group-hover:text-blue-600 transition-colors duration-200">
                            {item?.name || "Unknown Subject"}
                          </h3>
                          <p className="text-sm text-gray-500 mt-1">Training Progress</p>
                        </div>
                        <div className="ml-4">
                          <div className="w-16 h-16">
                            <CircularProgressbarWithChildren
                              value={item.result || 0}
                              maxValue={100}
                              minValue={0}
                              strokeWidth={6}
                              styles={buildStyles({
                                strokeLinecap: 'round',
                                pathColor: getRandomColor('dark', index),
                                trailColor: '#E5E7EB',
                                backgroundColor: '#3e98c7',
                              })}
                            >
                              <span className="text-xs font-bold text-gray-700">
                                {item.progress || 0}%
                              </span>
                            </CircularProgressbarWithChildren>
                          </div>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="mb-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-gray-600">Completion</span>
                          <span className="text-sm font-bold text-gray-800">{item.progress || 0}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-500 ease-out"
                            style={{ width: `${item.progress || 0}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Subject Image */}
                      {item?.image && (
                        <div className="mb-4">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-24 object-cover rounded-lg border border-gray-200"
                          />
                        </div>
                      )}
                    </div>

                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No Subjects Assigned</h3>
                <p className="text-gray-500">This employee hasn't been assigned any training subjects yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Feedback Dialog */}
      {showFeedback && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-white">Leave Feedback for Supervisor</h2>
                <button
                  onClick={() => setShowFeedback(false)}
                  className="text-white hover:text-gray-200 transition-colors duration-200"
                >
                  <IoClose size={24} />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">Rating</label>
                <div className="flex gap-2 justify-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      className="focus:outline-none transform hover:scale-110 transition-transform duration-200"
                    >
                      <FaStar
                        size={32}
                        className={star <= rating ? "text-yellow-400" : "text-gray-300"}
                      />
                    </button>
                  ))}
                </div>
                <p className="text-center text-sm text-gray-500 mt-2">
                  {rating === 0 && "Select a rating"}
                  {rating === 1 && "Poor"}
                  {rating === 2 && "Fair"}
                  {rating === 3 && "Good"}
                  {rating === 4 && "Very Good"}
                  {rating === 5 && "Excellent"}
                </p>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">Feedback</label>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Write your detailed feedback here..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[120px] resize-none"
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowFeedback(false)}
                  className="px-6 py-3 text-gray-600 hover:text-gray-800 font-medium transition-colors duration-200"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitFeedback}
                  disabled={isSubmitting}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  {isSubmitting ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Submitting...
                    </div>
                  ) : (
                    "Submit Feedback"
                  )}
                </button>
              </div>

              {existingFeedback && (
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <h3 className="text-lg font-semibold mb-4 text-gray-800">Previous Feedback</h3>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex gap-1 mb-3">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <FaStar
                          key={star}
                          size={20}
                          className={star <= existingFeedback.stars ? "text-yellow-400" : "text-gray-300"}
                        />
                      ))}
                    </div>
                    <p className="text-gray-700 mb-3">{existingFeedback.comment}</p>
                    <p className="text-sm text-gray-500">
                      Given on {new Date(existingFeedback.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeDetails;
