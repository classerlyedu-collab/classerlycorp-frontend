import { useEffect, useState } from "react";
import { Get, Delete } from "../../../config/apiMethods";
import { displayMessage } from "../../../config";

interface Assignment {
    _id: string;
    title: string;
    description: string;
    deadline: string;
    attachedRubric?: {
        _id: string;
        title: string;
    };
    subject?: {
        _id: string;
        name: string;
    };
    status: string;
    createdBy: {
        fullName: string;
        email: string;
    };
    createdAt: string;
}

interface AssignmentListProps {
    refreshTrigger: number;
    onEdit: (assignment: Assignment) => void;
    onRefresh: () => void;
    onViewSubmissions: (assignmentId: string, assignmentTitle: string) => void;
}

const AssignmentList: React.FC<AssignmentListProps> = ({ refreshTrigger, onEdit, onRefresh, onViewSubmissions }) => {
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [loading, setLoading] = useState(false);
    const [filter, setFilter] = useState<string>("all");
    const [searchText, setSearchText] = useState("");
    const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; id: string; title: string } | null>(null);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        fetchAssignments();
    }, [refreshTrigger]);

    const fetchAssignments = async () => {
        setLoading(true);
        try {
            const response: any = await Get("/assignment", "");
            if (response.success) {
                setAssignments(response.data || []);
            }
        } catch (error: any) {
            displayMessage(error?.response?.data?.message || "Failed to fetch assignments", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = (id: string, title: string) => {
        setDeleteConfirm({ show: true, id, title });
    };

    const confirmDelete = async () => {
        if (!deleteConfirm || deleting) return;

        setDeleting(true);
        try {
            const response: any = await Delete("/assignment", deleteConfirm.id);
            if (response.success) {
                displayMessage("Assignment deleted successfully", "success");
                onRefresh();
            }
        } catch (error: any) {
            displayMessage(error?.response?.data?.message || "Failed to delete assignment", "error");
        } finally {
            setDeleting(false);
            setDeleteConfirm(null);
        }
    };

    const cancelDelete = () => {
        if (!deleting) {
            setDeleteConfirm(null);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "published":
                return "bg-green-100 text-green-700";
            case "draft":
                return "bg-yellow-100 text-yellow-700";
            case "archived":
                return "bg-gray-100 text-gray-700";
            default:
                return "bg-blue-100 text-blue-700";
        }
    };

    const isOverdue = (deadline: string) => {
        return new Date(deadline) < new Date();
    };

    const filteredAssignments = assignments
        .filter(assignment => {
            const matchesFilter =
                filter === "all" ||
                (filter === "upcoming" && !isOverdue(assignment.deadline) && assignment.status === "published") ||
                (filter === "overdue" && isOverdue(assignment.deadline) && assignment.status === "published") ||
                assignment.status === filter;

            const matchesSearch =
                assignment.title.toLowerCase().includes(searchText.toLowerCase()) ||
                assignment.description.toLowerCase().includes(searchText.toLowerCase()) ||
                assignment.subject?.name?.toLowerCase().includes(searchText.toLowerCase());

            return matchesFilter && matchesSearch;
        });

    // Skeleton Loading Component
    const SkeletonLoader = () => (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200 flex gap-3">
                <div className="animate-pulse flex-1">
                    <div className="h-10 bg-gray-200 rounded-lg w-full"></div>
                </div>
                <div className="animate-pulse">
                    <div className="h-10 w-32 bg-gray-200 rounded-lg"></div>
                </div>
            </div>
            <div className="divide-y divide-gray-200">
                {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="p-4">
                        <div className="flex items-start gap-4 animate-pulse">
                            <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                            <div className="flex-1 space-y-2">
                                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                <div className="h-3 bg-gray-200 rounded w-full"></div>
                                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                            </div>
                            <div className="flex gap-2">
                                <div className="w-16 h-8 bg-gray-200 rounded-lg"></div>
                                <div className="w-16 h-8 bg-gray-200 rounded-lg"></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    if (loading) {
        return <SkeletonLoader />;
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            {/* Search and Filter Bar */}
            <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <input
                        type="text"
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        placeholder="Search assignments by title, description or subject..."
                        className="w-full px-4 py-2.5 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <svg className="w-5 h-5 absolute left-3 top-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>

                <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                    <option value="all">All</option>
                    <option value="upcoming">Upcoming</option>
                    <option value="overdue">Overdue</option>
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                    <option value="archived">Archived</option>
                </select>
            </div>

            {/* Assignments List */}
            {filteredAssignments.length === 0 ? (
                <div className="text-center py-16 px-4">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">No assignments found</h3>
                    <p className="text-sm text-gray-500">
                        {searchText || filter !== "all"
                            ? "Try adjusting your search or filter"
                            : "Click 'Create New Assignment' to get started"}
                    </p>
                </div>
            ) : (
                <div className="divide-y divide-gray-200">
                    {filteredAssignments.map((assignment) => {
                        const overdueStatus = isOverdue(assignment.deadline);

                        return (
                            <div key={assignment._id} className="p-4 hover:bg-gray-50 transition-colors">
                                <div className="flex items-start justify-between gap-4">
                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-sm flex-shrink-0">
                                                {assignment.title.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <h4 className="text-base font-semibold text-gray-900">{assignment.title}</h4>
                                                    <span className={`px-2 py-1 text-xs font-bold rounded ${getStatusColor(assignment.status)}`}>
                                                        {assignment.status}
                                                    </span>
                                                    {overdueStatus && assignment.status === "published" && (
                                                        <span className="px-2 py-1 text-xs font-bold rounded bg-red-100 text-red-700">
                                                            Overdue
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-3 text-xs text-gray-500 mt-1 flex-wrap">
                                                    <span className="flex items-center gap-1">
                                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                        </svg>
                                                        Due: {new Date(assignment.deadline).toLocaleDateString()}
                                                    </span>
                                                    {assignment.subject && (
                                                        <>
                                                            <span>•</span>
                                                            <span>{assignment.subject.name}</span>
                                                        </>
                                                    )}
                                                    {assignment.attachedRubric && (
                                                        <>
                                                            <span>•</span>
                                                            <span className="flex items-center gap-1">
                                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                                                </svg>
                                                                {assignment.attachedRubric.title}
                                                            </span>
                                                        </>
                                                    )}
                                                    <span>•</span>
                                                    <span>{assignment.createdBy?.fullName || "Unknown"}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex gap-2 flex-shrink-0">
                                        <button
                                            onClick={() => onViewSubmissions(assignment._id, assignment.title)}
                                            className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-xs font-medium flex items-center gap-1"
                                        >
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                            Submissions
                                        </button>
                                        <button
                                            onClick={() => onEdit(assignment)}
                                            className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs font-medium flex items-center gap-1"
                                        >
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(assignment._id, assignment.title)}
                                            className="px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-xs font-medium flex items-center gap-1"
                                        >
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteConfirm && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-gray-200">
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-200">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                                    <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </div>
                                <div>
                                    <h2 className="text-xl font-semibold text-gray-900">Delete Assignment</h2>
                                    <p className="text-gray-600 text-sm">This action cannot be undone</p>
                                </div>
                            </div>
                        </div>

                        {/* Body */}
                        <div className="p-6">
                            <div className="text-gray-700">
                                <p className="mb-2">Are you sure you want to delete this assignment?</p>
                                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                                    <p className="font-medium text-red-800">
                                        {deleteConfirm.title}
                                    </p>
                                    <p className="text-red-600 text-sm">
                                        All data associated with this assignment will be permanently removed
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
                            <button
                                onClick={cancelDelete}
                                disabled={deleting}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                disabled={deleting}
                                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                            >
                                {deleting ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                        Deleting...
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                        Delete Assignment
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AssignmentList;
