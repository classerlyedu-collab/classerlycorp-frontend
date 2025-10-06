import { useState } from "react";
import { FiPlusCircle } from "react-icons/fi";
import { Post } from "../../../../config/apiMethods";
import { displayMessage } from "../../../../config";

interface AddInstructorProps {
    onInstructorAdded?: () => void;
}

const AddInstructor: React.FC<AddInstructorProps> = ({ onInstructorAdded }) => {
    const [codeInput, setCodeInput] = useState<string>("");
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    const isButtonEnabled = codeInput?.trim().length >= 1;

    const handleAdd = async () => {
        if (!isButtonEnabled || isSubmitting) return;
        setIsSubmitting(true);
        try {
            const payload = { instructorCodes: [codeInput.trim()] };
            const d = await Post('/hr-admin/addinstructor', payload);
            if (d.success) {
                displayMessage(d.message || "Instructor request sent", "success");
                setCodeInput("");
                onInstructorAdded && onInstructorAdded();
            } else {
                displayMessage(d.message || "Failed to add instructor", "error");
            }
        } catch (err: any) {
            displayMessage(err?.message || "Failed to add instructor", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex flex-col justify-start items-stretch bg-white rounded-lg w-full">
            <div className="px-4 pt-4">
                <h2 className="text-base md:text-lg font-ubuntu font-semibold text-gray-900">Add Instructor</h2>
                <p className="text-xs text-gray-500 mt-1">Add an instructor by ID.</p>
            </div>

            <div className="w-full h-full flex flex-col items-stretch justify-center px-4 pb-4">
                <div className="flex flex-col mt-4 space-y-4">
                    <div className="flex flex-col">
                        <label className="text-sm font-medium text-gray-700 mb-1">Instructor Code</label>
                        <input
                            value={codeInput}
                            onChange={(e) => setCodeInput(e.target.value)}
                            placeholder="INS-XXXXXX"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                        <span className="text-xs text-gray-500 mt-1">Use the company-issued instructor ID.</span>
                    </div>


                    <button
                        type="button"
                        onClick={handleAdd}
                        disabled={!isButtonEnabled || isSubmitting}
                        className={`${(!isButtonEnabled || isSubmitting) ? 'bg-gray-300 text-gray-600 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 text-white'} inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md font-ubuntu font-semibold transition`}
                    >
                        <FiPlusCircle size={18} />
                        {isSubmitting ? 'Adding...' : 'Add Instructor'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddInstructor;
