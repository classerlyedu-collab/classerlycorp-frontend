import { useEffect, useState } from "react";
import { Get, Delete } from "../../../config/apiMethods";
import { displayMessage } from "../../../config";

interface Criterion {
    criterion: string;
    weight: number;
    maxScore: number;
    description?: string;
}

interface Rubric {
    _id: string;
    title: string;
    description: string;
    criteria: Criterion[];
    createdBy: {
        fullName: string;
        email: string;
    };
    createdAt: string;
}

interface RubricListProps {
    refreshTrigger: number;
    onEdit: (rubric: Rubric) => void;
    onRefresh: () => void;
}

const RubricList: React.FC<RubricListProps> = ({ refreshTrigger, onEdit, onRefresh }) => {
    const [rubrics, setRubrics] = useState<Rubric[]>([]);
    const [loading, setLoading] = useState(false);
    const [expandedRubric, setExpandedRubric] = useState<string | null>(null);
    const [searchText, setSearchText] = useState("");
    const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; id: string; title: string } | null>(null);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        fetchRubrics();
    }, [refreshTrigger]);

    const fetchRubrics = async () => {
        setLoading(true);
        try {
            const response: any = await Get("/rubric", "");
            if (response.success) {
                setRubrics(response.data || []);
            }
        } catch (error: any) {
            displayMessage(error?.response?.data?.message || "Failed to fetch rubrics", "error");
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
            const response: any = await Delete("/rubric", deleteConfirm.id);
            if (response.success) {
                displayMessage("Rubric deleted successfully", "success");
                onRefresh();
            }
        } catch (error: any) {
            displayMessage(error?.response?.data?.message || "Failed to delete rubric", "error");
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

    const toggleExpand = (id: string) => {
        setExpandedRubric(expandedRubric === id ? null : id);
    };

    const filteredRubrics = rubrics.filter(rubric =>
        rubric.title.toLowerCase().includes(searchText.toLowerCase()) ||
        rubric.description.toLowerCase().includes(searchText.toLowerCase())
    );

    // Skeleton Loading Component
    const SkeletonLoader = () => (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200">
                <div className="animate-pulse">
                    <div className="h-10 bg-gray-200 rounded-lg w-full"></div>
                </div>
            </div>
            <div className="divide-y divide-gray-200">
                {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="p-4">
                        <div className="flex items-start gap-4 animate-pulse">
                            <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                            <div className="flex-1 space-y-2">
                                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
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
            {/* Search Bar */}
            <div className="p-4 border-b border-gray-200">
                <div className="relative">
                    <input
                        type="text"
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        placeholder="Search rubrics by title or description..."
                        className="w-full px-4 py-2.5 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <svg className="w-5 h-5 absolute left-3 top-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
            </div>

            {/* Rubrics List */}
            {filteredRubrics.length === 0 ? (
                <div className="text-center py-16 px-4">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">No rubrics found</h3>
                    <p className="text-sm text-gray-500">
                        {searchText ? "Try adjusting your search criteria" : "Click 'Create New Rubric' to get started"}
                    </p>
                </div>
            ) : (
                <div className="divide-y divide-gray-200">
                    {filteredRubrics.map((rubric) => (
                        <div key={rubric._id} className="p-4 hover:bg-gray-50 transition-colors">
                            <div className="flex items-start justify-between gap-4">
                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-sm flex-shrink-0">
                                            {rubric.title.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-base font-semibold text-gray-900 truncate">{rubric.title}</h4>
                                            <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                                                <span className="flex items-center gap-1">
                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                                    </svg>
                                                    {rubric.criteria.length} criteria
                                                </span>
                                                <span>•</span>
                                                <span className="flex items-center gap-1">
                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                    </svg>
                                                    {rubric.createdBy?.fullName || "Unknown"}
                                                </span>
                                                <span>•</span>
                                                <span>{new Date(rubric.createdAt).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* View Details Button */}
                                    <button
                                        onClick={() => toggleExpand(rubric._id)}
                                        className="text-xs text-blue-600 hover:text-blue-700 font-medium mt-2"
                                    >
                                        {expandedRubric === rubric._id ? "Hide Details" : "View Details"}
                                    </button>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-2 flex-shrink-0">
                                    <button
                                        onClick={() => onEdit(rubric)}
                                        className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs font-medium flex items-center gap-1"
                                    >
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(rubric._id, rubric.title)}
                                        className="px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-xs font-medium flex items-center gap-1"
                                    >
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                        Delete
                                    </button>
                                </div>
                            </div>

                            {/* Expanded Details - Full Width */}
                            {expandedRubric === rubric._id && (
                                <div className="mt-3 space-y-3">
                                    <div
                                        className="text-sm text-gray-600 prose prose-sm max-w-none"
                                        dangerouslySetInnerHTML={{ __html: rubric.description }}
                                    />
                                    <div className="space-y-2">
                                        <p className="text-xs font-semibold text-gray-700 uppercase">Criteria:</p>
                                        {rubric.criteria.map((criterion, index) => (
                                            <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                                                <div className="flex justify-between items-start gap-3">
                                                    <div className="flex-1">
                                                        <p className="text-sm font-medium text-gray-900">{criterion.criterion}</p>
                                                        {criterion.description && (
                                                            <p className="text-xs text-gray-600 mt-1">{criterion.description}</p>
                                                        )}
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-bold whitespace-nowrap">
                                                            {criterion.weight}%
                                                        </span>
                                                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-bold whitespace-nowrap">
                                                            {criterion.maxScore} pts
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
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
                                    <h2 className="text-xl font-semibold text-gray-900">Delete Rubric</h2>
                                    <p className="text-gray-600 text-sm">This action cannot be undone</p>
                                </div>
                            </div>
                        </div>

                        {/* Body */}
                        <div className="p-6">
                            <div className="text-gray-700">
                                <p className="mb-2">Are you sure you want to delete this rubric?</p>
                                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                                    <p className="font-medium text-red-800">
                                        {deleteConfirm.title}
                                    </p>
                                    <p className="text-red-600 text-sm">
                                        All data associated with this rubric will be permanently removed
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
                                        Delete Rubric
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

export default RubricList;
