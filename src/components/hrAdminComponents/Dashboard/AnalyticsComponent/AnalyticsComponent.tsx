import { useEffect, useState } from "react";
import { TeacherAnalyticsData } from "../../../../constants/HRAdmin/Dashboard";
import { Get } from "../../../../config/apiMethods";
import { FcManager, FcPodiumWithSpeaker, FcPuzzle, FcReading, FcRules } from "react-icons/fc";
import { RouteName } from "../../../../routes/RouteNames";
import { useNavigate } from "react-router-dom";

interface AnalyticsComponentProps {
  refreshTrigger?: number;
}

const AnalyticsComponent: React.FC<AnalyticsComponentProps> = ({ refreshTrigger }) => {
  const navigate = useNavigate();
  const teacherdata = [
    {
      label: 'Total Employees',
      value: 0,
      icon: <FcManager className="text-5xl md:text-6xl lg:text-7xl" />,
      color: '#7F49F2',
      RouteName: RouteName?.EMPLOYEES_SCREEN
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
    // {
    //   label: 'Total Games',
    //   value: 0,
    //   icon: <FcPuzzle className="text-5xl md:text-6xl lg:text-7xl" />,
    //   color: '#63CB82',
    //   RouteName: null
    // },
    // {
    //     label: 'Total Classess',
    //     value: 90,
    //     icon: <FcPodiumWithSpeaker className="text-5xl md:text-6xl lg:text-7xl" />,
    //     color: '#3BC6DF'
    // },
  ]
  const [teacher, setTeacher] = useState<any[]>(
    []
  );
  useEffect(() => { }, [teacher])
  useEffect(() => {
    Get("/hr-admin/dashboard")
      .then((d) => {
        if (d.success) {

          let data = [...teacherdata]

          // Derive employees count robustly from various possible payload shapes
          const rawEmployees =
            (typeof d.data?.employees !== 'undefined' ? d.data.employees :
              typeof d.data?.students !== 'undefined' ? d.data.students :
                typeof d.data?.employee !== 'undefined' ? d.data.employee :
                  typeof d.data?.totalEmployees !== 'undefined' ? d.data.totalEmployees : 0);

          const employeesCount = Array.isArray(rawEmployees)
            ? rawEmployees.length
            : Number(rawEmployees) || 0;

          data[0].value = employeesCount;
          data[1].value = Number(d.data?.subject) || (Array.isArray(d.data?.subject) ? d.data.subject.length : 0);
          data[2].value = Number(d.data?.quizes) || (Array.isArray(d.data?.quizes) ? d.data.quizes.length : 0);

          setTeacher(data);
        }
      })
      .catch((e) => {
        //   displayMessage(e.message);
      });
  }, [refreshTrigger]);
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
