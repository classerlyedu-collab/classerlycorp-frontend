import { useEffect, useState } from "react";
import { TeacherAnalyticsData } from "../../../../constants/HRAdmin/Dashboard";
import { Get } from "../../../../config/apiMethods";
import { FcManager, FcPodiumWithSpeaker, FcPuzzle, FcReading, FcRules } from "react-icons/fc";
import { PiStudentFill } from "react-icons/pi";
import { MdOutlineSchool } from "react-icons/md";
import { RouteName } from "../../../../routes/RouteNames";
import { useNavigate } from "react-router-dom";
import { UseStateContext } from "../../../../context/ContextProvider";

interface AnalyticsComponentProps {
  refreshTrigger?: number;
}

const AnalyticsComponent: React.FC<AnalyticsComponentProps> = ({ refreshTrigger }) => {
  const navigate = useNavigate();
  const { role } = UseStateContext();
  const teacherdata = [
    {
      label: 'Total Employees',
      value: 0,
      icon: <FcManager className="text-5xl md:text-6xl lg:text-7xl" />,
      color: '#7F49F2',
      RouteName: RouteName?.EMPLOYEES_SCREEN
    },
    {
      label: 'Total Supervisors',
      value: 0,
      icon: <PiStudentFill className="text-5xl md:text-6xl lg:text-7xl text-blue-600" />,
      color: '#4CAF50',
      RouteName: RouteName?.SUPERVISORS_SCREEN
    },
    {
      label: 'Total Instructors',
      value: 0,
      icon: <MdOutlineSchool className="text-5xl md:text-6xl lg:text-7xl text-purple-600" />,
      color: '#8B5CF6',
      RouteName: RouteName?.INSTRUCTORS_SCREEN,
      roleRestriction: 'HR-Admin' // Only show for HR-Admin
    },
    {
      label: 'Total Subjects',
      value: 0,
      icon: <FcReading className="text-5xl md:text-6xl lg:text-7xl" />,
      color: '#E9C030',
      RouteName: RouteName?.SUBJECT_TOPIC_MANAGEMENT
    },
    {
      label: 'Total Quizzes',
      value: 0,
      icon: <FcRules className="text-5xl md:text-6xl lg:text-7xl" />,
      color: '#EA794A',
      RouteName: RouteName?.MY_QUIZZES
    },
  ]
  const [teacher, setTeacher] = useState<any[]>(
    []
  );
  useEffect(() => { }, [teacher])
  useEffect(() => {
    const endpoint = role === 'Instructor' ? '/hr-admin/instructor/dashboard' : '/hr-admin/dashboard';
    Get(endpoint)
      .then((d) => {
        if (d.success) {
          // Filter data based on role - remove instructor card for Instructor role
          let data = [...teacherdata].filter(item =>
            !item.roleRestriction || item.roleRestriction === role
          );

          // Derive employees count robustly from payload shapes
          const rawEmployees =
            (typeof d.data?.employees !== 'undefined' ? d.data.employees :
              typeof d.data?.students !== 'undefined' ? d.data.students :
                typeof d.data?.employee !== 'undefined' ? d.data.employee :
                  typeof d.data?.totalEmployees !== 'undefined' ? d.data.totalEmployees : 0);

          const employeesCount = Array.isArray(rawEmployees)
            ? rawEmployees.length
            : Number(rawEmployees) || 0;

          // Map the data based on the filtered array
          const employeesIndex = data.findIndex(item => item.label === 'Total Employees');
          const supervisorsIndex = data.findIndex(item => item.label === 'Total Supervisors');
          const instructorsIndex = data.findIndex(item => item.label === 'Total Instructors');
          const subjectsIndex = data.findIndex(item => item.label === 'Total Subjects');
          const quizzesIndex = data.findIndex(item => item.label === 'Total Quizzes');

          if (employeesIndex !== -1) data[employeesIndex].value = employeesCount;
          if (supervisorsIndex !== -1) data[supervisorsIndex].value = Number(d.data?.supervisors) || 0;
          if (instructorsIndex !== -1) data[instructorsIndex].value = Number(d.data?.instructors) || 0;
          if (subjectsIndex !== -1) data[subjectsIndex].value = Number(d.data?.subject) || (Array.isArray(d.data?.subject) ? d.data.subject.length : 0);
          if (quizzesIndex !== -1) data[quizzesIndex].value = Number(d.data?.quizes) || (Array.isArray(d.data?.quizes) ? d.data.quizes.length : 0);

          setTeacher(data);
        }
      })
      .catch((e) => {
        //   displayMessage(e.message);
      });
  }, [refreshTrigger, role]);
  return (
    <div className="w-full h-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
        {teacher?.map((item, index) => (
          <div
            key={index?.toString()}
            onClick={() => item?.RouteName && navigate(item?.RouteName)}
            className="cursor-pointer flex items-center px-4 py-3 md:py-4 lg:py-5 bg-white border border-gray-200 hover:border-gray-300 rounded-lg shadow-sm hover:shadow transition-colors duration-200"
          >
            <div className="flex items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-md bg-gray-50 mr-3">
              {item.icon}
            </div>
            <div className="flex flex-col justify-center">
              <span className="text-gray-900 font-ubuntu font-semibold text-base md:text-lg leading-tight">
                {typeof item.value === 'number' ? item.value : Number(item.value) || 0}
              </span>
              <span className="text-gray-600 font-ubuntu text-xs md:text-sm font-medium leading-snug">
                {item.label}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AnalyticsComponent;
