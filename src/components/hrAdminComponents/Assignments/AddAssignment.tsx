import { useState, useEffect, useRef } from "react";
import { Post, Put, Get } from "../../../config/apiMethods";
import { displayMessage } from "../../../config";
import { RichTextEditor } from "../../index";

interface AddAssignmentProps {
    onAssignmentSaved: () => void;
    editingAssignment: any;
    onCloseEdit: () => void;
}

const AddAssignment: React.FC<AddAssignmentProps> = ({ onAssignmentSaved, editingAssignment, onCloseEdit }) => {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [deadline, setDeadline] = useState("");
    const [attachedRubric, setAttachedRubric] = useState("");
    const [subject, setSubject] = useState("");
    const [status, setStatus] = useState("published");
    const [loading, setLoading] = useState(false);

    // Options for dropdowns
    const [rubrics, setRubrics] = useState<any[]>([]);
    const [subjects, setSubjects] = useState<any[]>([]);
    const [loadingOptions, setLoadingOptions] = useState(false);

    useEffect(() => {
        fetchOptions();
    }, []);

    useEffect(() => {
        if (editingAssignment) {
            setTitle(editingAssignment.title || "");
            setDescription(editingAssignment.description || "");

            // Format deadline for datetime-local input
            if (editingAssignment.deadline) {
                const date = new Date(editingAssignment.deadline);
                const formattedDate = date.toISOString().slice(0, 16);
                setDeadline(formattedDate);
            }

            setAttachedRubric(editingAssignment.attachedRubric?._id || "");
            setSubject(editingAssignment.subject?._id || "");
            setStatus(editingAssignment.status || "published");
        }
    }, [editingAssignment]);

    const fetchOptions = async () => {
        setLoadingOptions(true);
        try {
            // Fetch rubrics
            const rubricsResponse: any = await Get("/rubric", "");
            if (rubricsResponse.success) {
                setRubrics(rubricsResponse.data || []);
            }

            // Fetch subjects (using hr-admin endpoint)
            const subjectsResponse: any = await Get("/hr-admin/mysubjects", "");
            if (subjectsResponse.success) {
                setSubjects(subjectsResponse.data || []);
            }
        } catch (error: any) {
            console.error("Failed to fetch options:", error);
        } finally {
            setLoadingOptions(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!title.trim()) {
            displayMessage("Title is required", "error");
            return;
        }

        if (!description.trim() || description === '<p><br></p>') {
            displayMessage("Description is required", "error");
            return;
        }

        if (!deadline) {
            displayMessage("Deadline is required", "error");
            return;
        }

        const assignmentData: any = {
            title: title.trim(),
            description: description.trim(),
            deadline: new Date(deadline).toISOString(),
            status
        };

        if (attachedRubric) {
            assignmentData.attachedRubric = attachedRubric;
        }

        if (subject) {
            assignmentData.subject = subject;
        }

        setLoading(true);
        try {
            let response: any;
            if (editingAssignment) {
                response = await Put(`/assignment/${editingAssignment._id}`, assignmentData);
            } else {
                response = await Post("/assignment", assignmentData);
            }

            if (response.success) {
                displayMessage(editingAssignment ? "Assignment updated successfully" : "Assignment created successfully", "success");
                handleReset();
                onAssignmentSaved();
            }
        } catch (error: any) {
            displayMessage(error?.response?.data?.message || `Failed to ${editingAssignment ? "update" : "create"} assignment`, "error");
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setTitle("");
        setDescription("");
        setDeadline("");
        setAttachedRubric("");
        setSubject("");
        setStatus("published");
    };

    // Reset form when modal closes (when not editing)
    useEffect(() => {
        if (!editingAssignment) {
            setTitle("");
            setDescription("");
            setDeadline("");
            setAttachedRubric("");
            setSubject("");
            setStatus("published");
        }
    }, [editingAssignment]);

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                        {editingAssignment ? "Edit Assignment" : "Create New Assignment"}
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                        {editingAssignment ? "Update assignment details below" : "Fill in the details to create a new assignment"}
                    </p>
                </div>
                <button
                    onClick={onCloseEdit}
                    className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
                {/* Title */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Assignment Title <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., Research Paper on Climate Change"
                    />
                </div>

                {/* Description with Rich Text Editor */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Description <span className="text-red-500">*</span>
                    </label>
                    <div className="border border-gray-300 rounded-lg overflow-hidden">
                        <RichTextEditor
                            value={description}
                            onChange={setDescription}
                            placeholder="Describe the assignment requirements, objectives, and instructions..."
                            minHeight="250px"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Deadline */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Deadline <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="datetime-local"
                            value={deadline}
                            onChange={(e) => setDeadline(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    {/* Status */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Status
                        </label>
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                        >
                            <option value="draft">Draft</option>
                            <option value="published">Published</option>
                            <option value="archived">Archived</option>
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Attached Rubric */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Rubric (Optional)
                        </label>
                        <select
                            value={attachedRubric}
                            onChange={(e) => setAttachedRubric(e.target.value)}
                            disabled={loadingOptions}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white disabled:bg-gray-100"
                        >
                            <option value="">Select a rubric</option>
                            {rubrics.map((rubric) => (
                                <option key={rubric._id} value={rubric._id}>
                                    {rubric.title}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Subject */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Subject (Optional)
                        </label>
                        <select
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            disabled={loadingOptions}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white disabled:bg-gray-100"
                        >
                            <option value="">Select a subject</option>
                            {subjects.map((subj) => (
                                <option key={subj._id} value={subj._id}>
                                    {subj.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-4 border-t border-gray-200">
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-semibold"
                    >
                        {loading ? "Saving..." : (editingAssignment ? "Update Assignment" : "Create Assignment")}
                    </button>
                    <button
                        type="button"
                        onClick={onCloseEdit}
                        className="px-6 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-semibold text-gray-700"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddAssignment;
