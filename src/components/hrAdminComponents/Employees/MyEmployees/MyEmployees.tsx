import { StudentsData } from "../../../../constants/HRAdmin/MyStudents";
import { CiClock2 } from "react-icons/ci";
import { getRandomColor } from "../../../../utils/randomColorGenerator";
import { useEffect, useState, useRef } from "react";
import { Get, Post, Delete, Put } from "../../../../config/apiMethods";
import { displayMessage } from "../../../../config";
import { RouteName } from "../../../../routes/RouteNames";
import { useNavigate } from "react-router-dom";
import { IoClose } from "react-icons/io5";
import { UseStateContext } from "../../../../context/ContextProvider";
import { useSocket } from "../../../../hooks/useSocket";
import { useCommentSocket } from "../../../../hooks/useCommentSocket";

interface Comment {
  _id: string;
  text: string;
  subject?: {
    _id: string;
    name: string;
  };
  user: {
    _id: string;
    fullName: string;
  };
  userType: "HR-Admin" | "Employee";
  recipient: {
    _id: string;
    fullName: string;
  };
  recipientType: "HR-Admin" | "Employee";
  createdAt: string;
}

export const MyEmployees = () => {
  const [mystd, setMyStd] = useState<any[]>([]);
  const [instructors, setInstructors] = useState<any[]>([]);
  const [showComments, setShowComments] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [newComment, setNewComment] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [comments, setComments] = useState<Comment[]>([]);
  const [employeeSubjects, setEmployeeSubjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isSubjectsLoading, setIsSubjectsLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showInstructorDeleteModal, setShowInstructorDeleteModal] = useState(false);
  const [instructorToDelete, setInstructorToDelete] = useState<any>(null);
  const [isDeletingInstructor, setIsDeletingInstructor] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const [userPresence, setUserPresence] = useState<Record<string, 'online' | 'away' | 'offline'>>({});
  const [showSubjectAssignmentModal, setShowSubjectAssignmentModal] = useState(false);
  const [selectedEmployeeForSubjects, setSelectedEmployeeForSubjects] = useState<any>(null);
  const [availableSubjects, setAvailableSubjects] = useState<any[]>([]);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [assigningSubjects, setAssigningSubjects] = useState(false);
  const { role } = UseStateContext();
  const navigate = useNavigate();
  const commentsEndRef = useRef<HTMLDivElement>(null);

  // Socket functionality
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const token = localStorage.getItem("token") || "";
  const { socket, isConnected } = useSocket(token);

  // Set up comment socket for current conversation 
  useCommentSocket({
    socket,
    hrAdminId: user._id,
    employeeId: selectedEmployee?.auth?._id,
    onCommentReceived: (newCommentData) => {
      setComments(prevComments => [...prevComments, newCommentData]);
    }
  });

  // Join notifications room on mount and set up presence tracking
  useEffect(() => {
    if (!socket) return;

    console.log('Joining to notifications room', { userId: user._id });
    socket.emit('join-notifications', { userId: user._id });

    // Update presence when active
    socket.emit('update-presence', { status: 'online' });

    // Track user activity for 'away' status 
    let awayTimer: ReturnType<typeof setTimeout> | undefined;
    let onlineTimer: ReturnType<typeof setTimeout> | undefined;
    const resetAwayTimer = () => {
      if (awayTimer) clearTimeout(awayTimer);
      if (onlineTimer) clearTimeout(onlineTimer);

      // Emit online immediately
      socket.emit('update-presence', { status: 'online' });

      // Set to away after 30 seconds of inactivity
      awayTimer = setTimeout(() => {
        socket.emit('update-presence', { status: 'away' });
      }, 30000);
    };

    // Reset timer on any user activity
    const handleActivity = () => {
      resetAwayTimer();
    };

    // Listen for user mouse/keyboard activity 
    document.addEventListener('mousemove', handleActivity);
    document.addEventListener('keypress', handleActivity);
    document.addEventListener('click', handleActivity);

    return () => {
      socket.emit('leave-notifications', { userId: user._id });
      if (awayTimer) clearTimeout(awayTimer);
      if (onlineTimer) clearTimeout(onlineTimer);
      document.removeEventListener('mousemove', handleActivity);
      document.removeEventListener('keypress', handleActivity);
      document.removeEventListener('click', handleActivity);
    };
  }, [socket, user._id]);

  // Listen for notification badge-related events
  useEffect(() => {
    if (!socket) return;

    const handleNotificationReceived = (data: any) => {
      console.log('Global notification received:', data);
      const commentData = data.comment;

      console.log('Notification data:', {
        userType: commentData.userType,
        role,
        recipientId: commentData.recipient?._id,
        userId: user._id,
        showComments
      });

      // Track unread comments from Employee to current HR-Admin OR Instructor when comments modal is not open
      if (commentData.userType === "Employee" &&
        (role === "HR-Admin" || role === "Instructor") &&
        !showComments &&
        commentData.recipient?._id === user._id) {
        const senderId = commentData.user?._id;
        console.log('Adding notification count for sender:', senderId);
        if (senderId) {
          setUnreadCounts(prev => {
            const newCounts = {
              ...prev,
              [senderId]: (prev[senderId] || 0) + 1
            };
            console.log('Updated unread counts:', newCounts);
            return newCounts;
          });
        }
      }
    };

    socket.on('notification-received', handleNotificationReceived);

    return () => {
      socket.off('notification-received', handleNotificationReceived);
    };
  }, [socket, role, showComments, user._id]);

  // Track user presence status  
  useEffect(() => {
    if (!socket || mystd.length === 0) return;

    // Initialize presence state for all employees as 'offline'
    const initialPresence: Record<string, 'online' | 'away' | 'offline'> = {};
    mystd.forEach((employee: any) => {
      initialPresence[employee.auth._id] = 'offline';
    });
    setUserPresence(initialPresence);

    // Listen for presence status updates from socket events
    const handlePresenceChange = (data: any) => {
      // Update user presence state 
      setUserPresence(prev => ({
        ...prev,
        [data.userId]: data.status
      }));
    };

    socket.on('presence-changed', handlePresenceChange);

    // Check if employees are online by requesting their presence
    mystd.forEach((employee: any) => {
      socket.emit('check-presence', { userId: employee.auth._id });
    });

    return () => {
      socket.off('presence-changed', handlePresenceChange);
    };
  }, [socket, mystd]);

  const scrollToBottom = () => {
    commentsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (showComments) {
      scrollToBottom();
    }
  }, [showComments, comments]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openDropdown && !(event.target as Element).closest('.dropdown-container')) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openDropdown]);

  useEffect(() => {
    setIsInitialLoading(true);
    Get("/hr-admin/myemployees")
      .then((d) => {
        if (d.success) {
          // Support both legacy array and new object shape { employees, instructors }
          if (Array.isArray(d.data)) {
            setMyStd(d.data);
            setInstructors([]);
          } else {
            setMyStd(d.data?.employees || []);
            setInstructors(d.data?.instructors || []);
          }
        } else {
          displayMessage(d.message, "error");
        }
      })
      .catch((err) => {
        displayMessage(err.message, "error");
      })
      .finally(() => {
        setIsInitialLoading(false);
      });
  }, []);

  console.log(selectedEmployee);

  const handleOpenComments = async (employee: any) => {
    setSelectedEmployee(employee);
    setShowComments(true);
    setIsLoading(true);
    setIsSubjectsLoading(true);

    // Clear unread count for this employee when comments modal opens 
    const senderId = employee.auth._id;
    setUnreadCounts(prev => ({
      ...prev,
      [senderId]: 0  // Reset the unread count
    }));

    // Fetch comments for this employee
    try {
      const response = await Get(`/hr-admin/comments/${employee.auth._id}`);
      if (response.success) {
        setComments(response.data);
      } else {
        displayMessage(response.message || "Failed to load comments", "error");
      }
    } catch (error) {
      displayMessage("Failed to load comments", "error");
    } finally {
      setIsLoading(false);
    }

    // If HR-Admin, fetch employee's subjects
    if (role === "HR-Admin") {
      try {
        const subjectsResponse = await Get(`/subject/student/${employee.auth._id}/subjects`);
        if (subjectsResponse.success) {
          setEmployeeSubjects(subjectsResponse.data);
        }
      } catch (error) {
        displayMessage("Failed to load subjects", "error");
      } finally {
        setIsSubjectsLoading(false);
      }
    } else {
      setIsSubjectsLoading(false);
    }
  };

  const handleCloseComments = () => {
    setShowComments(false);
    setSelectedEmployee(null);
    setNewComment("");
    setSelectedSubject("");
    setComments([]);
    setEmployeeSubjects([]);
  };

  const handleSendComment = async () => {
    if (!newComment.trim()) {
      displayMessage("Please enter a comment", "error");
      return;
    }

    try {
      const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
      const payload = {
        text: newComment,
        recipientId: selectedEmployee.auth._id,
        recipientType: "Employee",
        ...(role === "HR-Admin" && selectedSubject && selectedSubject !== "" && !selectedSubject.includes("undefined") && { subject: selectedSubject })
      };

      const response = await Post("/hr-admin/comments", payload);
      if (response.success) {
        // Find the selected subject from employeeSubjects
        const selectedSubjectData = employeeSubjects.find(sub => sub._id === selectedSubject);

        // Create a new comment object with the subject data and current user info
        const newCommentData = {
          ...response.data,
          subject: selectedSubjectData ? {
            _id: selectedSubjectData._id,
            name: selectedSubjectData.name
          } : undefined,
          user: {
            _id: currentUser._id,
            fullName: currentUser.fullName
          },
          userType: "HR-Admin"
        };

        setComments([...comments, newCommentData]);
        setNewComment("");
        setSelectedSubject("");
        displayMessage("Comment sent successfully", "success");
      } else {
        displayMessage(response.message, "error");
      }
    } catch (error) {
      displayMessage("Failed to send comment", "error");
    }
  };

  const handleDeleteEmployee = (employee: any) => {
    setEmployeeToDelete(employee);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!employeeToDelete) return;

    setIsDeleting(true);
    try {
      const response = await Delete(`/hr-admin/employee/${employeeToDelete._id}`);
      if (response.success) {
        displayMessage(response.message || "Employee removed successfully from your team", "success");
        // Remove employee from the list
        setMyStd(mystd.filter(emp => emp._id !== employeeToDelete._id));
        setShowDeleteModal(false);
        setEmployeeToDelete(null);
      } else {
        displayMessage(response.message || "Failed to remove employee", "error");
      }
    } catch (error) {
      displayMessage("Failed to remove employee", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setEmployeeToDelete(null);
  };

  const handleConfirmDeleteInstructor = async () => {
    if (!instructorToDelete) return;

    setIsDeletingInstructor(true);
    try {
      const response = await Delete(`/hr-admin/instructor/${instructorToDelete._id}`);
      if (response.success) {
        displayMessage(response.message || "Instructor removed successfully from your team", "success");
        // Remove instructor from the list
        setInstructors(prev => prev.filter(ins => ins._id !== instructorToDelete._id));
        setShowInstructorDeleteModal(false);
        setInstructorToDelete(null);
      } else {
        displayMessage(response.message || "Failed to remove instructor", "error");
      }
    } catch (error) {
      displayMessage("Failed to remove instructor", "error");
    } finally {
      setIsDeletingInstructor(false);
    }
  };

  const handleCancelDeleteInstructor = () => {
    setShowInstructorDeleteModal(false);
    setInstructorToDelete(null);
  };

  // Subject assignment handlers
  const handleOpenSubjectAssignment = async (employee: any) => {
    setSelectedEmployeeForSubjects(employee);
    setShowSubjectAssignmentModal(true);

    // Fetch available subjects
    try {
      const subjectsResponse = await Get('/subject');
      if (subjectsResponse.success) {
        setAvailableSubjects(subjectsResponse.data);

        // Pre-select current subjects for the employee (if any)
        if (employee.subjects) {
          const employeeSubjectIds = employee.subjects.map((s: any) => s._id || s);
          setSelectedSubjects(employeeSubjectIds);
        } else {
          setSelectedSubjects([]);
        }
      } else {
        displayMessage("Failed to load subjects", "error");
      }
    } catch (error) {
      displayMessage("Failed to load subjects", "error");
    }
  };

  const handleAssignSubjects = async () => {
    if (!selectedEmployeeForSubjects || assigningSubjects) return;

    setAssigningSubjects(true);
    try {
      const response = await Put(`/hr-admin/employees/${selectedEmployeeForSubjects._id}/subjects`, {
        subjects: selectedSubjects
      });

      if (response.success) {
        displayMessage('Employee subjects updated successfully', 'success');
        setShowSubjectAssignmentModal(false);
        setSelectedEmployeeForSubjects(null);
        setSelectedSubjects([]);

        // Refresh the employees list
        const refreshResponse = await Get("/hr-admin/myemployees");
        if (refreshResponse.success) {
          if (Array.isArray(refreshResponse.data)) {
            setMyStd(refreshResponse.data);
            setInstructors([]);
          } else {
            setMyStd(refreshResponse.data?.employees || []);
            setInstructors(refreshResponse.data?.instructors || []);
          }
        }
      } else {
        displayMessage(response.message || "Failed to assign subjects", "error");
      }
    } catch (error) {
      displayMessage("Failed to assign subjects", "error");
    } finally {
      setAssigningSubjects(false);
    }
  };

  const handleCloseSubjectAssignment = () => {
    setShowSubjectAssignmentModal(false);
    setSelectedEmployeeForSubjects(null);
    setSelectedSubjects([]);
    setAvailableSubjects([]);
  };

  return (
    <>
      <div className="p-3 md:p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-3">
          <h2 className="text-lg font-ubuntu font-semibold text-gray-900">Employees</h2>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <input
              type="text"
              placeholder="Search employees..."
              className="w-full md:w-64 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {isInitialLoading ? (
          <div className="flex items-center justify-center h-40 md:h-48 bg-gray-50 border border-dashed border-gray-300 rounded-lg">
            <div className="text-center px-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-700 font-ubuntu font-medium">Loading employees...</p>
              <p className="text-gray-500 text-sm mt-1">Please wait while we fetch your team data</p>
            </div>
          </div>
        ) : (!mystd || mystd.length === 0) ? (
          <div className="flex items-center justify-center h-40 md:h-48 bg-gray-50 border border-dashed border-gray-300 rounded-lg">
            <div className="text-center px-4">
              <p className="text-gray-700 font-ubuntu font-medium">No employees yet</p>
              <p className="text-gray-500 text-sm mt-1">Add employees to see them listed here</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-8">
            {mystd?.map((item, index) => (
              <div key={index} className="group bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden hover:border-blue-300 flex flex-col">
                {/* Header with Background */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-b border-gray-100 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      {/* Avatar */}
                      <div className="relative">
                        <div className="w-12 h-12 rounded-full border-2 border-white shadow-sm overflow-hidden bg-white">
                          <img
                            className="w-full h-full object-cover"
                            src={item?.auth?.image || StudentsData[0].image}
                            alt="Employee Avatar"
                          />
                        </div>
                        {/* Online Status Indicator */}
                        <div className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-white ${userPresence[item.auth._id] === 'online' ? 'bg-green-500' :
                          userPresence[item.auth._id] === 'away' ? 'bg-yellow-500' :
                            'bg-gray-500'
                          }`}></div>
                      </div>
                      {/* Employee Info */}
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-gray-900 text-sm md:text-base truncate">{item?.auth?.fullName}</h3>
                        <p className="text-xs text-gray-500">Employee</p>
                      </div>
                    </div>

                    {/* More Options Dropdown */}
                    <div className="relative dropdown-container">
                      <button
                        onClick={() => setOpenDropdown(openDropdown === item._id ? null : item._id)}
                        className={`p-1 rounded-lg transition-all duration-200 ${openDropdown === item._id ? 'bg-white/70' : 'hover:bg-white/70'
                          } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                      >
                        <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                        </svg>
                      </button>

                      {/* Dropdown Menu */}
                      {openDropdown === item._id && (
                        <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                          <button
                            onClick={() => {
                              handleDeleteEmployee(item);
                              setOpenDropdown(null);
                            }}
                            className="w-full px-4 py-2 text-left text-sm text-orange-600 hover:bg-orange-50 transition-colors duration-200 flex items-center"
                          >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h8M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                            Remove Employee
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Employee Code Badge */}
                  <div className="inline-flex items-center px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-medium">
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                    </svg>
                    ID: {item?.code}
                  </div>
                </div>

                {/* Body Section */}
                <div className="flex-1 flex flex-col p-4 space-y-3">
                  {/* Supervisor Information */}
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center justify-center w-6 h-6 bg-gray-100 rounded-full">
                      <svg className="w-3 h-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-600">Supervisor</p>
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {item?.supervisor?.auth?.fullName || item?.parent?.auth?.fullName || 'Not Assigned'}
                      </p>
                    </div>
                  </div>

                  {/* Subject Progress */}
                  {(item?.overallProgress || item?.quiz) && (
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center justify-center w-8 h-8 bg-blue-200 rounded-full">
                            <svg className="w-4 h-4 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-blue-800">Training Progress</p>
                            <p className="text-xs text-blue-600">Lessons Completed</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-blue-900">
                            {item.overallProgress ?
                              `${item.overallProgress.completed}/${item.overallProgress.total}` :
                              `${item.quiz?.pass || 0}/${item.quiz?.total || 0}`
                            }
                          </p>
                          <p className="text-xs text-blue-600">
                            {item.overallProgress ?
                              `${item.overallProgress.percentage}%` :
                              `${Math.round(((item.quiz?.pass || 0) / Math.max(item.quiz?.total || 1, 1)) * 100)}%`
                            }
                          </p>
                        </div>
                      </div>
                      <div className="mt-3">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs font-medium text-blue-700">Overall Progress</span>
                          <span className="text-xs font-medium text-blue-700">
                            {item.overallProgress ?
                              `${item.overallProgress.percentage}%` :
                              `${Math.round(((item.quiz?.pass || 0) / Math.max(item.quiz?.total || 1, 1)) * 100)}%`
                            }
                          </span>
                        </div>
                        <div className="w-full h-2 bg-blue-200 rounded-full overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full transition-all duration-700 ease-out"
                            style={{
                              width: `${item.overallProgress ?
                                item.overallProgress.percentage :
                                Math.round(((item.quiz?.pass || 0) / Math.max(item.quiz?.total || 1, 1)) * 100)
                                }%`
                            }}
                          ></div>
                        </div>
                      </div>

                    </div>
                  )}

                  {/* Action Buttons - Restructured layout */}
                  <div className="flex flex-col gap-2 pt-3 mt-auto">
                    {/* View Button - Full Width */}
                    <button
                      onClick={() => navigate(RouteName.EMPLOYEE_DETAILS_SCREEN, { state: item })}
                      className="w-full inline-flex items-center justify-center px-3 py-2 text-xs font-medium rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 group"
                    >
                      <svg className="w-3 h-3 mr-2 group-hover:scale-110 transition-transform duration-200 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      <span>View Employee Details</span>
                    </button>

                    {/* Subjects and Comments Buttons - 50% width each */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleOpenSubjectAssignment(item)}
                        className="flex-1 inline-flex items-center justify-center px-3 py-2 text-xs font-medium rounded-lg bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800 shadow-sm hover:shadow-md transition-all duration-200 group"
                      >
                        <svg className="w-3 h-3 mr-2 group-hover:scale-110 transition-transform duration-200 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                        <span>Subjects</span>
                      </button>
                      <button
                        onClick={() => handleOpenComments(item)}
                        className="relative flex-1 inline-flex items-center justify-center px-3 py-2 text-xs font-medium rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-sm hover:shadow-md transition-all duration-200 group"
                      >
                        <svg className="w-3 h-3 mr-2 group-hover:scale-110 transition-transform duration-200 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        <span>Comments</span>
                        {unreadCounts[item.auth._id] > 0 && (
                          <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[16px] h-4 px-1 bg-red-500 text-white text-xs rounded-full font-bold leading-none">
                            {unreadCounts[item.auth._id] > 9 ? "9+" : unreadCounts[item.auth._id]}
                          </span>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Instructors Section */}
        {role === "HR-Admin" && (
          <div className="mt-8">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-ubuntu font-semibold text-gray-900">Instructors</h2>
            </div>
            {isInitialLoading ? (
              <div className="flex items-center justify-center h-40 md:h-48 bg-gray-50 border border-dashed border-gray-300 rounded-lg">
                <div className="text-center px-4">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-700 font-ubuntu font-medium">Loading instructors...</p>
                </div>
              </div>
            ) : (!instructors || instructors.length === 0) ? (
              <div className="flex items-center justify-center h-32 bg-gray-50 border border-dashed border-gray-300 rounded-lg">
                <div className="text-center px-4">
                  <p className="text-gray-700 font-ubuntu font-medium">No instructors yet</p>
                  <p className="text-gray-500 text-sm mt-1">Once added, instructors will appear here</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-8">
                {instructors.map((ins) => (
                  <div key={ins._id} className="group bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden hover:border-blue-300 flex flex-col">
                    <div className="bg-gradient-to-br from-purple-50 to-violet-50 border-b border-gray-100 p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 rounded-full border-2 border-white shadow-sm overflow-hidden bg-white">
                            <img className="w-full h-full object-cover" src={ins?.auth?.image || StudentsData[0].image} alt="Instructor Avatar" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="font-semibold text-gray-900 text-sm md:text-base truncate">{ins?.auth?.fullName}</h3>
                            <p className="text-xs text-gray-500">Instructor</p>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setInstructorToDelete(ins);
                            setShowInstructorDeleteModal(true);
                          }}
                          disabled={isDeletingInstructor}
                          className="p-1.5 rounded-lg hover:bg-white/70 transition-colors text-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Remove Instructor"
                        >
                          {isDeletingInstructor ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                          ) : (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          )}
                        </button>
                      </div>
                      <div className="inline-flex items-center px-2.5 py-1 rounded-full bg-purple-100 text-purple-800 text-xs font-medium">ID: {ins?.code}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Comments Dialog */}
      {showComments && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col border border-gray-200">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-2xl">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-lg font-bold">
                    {selectedEmployee?.auth?.fullName?.charAt(0).toUpperCase() || 'E'}
                  </span>
                </div>
                <div>
                  <h2 className="text-xl font-semibold">{selectedEmployee?.auth?.fullName}</h2>
                  <p className="text-blue-100 text-sm">Employee Conversation</p>
                </div>
              </div>
              <button
                onClick={handleCloseComments}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                <IoClose size={24} />
              </button>
            </div>

            {/* Comments List */}
            <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-2 border-blue-600 border-t-transparent mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading conversation...</p>
                  </div>
                </div>
              ) : comments.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-500 space-y-3">
                  <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                    <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <p className="text-xl font-semibold text-gray-700">No messages yet</p>
                  <p className="text-sm max-w-sm text-center">Start the conversation with your employee by sending a message below</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {comments.map((comment) => {
                    const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
                    const isCurrentUser = comment.user._id === currentUser._id;

                    return (
                      <div key={comment._id} className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}>
                        <div className={`flex max-w-[75%] space-x-3 ${isCurrentUser ? "flex-row-reverse space-x-reverse" : ""}`}>
                          {/* Avatar for message */}
                          <div className="flex-shrink-0">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${isCurrentUser ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"
                              }`}>
                              {comment.user?.fullName?.charAt(0).toUpperCase() || 'U'}
                            </div>
                          </div>

                          {/* Message Bubble */}
                          <div className={`rounded-2xl px-4 py-3 shadow-sm ${isCurrentUser
                            ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white"
                            : "bg-white border border-gray-200 text-gray-800"
                            }`}>
                            {/* Subject Badge */}
                            {comment.subject && (
                              <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mb-2 ${isCurrentUser
                                ? "bg-white/20 text-white"
                                : "bg-blue-100 text-blue-700"
                                }`}>
                                📚 {comment.subject.name}
                              </div>
                            )}
                            <p className="text-sm leading-relaxed">{comment.text}</p>
                            <p className={`text-xs mt-1 ${isCurrentUser ? "text-blue-100" : "text-gray-500"
                              }`}>
                              {new Date(comment.createdAt).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={commentsEndRef} />
                </div>
              )}
            </div>

            {/* Input Section */}
            <div className="border-t border-gray-200 p-6 bg-white">
              <div className="flex flex-col space-y-4">
                {/* Subject Selector */}
                {role === "HR-Admin" && (
                  isSubjectsLoading ? (
                    <div className="flex items-center justify-center py-3 bg-gray-50 rounded-lg">
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600"></div>
                      <span className="ml-2 text-gray-600 text-sm">Loading subjects...</span>
                    </div>
                  ) : employeeSubjects.length === 0 ? (
                    <div className="text-center px-4 py-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-yellow-700 text-sm">No subjects available</p>
                    </div>
                  ) : (
                    <select
                      value={selectedSubject}
                      onChange={(e) => setSelectedSubject(e.target.value)}
                      className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white transition-all"
                    >
                      <option value="">📚 Choose a subject (optional)</option>
                      {employeeSubjects.map((subject) => (
                        <option key={subject._id} value={subject._id}>
                          {subject.name}
                        </option>
                      ))}
                    </select>
                  )
                )}

                {/* Message Input */}
                <div className="flex items-center space-x-3">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Type your message here..."
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    onKeyPress={(e) => e.key === 'Enter' && handleSendComment()}
                  />
                  <button
                    onClick={handleSendComment}
                    disabled={!newComment.trim()}
                    className={`px-6 py-3 rounded-xl font-medium transition-all ${newComment.trim()
                      ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-lg"
                      : "bg-gray-100 text-gray-400 cursor-not-allowed"
                      }`}
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Remove Employee Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-gray-200">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h8M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Remove Employee</h2>
                  <p className="text-gray-600 text-sm">This will remove them from your account</p>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="p-6">
              <div className="text-gray-700">
                <p className="mb-2">Are you sure you want to remove this employee from your account?</p>
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                  <p className="font-medium text-orange-800">
                    {employeeToDelete?.auth?.fullName}
                  </p>
                  <p className="text-orange-600 text-sm">
                    They will be removed from your team and can be added by other HR-Admins if needed
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
              <button
                onClick={handleCancelDelete}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-medium text-white bg-orange-600 rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Removing...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h8M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    Remove Employee
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Subject Assignment Modal */}
      {showSubjectAssignmentModal && selectedEmployeeForSubjects && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl border border-gray-200">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Assign Subjects</h2>
                  <p className="text-gray-600 text-sm">{selectedEmployeeForSubjects?.auth?.fullName}</p>
                </div>
              </div>
              <button
                onClick={handleCloseSubjectAssignment}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <IoClose size={24} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              {availableSubjects.length === 0 ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <p className="text-gray-600 font-medium">No subjects available</p>
                    <p className="text-gray-500 text-sm mt-1">Please create subjects first before assigning them to employees.</p>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="mb-4">
                    <p className="text-gray-700 mb-3">Select courses to assign to this employee:</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {availableSubjects.map((subject) => (
                      <label
                        key={subject._id}
                        className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={selectedSubjects.includes(subject._id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedSubjects(prev => [...prev, subject._id]);
                            } else {
                              setSelectedSubjects(prev => prev.filter(id => id !== subject._id));
                            }
                          }}
                          className="mt-1 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">{subject.name}</p>
                          {subject.description && (
                            <p className="text-xs text-gray-500">{subject.description}</p>
                          )}
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
              <button
                onClick={handleCloseSubjectAssignment}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAssignSubjects}
                disabled={assigningSubjects}
                className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${assigningSubjects
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800 shadow-lg hover:shadow-xl'
                  }`}
              >
                {assigningSubjects ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                    Updating...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    {selectedSubjects.length === 0 ? 'Remove All Subjects' : `Update Subjects (${selectedSubjects.length})`}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Instructor Delete Confirmation Modal */}
      {showInstructorDeleteModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-gray-200">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Remove Instructor</h3>
                  <p className="text-sm text-gray-500">This action cannot be undone</p>
                </div>
              </div>
              <button
                onClick={handleCancelDeleteInstructor}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <IoClose className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white font-semibold text-lg">
                  {instructorToDelete?.auth?.fullName?.charAt(0) || 'I'}
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">{instructorToDelete?.auth?.fullName}</h4>
                  <p className="text-sm text-gray-500">Instructor • ID: {instructorToDelete?.code}</p>
                </div>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed">
                Are you sure you want to remove this instructor from your team? They will lose access to all subjects, employees, and content under your management.
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
              <button
                onClick={handleCancelDeleteInstructor}
                disabled={isDeletingInstructor}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDeleteInstructor}
                disabled={isDeletingInstructor}
                className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${isDeletingInstructor
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800 shadow-lg hover:shadow-xl'
                  }`}
              >
                {isDeletingInstructor ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                    Removing...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Remove Instructor
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MyEmployees;
