import React, { useState, useEffect } from 'react';
import { Get, Delete, Put } from '../../../config/apiMethods';
import { displayMessage } from '../../../config';
import {
    BsClock,
    BsCheckCircle,
    BsXCircle,
    BsPersonFill,
    BsChevronRight,
    BsEye,
    BsTrash3,
    BsX,
    BsTag,
    BsPlus,
    BsList,
    BsPencilSquare
} from 'react-icons/bs';

interface Request {
    _id: string;
    status: 'Pending' | 'Complete' | 'Rejected';
    employee: {
        _id: string;
        code: string;
        auth: {
            _id: string;
            fullName: string;
            email: string;
            userName: string;
            image?: string;
        };
    };
    subjects: any[];
    createdAt: string;
    updatedAt: string;
}

interface RequestManagementProps {
    refreshTrigger?: number;
}

const RequestManagement: React.FC<RequestManagementProps> = ({ refreshTrigger }) => {
    const [requests, setRequests] = useState<Request[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
    const [showSubjectsModal, setShowSubjectsModal] = useState<boolean>(false);
    const [showEditSubjectsModal, setShowEditSubjectsModal] = useState<boolean>(false);
    const [deletingRequest, setDeletingRequest] = useState<string | null>(null);
    const [cancellingRequest, setCancellingRequest] = useState<string | null>(null);
    const [updatingSubjects, setUpdatingSubjects] = useState<boolean>(false);
    const [loadingEditSubjects, setLoadingEditSubjects] = useState<boolean>(false);
    const [loadingViewSubjects, setLoadingViewSubjects] = useState<boolean>(false);
    const [showCancelConfirmModal, setShowCancelConfirmModal] = useState<boolean>(false);
    const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState<boolean>(false);
    const [requestToCancel, setRequestToCancel] = useState<string | null>(null);
    const [requestToDelete, setRequestToDelete] = useState<string | null>(null);
    const [availableSubjects, setAvailableSubjects] = useState<any[]>([]);
    const [selectedSubjectsForEdit, setSelectedSubjectsForEdit] = useState<string[]>([]);
    const [topicsForSubject, setTopicsForSubject] = useState<any[]>([]);

    const fetchRequests = async () => {
        try {
            setLoading(true);
            const response = await Get('/hr-admin/requests');
            if (response.success) {
                setRequests(response.data || []);
            } else {
                displayMessage(response.message || "Failed to load requests", "error");
            }
        } catch (error) {
            displayMessage("Failed to load requests", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    useEffect(() => {
        if (refreshTrigger && refreshTrigger > 0) {
            fetchRequests();
        }
    }, [refreshTrigger]);

    const handleRequestCancelAction = (requestId: string) => {
        setRequestToCancel(requestId);
        setShowCancelConfirmModal(true);
    };

    const handleRequestDeleteAction = (requestId: string) => {
        setRequestToDelete(requestId);
        setShowDeleteConfirmModal(true);
    };

    const handleCancelRequest = async () => {
        if (!requestToCancel) return;

        try {
            setCancellingRequest(requestToCancel);
            const response = await Delete(`/hr-admin/requests/${requestToCancel}/cancel`);
            if (response.success) {
                displayMessage('Request cancelled successfully', 'success');
                setRequests(prev => prev.filter(req => req._id !== requestToCancel));
            } else {
                displayMessage(response.message || "Failed to cancel request", "error");
            }
        } catch (error) {
            displayMessage("Failed to cancel request", "error");
        } finally {
            setCancellingRequest(null);
            setShowCancelConfirmModal(false);
            setRequestToCancel(null);
        }
    };

    const handleDeleteRequest = async () => {
        if (!requestToDelete) return;

        try {
            setDeletingRequest(requestToDelete);
            const response = await Delete(`/hr-admin/requests/${requestToDelete}/delete`);
            if (response.success) {
                displayMessage('Request deleted successfully', 'success');
                setRequests(prev => prev.filter(req => req._id !== requestToDelete));
            } else {
                displayMessage(response.message || "Failed to delete request", "error");
            }
        } catch (error) {
            displayMessage("Failed to delete request", "error");
        } finally {
            setDeletingRequest(null);
            setShowDeleteConfirmModal(false);
            setRequestToDelete(null);
        }
    };

    const handleShowSubjects = async (request: Request) => {
        try {
            setLoadingViewSubjects(true);
            setSelectedRequest(request);

            // Topics are now populated from backend, but we can fetch additional topics
            try {
                const topicsResponse = await Get('/topic/all');
                if (topicsResponse.success) {
                    setTopicsForSubject(topicsResponse.data);
                }
            } catch (error) {
                console.log("Could not fetch topics for display");
            }

            setShowSubjectsModal(true);
        } finally {
            setLoadingViewSubjects(false);
        }
    };

    const handleEditSubjects = async (request: Request) => {
        try {
            setLoadingEditSubjects(true);
            setSelectedRequest(request);
            setSelectedSubjectsForEdit(request.subjects.map((s: any) => s._id));

            const subjectsResponse = await Get('/subject');

            if (subjectsResponse.success) {
                setAvailableSubjects(subjectsResponse.data);
            } else {
                displayMessage(subjectsResponse.message || "Failed to load subjects", "error");
            }

            setShowEditSubjectsModal(true);
        } catch (error) {
            displayMessage("Failed to load data", "error");
        } finally {
            setLoadingEditSubjects(false);
        }
    };

    const getTopicsForSubject = (subjectId: string, subjectsArray?: any[]) => {
        // First try to get topics from the subject object directly (populated from backend)
        if (subjectsArray && subjectsArray.length > 0) {
            const subject = subjectsArray.find(s => s._id === subjectId);
            if (subject && subject.topics) {
                return subject.topics;
            }
        }
        // Fallback to filtering from the global topics array
        return topicsForSubject.filter(topic => topic.subject === subjectId);
    };

    const handleUpdateSubjects = async () => {
        if (!selectedRequest) return;

        try {
            setUpdatingSubjects(true);
            const response = await Put(`/hr-admin/requests/${selectedRequest._id}/subjects`, {
                subjects: selectedSubjectsForEdit
            });

            if (response.success) {
                displayMessage('Subjects updated successfully', 'success');
                setRequests(prev => prev.map(req =>
                    req._id === selectedRequest._id
                        ? { ...req, subjects: availableSubjects.filter(s => selectedSubjectsForEdit.includes(s._id)) }
                        : req
                ));
                setShowEditSubjectsModal(false);
            } else {
                displayMessage(response.message || "Failed to update subjects", "error");
            }
        } catch (error) {
            displayMessage("Failed to update subjects", "error");
        } finally {
            setUpdatingSubjects(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Pending':
                return 'text-amber-700 bg-amber-50 border border-amber-200';
            case 'Complete':
                return 'text-emerald-700 bg-emerald-50 border border-emerald-200';
            case 'Rejected':
                return 'text-red-700 bg-red-50 border border-red-200';
            default:
                return 'text-gray-700 bg-gray-50 border border-gray-200';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'Pending':
                return <BsClock className="w-4 h-4" />;
            case 'Complete':
                return <BsCheckCircle className="w-4 h-4" />;
            case 'Rejected':
                return <BsXCircle className="w-4 h-4" />;
            default:
                return null;
        }
    };

    const getPendingCount = () => {
        return requests.filter(req => req.status === 'Pending').length;
    };

    const getRejectedCount = () => {
        return requests.filter(req => req.status === 'Rejected').length;
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    return (
        <>
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 md:p-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 md:mb-8 gap-4">
                    <div className="flex items-center space-x-3 md:space-x-4">
                        <div className="p-2 md:p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-md">
                            <BsList className="w-5 h-5 md:w-6 md:h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-lg md:text-2xl font-bold text-gray-900">Employee Requests</h2>
                            <p className="text-xs md:text-sm text-gray-600 mt-1">Monitor and manage team join requests</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2 sm:space-x-3 flex-wrap">
                        {getPendingCount() > 0 && (
                            <div className="px-3 py-1.5 md:px-4 md:py-2 bg-amber-100 text-amber-800 rounded-full text-xs md:text-sm font-semibold border border-amber-200">
                                {getPendingCount()} Pending
                            </div>
                        )}
                        {getRejectedCount() > 0 && (
                            <div className="px-3 py-1.5 md:px-4 md:py-2 bg-red-100 text-red-800 rounded-full text-xs md:text-sm font-semibold border border-red-200">
                                {getRejectedCount()} Rejected
                            </div>
                        )}
                    </div>
                </div>

                {/* Requests List */}
                <div className="max-h-[500px] overflow-y-auto space-y-4">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="flex items-center space-x-3">
                                <div className="animate-spin rounded-full h-8 w-8 border-3 border-blue-600 border-t-transparent"></div>
                                <span className="text-gray-600 font-medium">Loading requests...</span>
                            </div>
                        </div>
                    ) : requests.filter((request) => request.status !== 'Complete').length === 0 ? (
                        <div className="text-center py-12">
                            <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                                <BsPersonFill className="w-10 h-10 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-600 mb-2">No Employee Requests</h3>
                            <p className="text-sm text-gray-500 max-w-sm mx-auto">
                                When employees request to join your team, they will appear here for your review
                            </p>
                        </div>
                    ) : (
                        requests
                            .filter((request) => request.status !== 'Complete')
                            .map((request) => (
                                <div
                                    key={request._id}
                                    className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200 p-3 md:p-6"
                                >
                                    {/* Header Section */}
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 md:mb-4 gap-3">
                                        <div className="flex items-center space-x-3 md:space-x-4">
                                            <div className="relative">
                                                <div className="w-10 h-10 md:w-14 md:h-14 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden shadow-md">
                                                    <img
                                                        src={request.employee.auth.image || require("../../../images/settings/profile.png")}
                                                        alt={request.employee.auth.fullName}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                                <div className={`absolute -bottom-1 -right-1 w-3 h-3 md:w-4 md:h-4 rounded-full border-2 border-white flex items-center justify-center ${request.status === 'Pending' ? 'bg-amber-500' :
                                                    request.status === 'Complete' ? 'bg-emerald-500' :
                                                        'bg-red-500'
                                                    }`}>
                                                    {getStatusIcon(request.status)}
                                                </div>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-base md:text-lg font-bold text-gray-900 truncate">
                                                    {request.employee.auth.fullName || request.employee.auth.userName}
                                                </h3>
                                                <p className="text-xs md:text-sm text-gray-600 truncate">{request.employee.auth.email}</p>
                                                <div className="flex items-center space-x-1 text-xs text-gray-500 mt-1">
                                                    <BsTag className="w-3 h-3" />
                                                    <span className="font-mono font-medium">ID: {request.employee.code}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <span className={`px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-xs md:text-sm font-semibold inline-flex items-center space-x-1 md:space-x-2 border ${getStatusColor(request.status)} self-start sm:self-center`}>
                                            {getStatusIcon(request.status)}
                                            <span>{request.status}</span>
                                        </span>
                                    </div>

                                    {/* Middle Section */}
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 md:mb-4 gap-3">
                                        <div className="text-xs md:text-sm text-gray-500">
                                            <span className="font-medium">Requested:</span> {formatDate(request.createdAt)}
                                        </div>
                                        <div className="flex flex-wrap items-center gap-2">
                                            <button
                                                onClick={() => handleShowSubjects(request)}
                                                disabled={loadingViewSubjects}
                                                className="inline-flex items-center space-x-1 px-2 py-1 bg-blue-600 text-white text-xs font-medium rounded hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                                            >
                                                {loadingViewSubjects ? (
                                                    <>
                                                        <div className="animate-spin w-3 h-3 border border-white border-t-transparent rounded-full"></div>
                                                        <span className="hidden sm:inline">Loading...</span>
                                                        <span className="sm:hidden">...</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <BsEye className="w-3 h-3" />
                                                        <span className="hidden sm:inline">View {request.subjects.length}</span>
                                                        <span className="sm:hidden">{request.subjects.length}</span>
                                                    </>
                                                )}
                                            </button>
                                            {request.status === 'Pending' && (
                                                <button
                                                    onClick={() => handleEditSubjects(request)}
                                                    disabled={loadingEditSubjects}
                                                    className="inline-flex items-center space-x-1 px-2 py-1 bg-green-600 text-white text-xs font-medium rounded hover:bg-green-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                                                >
                                                    {loadingEditSubjects ? (
                                                        <>
                                                            <div className="animate-spin w-3 h-3 border border-white border-t-transparent rounded-full"></div>
                                                            <span className="hidden sm:inline">Loading...</span>
                                                            <span className="sm:hidden">...</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <BsPencilSquare className="w-3 h-3" />
                                                            <span className="hidden sm:inline">Edit Subjects</span>
                                                            <span className="sm:hidden">Edit</span>
                                                        </>
                                                    )}
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Actions Section */}
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                        <div className="text-xs text-gray-500 order-2 sm:order-1">
                                            Last updated: {formatDate(request.updatedAt)}
                                        </div>
                                        <div className="flex items-center space-x-2 order-1 sm:order-2">
                                            {request.status === 'Pending' && (
                                                <button
                                                    onClick={() => handleRequestCancelAction(request._id)}
                                                    disabled={cancellingRequest === request._id}
                                                    className="inline-flex items-center space-x-2 px-3 py-2 md:px-4 md:py-2 bg-red-600 text-white text-xs md:text-sm font-semibold rounded-lg hover:bg-red-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md w-full sm:w-auto justify-center"
                                                >
                                                    {cancellingRequest === request._id ? (
                                                        <>
                                                            <div className="animate-spin w-3 h-3 md:w-4 md:h-4 border-2 border-white border-t-transparent rounded-full"></div>
                                                            <span className="hidden sm:inline">Cancelling...</span>
                                                            <span className="sm:hidden">Loading...</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <BsX className="w-3 h-3 md:w-4 md:h-4" />
                                                            <span className="hidden sm:inline">Cancel Request</span>
                                                            <span className="sm:hidden">Cancel</span>
                                                        </>
                                                    )}
                                                </button>
                                            )}
                                            {request.status === 'Rejected' && (
                                                <button
                                                    onClick={() => handleRequestDeleteAction(request._id)}
                                                    disabled={deletingRequest === request._id}
                                                    className="inline-flex items-center space-x-2 px-3 py-2 md:px-4 md:py-2 bg-red-600 text-white text-xs md:text-sm font-semibold rounded-lg hover:bg-red-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md w-full sm:w-auto justify-center"
                                                >
                                                    {deletingRequest === request._id ? (
                                                        <>
                                                            <div className="animate-spin w-3 h-3 md:w-4 md:h-4 border-2 border-white border-t-transparent rounded-full"></div>
                                                            <span className="hidden sm:inline">Deleting...</span>
                                                            <span className="sm:hidden">Loading...</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <BsTrash3 className="w-3 h-3 md:w-4 md:h-4" />
                                                            <span className="hidden sm:inline">Delete Request</span>
                                                            <span className="sm:hidden">Delete</span>
                                                        </>
                                                    )}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                    )}
                </div>
            </div>

            {/* Subjects Modal */}
            {showSubjectsModal && selectedRequest && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 md:p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] md:max-h-[80vh] overflow-hidden">
                        <div className="p-4 md:p-6 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg md:text-xl font-bold text-gray-900">Subjects Details</h3>
                                <button
                                    onClick={() => setShowSubjectsModal(false)}
                                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                                >
                                    <BsX className="w-5 h-5 md:w-6 md:h-6" />
                                </button>
                            </div>
                            <p className="text-xs md:text-sm text-gray-600 mt-1">
                                {selectedRequest.employee.auth.fullName} - {selectedRequest.subjects.length} subjects
                            </p>
                        </div>
                        <div className="p-4 md:p-6 max-h-64 overflow-y-auto">
                            <div className="space-y-3">
                                {selectedRequest.subjects.map((subject: any, index: number) => {
                                    const topics = subject.topics || [];
                                    return (
                                        <div
                                            key={index}
                                            className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                                        >
                                            <div className="flex items-start space-x-3">
                                                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                                    <BsPlus className="w-5 h-5 text-blue-600" />
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="font-semibold text-gray-900">{subject.name || 'Subject Name'}</h4>
                                                    {topics.length > 0 ? (
                                                        <div className="mt-1">
                                                            <p className="text-xs text-gray-500 mb-1">Topics:</p>
                                                            <div className="flex flex-wrap gap-1">
                                                                {topics.slice(0, 3).map((topic: any, idx: number) => (
                                                                    <span
                                                                        key={idx}
                                                                        className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded"
                                                                    >
                                                                        {topic.name}
                                                                    </span>
                                                                ))}
                                                                {topics.length > 3 && (
                                                                    <span className="px-2 py-1 bg-gray-200 text-gray-600 text-xs rounded">
                                                                        +{topics.length - 3} more
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <p className="text-xs text-gray-500 mt-1">No topics available</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                                {selectedRequest.subjects.length === 0 && (
                                    <div className="text-center py-8">
                                        <BsList className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                                        <p className="text-gray-500">No subjects available</p>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="p-4 md:p-6 border-t border-gray-200 bg-gray-50">
                            <button
                                onClick={() => setShowSubjectsModal(false)}
                                className="w-full px-4 py-2 md:py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Subjects Modal */}
            {showEditSubjectsModal && selectedRequest && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 md:p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] md:max-h-[80vh] overflow-hidden">
                        <div className="p-4 md:p-6 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg md:text-xl font-bold text-gray-900">Edit Subject Assignment</h3>
                                <button
                                    onClick={() => setShowEditSubjectsModal(false)}
                                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                                >
                                    <BsX className="w-5 h-5 md:w-6 md:h-6" />
                                </button>
                            </div>
                            <p className="text-xs md:text-sm text-gray-600 mt-1">
                                {selectedRequest.employee.auth.fullName} - Select subjects to assign
                            </p>
                        </div>
                        <div className="p-4 md:p-6 max-h-64 overflow-y-auto">
                            <div className="grid grid-cols-1 gap-3">
                                {availableSubjects.map((subject: any) => {
                                    const topics = subject.topics || getTopicsForSubject(subject._id, availableSubjects);
                                    return (
                                        <label
                                            key={subject._id}
                                            className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={selectedSubjectsForEdit.includes(subject._id)}
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                                    if (e.target.checked) {
                                                        setSelectedSubjectsForEdit(prev => [...prev, subject._id]);
                                                    } else {
                                                        setSelectedSubjectsForEdit(prev => prev.filter(id => id !== subject._id));
                                                    }
                                                }}
                                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-1"
                                            />
                                            <div className="flex-1">
                                                <div className="font-medium text-gray-900">{subject.name}</div>
                                                {topics.length > 0 ? (
                                                    <div className="mt-1">
                                                        <div className="text-xs text-gray-500 mb-1">Topics: {topics.length} available</div>
                                                        <div className="flex flex-wrap gap-1">
                                                            {topics.slice(0, 2).map((topic: any, idx: number) => (
                                                                <span
                                                                    key={idx}
                                                                    className="px-1.5 py-0.5 bg-blue-100 text-blue-700 text-xs rounded"
                                                                >
                                                                    {topic.name}
                                                                </span>
                                                            ))}
                                                            {topics.length > 2 && (
                                                                <span className="text-xs text-gray-400">
                                                                    +{topics.length - 2} more
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="text-xs text-gray-400 mt-1">No topics available</div>
                                                )}
                                            </div>
                                        </label>
                                    );
                                })}
                                {availableSubjects.length === 0 && (
                                    <div className="text-center py-8">
                                        <BsList className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                                        <p className="text-gray-500">No subjects available</p>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="p-4 md:p-6 border-t border-gray-200 bg-gray-50 flex flex-col sm:flex-row items-center justify-end space-y-2 sm:space-y-0 sm:space-x-3">
                            <button
                                onClick={() => setShowEditSubjectsModal(false)}
                                className="w-full sm:w-auto px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleUpdateSubjects}
                                disabled={updatingSubjects}
                                className="w-full sm:w-auto px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {updatingSubjects ? 'Updating...' : 'Update Subjects'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Cancel Confirmation Modal */}
            {showCancelConfirmModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 md:p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
                        <div className="p-4 md:p-6 border-b border-gray-200">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 md:w-12 md:h-12 bg-red-100 rounded-full flex items-center justify-center">
                                    <BsX className="w-5 h-5 md:w-6 md:h-6 text-red-600" />
                                </div>
                                <div>
                                    <h3 className="text-lg md:text-xl font-bold text-gray-900">Cancel Request</h3>
                                    <p className="text-xs md:text-sm text-gray-600 mt-1">This action cannot be undone</p>
                                </div>
                            </div>
                        </div>
                        <div className="p-4 md:p-6">
                            <p className="text-sm md:text-base text-gray-700 mb-4">
                                Are you sure you want to cancel this pending request? The employee will be notified and this request will be removed from the system.
                            </p>
                        </div>
                        <div className="p-4 md:p-6 border-t border-gray-200 bg-gray-50 flex flex-col sm:flex-row items-center justify-end space-y-2 sm:space-y-0 sm:space-x-3">
                            <button
                                onClick={() => {
                                    setShowCancelConfirmModal(false);
                                    setRequestToCancel(null);
                                }}
                                className="w-full sm:w-auto px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCancelRequest}
                                disabled={!!cancellingRequest}
                                className="w-full sm:w-auto px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {cancellingRequest ? 'Cancelling...' : 'Yes, Cancel Request'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteConfirmModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 md:p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
                        <div className="p-4 md:p-6 border-b border-gray-200">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 md:w-12 md:h-12 bg-red-100 rounded-full flex items-center justify-center">
                                    <BsTrash3 className="w-5 h-5 md:w-6 md:h-6 text-red-600" />
                                </div>
                                <div>
                                    <h3 className="text-lg md:text-xl font-bold text-gray-900">Delete Request</h3>
                                    <p className="text-xs md:text-sm text-gray-600 mt-1">This action cannot be undone</p>
                                </div>
                            </div>
                        </div>
                        <div className="p-4 md:p-6">
                            <p className="text-sm md:text-base text-gray-700 mb-4">
                                Are you sure you want to permanently delete this rejected request? This action will permanently remove the request from the system.
                            </p>
                        </div>
                        <div className="p-4 md:p-6 border-t border-gray-200 bg-gray-50 flex flex-col sm:flex-row items-center justify-end space-y-2 sm:space-y-0 sm:space-x-3">
                            <button
                                onClick={() => {
                                    setShowDeleteConfirmModal(false);
                                    setRequestToDelete(null);
                                }}
                                className="w-full sm:w-auto px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteRequest}
                                disabled={!!deletingRequest}
                                className="w-full sm:w-auto px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {deletingRequest ? 'Deleting...' : 'Yes, Delete Request'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default RequestManagement;
