import { useEffect, useState, useRef } from "react";
import { Get, Delete, Put } from "../../../../config/apiMethods";
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
    user: {
        _id: string;
        fullName: string;
    };
    userType: "HR-Admin" | "Instructor";
    recipient: {
        _id: string;
        fullName: string;
    };
    recipientType: "HR-Admin" | "Instructor";
    createdAt: string;
}

export const MyInstructors = () => {
    const [instructors, setInstructors] = useState<any[]>([]);
    const [showComments, setShowComments] = useState(false);
    const [selectedInstructor, setSelectedInstructor] = useState<any>(null);
    const [newComment, setNewComment] = useState("");
    const [comments, setComments] = useState<Comment[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isInitialLoading, setIsInitialLoading] = useState(true);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [instructorToDelete, setInstructorToDelete] = useState<any>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);
    const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
    const [userPresence, setUserPresence] = useState<Record<string, 'online' | 'away' | 'offline'>>({});
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
        employeeId: selectedInstructor?.auth?._id,
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

            // Track unread comments from Instructor to current HR-Admin when comments modal is not open
            if (commentData.userType === "Instructor" &&
                role === "HR-Admin" &&
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
        if (!socket || instructors.length === 0) return;

        // Initialize presence state for all instructors as 'offline'
        const initialPresence: Record<string, 'online' | 'away' | 'offline'> = {};
        instructors.forEach((instructor: any) => {
            initialPresence[instructor.auth._id] = 'offline';
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

        // Check if instructors are online by requesting their presence
        instructors.forEach((instructor: any) => {
            socket.emit('check-presence', { userId: instructor.auth._id });
        });

        return () => {
            socket.off('presence-changed', handlePresenceChange);
        };
    }, [socket, instructors]);

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
                    // Get instructors from the response
                    setInstructors(d.data?.instructors || []);
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

    const handleOpenComments = async (instructor: any) => {
        setSelectedInstructor(instructor);
        setShowComments(true);
        setIsLoading(true);

        // Clear unread count for this instructor when comments modal opens 
        const senderId = instructor.auth._id;
        setUnreadCounts(prev => ({
            ...prev,
            [senderId]: 0  // Reset the unread count
        }));

        // Fetch comments for this instructor
        try {
            const response = await Get(`/hr-admin/comments/${instructor.auth._id}`);
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
    };

    const handleCloseComments = () => {
        setShowComments(false);
        setSelectedInstructor(null);
        setNewComment("");
        setComments([]);
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
                recipientId: selectedInstructor.auth._id,
                recipientType: "Instructor"
            };

            const response = await Put("/hr-admin/comments", payload);
            if (response.success) {
                // Create a new comment object with current user info
                const newCommentData = {
                    ...response.data,
                    user: {
                        _id: currentUser._id,
                        fullName: currentUser.fullName
                    },
                    userType: "HR-Admin"
                };

                setComments([...comments, newCommentData]);
                setNewComment("");
                displayMessage("Comment sent successfully", "success");
            } else {
                displayMessage(response.message, "error");
            }
        } catch (error) {
            displayMessage("Failed to send comment", "error");
        }
    };

    const handleDeleteInstructor = (instructor: any) => {
        setInstructorToDelete(instructor);
        setShowDeleteModal(true);
    };

    const handleConfirmDelete = async () => {
        if (!instructorToDelete) return;

        setIsDeleting(true);
        try {
            const response = await Delete(`/hr-admin/instructor/${instructorToDelete._id}`);
            if (response.success) {
                displayMessage(response.message || "Instructor removed successfully from your team", "success");
                // Remove instructor from the list
                setInstructors(instructors.filter(inst => inst._id !== instructorToDelete._id));
                setShowDeleteModal(false);
                setInstructorToDelete(null);
            } else {
                displayMessage(response.message || "Failed to remove instructor", "error");
            }
        } catch (error) {
            displayMessage("Failed to remove instructor", "error");
        } finally {
            setIsDeleting(false);
        }
    };

    const handleCancelDelete = () => {
        setShowDeleteModal(false);
        setInstructorToDelete(null);
    };

    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase();
    };

    return (
        <>
            <div className="p-3 md:p-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-3">
                    <h2 className="text-lg font-ubuntu font-semibold text-gray-900">Instructors</h2>
                    <div className="flex items-center gap-2 w-full md:w-auto">
                        <input
                            type="text"
                            placeholder="Search instructors..."
                            className="w-full md:w-64 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                    </div>
                </div>

                {isInitialLoading ? (
                    <div className="flex items-center justify-center h-40 md:h-48 bg-gray-50 border border-dashed border-gray-300 rounded-lg">
                        <div className="text-center px-4">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                            <p className="text-gray-700 font-ubuntu font-medium">Loading instructors...</p>
                            <p className="text-gray-500 text-sm mt-1">Please wait while we fetch your instructor data</p>
                        </div>
                    </div>
                ) : (!instructors || instructors.length === 0) ? (
                    <div className="flex items-center justify-center h-40 md:h-48 bg-gray-50 border border-dashed border-gray-300 rounded-lg">
                        <div className="text-center px-4">
                            <p className="text-gray-700 font-ubuntu font-medium">No instructors yet</p>
                            <p className="text-gray-500 text-sm mt-1">Add instructors to see them listed here</p>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-8">
                        {instructors?.map((item, index) => (
                            <div key={index} className="group bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden hover:border-purple-300 flex flex-col">
                                {/* Header with Background */}
                                <div className="bg-gradient-to-br from-purple-50 to-indigo-50 border-b border-gray-100 p-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center space-x-3">
                                            {/* Avatar */}
                                            <div className="relative">
                                                <div className="w-12 h-12 rounded-full border-2 border-white shadow-sm overflow-hidden bg-white flex items-center justify-center">
                                                    {item?.auth?.image ? (
                                                        <img
                                                            className="w-full h-full object-cover"
                                                            src={item.auth.image}
                                                            alt="Instructor Avatar"
                                                        />
                                                    ) : (
                                                        <span className="text-purple-600 font-bold text-sm">
                                                            {getInitials(item?.auth?.fullName || 'I')}
                                                        </span>
                                                    )}
                                                </div>
                                                {/* Online Status Indicator */}
                                                <div className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-white ${userPresence[item.auth._id] === 'online' ? 'bg-green-500' :
                                                    userPresence[item.auth._id] === 'away' ? 'bg-yellow-500' :
                                                        'bg-gray-500'
                                                    }`}></div>
                                            </div>
                                            {/* Instructor Info */}
                                            <div className="min-w-0 flex-1">
                                                <h3 className="font-semibold text-gray-900 text-sm md:text-base truncate">{item?.auth?.fullName}</h3>
                                                <p className="text-xs text-gray-500">Instructor</p>
                                            </div>
                                        </div>

                                        {/* More Options Dropdown */}
                                        <div className="relative dropdown-container">
                                            <button
                                                onClick={() => setOpenDropdown(openDropdown === item._id ? null : item._id)}
                                                className={`p-1 rounded-lg transition-all duration-200 ${openDropdown === item._id ? 'bg-white/70' : 'hover:bg-white/70'
                                                    } focus:outline-none focus:ring-2 focus:ring-purple-500/20`}
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
                                                            handleDeleteInstructor(item);
                                                            setOpenDropdown(null);
                                                        }}
                                                        className="w-full px-4 py-2 text-left text-sm text-orange-600 hover:bg-orange-50 transition-colors duration-200 flex items-center"
                                                    >
                                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h8M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                                        </svg>
                                                        Remove Instructor
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Instructor Code Badge */}
                                    <div className="inline-flex items-center px-2.5 py-1 rounded-full bg-purple-100 text-purple-800 text-xs font-medium">
                                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                                        </svg>
                                        ID: {item?.code}
                                    </div>
                                </div>

                                {/* Body Section */}
                                <div className="flex-1 flex flex-col p-4 space-y-3">
                                    {/* Status Information */}
                                    <div className="flex items-center space-x-2">
                                        <div className="flex items-center justify-center w-6 h-6 bg-gray-100 rounded-full">
                                            <svg className="w-3 h-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs text-gray-600">Status</p>
                                            <p className={`text-sm font-medium ${item?.auth?.isBlocked ? 'text-red-600' : 'text-green-600'}`}>
                                                {item?.auth?.isBlocked ? 'Blocked' : 'Active'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Subjects Count */}
                                    {item?.subjects && (
                                        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-100 rounded-xl p-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-3">
                                                    <div className="flex items-center justify-center w-8 h-8 bg-purple-200 rounded-full">
                                                        <svg className="w-4 h-4 text-purple-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                                        </svg>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-semibold text-purple-800">Assigned Subjects</p>
                                                        <p className="text-xs text-purple-600">Courses Available</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-lg font-bold text-purple-900">
                                                        {item.subjects.length}
                                                    </p>
                                                    <p className="text-xs text-purple-600">
                                                        subjects
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Action Buttons */}
                                    <div className="flex flex-col gap-2 pt-3 mt-auto">
                                        {/* Comments Button - Full Width */}
                                        <button
                                            onClick={() => handleOpenComments(item)}
                                            className="relative w-full inline-flex items-center justify-center px-3 py-2 text-xs font-medium rounded-lg bg-gradient-to-r from-purple-600 to-purple-700 text-white hover:from-purple-700 hover:to-purple-800 shadow-sm hover:shadow-md transition-all duration-200 group"
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
                        ))}
                    </div>
                )}

            </div>

            {/* Comments Dialog */}
            {showComments && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col border border-gray-200">
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-t-2xl">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                                    <span className="text-lg font-bold">
                                        {selectedInstructor?.auth?.fullName?.charAt(0).toUpperCase() || 'I'}
                                    </span>
                                </div>
                                <div>
                                    <h2 className="text-xl font-semibold">{selectedInstructor?.auth?.fullName}</h2>
                                    <p className="text-purple-100 text-sm">Instructor Conversation</p>
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
                                        <div className="animate-spin rounded-full h-12 w-12 border-2 border-purple-600 border-t-transparent mx-auto mb-4"></div>
                                        <p className="text-gray-600">Loading conversation...</p>
                                    </div>
                                </div>
                            ) : comments.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-gray-500 space-y-3">
                                    <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center">
                                        <svg className="w-10 h-10 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                        </svg>
                                    </div>
                                    <p className="text-xl font-semibold text-gray-700">No messages yet</p>
                                    <p className="text-sm max-w-sm text-center">Start the conversation with your instructor by sending a message below</p>
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
                                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${isCurrentUser ? "bg-purple-600 text-white" : "bg-gray-200 text-gray-600"
                                                            }`}>
                                                            {comment.user?.fullName?.charAt(0).toUpperCase() || 'U'}
                                                        </div>
                                                    </div>

                                                    {/* Message Bubble */}
                                                    <div className={`rounded-2xl px-4 py-3 shadow-sm ${isCurrentUser
                                                        ? "bg-gradient-to-r from-purple-600 to-purple-700 text-white"
                                                        : "bg-white border border-gray-200 text-gray-800"
                                                        }`}>
                                                        <p className="text-sm leading-relaxed">{comment.text}</p>
                                                        <p className={`text-xs mt-1 ${isCurrentUser ? "text-purple-100" : "text-gray-500"
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
                            <div className="flex items-center space-x-3">
                                <input
                                    type="text"
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    placeholder="Type your message here..."
                                    className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                    onKeyPress={(e) => e.key === 'Enter' && handleSendComment()}
                                />
                                <button
                                    onClick={handleSendComment}
                                    disabled={!newComment.trim()}
                                    className={`px-6 py-3 rounded-xl font-medium transition-all ${newComment.trim()
                                        ? "bg-gradient-to-r from-purple-600 to-purple-700 text-white hover:from-purple-700 hover:to-purple-800 shadow-lg"
                                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                                        }`}
                                >
                                    Send
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Remove Instructor Confirmation Modal */}
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
                                    <h2 className="text-xl font-semibold text-gray-900">Remove Instructor</h2>
                                    <p className="text-gray-600 text-sm">This will remove them from your account</p>
                                </div>
                            </div>
                        </div>

                        {/* Body */}
                        <div className="p-6">
                            <div className="text-gray-700">
                                <p className="mb-2">Are you sure you want to remove this instructor from your account?</p>
                                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                                    <p className="font-medium text-orange-800">
                                        {instructorToDelete?.auth?.fullName}
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

export default MyInstructors;
