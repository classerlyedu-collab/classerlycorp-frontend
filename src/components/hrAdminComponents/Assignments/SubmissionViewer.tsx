import { useEffect, useState } from "react";
import { Get, Put } from "../../../config/apiMethods";
import { displayMessage } from "../../../config";

interface SubmissionViewerProps {
    assignmentId: string;
    assignmentTitle: string;
    onClose: () => void;
}

interface Criterion {
    criterion: string;
    weight: number;
    maxScore: number;
}

interface Rubric {
    _id: string;
    title: string;
    criteria: Criterion[];
}

interface Assignment {
    _id: string;
    title: string;
    attachedRubric?: Rubric;
}

interface Submission {
    _id: string;
    employee: {
        auth: {
            fullName: string;
            email: string;
            image?: string;
        };
    };
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

const SubmissionViewer: React.FC<SubmissionViewerProps> = ({ assignmentId, assignmentTitle, onClose }) => {
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [assignment, setAssignment] = useState<Assignment | null>(null);
    const [loading, setLoading] = useState(false);
    const [gradingSubmission, setGradingSubmission] = useState<string | null>(null);
    const [gradingLoading, setGradingLoading] = useState(false);
    const [gradeData, setGradeData] = useState<{ score: number; maxScore: number; feedback: string }>({
        score: 0,
        maxScore: 100,
        feedback: ""
    });

    useEffect(() => {
        fetchAssignmentAndSubmissions();
    }, [assignmentId]);

    const fetchAssignmentAndSubmissions = async () => {
        setLoading(true);
        try {
            // Fetch assignment details with rubric
            const assignmentResponse: any = await Get(`/assignment/${assignmentId}`, "");
            if (assignmentResponse.success) {
                setAssignment(assignmentResponse.data);
            }

            // Fetch submissions
            const submissionsResponse: any = await Get(`/submission/assignment/${assignmentId}`, "");
            if (submissionsResponse.success) {
                setSubmissions(submissionsResponse.data || []);
            }
        } catch (error: any) {
            displayMessage(error?.response?.data?.message || "Failed to fetch data", "error");
        } finally {
            setLoading(false);
        }
    };

    // Calculate total max score from rubric criteria
    const calculateMaxScore = (): number => {
        if (!assignment?.attachedRubric?.criteria) {
            return 100; // Default if no rubric
        }
        return assignment.attachedRubric.criteria.reduce((sum, criterion) => sum + criterion.maxScore, 0);
    };

    const handleGrade = (submission: Submission) => {
        setGradingSubmission(submission._id);
        const calculatedMaxScore = calculateMaxScore();

        if (submission.grade) {
            // Editing existing grade
            setGradeData({
                score: submission.grade.score,
                maxScore: calculatedMaxScore, // Always use rubric's maxScore
                feedback: submission.grade.feedback
            });
        } else {
            // New grade - auto-fill maxScore from rubric
            setGradeData({
                score: 0,
                maxScore: calculatedMaxScore,
                feedback: ""
            });
        }
    };

    const submitGrade = async () => {
        if (!gradingSubmission) return;

        if (gradeData.score < 0 || gradeData.score > gradeData.maxScore) {
            displayMessage(`Score must be between 0 and ${gradeData.maxScore}`, "error");
            return;
        }

        setGradingLoading(true);
        try {
            const response: any = await Put(`/submission/${gradingSubmission}/grade`, gradeData);
            if (response.success) {
                displayMessage("Grade submitted successfully", "success");
                setGradingSubmission(null);
                setGradeData({ score: 0, maxScore: 100, feedback: "" });
                fetchAssignmentAndSubmissions();
            }
        } catch (error: any) {
            displayMessage(error?.response?.data?.message || "Failed to grade submission", "error");
        } finally {
            setGradingLoading(false);
        }
    };

    // Helper function to view document in new tab
    const viewDocument = (fileUrl: string, fileName: string) => {
        try {
            if (!fileUrl) {
                displayMessage("File URL not found", "error");
                return;
            }

            // For .docx files, use Google Docs Viewer
            const viewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(fileUrl)}&embedded=true`;
            window.open(viewerUrl, '_blank');
        } catch (error) {
            displayMessage("Failed to view document", "error");
        }
    };

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden border border-gray-200">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b-2 border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Submissions</h2>
                        <p className="text-sm text-gray-600 mt-1">{assignmentTitle}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-white transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
                        </div>
                    ) : submissions.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-700 mb-2">No submissions yet</h3>
                            <p className="text-sm text-gray-500">Submissions will appear here once employees submit their work</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {submissions.map((submission) => (
                                <div key={submission._id} className="border-2 border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex items-center gap-3 flex-1">
                                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-md">
                                                {submission.employee.auth.fullName.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-bold text-gray-900">{submission.employee.auth.fullName}</p>
                                                <p className="text-xs text-gray-600">{submission.employee.auth.email}</p>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    Submitted: {new Date(submission.submittedAt).toLocaleString()}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            {submission.grade && (
                                                <div className="bg-purple-100 border border-purple-200 px-3 py-2 rounded-lg text-center">
                                                    <p className="text-xs font-bold text-purple-700 uppercase">Graded</p>
                                                    <p className="text-lg font-bold text-purple-900">{submission.grade.score}/{submission.grade.maxScore}</p>
                                                </div>
                                            )}
                                            <button
                                                onClick={() => viewDocument(submission.fileUrl, submission.fileName)}
                                                className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs font-medium flex items-center gap-1"
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
                                                className="px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-xs font-medium flex items-center gap-1"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                                Download
                                            </a>
                                            <button
                                                onClick={() => handleGrade(submission)}
                                                className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-xs font-medium flex items-center gap-1"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                                {submission.grade ? "Edit Grade" : "Grade"}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Grading Modal */}
                {gradingSubmission && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                        <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
                            <h3 className="text-xl font-bold text-gray-900 mb-4">Grade Submission</h3>
                            <div className="space-y-4">
                                {assignment?.attachedRubric && (
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                                        <div className="flex items-start gap-2">
                                            <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <div className="flex-1">
                                                <p className="text-sm font-semibold text-blue-900">Rubric: {assignment.attachedRubric.title}</p>
                                                <p className="text-xs text-blue-700 mt-1">Max score calculated from rubric criteria ({assignment.attachedRubric.criteria.length} criteria)</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Score *</label>
                                        <input
                                            type="number"
                                            value={gradeData.score}
                                            onChange={(e) => setGradeData({ ...gradeData, score: Number(e.target.value) })}
                                            disabled={gradingLoading}
                                            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${gradingLoading
                                                ? 'bg-gray-100 border-gray-300 text-gray-500 cursor-not-allowed'
                                                : 'border-gray-300 focus:ring-blue-500'
                                                }`}
                                            min="0"
                                            max={gradeData.maxScore}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Max Score {assignment?.attachedRubric && <span className="text-xs text-gray-500">(from rubric)</span>}
                                        </label>
                                        <input
                                            type="number"
                                            value={gradeData.maxScore}
                                            readOnly={!!assignment?.attachedRubric || gradingLoading}
                                            onChange={(e) => !assignment?.attachedRubric && !gradingLoading && setGradeData({ ...gradeData, maxScore: Number(e.target.value) })}
                                            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${assignment?.attachedRubric || gradingLoading
                                                ? 'bg-gray-100 border-gray-300 text-gray-700 cursor-not-allowed'
                                                : 'border-gray-300 focus:ring-blue-500'
                                                }`}
                                            min="0"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Feedback</label>
                                    <textarea
                                        value={gradeData.feedback}
                                        onChange={(e) => setGradeData({ ...gradeData, feedback: e.target.value })}
                                        rows={4}
                                        disabled={gradingLoading}
                                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 resize-none ${gradingLoading
                                            ? 'bg-gray-100 border-gray-300 text-gray-500 cursor-not-allowed'
                                            : 'border-gray-300 focus:ring-blue-500'
                                            }`}
                                        placeholder="Provide feedback to the student..."
                                    />
                                </div>
                                <div className="flex gap-3 pt-2">
                                    <button
                                        onClick={submitGrade}
                                        disabled={gradingLoading}
                                        className={`flex-1 px-4 py-2 rounded-lg transition-colors font-semibold flex items-center justify-center gap-2 ${gradingLoading
                                            ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                                            : 'bg-green-600 text-white hover:bg-green-700'
                                            }`}
                                    >
                                        {gradingLoading && (
                                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                        )}
                                        {gradingLoading ? "Submitting..." : "Submit Grade"}
                                    </button>
                                    <button
                                        onClick={() => setGradingSubmission(null)}
                                        disabled={gradingLoading}
                                        className={`px-4 py-2 border-2 rounded-lg transition-colors font-semibold ${gradingLoading
                                            ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                                            : 'border-gray-300 hover:bg-gray-50'
                                            }`}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SubmissionViewer;

