import { useEffect, useMemo, useState } from "react";
import {
  Navbar,
  ParentsFeedback,
  SideDrawer,
  TeacherProfile,
  TeacherRating,
} from "../../../components";
import { displayMessage } from "../../../config";
import { Get, Post } from "../../../config/apiMethods";
import { FaStar, FaComments, FaChartLine, FaUsers, FaHeart, FaThumbsUp, FaAward, FaCalendarAlt } from "react-icons/fa";

const Feedback = () => {
  const [feedbacks, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalFeedback: 0,
    averageRating: 0,
    recentFeedback: 0
  });
  // Students and teacher->student feedback form state
  const [students, setStudents] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [teacherNote, setTeacherNote] = useState<string>("");
  const [teacherStars, setTeacherStars] = useState<number>(0);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [activeRightTab, setActiveRightTab] = useState<"list" | "give">("list");

  useEffect(() => {
    setLoading(true);
    Get("/hr-admin/feedback").then((d) => {
      if (d.success) {
        setFeedback(d.data || []);
        // Calculate stats
        const total = d.data?.length || 0;
        const avgRating = d.data?.reduce((sum: number, item: any) => sum + (item.star || 0), 0) / total || 0;
        const recent = d.data?.filter((item: any) => {
          const feedbackDate = new Date(item.createdAt);
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          return feedbackDate > weekAgo;
        }).length || 0;

        setStats({
          totalFeedback: total,
          averageRating: avgRating,
          recentFeedback: recent
        });
      } else {
        displayMessage(d.message, "error");
      }
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });
    // Fetch teacher's students
    Get("/hr-admin/mystudents").then((d) => {
      if (d.success) {
        setStudents(d.data || []);
      }
    }).catch(() => { });
  }, []);

  const satisfactionPercent = Math.max(0, Math.min(100, Math.round((stats.averageRating / 5) * 100)));

  // Build star counts (1..5) dynamically from feedbacks
  const ratingCounts = useMemo(() => {
    const counts: { [k: string]: number } = { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 };
    (feedbacks || []).forEach((f: any) => {
      const s = Number(f?.star) || 0;
      if (s >= 1 && s <= 5) counts[String(s)] += 1;
    });
    return counts;
  }, [feedbacks]);

  const handleSubmitTeacherFeedback = async () => {
    if (!selectedStudent) {
      displayMessage("Please select a student", "error");
      return;
    }
    if (!teacherStars) {
      displayMessage("Please select a star rating", "error");
      return;
    }
    if (!teacherNote.trim()) {
      displayMessage("Please write feedback", "error");
      return;
    }
    setSubmitting(true);
    try {
      const res: any = await Post("/hr-admin/feedback", { student: selectedStudent, feedback: teacherNote.trim(), star: teacherStars });
      if (res?.success) {
        displayMessage("Feedback sent to student", "success");
        setTeacherNote("");
        setTeacherStars(0);
        setSelectedStudent(null);
        // refresh teacher feedback list so new entry appears if relevant
        Get("/hr-admin/feedback").then((d) => {
          if (d.success) {
            setFeedback(d.data || []);
            const total = d.data?.length || 0;
            const avgRating = d.data?.reduce((sum: number, item: any) => sum + (item.star || 0), 0) / total || 0;
            const recent = d.data?.filter((item: any) => {
              const feedbackDate = new Date(item.createdAt);
              const weekAgo = new Date();
              weekAgo.setDate(weekAgo.getDate() - 7);
              return feedbackDate > weekAgo;
            }).length || 0;
            setStats({ totalFeedback: total, averageRating: avgRating, recentFeedback: recent });
          }
        });
      } else {
        displayMessage(res?.message || "Failed to send feedback", "error");
      }
    } catch (err: any) {
      displayMessage(err?.message || "Failed to send feedback", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="flex flex-col lg:flex-row">
        {/* Sidebar */}
        <div className="w-full lg:w-64 bg-white shadow-xl">
          <SideDrawer />
        </div>

        {/* Main Content */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <Navbar title="Feedback Analytics" />
            <div className="mt-3 sm:mt-4">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Student Feedback Dashboard</h1>
              <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">Monitor and analyze student feedback to improve your teaching</p>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-xs sm:text-sm font-medium">Total Reviews</p>
                  <p className="text-2xl sm:text-3xl font-bold">{stats.totalFeedback}</p>
                </div>
                <div className="bg-blue-400 bg-opacity-30 p-2 sm:p-3 rounded-lg sm:rounded-xl">
                  <FaComments className="text-lg sm:text-2xl" />
                </div>
              </div>
              <div className="mt-3 sm:mt-4 flex items-center text-blue-100">
                <FaChartLine className="mr-1 sm:mr-2 text-xs sm:text-sm" />
                <span className="text-xs sm:text-sm">All time feedback</span>
              </div>
            </div>

            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-100 text-xs sm:text-sm font-medium">Average Rating</p>
                  <p className="text-2xl sm:text-3xl font-bold">{stats.averageRating.toFixed(1)}/5</p>
                </div>
                <div className="bg-yellow-400 bg-opacity-30 p-2 sm:p-3 rounded-lg sm:rounded-xl">
                  <FaStar className="text-lg sm:text-2xl" />
                </div>
              </div>
              <div className="mt-3 sm:mt-4 flex items-center text-yellow-100">
                <FaAward className="mr-1 sm:mr-2 text-xs sm:text-sm" />
                <span className="text-xs sm:text-sm">Overall performance</span>
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-400 to-green-600 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-xs sm:text-sm font-medium">This Week</p>
                  <p className="text-2xl sm:text-3xl font-bold">{stats.recentFeedback}</p>
                </div>
                <div className="bg-green-400 bg-opacity-30 p-2 sm:p-3 rounded-lg sm:rounded-xl">
                  <FaCalendarAlt className="text-lg sm:text-2xl" />
                </div>
              </div>
              <div className="mt-3 sm:mt-4 flex items-center text-green-100">
                <FaChartLine className="mr-1 sm:mr-2 text-xs sm:text-sm" />
                <span className="text-xs sm:text-sm">Recent activity</span>
              </div>
            </div>

            <div className="bg-gradient-to-r from-pink-500 to-rose-500 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-xs sm:text-sm font-medium">Satisfaction</p>
                  <p className="text-2xl sm:text-3xl font-bold">{satisfactionPercent}%</p>
                </div>
                <div className="bg-purple-500 bg-opacity-30 p-2 sm:p-3 rounded-lg sm:rounded-xl">
                  <FaThumbsUp className="text-lg sm:text-2xl" />
                </div>
              </div>
              <div className="mt-3 sm:mt-4 flex items-center text-purple-100">
                <FaHeart className="mr-1 sm:mr-2 text-xs sm:text-sm" />
                <span className="text-xs sm:text-sm">Student satisfaction</span>
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Left Column - Profile & Rating */}
            <div className="lg:col-span-1 space-y-4 sm:space-y-6">
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg overflow-hidden">
                <TeacherProfile />
              </div>
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg">
                <TeacherRating counts={ratingCounts} average={stats.averageRating} total={stats.totalFeedback} />
              </div>
            </div>

            {/* Right Column - Reviews / Give Feedback */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg h-full">
                <div className="p-4 sm:p-6 border-b border-gray-200">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center">
                      <div className="bg-gradient-to-r from-pink-500 to-rose-500 p-2 sm:p-3 rounded-lg sm:rounded-xl mr-3 sm:mr-4">
                        <FaHeart className="text-white text-lg sm:text-xl" />
                      </div>
                      <div>
                        <h2 className="text-lg sm:text-2xl font-bold text-gray-900">Student Reviews</h2>
                        <p className="text-sm sm:text-base text-gray-600">What students are saying about your teaching</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="hidden sm:block bg-blue-600 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-full font-semibold text-xs sm:text-sm">
                        {feedbacks.length} Reviews
                      </div>
                      <div className="inline-flex items-center w-full sm:w-auto rounded-full p-1 bg-white border border-gray-200 shadow-sm">
                        <button
                          onClick={() => setActiveRightTab("list")}
                          role="tab"
                          aria-selected={activeRightTab === 'list'}
                          className={`flex-1 sm:flex-none px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-medium rounded-full transition-colors ${activeRightTab === 'list' ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:text-gray-800'}`}
                        >
                          Reviews
                        </button>
                        <button
                          onClick={() => setActiveRightTab("give")}
                          role="tab"
                          aria-selected={activeRightTab === 'give'}
                          className={`flex-1 sm:flex-none px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-medium rounded-full transition-colors ${activeRightTab === 'give' ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:text-gray-800'}`}
                        >
                          Give Feedback
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 sm:p-6">
                  {activeRightTab === 'list' ? (
                    loading ? (
                      <div className="flex items-center justify-center h-48 sm:h-64">
                        <div className="flex flex-col items-center">
                          <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-blue-600 mb-3 sm:mb-4"></div>
                          <p className="text-gray-500 text-sm sm:text-base">Loading feedback...</p>
                        </div>
                      </div>
                    ) : feedbacks.length === 0 ? (
                      <div className="text-center py-12 sm:py-16">
                        <div className="bg-gradient-to-r from-gray-100 to-gray-200 w-16 h-16 sm:w-24 sm:h-24 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                          <FaComments className="text-gray-400 text-2xl sm:text-4xl" />
                        </div>
                        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">No feedback yet</h3>
                        <p className="text-sm sm:text-base text-gray-500 mb-4 sm:mb-6">Students haven't left any feedback yet. Encourage them to share their thoughts!</p>
                        <button className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-200 text-sm sm:text-base" onClick={() => setActiveRightTab('give')}>
                          Give Feedback Now
                        </button>
                      </div>
                    ) : (
                      <ParentsFeedback feedbacks={feedbacks} />
                    )
                  ) : (
                    <div className="max-w-2xl">
                      <div className="grid gap-3 sm:gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Select Student</label>
                          <select
                            value={selectedStudent || ""}
                            onChange={(e) => setSelectedStudent(e.target.value || null)}
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm bg-white"
                          >
                            <option value="" disabled>Select a student</option>
                            {students.map((s: any) => (
                              <option key={s?._id} value={s?._id}>
                                {s?.auth?.fullName || s?.auth?.userName || "Student"}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Your Feedback</label>
                          <textarea
                            value={teacherNote}
                            onChange={(e) => setTeacherNote(e.target.value)}
                            rows={4}
                            placeholder="Write a short, helpful message"
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Star Rating</label>
                          <div className="flex items-center gap-1 sm:gap-2">
                            {Array.from({ length: 5 }, (_, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => setTeacherStars(idx + 1)}
                                className="focus:outline-none"
                                aria-label={`Rate ${idx + 1} star${idx ? 's' : ''}`}
                              >
                                <FaStar className={`h-4 w-4 sm:h-5 sm:w-5 ${teacherStars > idx ? 'text-yellow-400' : 'text-gray-300'}`} />
                              </button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <button
                            onClick={handleSubmitTeacherFeedback}
                            disabled={submitting}
                            className={`inline-flex items-center justify-center px-4 py-2 rounded-lg font-semibold transition text-sm sm:text-base ${submitting ? 'bg-gray-300 text-gray-600 cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
                          >
                            {submitting ? 'Sending...' : 'Send Feedback'}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Feedback;