import { useNavigate, useSearchParams } from "react-router-dom";
import { YourTopics, Navbar, SideDrawer } from "../../../components";
import { useEffect, useState } from "react";
import { Get } from "../../../config/apiMethods";
import { displayMessage } from "../../../config";
import { MdArrowBack } from "react-icons/md";

interface topictypeORM {
  name: String;
  image: string;
  lessons: any;
  quizes: any;
  practices: any;
  difficulty: String;
  _id: any;
}

const Topics = () => {
  const [topic, setTopics] = useState<topictypeORM[]>([]);
  const [loading, setLoading] = useState(true);
  const [topicProgress, setTopicProgress] = useState<{ [topicId: string]: number }>({});
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Fetch topic progress by calculating average lesson progress for each topic
  const fetchTopicProgress = async (topics: any[]) => {
    const progressData: { [topicId: string]: number } = {};

    for (const topicItem of topics) {
      if (topicItem.lessons && Array.isArray(topicItem.lessons) && topicItem.lessons.length > 0) {
        try {
          // Get all lesson progress for this topic
          const lessonProgressPromises = topicItem.lessons.map(async (lesson: any) => {
            try {
              // Check if lesson has _id property
              const lessonId = lesson._id || lesson.id;
              if (!lessonId) {
                console.warn("Lesson missing ID:", lesson);
                return 0;
              }

              const response = await Get(`/topic/lesson/progress/${lessonId}`);
              return response?.success && response.data ? response.data.progress || 0 : 0;
            } catch (error) {
              console.warn(`Failed to fetch progress for lesson ${lesson._id}:`, error);
              return 0;
            }
          });

          const lessonProgresses = await Promise.all(lessonProgressPromises);

          // Calculate average progress across all lessons in this topic
          const averageProgress = lessonProgresses.length > 0
            ? Math.round(lessonProgresses.reduce((sum, progress) => sum + progress, 0) / lessonProgresses.length)
            : 0;

          progressData[topicItem._id] = averageProgress;
        } catch (error) {
          console.error("Error calculating topic progress:", error);
          progressData[topicItem._id] = 0;
        }
      } else {
        progressData[topicItem._id] = 0;
      }
    }

    setTopicProgress(progressData);
  };

  useEffect(() => {
    const subject = searchParams.get("subject");
    setLoading(true);

    Get(`/topic?subject=${subject}`).then(async (d) => {
      if (d.success) {
        //    setTopics
        //  (  d.data
        //    )
        let mn = await d.data.map((i: any) => {
          let s = 0, m = 0, p = 0;

          // Ensure quizes is an array
          const quizes = Array.isArray(i.quizes) ? i.quizes : [];

          // Flatten studentQuizData safely
          let q = quizes
            .map((j: any) => j?.studentQuizData || [])
            .flat();

          const read = parseFloat(i?.read) || 0; // Fallback to 0 if read is null/undefined

          // === STATUS CONDITIONS ===
          if (q.length === 0 && quizes.length > 0 && quizes[0]?._id && read === 0) {
            i.status = "incomplete (0%)";
          } else if (q.length === 0 && read === 1) {
            i.status = "complete (100%)";
          } else {
            i.status = `incomplete (${Math.round(read * 100)}%)`;
          }

          // === QUIZ SCORE PROCESSING ===
          q.forEach((j: any, index: number) => {
            s += j?.score || 0;
            m += j?.marks || 0;

            if (index === q.length - 1) {
              if (m === 0) {
                i.status = `incomplete (${Math.round(read * 100)}%)`;
              } else {
                const quizRatio = s > 0 ? m / s : 0;
                const avgProgress = ((quizRatio + read) / 2) * 100;

                if (avgProgress === 100) {
                  i.status = `complete (100%)`;
                } else {
                  i.status = `incomplete (${Math.round(avgProgress)}%)`;
                }
              }
            }
          });

          return i;
        });
        setTopics(mn);

        // Fetch progress for all topics after loading
        await fetchTopicProgress(mn);

        // setTopics(d.data);
      } else {
        displayMessage(d.message);
      }
      setLoading(false);
    }).catch((error) => {
      console.error("Error fetching topics:", error);
      displayMessage("Failed to load topics. Please try again.");
      setLoading(false);
    });
    // Function to update the current index every 4 seconds

    // Cleanup interval on component unmount
    // return () => clearInterval(interval);
  }, []);
  return (
    <div className="flex flex-row w-screen h-screen max-w-[2200px] justify-center items-center mx-auto bg-mainBg flex-wrap">
      {/* Sidebar */}
      <div className="lg:w-1/6 h-full bg-transparent transition-all delay-100 flex">
        <SideDrawer />
      </div>

      {/* Main Content */}
      <div className="flex flex-col h-screen w-screen lg:w-10/12 px-2 py-2 md:px-4 md:py-6 xl:pr-16 bg-mainBg">
        {/* Header */}
        <div className="w-full h-fit bg-mainBg mb-2 md:mb-6 flex">
          <Navbar title="Topics" hideSearchBar />
        </div>

        {/* Content */}
        <div className="flex-1 bg-gradient-to-br from-gray-50 to-blue-50 p-4 lg:p-6">
          <div className="max-w-6xl mx-auto">
            {/* Header Section */}
            <div className="mb-8">
              {loading ? (
                <div className="animate-pulse">
                  <div className="h-8 bg-gray-200 rounded-lg mb-4 w-64"></div>
                  <div className="h-4 bg-gray-200 rounded w-96"></div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => navigate(-1)}
                      className="group flex items-center gap-2 bg-white border-2 border-gray-200 rounded-xl px-4 py-3 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 shadow-sm hover:shadow-md"
                    >
                      <MdArrowBack className="text-gray-600 group-hover:text-blue-600 transition-colors duration-200" size={20} />
                      <span className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors duration-200">Back</span>
                    </button>
                    <div>
                      <h1 className="text-3xl font-bold text-gray-900">Course Topics</h1>
                      <p className="text-gray-600 mt-2">Explore the learning content for your course</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 text-sm text-gray-600">
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-semibold">
                      {topic.length} Topic{topic.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Topics Content - Removed image carousel */}
            <div className="w-full">
              <YourTopics topic={topic} loading={loading} topicProgress={topicProgress} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Topics;
