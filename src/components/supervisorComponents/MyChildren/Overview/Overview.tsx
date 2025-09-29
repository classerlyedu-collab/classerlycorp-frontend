import { FaUser, FaGraduationCap, FaIdCard, FaCalendarAlt } from "react-icons/fa";
import { useEffect, useState } from "react";
import { Get } from "../../../../config/apiMethods";
import { useNavigate } from "react-router-dom";
import { RouteName } from "../../../../routes/RouteNames";

const Overview = ({ per, mystd }: any) => {
  const [allEmployees, setAllEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  let date = new Date();

  useEffect(() => {
    // Fetch all employees for this supervisor
    Get("/supervisor/mychilds")
      .then((response) => {
        if (response.success) {
          setAllEmployees(response.data);
        }
      })
      .catch((error) => {
        console.error("Error fetching employee data:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleEmployeeSelect = (employee: any) => {
    // Store selected employee in localStorage
    localStorage.setItem("myemployee", JSON.stringify(employee));
    // Navigate to the same page with employee parameter
    navigate(RouteName.MYEMPLOYEES_SCREEN + `?employee=${employee._id}`);
    // Reload the page to update the selected employee
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="w-full space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-100 rounded-full">
            <FaUser className="text-blue-600 text-lg" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 font-ubuntu">Select an Employee to View Progress</h1>
        </div>

        {/* Loading State */}
        <div className="flex flex-col items-center justify-center py-16">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mb-6"></div>
          <h3 className="text-xl font-semibold text-gray-700 font-ubuntu mb-2">Loading Employees...</h3>
          <p className="text-gray-500 font-ubuntu text-center max-w-md">
            Please wait while we fetch your team members and their progress data.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-3 bg-blue-100 rounded-full">
          <FaUser className="text-blue-600 text-lg" />
        </div>
        <h1 className="text-2xl font-bold text-gray-800 font-ubuntu">Select an Employee to View Progress</h1>
      </div>

      {/* Employees Grid */}
      {allEmployees && allEmployees.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allEmployees.map((employee: any, index: number) => (
            <div
              key={index}
              onClick={() => handleEmployeeSelect(employee)}
              className="group bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-blue-300 cursor-pointer hover:scale-[1.02] overflow-hidden relative"
            >
              {/* Background Gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

              {/* Content */}
              <div className="relative p-6">
                {/* Header Section */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="w-20 h-20 bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                        <img
                          src={employee?.auth?.image || "https://st2.depositphotos.com/3889193/6856/i/450/depositphotos_68564721-Beautiful-young-student-posing.jpg"}
                          alt={employee?.auth?.fullName}
                          className="w-16 h-16 rounded-xl object-cover"
                        />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-800 font-ubuntu text-xl mb-1 group-hover:text-blue-700 transition-colors duration-200">
                        {employee?.auth?.fullName || "Employee Name"}
                      </h3>
                      <p className="text-sm font-medium text-blue-600 font-ubuntu mb-2">
                        {employee?.auth?.email || "No email"}
                      </p>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${employee?.isBlocked ? 'bg-red-400' : 'bg-green-400'}`}></div>
                        <span className={`text-xs font-ubuntu ${employee?.isBlocked ? 'text-red-500' : 'text-gray-500'}`}>
                          {employee?.isBlocked ? 'Not Active' : 'Active'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="w-10 h-10 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center shadow-lg transition-all duration-200">
                      <FaGraduationCap className="w-4 h-4 text-white" />
                    </div>
                  </div>
                </div>

                {/* Info Section */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl group-hover:bg-blue-50 transition-colors duration-200">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <FaIdCard className="text-blue-600 text-sm" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-ubuntu">Employee Code</p>
                      <p className="text-sm font-semibold text-gray-800 font-ubuntu">{employee?.code || "N/A"}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl group-hover:bg-blue-50 transition-colors duration-200">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                      <FaCalendarAlt className="text-purple-600 text-sm" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-ubuntu">Joined</p>
                      <p className="text-sm font-semibold text-gray-800 font-ubuntu">{date.getFullYear()}</p>
                    </div>
                  </div>
                </div>

                {/* Progress Section */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700 font-ubuntu">Training Progress</span>
                    <span className="text-sm font-bold text-blue-600 font-ubuntu">{employee?.overallProgress?.percentage || 0}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${employee?.overallProgress?.percentage || 0}%` }}
                    ></div>
                  </div>
                </div>

                {/* Footer */}
                <div className="pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-center gap-2 text-blue-600 font-ubuntu">
                    <FaGraduationCap className="w-4 h-4" />
                    <span className="text-sm font-semibold group-hover:text-blue-700 transition-colors duration-200">
                      Select to View Progress
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <FaUser className="text-gray-300 text-6xl mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-500 font-ubuntu mb-2">No Employees Found</h3>
          <p className="text-gray-400 font-ubuntu">Employees will appear here once they are assigned to you.</p>
        </div>
      )}
    </div>
  );
};

export default Overview;