import React, { useState, useEffect } from 'react';
import { getRandomColor } from '../../../../utils/randomColorGenerator';
import { getInitialsLetters } from '../../../../utils/FirstLetterExtractor';
import { Get } from "../../../../config/apiMethods";
import { displayMessage } from "../../../../config";

// Define the type for the TopPerformingStudents component
interface TopPerformer {
  _id: string;
  fullName: string;
  averageScore: number;
  totalQuizzes: number;
}

const TopPerformingStudents: React.FC = () => {
  const [topPerformers, setTopPerformers] = useState<TopPerformer[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTopPerformers = () => {
    setLoading(true);
    Get("/employee/topperformers").then((d) => {
      if (d.success) {
        setTopPerformers(d.data || []);
      } else {
        console.warn("Failed to fetch top performers:", d.message);
        setTopPerformers([]);
      }
    }).catch((error) => {
      console.error("Error fetching top performers:", error);
      displayMessage("Failed to load top performers", "error");
      setTopPerformers([]);
    }).finally(() => {
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchTopPerformers();
  }, []);

  if (loading) {
    return (
      <div className="w-full bg-white h-full py-5 sm:pl-4 sm:pr-0 md:px-4 rounded-2xl flex flex-row flex-wrap max-h-96 md:overflow-y-auto">
        <h1 className="font-ubuntu font-medium text-base md:text-xl text-greyBlack mb-2">
          Top Performing Employees
        </h1>
        <div className="flex justify-center items-center h-32 w-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white h-full py-5 sm:pl-4 sm:pr-0 md:px-4 rounded-2xl flex flex-row flex-wrap max-h-96 md:overflow-y-auto">

      <h1 className="font-ubuntu font-medium text-base md:text-xl text-greyBlack mb-2">
        Top Performing Employees
      </h1>

      <div className="w-full mt-2 flex md:flex-wrap items-start justify-start gap-3 overflow-x-auto">
        {topPerformers.length > 0 ? (
          topPerformers.map((performer: TopPerformer, index: number) => (
            <div key={performer._id} className="flex min-w-52 md:min-w-full flex-row justify-start items-center rounded-3xl p-4 w-3/4 sm:w-1/2 md:w-full" style={{
              background: getRandomColor('dark', index)
            }}>
              <div className="flex items-center justify-center w-10 h-10 md:w-16 md:h-16 rounded-full " style={{
                background: getRandomColor('dark', index + 3)
              }}>
                <p className="text-md md:text-xl font-semibold text-white">{getInitialsLetters(performer.fullName)}</p>
              </div>

              <div className='flex flex-col ml-2 md:ml-5'>
                <h1 className="font-ubuntu font-medium text-white text-sm md:text-base">{performer.fullName}</h1>
                <h1 className="font-ubuntu font-medium md:text-sm text-xs text-mainBg">
                  {performer.averageScore?.toFixed(1) || 0}/10 Avg Score
                </h1>
                <h1 className="font-ubuntu font-medium md:text-sm text-xs text-mainBg opacity-75">
                  {performer.totalQuizzes || 0} quizzes completed
                </h1>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 w-full">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No performance data available</h3>
            <p className="mt-1 text-sm text-gray-500">
              Performance rankings will appear here once employees complete quizzes.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TopPerformingStudents;
