import React, { useState, useEffect } from "react";
import { FaUserPlus, FaTimes, FaCheck } from "react-icons/fa";
import { Post } from "../../../config/apiMethods";
import { displayMessage } from "../../../config";
import { CustomInput } from "../../customInput";

interface AddEmployeeModalProps {
  isVisible: boolean;
  onClose: () => void;
  employeeCode: any;
  setEmployeeCode: any;
  onEmployeeAdded?: () => void;
}

const AddEmployeeModal: React.FC<AddEmployeeModalProps> = ({
  isVisible,
  onClose,
  employeeCode,
  setEmployeeCode,
  onEmployeeAdded,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setIsAnimating(true);
    } else {
      setIsAnimating(false);
    }
  }, [isVisible]);
  if (!isVisible) return null;

  // Determine if the button should be enabled
  const isButtonEnabled = employeeCode?.length >= 1;

  const handleAddEmployee = async () => {
    if (!isButtonEnabled || isAdding) return;

    setIsAdding(true);
    try {
      const response = await Post("/supervisor/addchild", {
        stdid: employeeCode,
      });

      if (response.success) {
        displayMessage(response.message, "success");
        setEmployeeCode("");
        onClose();
        // Refresh employee list immediately
        if (onEmployeeAdded) {
          onEmployeeAdded();
        }
      } else {
        displayMessage(response.message, "error");
      }
    } catch (err: any) {
      displayMessage(err.message, "error");
    } finally {
      setIsAdding(false);
    }
  };
  return (
    <div className={`fixed inset-0 bg-black z-40 flex items-start justify-end pt-12 pr-5 transition-opacity duration-300 ${isAnimating ? 'bg-opacity-50' : 'bg-opacity-0'
      }`}>
      <div className={`bg-white z-40 rounded-xl shadow-2xl p-0 w-4/5 sm:w-3/5 lg:w-2/5 max-w-md transform transition-all duration-300 ease-out ${isAnimating ? 'opacity-100 translate-x-0 scale-100' : 'opacity-0 translate-x-4 scale-95'
        }`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <FaUserPlus className="w-4 h-4 text-blue-600" />
            </div>
            <h1 className="font-ubuntu font-semibold text-lg text-gray-800">
              Add Employee
            </h1>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-all duration-200 ease-out hover:scale-105"
          >
            <FaTimes className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-6">
            <p className="text-sm text-gray-600 mb-4">
              Enter the employee code to add them to your team. The employee will receive access to your assigned subjects and training materials.
            </p>

            <CustomInput
              value={employeeCode}
              setValue={setEmployeeCode}
              placeholder="e.g EMP-001"
              label="Employee Code"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all duration-200 ease-out hover:scale-105 active:scale-95"
            >
              Cancel
            </button>
            <button
              onClick={handleAddEmployee}
              disabled={!isButtonEnabled || isAdding}
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ease-out flex items-center justify-center gap-2 ${isButtonEnabled && !isAdding
                ? "bg-blue-600 text-white hover:bg-blue-700 hover:scale-105 active:scale-95"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
            >
              {isAdding ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <FaCheck className="w-3 h-3" />
                  Add Employee
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddEmployeeModal;
