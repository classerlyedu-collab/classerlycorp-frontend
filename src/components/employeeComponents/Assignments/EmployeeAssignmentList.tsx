import { useEffect, useState } from "react";
import { Get } from "../../../config/apiMethods";
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

const EmployeeAssignmentList: React.FC = () => {
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [loading, setLoading] = useState(false);
    const [filter, setFilter] = useState<string>("all");
    const [searchText, setSearchText] = useState("");
    const [expandedAssignment, setExpandedAssignment] = useState<string | null>(null);

    useEffect(() => {
        fetchAssignments();
    }, []);

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

    const isOverdue = (deadline: string) => {
        return new Date(deadline) < new Date();
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

    const toggleExpand = (id: string) => {
        setExpandedAssignment(expandedAssignment === id ? null : id);
    };

    const filteredAssignments = assignments
        .filter(assignment => {
            const matchesFilter =
                filter === "all" ||
                (filter === "upcoming" && !isOverdue(assignment.deadline)) ||
                (filter === "overdue" && isOverdue(assignment.deadline));

            const matchesSearch =
                assignment.title.toLowerCase().includes(searchText.toLowerCase()) ||
                assignment.description.toLowerCase().includes(searchText.toLowerCase()) ||
                assignment.subject?.name?.toLowerCase().includes(searchText.toLowerCase());

            return matchesFilter && matchesSearch;
        });

    // Skeleton Loading
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
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="p-4">
                        <div className="flex items-start gap-4 animate-pulse">
                            <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                            <div className="flex-1 space-y-2">
                                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                <div className="h-3 bg-gray-200 rounded w-full"></div>
                                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
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
            {/* Search and Filter */}
            <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <input
                        type="text"
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        placeholder="Search assignments..."
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
                    <option value="all">All Assignments</option>
                    <option value="upcoming">Upcoming</option>
                    <option value="overdue">Overdue</option>
                </select>
            </div>

            {/* List */}
            {filteredAssignments.length === 0 ? (
                <div className="text-center py-16 px-4">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">No assignments found</h3>
                    <p className="text-sm text-gray-500">
                        {searchText || filter !== "all" ? "Try adjusting your search or filter" : "Your instructor will create assignments for you"}
                    </p>
                </div>
            ) : (
                <div className="divide-y divide-gray-200">
                    {filteredAssignments.map((assignment) => {
                        const overdueStatus = isOverdue(assignment.deadline);

                        return (
                            <div key={assignment._id} className="p-4 hover:bg-gray-50 transition-colors">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-sm flex-shrink-0">
                                                {assignment.title.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap mb-1">
                                                    <h4 className="text-base font-semibold text-gray-900">{assignment.title}</h4>
                                                    {overdueStatus && (
                                                        <span className="px-2 py-1 text-xs font-bold rounded bg-red-100 text-red-700 animate-pulse">
                                                            Overdue
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-3 text-xs text-gray-500 flex-wrap">
                                                    <span className={`flex items-center gap-1 ${overdueStatus ? 'text-red-600 font-medium' : ''}`}>
                                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                        </svg>
                                                        Due: {new Date(assignment.deadline).toLocaleDateString()} at {new Date(assignment.deadline).toLocaleTimeString()}
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
                                                                Has Rubric
                                                            </span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* View Details Button */}
                                        <button
                                            onClick={() => toggleExpand(assignment._id)}
                                            className="text-xs text-blue-600 hover:text-blue-700 font-medium mt-2"
                                        >
                                            {expandedAssignment === assignment._id ? "Hide Details" : "View Details"}
                                        </button>

                                        {/* Expanded Details */}
                                        {expandedAssignment === assignment._id && (
                                            <div className="mt-3 space-y-3">
                                                <div
                                                    className="text-sm text-gray-700 prose prose-sm max-w-none"
                                                    dangerouslySetInnerHTML={{ __html: assignment.description }}
                                                />
                                                {assignment.attachedRubric && (
                                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                                        <p className="text-xs font-semibold text-blue-800 mb-1">Grading Rubric</p>
                                                        <p className="text-sm text-blue-700 font-medium">{assignment.attachedRubric.title}</p>
                                                        <p className="text-xs text-blue-600 mt-1">View rubrics page to see grading criteria</p>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* Status Badge */}
                                    <div className="flex-shrink-0">
                                        {overdueStatus ? (
                                            <div className="flex items-center gap-2 px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-xs font-bold">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                Overdue
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2 px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-xs font-bold">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                Active
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default EmployeeAssignmentList;

