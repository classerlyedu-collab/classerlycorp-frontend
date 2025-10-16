import { useState, useEffect, useRef } from "react";
import { Post, Put } from "../../../config/apiMethods";
import { displayMessage } from "../../../config";
import { RichTextEditor } from "../../index";

interface Criterion {
    criterion: string;
    weight: number;
    maxScore: number;
    description?: string;
}

interface AddRubricProps {
    onRubricSaved: () => void;
    editingRubric: any;
    onCloseEdit: () => void;
}

const AddRubric: React.FC<AddRubricProps> = ({ onRubricSaved, editingRubric, onCloseEdit }) => {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [criteria, setCriteria] = useState<Criterion[]>([
        { criterion: "", weight: 0, maxScore: 0, description: "" }
    ]);
    const [loading, setLoading] = useState(false);
    const criteriaEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (editingRubric) {
            setTitle(editingRubric.title || "");
            setDescription(editingRubric.description || "");
            setCriteria(editingRubric.criteria || [{ criterion: "", weight: 0, maxScore: 0, description: "" }]);
        }
    }, [editingRubric]);

    const handleAddCriterion = () => {
        setCriteria([...criteria, { criterion: "", weight: 0, maxScore: 0, description: "" }]);
        // Smooth scroll to the new criterion after state update
        setTimeout(() => {
            criteriaEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 100);
    };

    const handleRemoveCriterion = (index: number) => {
        if (criteria.length > 1) {
            setCriteria(criteria.filter((_, i) => i !== index));
        }
    };

    const handleCriterionChange = (index: number, field: keyof Criterion, value: string | number) => {
        const newCriteria = [...criteria];
        newCriteria[index] = { ...newCriteria[index], [field]: value };
        setCriteria(newCriteria);
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

        const validCriteria = criteria.filter(c => c.criterion.trim());
        if (validCriteria.length === 0) {
            displayMessage("At least one criterion is required", "error");
            return;
        }

        for (const criterion of validCriteria) {
            if (criterion.weight < 0 || criterion.weight > 100) {
                displayMessage("Weight must be between 0 and 100", "error");
                return;
            }
            if (criterion.maxScore <= 0) {
                displayMessage("Max score must be greater than 0", "error");
                return;
            }
        }

        const rubricData = {
            title: title.trim(),
            description: description.trim(),
            criteria: validCriteria
        };

        setLoading(true);
        try {
            let response: any;
            if (editingRubric) {
                response = await Put(`/rubric/${editingRubric._id}`, rubricData);
            } else {
                response = await Post("/rubric", rubricData);
            }

            if (response.success) {
                displayMessage(editingRubric ? "Rubric updated successfully" : "Rubric created successfully", "success");
                handleReset();
                onRubricSaved();
            }
        } catch (error: any) {
            displayMessage(error?.response?.data?.message || `Failed to ${editingRubric ? "update" : "create"} rubric`, "error");
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setTitle("");
        setDescription("");
        setCriteria([{ criterion: "", weight: 0, maxScore: 0, description: "" }]);
    };

    // Reset form when modal closes (when not editing)
    useEffect(() => {
        if (!editingRubric) {
            setTitle("");
            setDescription("");
            setCriteria([{ criterion: "", weight: 0, maxScore: 0, description: "" }]);
        }
    }, [editingRubric]);

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                        {editingRubric ? "Edit Rubric" : "Create New Rubric"}
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                        {editingRubric ? "Update rubric details below" : "Fill in the details to create a new rubric"}
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
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Title */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Rubric Title <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., Essay Writing Rubric"
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
                            placeholder="Describe the purpose and use of this rubric..."
                            minHeight="250px"
                        />
                    </div>
                </div>

                {/* Criteria */}
                <div>
                    <div className="flex justify-between items-center mb-3">
                        <label className="block text-sm font-semibold text-gray-700">
                            Criteria <span className="text-red-500">*</span>
                        </label>
                        <button
                            type="button"
                            onClick={handleAddCriterion}
                            className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Add Criterion
                        </button>
                    </div>

                    <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                        {criteria.map((criterion, index) => (
                            <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50 space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-bold text-gray-600">Criterion {index + 1}</span>
                                    {criteria.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveCriterion(index)}
                                            className="text-red-500 hover:text-red-700 text-sm font-medium"
                                        >
                                            Remove
                                        </button>
                                    )}
                                </div>

                                <input
                                    type="text"
                                    value={criterion.criterion}
                                    onChange={(e) => handleCriterionChange(index, "criterion", e.target.value)}
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Criterion name (e.g., Content Quality)"
                                />

                                <textarea
                                    value={criterion.description || ""}
                                    onChange={(e) => handleCriterionChange(index, "description", e.target.value)}
                                    rows={2}
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                    placeholder="Optional description"
                                />

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1">Weight (%)</label>
                                        <input
                                            type="number"
                                            value={criterion.weight}
                                            onChange={(e) => handleCriterionChange(index, "weight", Number(e.target.value))}
                                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            min="0"
                                            max="100"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1">Max Score</label>
                                        <input
                                            type="number"
                                            value={criterion.maxScore}
                                            onChange={(e) => handleCriterionChange(index, "maxScore", Number(e.target.value))}
                                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            min="0"
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                        <div ref={criteriaEndRef} />
                    </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-4 border-t border-gray-200">
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-semibold"
                    >
                        {loading ? "Saving..." : (editingRubric ? "Update Rubric" : "Create Rubric")}
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

export default AddRubric;
