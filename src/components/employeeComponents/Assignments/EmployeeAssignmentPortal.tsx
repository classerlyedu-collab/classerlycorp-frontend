import { useEffect, useState } from "react";
import { Get, Post } from "../../../config/apiMethods";
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
}

interface Assignment {
    _id: string;
    title: string;
    description: string;
    deadline: string;
    attachedRubric?: Rubric;
    subject?: {
        _id: string;
        name: string;
    };
    createdBy: {
        fullName: string;
        email: string;
    };
    createdAt: string;
}

interface Submission {
    _id: string;
    assignment: string | { _id: string; title: string };
    fileUrl: string;
    fileName: string;
    submittedAt: string;
    status: string;
    grade?: {
        score: number;
        maxScore: number;
        percentage: number;
        feedback: string;
        gradedBy: { fullName: string };
        gradedAt: string;
    };
}

const EmployeeAssignmentPortal: React.FC = () => {
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [submissions, setSubmissions] = useState<{ [key: string]: Submission }>({});
    const [loading, setLoading] = useState(false);
    const [filter, setFilter] = useState<string>("all");
    const [searchText, setSearchText] = useState("");
    const [expandedAssignment, setExpandedAssignment] = useState<string | null>(null);
    const [uploadingFor, setUploadingFor] = useState<string | null>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch assignments
            const assignmentsResponse: any = await Get("/assignment", "");
            if (assignmentsResponse.success) {
                setAssignments(assignmentsResponse.data || []);
            }

            // Fetch my submissions
            const submissionsResponse: any = await Get("/submission/my-submissions", "");
            if (submissionsResponse.success) {
                const subMap: { [key: string]: Submission } = {};
                (submissionsResponse.data || []).forEach((sub: Submission) => {
                    // Handle both populated and unpopulated assignment field
                    const assignmentId = typeof sub.assignment === 'string'
                        ? sub.assignment
                        : sub.assignment._id;
                    subMap[assignmentId] = sub;
                });
                setSubmissions(subMap);
            }
        } catch (error: any) {
            displayMessage(error?.response?.data?.message || "Failed to fetch data", "error");
        } finally {
            setLoading(false);
        }
    };

    const isOverdue = (deadline: string) => {
        return new Date(deadline) < new Date();
    };

    const handleFileUpload = async (assignmentId: string, file: File) => {
        // Check if file is .docx
        if (!file.name.endsWith('.docx')) {
            displayMessage("Only .docx files are allowed", "error");
            return;
        }

        if (file.size > 10 * 1024 * 1024) {
            displayMessage("File size must be less than 10MB", "error");
            return;
        }

        setUploadingFor(assignmentId);
        try {
            // Upload file first using document upload endpoint
            const formData = new FormData();
            formData.append('file', file);

            const uploadResponse: any = await Post('/uploaddocument', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (!uploadResponse.success || !uploadResponse.file) {
                throw new Error("File upload failed");
            }

            // Submit assignment with file metadata including publicId and resourceType for future deletion
            const submissionData = {
                assignmentId,
                fileUrl: uploadResponse.file,
                fileName: file.name,
                fileMetadata: {
                    publicId: uploadResponse.public_id,
                    resourceType: uploadResponse.resource_type || 'raw',
                    size: file.size,
                    uploadedAt: new Date(),
                }
            };

            const submitResponse: any = await Post('/submission/submit', submissionData);

            if (submitResponse.success) {
                displayMessage("Assignment submitted successfully", "success");
                fetchData(); // Refresh data
            }
        } catch (error: any) {
            displayMessage(error?.response?.data?.message || "Failed to submit assignment", "error");
        } finally {
            setUploadingFor(null);
        }
    };

    // Helper function to view document in new tab
    const viewDocument = (fileUrl: string, fileName: string) => {
        // For .docx files, use Google Docs Viewer
        const viewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(fileUrl)}&embedded=true`;
        window.open(viewerUrl, '_blank');
    };

    const toggleExpand = (id: string) => {
        setExpandedAssignment(expandedAssignment === id ? null : id);
    };

    const filteredAssignments = assignments.filter(assignment => {
        const matchesFilter =
            filter === "all" ||
            (filter === "pending" && !submissions[assignment._id]) ||
            (filter === "submitted" && submissions[assignment._id] && submissions[assignment._id].status === "submitted") ||
            (filter === "graded" && submissions[assignment._id]?.grade);

        const matchesSearch =
            assignment.title.toLowerCase().includes(searchText.toLowerCase()) ||
            assignment.subject?.name?.toLowerCase().includes(searchText.toLowerCase());

        return matchesFilter && matchesSearch;
    });

    // Skeleton Loading
    const SkeletonLoader = () => (
        <div className="space-y-4">
            {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-2xl border-2 border-gray-200 p-6">
                    <div className="animate-pulse space-y-4">
                        <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        <div className="h-20 bg-gray-200 rounded"></div>
                    </div>
                </div>
            ))}
        </div>
    );

    if (loading) {
        return <SkeletonLoader />;
    }

    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold text-blue-600 uppercase">Total</p>
                            <p className="text-2xl font-bold text-blue-900">{assignments.length}</p>
                        </div>
                        <div className="w-12 h-12 bg-blue-200 rounded-full flex items-center justify-center">
                            <svg className="w-6 h-6 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-2 border-yellow-200 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold text-yellow-600 uppercase">Pending</p>
                            <p className="text-2xl font-bold text-yellow-900">
                                {assignments.filter(a => !submissions[a._id]).length}
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-yellow-200 rounded-full flex items-center justify-center">
                            <svg className="w-6 h-6 text-yellow-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold text-green-600 uppercase">Submitted</p>
                            <p className="text-2xl font-bold text-green-900">
                                {Object.keys(submissions).length}
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-green-200 rounded-full flex items-center justify-center">
                            <svg className="w-6 h-6 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold text-purple-600 uppercase">Graded</p>
                            <p className="text-2xl font-bold text-purple-900">
                                {Object.values(submissions).filter(s => s.grade).length}
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-purple-200 rounded-full flex items-center justify-center">
                            <svg className="w-6 h-6 text-purple-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <input
                        type="text"
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        placeholder="Search assignments..."
                        className="w-full px-4 py-3 pl-11 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    />
                    <svg className="w-5 h-5 absolute left-3 top-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>

                <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="px-4 py-3 border-2 border-gray-300 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                    <option value="all">All Assignments</option>
                    <option value="pending">Pending Submission</option>
                    <option value="submitted">Submitted</option>
                    <option value="graded">Graded</option>
                </select>
            </div>

            {/* Assignments List */}
            {filteredAssignments.length === 0 ? (
                <div className="bg-white rounded-2xl border-2 border-gray-200 p-12 text-center">
                    <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                        <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-700 mb-2">No Assignments Found</h3>
                    <p className="text-gray-500">
                        {searchText || filter !== "all" ? "Try adjusting your search or filter" : "Your instructor will post assignments here"}
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredAssignments.map((assignment) => {
                        const submission = submissions[assignment._id];
                        const overdueStatus = isOverdue(assignment.deadline);
                        const canSubmit = !overdueStatus;

                        return (
                            <div key={assignment._id} className="bg-white rounded-2xl border-2 border-gray-200 shadow-sm hover:shadow-lg transition-all overflow-hidden">
                                {/* Header */}
                                <div className="bg-gradient-to-r from-slate-50 to-blue-50 p-6 border-b-2 border-gray-200">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                                                    {assignment.title.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className="text-xl font-bold text-gray-900 mb-1">{assignment.title}</h3>
                                                    {assignment.subject && (
                                                        <p className="text-sm text-gray-600 font-medium">{assignment.subject.name}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Status Badge */}
                                        <div>
                                            {submission?.grade ? (
                                                <div className="bg-gradient-to-br from-purple-100 to-purple-200 border-2 border-purple-300 px-4 py-2 rounded-xl">
                                                    <p className="text-xs font-bold text-purple-700 uppercase">Graded</p>
                                                    <p className="text-2xl font-bold text-purple-900">{submission.grade.score}/{submission.grade.maxScore}</p>
                                                    <p className="text-xs font-semibold text-purple-700">{submission.grade.percentage}%</p>
                                                </div>
                                            ) : submission ? (
                                                <div className="bg-gradient-to-br from-green-100 to-green-200 border-2 border-green-300 px-4 py-3 rounded-xl text-center">
                                                    <p className="text-xs font-bold text-green-700 uppercase mb-1">Submitted</p>
                                                    <svg className="w-8 h-8 text-green-600 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                </div>
                                            ) : overdueStatus ? (
                                                <div className="bg-gradient-to-br from-red-100 to-red-200 border-2 border-red-300 px-4 py-3 rounded-xl text-center">
                                                    <p className="text-xs font-bold text-red-700 uppercase mb-1">Overdue</p>
                                                    <svg className="w-8 h-8 text-red-600 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                </div>
                                            ) : (
                                                <div className="bg-gradient-to-br from-yellow-100 to-yellow-200 border-2 border-yellow-300 px-4 py-3 rounded-xl text-center">
                                                    <p className="text-xs font-bold text-yellow-700 uppercase mb-1">Pending</p>
                                                    <svg className="w-8 h-8 text-yellow-600 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Deadline Info */}
                                    <div className="mt-4 flex items-center gap-6 text-sm">
                                        <div className="flex items-center gap-2">
                                            <svg className={`w-5 h-5 ${overdueStatus ? 'text-red-600' : 'text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            <span className={`font-semibold ${overdueStatus ? 'text-red-700' : 'text-gray-700'}`}>
                                                Due: {new Date(assignment.deadline).toLocaleString()}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                            <span className="font-medium text-gray-700">By: {assignment.createdBy.fullName}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Body */}
                                <div className="p-6">
                                    {/* Description */}
                                    <div
                                        className="prose prose-sm max-w-none text-gray-700 mb-4"
                                        dangerouslySetInnerHTML={{ __html: assignment.description }}
                                    />

                                    {/* View Details Button */}
                                    <button
                                        onClick={() => toggleExpand(assignment._id)}
                                        className="text-sm text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-2 mb-4"
                                    >
                                        {expandedAssignment === assignment._id ? (
                                            <>
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                                </svg>
                                                Hide Rubric & Details
                                            </>
                                        ) : (
                                            <>
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                </svg>
                                                View Grading Rubric & Details
                                            </>
                                        )}
                                    </button>

                                    {/* Expanded: Rubric */}
                                    {expandedAssignment === assignment._id && assignment.attachedRubric && (
                                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-5 mb-4">
                                            <h4 className="text-lg font-bold text-blue-900 mb-3 flex items-center gap-2">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                                                </svg>
                                                Grading Rubric: {assignment.attachedRubric.title}
                                            </h4>
                                            {assignment.attachedRubric.description && (
                                                <div
                                                    className="prose prose-sm max-w-none text-gray-700 mb-4"
                                                    dangerouslySetInnerHTML={{ __html: assignment.attachedRubric.description }}
                                                />
                                            )}
                                            <div className="space-y-3">
                                                {(assignment.attachedRubric.criteria || []).map((criterion, index) => (
                                                    <div key={index} className="bg-white border-2 border-blue-200 rounded-lg p-4">
                                                        <div className="flex justify-between items-start gap-3">
                                                            <div className="flex-1">
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                                                                        {index + 1}
                                                                    </span>
                                                                    <p className="font-bold text-gray-900">{criterion.criterion}</p>
                                                                </div>
                                                                {criterion.description && (
                                                                    <p className="text-sm text-gray-600 ml-8">{criterion.description}</p>
                                                                )}
                                                            </div>
                                                            <div className="flex gap-2">
                                                                <span className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold whitespace-nowrap">
                                                                    {criterion.weight}%
                                                                </span>
                                                                <span className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-bold whitespace-nowrap">
                                                                    {criterion.maxScore} pts
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                                {assignment.attachedRubric.criteria && assignment.attachedRubric.criteria.length > 0 && (
                                                    <div className="bg-blue-600 text-white rounded-lg p-3 text-center">
                                                        <p className="text-sm font-bold">
                                                            Total Possible Score: {assignment.attachedRubric.criteria.reduce((sum, c) => sum + c.maxScore, 0)} points
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Submission Section */}
                                    <div className="border-t-2 border-gray-200 pt-4">
                                        {submission?.grade ? (
                                            // Graded
                                            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 border-2 border-purple-200 rounded-xl p-5">
                                                <h4 className="text-lg font-bold text-purple-900 mb-3">Grade & Feedback</h4>
                                                <div className="grid grid-cols-2 gap-4 mb-4">
                                                    <div>
                                                        <p className="text-sm text-purple-700 font-medium">Score</p>
                                                        <p className="text-3xl font-bold text-purple-900">
                                                            {submission.grade.score}/{submission.grade.maxScore}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-purple-700 font-medium">Percentage</p>
                                                        <p className="text-3xl font-bold text-purple-900">{submission.grade.percentage}%</p>
                                                    </div>
                                                </div>
                                                {submission.grade.feedback && (
                                                    <div className="bg-white border border-purple-200 rounded-lg p-4">
                                                        <p className="text-xs font-bold text-purple-700 uppercase mb-2">Instructor Feedback:</p>
                                                        <p className="text-sm text-gray-700">{submission.grade.feedback}</p>
                                                    </div>
                                                )}
                                                <div className="mt-3 flex items-center gap-2 text-xs text-purple-700">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                    </svg>
                                                    Graded by {submission.grade.gradedBy.fullName} on {new Date(submission.grade.gradedAt).toLocaleString()}
                                                </div>
                                                <div className="mt-3 pt-3 border-t border-purple-200">
                                                    <p className="text-xs text-purple-700 font-medium mb-2">Your Submission:</p>
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => viewDocument(submission.fileUrl, submission.fileName)}
                                                            className="inline-flex items-center gap-2 text-sm text-white bg-blue-600 hover:bg-blue-700 font-medium px-4 py-2 rounded-lg transition-colors"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                            </svg>
                                                            View
                                                        </button>
                                                        <a
                                                            href={submission.fileUrl}
                                                            download
                                                            className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium border border-blue-300 px-4 py-2 rounded-lg bg-white"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                            </svg>
                                                            Download
                                                        </a>
                                                    </div>
                                                    <p className="text-xs text-gray-600 mt-2">{submission.fileName}</p>
                                                </div>
                                            </div>
                                        ) : submission ? (
                                            // Submitted but not graded
                                            <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-5">
                                                <div className="flex items-start gap-3 mb-3">
                                                    <svg className="w-6 h-6 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    <div className="flex-1">
                                                        <p className="text-base font-bold text-green-900 mb-1">Submitted Successfully</p>
                                                        <p className="text-sm text-green-700">Submitted on {new Date(submission.submittedAt).toLocaleString()}</p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2 mb-3">
                                                    <button
                                                        onClick={() => viewDocument(submission.fileUrl, submission.fileName)}
                                                        className="inline-flex items-center gap-2 text-sm text-white bg-blue-600 hover:bg-blue-700 font-medium px-4 py-2 rounded-lg transition-colors"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                        </svg>
                                                        View
                                                    </button>
                                                    <a
                                                        href={submission.fileUrl}
                                                        download
                                                        className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium bg-white border border-green-200 px-4 py-2 rounded-lg"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                        </svg>
                                                        Download
                                                    </a>
                                                </div>
                                                <p className="text-xs text-gray-600 mb-3">{submission.fileName}</p>
                                                {canSubmit && (
                                                    <div className="mt-3 pt-3 border-t border-green-200">
                                                        <p className="text-xs text-green-700 mb-2">You can resubmit before the deadline:</p>
                                                        <label className="inline-block cursor-pointer bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
                                                            <input
                                                                type="file"
                                                                accept=".docx"
                                                                onChange={(e) => {
                                                                    if (e.target.files?.[0]) {
                                                                        handleFileUpload(assignment._id, e.target.files[0]);
                                                                    }
                                                                }}
                                                                className="hidden"
                                                                disabled={uploadingFor === assignment._id}
                                                            />
                                                            {uploadingFor === assignment._id ? "Uploading..." : "Resubmit Assignment"}
                                                        </label>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            // Not submitted
                                            <div className={`rounded-xl p-5 border-2 ${overdueStatus
                                                ? 'bg-red-50 border-red-200'
                                                : 'bg-blue-50 border-blue-200'
                                                }`}>
                                                {overdueStatus ? (
                                                    <div className="text-center py-4">
                                                        <svg className="w-12 h-12 text-red-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                                        </svg>
                                                        <p className="text-lg font-bold text-red-900 mb-1">Submission Closed</p>
                                                        <p className="text-sm text-red-700">The deadline for this assignment has passed</p>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <h4 className="text-base font-bold text-blue-900 mb-3">Submit Your Work</h4>
                                                        <p className="text-sm text-blue-700 mb-4">Upload your assignment file (.docx format only)</p>
                                                        <label className="block cursor-pointer">
                                                            <div className="border-2 border-dashed border-blue-400 rounded-xl p-6 text-center hover:bg-blue-100 transition-all">
                                                                <input
                                                                    type="file"
                                                                    accept=".docx"
                                                                    onChange={(e) => {
                                                                        if (e.target.files?.[0]) {
                                                                            handleFileUpload(assignment._id, e.target.files[0]);
                                                                        }
                                                                    }}
                                                                    className="hidden"
                                                                    disabled={uploadingFor === assignment._id}
                                                                />
                                                                {uploadingFor === assignment._id ? (
                                                                    <div className="flex flex-col items-center gap-3">
                                                                        <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-600 border-t-transparent"></div>
                                                                        <p className="text-sm font-semibold text-blue-700">Uploading your assignment...</p>
                                                                    </div>
                                                                ) : (
                                                                    <>
                                                                        <svg className="w-12 h-12 text-blue-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                                                        </svg>
                                                                        <p className="text-sm font-bold text-blue-900 mb-1">Click to upload or drag and drop</p>
                                                                        <p className="text-xs text-blue-700">Microsoft Word (.docx) • Max 10MB</p>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </label>
                                                    </>
                                                )}
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

export default EmployeeAssignmentPortal;

