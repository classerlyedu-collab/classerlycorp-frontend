import React, { useEffect, useState, useRef } from "react";
import { Get, Post } from "../../../../config/apiMethods";
import { displayMessage } from "../../../../config";
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

interface MyTeachersProps {
  refreshTrigger?: number;
}

const MyTeachers: React.FC<MyTeachersProps> = ({ refreshTrigger }) => {
  const [myTeacher, setmyTeachers] = useState<any[]>([]);
  const [showComments, setShowComments] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<any>(null);
  const [newComment, setNewComment] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [comments, setComments] = useState<Comment[]>([]);
  const [studentSubjects, setStudentSubjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubjectsLoading, setIsSubjectsLoading] = useState(false);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const [userPresence, setUserPresence] = useState<Record<string, 'online' | 'away' | 'offline'>>({});
  const { role } = UseStateContext();
  const commentsEndRef = useRef<HTMLDivElement>(null);

  // Socket functionality
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const token = localStorage.getItem("token") || "";
  const { socket, isConnected } = useSocket(token);

  // Join notifications room and set up presence tracking on employee side  
  useEffect(() => {
    if (!socket) return;

    console.log('Joining to notifications room (Employee)', { userId: user._id });
    socket.emit('join-notifications', { userId: user._id });
    socket.emit('update-presence', { status: 'online' });

    return () => {
      socket.emit('leave-notifications', { userId: user._id });
    };
  }, [socket, user._id]);

  // Track user presence status on employee side  
  useEffect(() => {
    if (!socket || myTeacher.length === 0) return;

    // Initialize presence state for all teachers as 'offline'  
    const initialPresence: Record<string, 'online' | 'away' | 'offline'> = {};
    myTeacher.forEach((teacher: any) => {
      initialPresence[teacher.auth._id] = 'offline';
    });
    setUserPresence(initialPresence);

    // Listen for presence status updates from socket events
    const handlePresenceChange = (data: any) => {
      // Update teacher presence status for employee dashboard
      setUserPresence(prev => ({
        ...prev,
        [data.userId]: data.status
      }));
    };

    socket.on('presence-changed', handlePresenceChange);

    // Check if teachers are online by requesting their presence
    myTeacher.forEach((teacher: any) => {
      socket.emit('check-presence', { userId: teacher.auth._id });
    });

    return () => {
      socket.off('presence-changed', handlePresenceChange);
    };
  }, [socket, myTeacher]);

  // Listen for notification badge-related events
  useEffect(() => {
    if (!socket) return;

    const handleNotificationReceived = (data: any) => {
      console.log('Global notification received (Employee side):', data);
      const commentData = data.comment;

      console.log('Notification data (Employee side):', {
        userType: commentData.userType,
        role,
        recipientId: commentData.recipient?._id,
        userId: user._id,
        showComments
      });

      // Only track unread comments from HR-Admin to current Employee when comments modal is not open
      if (commentData.userType === "HR-Admin" &&
        role === "Employee" &&
        !showComments &&
        commentData.recipient?._id === user._id) {
        const senderId = commentData.user?._id;
        console.log('Adding notification count for sender (Employee side):', senderId);
        if (senderId) {
          setUnreadCounts(prev => {
            const newCounts = {
              ...prev,
              [senderId]: (prev[senderId] || 0) + 1
            };
            console.log('Updated unread counts (Employee side):', newCounts);
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

  // Set up comment socket for current conversation 
  useCommentSocket({
    socket,
    hrAdminId: selectedTeacher?.auth?._id,
    employeeId: user._id,
    onCommentReceived: (newCommentData) => {
      setComments(prevComments => [...prevComments, newCommentData]);
    }
  });

  const scrollToBottom = () => {
    commentsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (showComments) {
      scrollToBottom();
    }
  }, [showComments, comments]);

  const getTeachers = () => {
    Get("/employee/myteachers").then((d) => {
      if (d.data?.length > 0) {
        setmyTeachers(d.data);
      }
    });
  };

  useEffect(() => {
    getTeachers();
  }, []);

  useEffect(() => {
    if (refreshTrigger && refreshTrigger > 0) {
      getTeachers();
    }
  }, [refreshTrigger]);

  const handleOpenComments = async (teacher: any) => {
    setSelectedTeacher(teacher);
    setShowComments(true);
    setIsLoading(true);
    setIsSubjectsLoading(true);

    // Clear unread count for this teacher when comments modal opens 
    const senderId = teacher.auth._id;
    setUnreadCounts(prev => ({
      ...prev,
      [senderId]: 0  // Reset the unread count
    }));

    // Fetch comments for this teacher
    try {
      const response = await Get(`/hr-admin/comments/${teacher.auth._id}`);
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

    // Get current user from localStorage
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    // Fetch student's own subjects
    try {
      const subjectsResponse = await Get(`/subject/student/${user._id}/subjects`);
      if (subjectsResponse.success) {
        setStudentSubjects(subjectsResponse.data);
      }
    } catch (error) {
      displayMessage("Failed to load subjects", "error");
    } finally {
      setIsSubjectsLoading(false);
    }
  };

  const handleCloseComments = () => {
    setShowComments(false);
    setSelectedTeacher(null);
    setNewComment("");
    setSelectedSubject("");
    setComments([]);
    setStudentSubjects([]);
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
        recipientId: selectedTeacher.auth._id,
        recipientType: "HR-Admin",
        ...(selectedSubject && selectedSubject !== "" && !selectedSubject.includes("undefined") && { subject: selectedSubject })
      };

      const response = await Post("/hr-admin/comments", payload);
      if (response.success) {
        // Find the selected subject from studentSubjects
        const selectedSubjectData = studentSubjects.find(sub => sub._id === selectedSubject);

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
          userType: "Employee"
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

  return (
    <>
      <div className="max-h-96 overflow-y-auto">
        {myTeacher.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Team Members</h3>
            <p className="text-gray-500 text-sm">You haven't been added to any team yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {myTeacher.map((item: any) => (
              <div key={item._id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                <div className="flex items-center space-x-3">
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    <div className="relative">
                      <img
                        src={item?.auth?.image || require("../../../../images/settings/profile.png")}
                        alt={item?.auth?.userName || 'Team Member'}
                        className="w-12 h-12 rounded-full object-cover border-2 border-blue-200"
                      />
                      {/* Online Status Indicator */}
                      <div className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-white ${userPresence[item.auth._id] === 'online' ? 'bg-green-500' :
                        userPresence[item.auth._id] === 'away' ? 'bg-yellow-500' :
                          'bg-gray-500'
                        }`}></div>
                    </div>
                  </div>

                  {/* Team Member Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-semibold text-gray-900 truncate">
                      {item?.auth?.userName || item?.auth?.fullName}
                    </h3>
                    <p className="text-sm text-gray-600">Team Member</p>
                  </div>

                  {/* Actions */}
                  <div className="flex-shrink-0">
                    <button
                      onClick={() => handleOpenComments(item)}
                      className="relative inline-flex items-center px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-100 hover:bg-blue-200 rounded-md transition-colors"
                    >
                      💬 Comments
                      {unreadCounts[item.auth._id] > 0 && (
                        <span className="absolute -top-1 -right-1 flex items-center justify-center h-4 w-4 bg-red-500 text-white text-xs rounded-full font-bold">
                          {unreadCounts[item.auth._id] > 9 ? "9+" : unreadCounts[item.auth._id]}
                        </span>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
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
                    {selectedTeacher?.auth?.userName?.charAt(0).toUpperCase() || 'T'}
                  </span>
                </div>
                <div>
                  <h2 className="text-xl font-semibold">{selectedTeacher?.auth?.userName}</h2>
                  <p className="text-blue-100 text-sm">Team Member Conversation</p>
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
                  <p className="text-sm max-w-sm text-center">Start the conversation with your team member by sending a message below</p>
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
                {isSubjectsLoading ? (
                  <div className="flex items-center justify-center py-3 bg-gray-50 rounded-lg">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600"></div>
                    <span className="ml-2 text-gray-600 text-sm">Loading subjects...</span>
                  </div>
                ) : studentSubjects.length === 0 ? (
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
                    {studentSubjects.map((subject) => (
                      <option key={subject._id} value={subject._id}>
                        {subject.name}
                      </option>
                    ))}
                  </select>
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
    </>
  );
};

export default MyTeachers;
