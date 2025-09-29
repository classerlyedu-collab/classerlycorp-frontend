import { useState, useEffect } from "react";
import { buildStyles, CircularProgressbarWithChildren } from 'react-circular-progressbar';
import { Get } from "../../../../config/apiMethods";
import { displayMessage } from "../../../../config";

interface SubjectProgress {
  _id: string;
  name: string;
  image: string;
  progress: number;
  result: number;
}

const CompletionProgress = () => {
  const [subjects, setSubjects] = useState<SubjectProgress[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSubjectProgress = () => {
    setLoading(true);
    Get("/employee/mysubjects").then((d) => {
      if (d.success) {
        setSubjects(d.data || []);
      } else {
        console.warn("Failed to fetch subject progress:", d.message);
        setSubjects([]);
      }
    }).catch((error) => {
      console.error("Error fetching subject progress:", error);
      displayMessage("Failed to load progress data", "error");
      setSubjects([]);
    }).finally(() => {
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchSubjectProgress();
  }, []);

  if (loading) {
    return (
      <div className="w-full bg-white h-full py-5 px-4 rounded-2xl max-h-96 overflow-y-auto">
        <h1 className="font-ubuntu font-medium text-base md:text-xl text-greyBlack mb-2">
          Completion Progress
        </h1>
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white h-full py-5 px-4 rounded-2xl max-h-96 overflow-y-auto">
      <h1 className="font-ubuntu font-medium text-base md:text-xl text-greyBlack mb-2">
        Completion Progress
      </h1>
      <div>
        {subjects.length > 0 ? (
          subjects.map((subject, index) => (
            <div key={subject._id} className="flex justify-between items-center">
              <div className="flex flex-col pb-5">
                <h1 className="font-ubuntu font-semibold text-base text-black">
                  {subject.name}
                </h1>
                <h1 className="font-ubuntu font-medium md:text-sm text-xs text-greyBlack">
                  Training Subject
                </h1>
              </div>
              <div className="flex justify-center items-center w-10 h-10 md:w-10 md:h-10 lg:w-12 lg:h-12 xl:w-14 xl:h-14 my-2 mx-3">
                <CircularProgressbarWithChildren
                  value={subject.progress || 0}
                  maxValue={100}
                  minValue={0}
                  strokeWidth={7}
                  styles={buildStyles({
                    strokeLinecap: 'round',
                    pathColor: subject.progress >= 80 ? '#10B981' : subject.progress >= 50 ? '#F59E0B' : '#EF4444',
                    trailColor: '#E9E3FF',
                    backgroundColor: '#8A70D6',
                  })}
                >
                  {/* Progress percentage */}
                  <h1 className="font-ubuntu text-xs font-base text-greyBlack group-hover:text-white">
                    {subject.progress || 0}%
                  </h1>
                </CircularProgressbarWithChildren>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No subjects assigned</h3>
            <p className="mt-1 text-sm text-gray-500">
              Contact your HR-Admin to get training subjects assigned.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
export default CompletionProgress;
