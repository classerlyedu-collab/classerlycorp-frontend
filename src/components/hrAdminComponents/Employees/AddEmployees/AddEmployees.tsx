import { useEffect, useState } from "react";
import { FiPlusCircle } from "react-icons/fi";
import { Get, Post } from "../../../../config/apiMethods";
import { displayMessage } from "../../../../config";
import { UseStateContext } from "../../../../context/ContextProvider";
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Box,
  OutlinedInput
} from '@mui/material';

interface AddEmployeesProps {
  onEmployeeAdded?: () => void;
}

const AddEmployees: React.FC<AddEmployeesProps> = ({ onEmployeeAdded }) => {
  const { role } = UseStateContext();
  const [codeInput, setCodeInput] = useState<string>("");
  const [selectedSubjects, setSelectedSubjects] = useState<Array<string | number>>([]);
  const [subjectData, setSubjectData] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [addType, setAddType] = useState<'Employee' | 'Instructor'>('Employee');

  useEffect(() => {
    Get("/subject")
      .then((d) => {
        if (d.success) setSubjectData(d.data);
        else displayMessage(d.message, "error");
      })
      .catch((e) => displayMessage(e.message, "error"));
  }, []);

  // Ensure non-HR roles cannot switch to Instructor add
  useEffect(() => {
    if (role !== 'HR-Admin' && addType !== 'Employee') {
      setAddType('Employee');
    }
  }, [role, addType]);

  const isButtonEnabled = codeInput?.trim().length >= 1;

  const handleAdd = async () => {
    if (!isButtonEnabled || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const endpoint = addType === 'Instructor' ? '/hr-admin/addinstructor' : '/hr-admin/addemployee';
      const payload = addType === 'Instructor'
        ? { instructorCodes: [codeInput.trim()], subjects: selectedSubjects }
        : { stdId: [codeInput.trim()], subjects: selectedSubjects };
      const d = await Post(endpoint, payload);
      if (d.success) {
        displayMessage(d.message || `${addType} request sent`, "success");
        setCodeInput("");
        setSelectedSubjects([]);
        onEmployeeAdded && onEmployeeAdded();
      } else {
        displayMessage(d.message || `Failed to add ${addType.toLowerCase()}`, "error");
      }
    } catch (err: any) {
      displayMessage(err?.message || `Failed to add ${addType.toLowerCase()}`, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col justify-start items-stretch bg-white rounded-lg w-full">
      <div className="px-4 pt-4">
        <h2 className="text-base md:text-lg font-ubuntu font-semibold text-gray-900">Add {addType}</h2>
        <p className="text-xs text-gray-500 mt-1">Add an {addType.toLowerCase()} by ID.</p>
      </div>

      <div className="w-full h-full flex flex-col items-stretch justify-center px-4 pb-4">
        <div className="flex flex-col mt-4 space-y-4">
          {/* HR-Admin can toggle between adding Employee and Instructor; Instructor users never see the Instructor option */}
          <div className="flex items-center gap-2">
            <button
              className={`px-3 py-1 rounded-md text-sm ${addType === 'Employee' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-800'}`}
              onClick={() => setAddType('Employee')}
              type="button"
            >Employee</button>
            {role === 'HR-Admin' && (
              <button
                className={`px-3 py-1 rounded-md text-sm ${addType === 'Instructor' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-800'}`}
                onClick={() => setAddType('Instructor')}
                type="button"
              >Instructor</button>
            )}
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">{addType} Code</label>
            <input
              value={codeInput}
              onChange={(e) => setCodeInput(e.target.value)}
              placeholder={addType === 'Instructor' ? 'INS-XXXXXX' : 'EMP-XXXXXX'}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            <span className="text-xs text-gray-500 mt-1">Use the company-issued {addType.toLowerCase()} ID.</span>
          </div>

          {addType === 'Employee' && (
            <div className="flex flex-col">
              <FormControl fullWidth size="small">
                <InputLabel>Subjects (optional)</InputLabel>
                <Select
                  multiple
                  value={selectedSubjects}
                  onChange={(e) => setSelectedSubjects(e.target.value as Array<string | number>)}
                  input={<OutlinedInput label="Subjects (optional)" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => {
                        const subject = subjectData.find(s => s._id === value);
                        return <Chip key={value} label={subject?.name || value} size="small" />
                      })}
                    </Box>
                  )}
                >
                  {subjectData.map((s) => (
                    <MenuItem key={s._id} value={s._id}>
                      {s.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div>
          )}

          <button
            type="button"
            onClick={handleAdd}
            disabled={!isButtonEnabled || isSubmitting}
            className={`${(!isButtonEnabled || isSubmitting) ? 'bg-gray-300 text-gray-600 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 text-white'} inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md font-ubuntu font-semibold transition`}
          >
            <FiPlusCircle size={18} />
            {isSubmitting ? 'Adding...' : `Add ${addType}`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddEmployees;
