import { Navbar, SideDrawer } from "../../../components";
import "react-datepicker/dist/react-datepicker.css";
import { useNavigate } from "react-router-dom";
import { RouteName } from "../../../routes/RouteNames";
import { useEffect, useMemo, useState } from "react";
import { Get, Delete } from "../../../config/apiMethods";
import { displayMessage } from "../../../config";
import { useSubscriptionStatus } from "../../../hooks/useSubscriptionStatus.hook";

const MyQuizzes = () => {

  const navigate = useNavigate();
  const { loading, allowed } = useSubscriptionStatus();

  const headerArray = ["Subject", "Topic", "Lesson", "Questions", "Score"];
  const [quizzes, setQuizzes] = useState<any[]>([])
  const [searchText, setSearchText] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; quizId: string | null; quizTitle: string }>({
    show: false,
    quizId: null,
    quizTitle: ""
  })
  const [isDeleting, setIsDeleting] = useState(false)

  const getStoredUser = () => {
    try {
      const raw = localStorage.getItem("user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  };

  const user = getStoredUser();

  useEffect(() => {
    // Only redirect if we've checked and user is not allowed (not while loading)
    if (!loading && !allowed) {
      navigate(RouteName.SUBSCRIPTION, { replace: true });
    }
  }, [loading, allowed, navigate]);

  useEffect(() => {
    setIsLoading(true)

    if (!user) {
      setQuizzes([]);
      setIsLoading(false);
      return;
    }

    const endpoint = user?.userType === "HR-Admin" ?
      `/quiz` :
      `/quiz?createdBy=${user?.profile?._id}`;

    Get(endpoint).then((d) => {
      if (d?.success) {
        setQuizzes(Array.isArray(d.data) ? d.data : [])
      } else {
        // Treat "not found" as empty state rather than error toast
        const msg = d?.message?.toLowerCase?.() || "";
        if (msg.includes("not found") || msg.includes("no") || msg.includes("quiz")) {
          setQuizzes([])
        } else {
          displayMessage(d?.message || "Failed to load quizzes", "error");
        }
      }
      setIsLoading(false)
    });
  }, [])

  const filteredQuizzes = useMemo(() => {
    if (!searchText?.trim()) return quizzes;
    const needle = searchText.toLowerCase();
    return quizzes.filter((q: any) => {
      const subject = q?.subject?.name?.toLowerCase?.() || "";
      const topic = q?.topic?.name?.toLowerCase?.() || "";
      const lesson = q?.lesson?.name?.toLowerCase?.() || "";
      const grade = q?.grade?.grade?.toString?.().toLowerCase?.() || "";
      return subject.includes(needle) || topic.includes(needle) || lesson.includes(needle) || grade.includes(needle);
    })
  }, [quizzes, searchText])

  const handleDeleteQuiz = (quizId: string, quizTitle: string) => {
    setDeleteConfirm({
      show: true,
      quizId,
      quizTitle: quizTitle || "this quiz"
    });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm.quizId || isDeleting) return;

    setIsDeleting(true);
    try {
      const response = await Delete(`/quiz/teacher/${deleteConfirm.quizId}`);
      if (response.success) {
        displayMessage("Quiz deleted successfully", "success");
        // Refresh the quiz list
        const endpoint = user?.userType === "HR-Admin" ?
          `/quiz` :
          `/quiz?createdBy=${user?.profile?._id}`;
        Get(endpoint).then((d) => {
          if (d?.success) {
            setQuizzes(Array.isArray(d.data) ? d.data : [])
          } else {
            setQuizzes([])
          }
        });
      } else {
        displayMessage(response.message || "Failed to delete quiz", "error");
      }
    } catch (error) {
      displayMessage("Failed to delete quiz", "error");
    } finally {
      setIsDeleting(false);
      setDeleteConfirm({ show: false, quizId: null, quizTitle: "" });
    }
  };

  const cancelDelete = () => {
    if (!isDeleting) {
      setDeleteConfirm({ show: false, quizId: null, quizTitle: "" });
    }
  };

  // Don't render content if not allowed (will redirect silently)
  if (!loading && !allowed) return null;

  return (
    <div className="flex flex-row w-screen h-screen max-w-[2200px] justify-center items-center mx-auto bg-mainBg flex-wrap">
      {/* for left side */}
      <div className="lg:w-1/6 h-full bg-transparent">
        <SideDrawer />
      </div>

      {/* for right side */}
      <div className="flex flex-col h-screen w-screen lg:w-10/12 px-2 py-2 md:px-4 md:py-6 md:pr-16 bg-mainBg">
        {/* 1st Navbar */}
        <div className="w-full h-fit bg-mainBg mb-2 md:mb-6">
          <Navbar title="Quizzes" hideSearchBar />
        </div>

        {/* controls */}
        <div className="w-full flex flex-col gap-3 px-1 md:px-5 mb-4">
          <div className="w-full flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
            <input
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Search by subject, topic, lesson or grade"
              className="w-full md:w-1/2 px-4 py-2 rounded-md border border-gray-300 focus:outline-none"
            />
            <div className="flex gap-2">
              <button
                className="bg-secondary px-4 py-2 rounded-md hover:opacity-90 text-white"
                onClick={() => navigate(RouteName.ADD_QUIZ)}
              >
                Add Quiz
              </button>
            </div>
          </div>
        </div>

        {/* content */}
        <div className="w-full px-1 md:px-5 pb-10">
          {isLoading ? (
            <div className="w-full h-64 flex items-center justify-center">
              <p className="text-greyBlack">Loading quizzes...</p>
            </div>
          ) : filteredQuizzes?.length === 0 ? (
            <div className="w-full h-64 flex flex-col items-center justify-center gap-3 bg-white rounded-xl border border-dashed border-gray-300">
              <h3 className="text-lg md:text-xl text-greyBlack">No quizzes created yet</h3>
              <p className="text-sm text-grey">Once you add quizzes, they will appear here.</p>
              <button
                className="bg-secondary px-4 py-2 rounded-md hover:opacity-90 text-white"
                onClick={() => navigate(RouteName.ADD_QUIZ)}
              >
                Create your first quiz
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredQuizzes.map((item: any, index: number) => (
                <div key={item?._id || index} className="group bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 overflow-hidden">
                  {/* Card Header with Gradient */}
                  <div
                    className="relative h-20"
                    style={{
                      background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)'
                    }}
                  >
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-white bg-opacity-20 flex items-center justify-center text-white font-bold text-lg">
                        {(item?.subject?.name || "Q").slice(0, 1).toUpperCase()}
                      </div>
                    </div>
                    <div className="absolute top-3 right-3">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${item?.type === 'private'
                        ? 'bg-orange-100 text-orange-700'
                        : 'bg-green-100 text-green-700'
                        }`}>
                        {item?.type === 'private' ? 'Private' : 'Universal'}
                      </span>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-6">
                    <div className="mb-4">
                      <h3 className="text-lg font-bold text-gray-900 mb-1">{item?.subject?.name || "Untitled Subject"}</h3>
                      <p className="text-sm text-gray-600 mb-3">
                        {item?.topic?.name || "No Topic"} • {item?.lesson?.name || "No Lesson"}
                      </p>

                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="text-center p-3 bg-blue-50 rounded-lg">
                          <div className="text-xl font-bold text-blue-600">{item?.questions?.length || 0}</div>
                          <div className="text-xs text-blue-600 font-medium">Questions</div>
                        </div>
                        <div className="text-center p-3 bg-emerald-50 rounded-lg">
                          <div className="text-xl font-bold text-emerald-600">{item?.score ?? 0}</div>
                          <div className="text-xs text-emerald-600 font-medium">Total Score</div>
                        </div>
                      </div>

                      <div className="text-xs text-gray-400 mb-4">
                        Created: {item?.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'Unknown'}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => navigate(RouteName.UPDATE_QUIZ, { state: item })}
                        className="flex-1 text-white py-2.5 px-4 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 group/btn"
                        style={{
                          background: 'linear-gradient(90deg, #3b82f6 0%, #1d4ed8 100%)'
                        }}
                        onMouseEnter={(e) => {
                          (e.target as HTMLButtonElement).style.background = 'linear-gradient(90deg, #2563eb 0%, #1e40af 100%)';
                        }}
                        onMouseLeave={(e) => {
                          (e.target as HTMLButtonElement).style.background = 'linear-gradient(90deg, #3b82f6 0%, #1d4ed8 100%)';
                        }}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => handleDeleteQuiz(item._id, item.title || `${item.subject?.name || "Subject"} - ${item.topic?.name || "Topic"}`)}
                        className="px-4 py-2.5 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-all duration-200 flex items-center justify-center"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Delete Confirmation Dialog */}
      {deleteConfirm.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Confirm Delete
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete <strong>"{deleteConfirm.quizTitle}"</strong>?
              This action cannot be undone and will also delete all student attempts for this quiz.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={cancelDelete}
                disabled={isDeleting}
                className={`px-4 py-2 text-gray-600 bg-gray-200 rounded-md transition-colors ${isDeleting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-300'
                  }`}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className={`px-4 py-2 text-white bg-red-500 rounded-md transition-colors flex items-center gap-2 min-w-[120px] justify-center ${isDeleting ? 'opacity-60 cursor-not-allowed' : 'hover:bg-red-600'
                  }`}
              >
                {isDeleting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Deleting...</span>
                  </>
                ) : (
                  'Delete Quiz'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default MyQuizzes;
