import { useEffect, useState } from "react";
import { Get } from "../../../config/apiMethods";
import { displayMessage } from "../../../config";

// interface subjecttypeORM {
//   createdAt: String;
//   grade: any;
//   image: string;
//   name: String;
//   topics:any;
//   updatedAt: any;
//   _id:any
// }

const Quiz = ({ onLoadToEditor }: { onLoadToEditor?: (q: any) => void }) => {
  // const [quiz, setquiz] = useState([]);
  const [quiz, setQuiz] = useState<any[]>([]);

  const [loading, setLoading] = useState(false);

  let user = JSON.parse(localStorage.getItem("user") || "");
  useEffect(() => {
    setLoading(true);

    const endpoint = user?.userType === "HR-Admin"
      ? `/quiz`
      : `/quiz?createdBy=${user?.profile?._id}`;

    Get(endpoint).then((d) => {
      if (d.success) {
        setQuiz(d.data);
        setLoading(false);
      } else {
        displayMessage(d.message, "error");
      }
    });
  }, []);
  return (
    <div className="w-full">
      {quiz.length === 0 ? (
        <p className="text-sm text-grey">No quizzes found.</p>
      ) : (
        <div className="space-y-3">
          {quiz.map((q: any, idx: number) => (
            <div key={q?._id || idx} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-sm">
                      {(q?.subject?.name || 'Q').slice(0, 1).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 truncate">{q?.subject?.name || 'Subject'}</h4>
                      <p className="text-xs text-gray-500">{q?.topic?.name || 'Topic'} • {q?.lesson?.name || 'Lesson'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-600">
                    <span className="flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {q?.questions?.length || 0} questions
                    </span>
                    <span className="flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                      </svg>
                      {q?.score ?? 0} points
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${q?.type === 'private'
                        ? 'bg-orange-100 text-orange-700'
                        : 'bg-green-100 text-green-700'
                      }`}>
                      {q?.type === 'private' ? 'Private' : 'Universal'}
                    </span>
                  </div>
                </div>
                {onLoadToEditor ? (
                  <button
                    className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs font-medium flex items-center gap-1"
                    onClick={() => onLoadToEditor(q)}
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    Load
                  </button>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
export default Quiz;
