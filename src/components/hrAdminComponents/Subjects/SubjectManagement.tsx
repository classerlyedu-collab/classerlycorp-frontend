import React, { useState, useEffect, useRef } from 'react';
import { Get, Post, Put, Delete } from '../../../config/apiMethods';
import { displayMessage } from '../../../config';
import { FiPlus, FiEdit2, FiTrash2, FiImage, FiBookOpen, FiChevronRight, FiX, FiAlertTriangle } from 'react-icons/fi';

interface Subject {
    _id: string;
    name: string;
    image?: string;
    topics?: any[];
    createdBy?: any;
    createdAt: string;
}

interface SubjectManagementProps {
    onNavigateToTopics?: (subject: Subject) => void;
}

const SubjectManagement: React.FC<SubjectManagementProps> = ({ onNavigateToTopics }) => {
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [showModal, setShowModal] = useState<boolean>(false);
    const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
    const [isDeleting, setIsDeleting] = useState<boolean>(false);
    const [subjectToDelete, setSubjectToDelete] = useState<Subject | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        image: null as File | null
    });
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        fetchSubjects();
    }, []);

    const fetchSubjects = async () => {
        try {
            setLoading(true);
            const response = await Get('/subject');
            if (response.success) {
                setSubjects(response.data);
            } else {
                displayMessage(response.message, 'error');
            }
        } catch (error: any) {
            displayMessage(error.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name.trim()) {
            displayMessage('Subject name is required', 'error');
            return;
        }

        try {
            setIsSubmitting(true);
            const formDataToSend = new FormData();
            formDataToSend.append('name', formData.name.trim());
            if (formData.image) {
                formDataToSend.append('file', formData.image);
            }

            let response;
            if (editingSubject) {
                response = await Put(`/subject/${editingSubject._id}`, formDataToSend, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            } else {
                response = await Post('/subject', formDataToSend, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }

            if (response.success) {
                displayMessage(
                    editingSubject ? 'Subject updated successfully' : 'Subject created successfully',
                    'success'
                );
                setShowModal(false);
                setEditingSubject(null);
                setFormData({ name: '', image: null });
                if (previewUrl) {
                    URL.revokeObjectURL(previewUrl);
                }
                setPreviewUrl(null);

                // Update local state instead of refetching
                if (editingSubject) {
                    setSubjects(prev => prev.map(subject =>
                        subject._id === editingSubject._id
                            ? { ...subject, name: formData.name, image: response.data?.image || subject.image }
                            : subject
                    ));
                } else {
                    setSubjects(prev => [response.data, ...prev]);
                }
            } else {
                displayMessage(response.message, 'error');
            }
        } catch (error: any) {
            displayMessage(error.message, 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEdit = (subject: Subject) => {
        setEditingSubject(subject);
        setFormData({ name: subject.name, image: null });
        setPreviewUrl(null);
        setShowModal(true);
    };

    const handleDeleteClick = (subject: Subject) => {
        setSubjectToDelete(subject);
        setShowDeleteModal(true);
    };

    const handleConfirmDelete = async () => {
        if (!subjectToDelete) return;

        try {
            setIsDeleting(true);
            const response = await Delete(`/subject/${subjectToDelete._id}`);
            if (response.success) {
                displayMessage('Subject and all associated topics and lessons deleted successfully', 'success');
                // Update local state instead of refetching
                setSubjects(prev => prev.filter(subject => subject._id !== subjectToDelete._id));
            } else {
                displayMessage(response.message, 'error');
            }
        } catch (error: any) {
            displayMessage(error.message, 'error');
        } finally {
            setIsDeleting(false);
            setShowDeleteModal(false);
            setSubjectToDelete(null);
        }
    };

    const handleCancelDelete = () => {
        setShowDeleteModal(false);
        setSubjectToDelete(null);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingSubject(null);
        setFormData({ name: '', image: null });
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
        }
        setPreviewUrl(null);
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }
            setPreviewUrl(URL.createObjectURL(file));
            setFormData({ ...formData, image: file });
        }
    };

    const handleChooseImageClick = () => {
        fileInputRef.current?.click();
    };

    const handleDrop: React.DragEventHandler<HTMLDivElement> = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const file = e.dataTransfer.files?.[0];
        if (file && file.type.startsWith('image/')) {
            if (previewUrl) URL.revokeObjectURL(previewUrl);
            setPreviewUrl(URL.createObjectURL(file));
            setFormData({ ...formData, image: file });
        }
    };

    const handleDragOver: React.DragEventHandler<HTMLDivElement> = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleRemoveSelectedImage = () => {
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
        }
        setPreviewUrl(null);
        setFormData({ ...formData, image: null });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Subject Management</h2>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                    <FiPlus size={20} />
                    Add Subject
                </button>
            </div>

            {subjects.length === 0 ? (
                <div className="text-center py-12">
                    <FiImage size={48} className="mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No subjects yet</h3>
                    <p className="text-gray-500 mb-4">Create your first subject to get started.</p>
                    <button
                        onClick={() => setShowModal(true)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Add Subject
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {subjects.map((subject) => (
                        <div key={subject._id} className="group bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 overflow-hidden">
                            {/* Card Header with Image */}
                            <div
                                className="relative h-32"
                                style={{
                                    background: 'linear-gradient(135deg, #2563eb 0%, #4338ca 100%)'
                                }}
                            >
                                {subject.image ? (
                                    <img
                                        src={subject.image}
                                        alt={subject.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <FiImage className="text-white" size={32} />
                                    </div>
                                )}
                                <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                    <button
                                        onClick={() => handleEdit(subject)}
                                        className="p-2 bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg transition-colors"
                                        title="Edit Subject"
                                    >
                                        <FiEdit2 size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteClick(subject)}
                                        className="p-2 bg-red-600 text-white hover:bg-red-700 rounded-lg transition-colors"
                                        title="Delete Subject"
                                    >
                                        <FiTrash2 size={16} />
                                    </button>
                                </div>
                            </div>

                            {/* Card Content */}
                            <div className="p-6">
                                <div className="mb-4">
                                    <h3 className="text-xl font-bold text-gray-900 capitalize mb-2">{subject.name}</h3>
                                    <div className="flex items-center gap-4 text-sm text-gray-600">
                                        <div className="flex items-center gap-1">
                                            <FiBookOpen size={16} className="text-blue-500" />
                                            <span>{subject.topics?.length || 0} topics</span>
                                        </div>
                                        <div className="text-xs text-gray-400">
                                            {new Date(subject.createdAt).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>

                                {/* Action Button */}
                                {onNavigateToTopics && (
                                    <button
                                        onClick={() => onNavigateToTopics(subject)}
                                        className="w-full text-white py-3 px-4 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 group/btn"
                                        style={{
                                            background: 'linear-gradient(90deg, #2563eb 0%, #4338ca 100%)'
                                        }}
                                        onMouseEnter={(e) => {
                                            (e.target as HTMLButtonElement).style.background = 'linear-gradient(90deg, #1d4ed8 0%, #3730a3 100%)';
                                        }}
                                        onMouseLeave={(e) => {
                                            (e.target as HTMLButtonElement).style.background = 'linear-gradient(90deg, #2563eb 0%, #4338ca 100%)';
                                        }}
                                    >
                                        <FiBookOpen size={18} />
                                        <span>View Topics</span>
                                        <FiChevronRight size={18} className="group-hover/btn:translate-x-1 transition-transform duration-200" />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl w-full max-w-md shadow-xl">
                        <div className="p-6">
                            <h3 className="text-xl font-bold text-gray-900 mb-4">
                                {editingSubject ? 'Edit Subject' : 'Add New Subject'}
                            </h3>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Subject Name
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        disabled={isSubmitting}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-gray-100"
                                        placeholder="Enter subject name"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Subject Image (Optional)
                                    </label>
                                    <div
                                        className="border border-dashed border-gray-300 rounded-lg p-3"
                                        onDrop={handleDrop}
                                        onDragOver={handleDragOver}
                                    >
                                        {/* Preview area */}
                                        {previewUrl ? (
                                            <div className="relative">
                                                <img src={previewUrl} alt="Preview" className="w-full h-40 object-cover rounded" />
                                                <button
                                                    type="button"
                                                    onClick={handleRemoveSelectedImage}
                                                    className="absolute top-2 right-2 bg-white/90 hover:bg-white text-gray-700 border border-gray-200 rounded-full p-1 disabled:opacity-60 disabled:cursor-not-allowed"
                                                    disabled={isSubmitting}
                                                    title="Remove selected image"
                                                >
                                                    <FiX size={16} />
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-3">
                                                {editingSubject?.image ? (
                                                    <img src={editingSubject.image} alt={editingSubject.name} className="w-20 h-20 object-cover rounded" />
                                                ) : (
                                                    <div className="w-20 h-20 bg-gray-100 rounded flex items-center justify-center text-gray-400">
                                                        <FiImage />
                                                    </div>
                                                )}
                                                <div className="flex-1">
                                                    <input
                                                        ref={fileInputRef}
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={handleImageChange}
                                                        disabled={isSubmitting}
                                                        className="hidden"
                                                    />
                                                    <div className="flex items-center gap-3">
                                                        <button
                                                            type="button"
                                                            onClick={handleChooseImageClick}
                                                            disabled={isSubmitting}
                                                            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-white shadow-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                                                            style={{ background: 'linear-gradient(90deg, #2563eb 0%, #4338ca 100%)' }}
                                                            onMouseEnter={(e) => {
                                                                (e.target as HTMLButtonElement).style.background = 'linear-gradient(90deg, #1d4ed8 0%, #3730a3 100%)';
                                                            }}
                                                            onMouseLeave={(e) => {
                                                                (e.target as HTMLButtonElement).style.background = 'linear-gradient(90deg, #2563eb 0%, #4338ca 100%)';
                                                            }}
                                                        >
                                                            <FiImage size={16} />
                                                            {editingSubject?.image ? 'Change Image' : 'Choose Image'}
                                                        </button>
                                                        {formData.image && (
                                                            <span className="text-sm text-gray-600 truncate max-w-[200px]">{formData.image.name}</span>
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-gray-500 mt-1">Drag & drop or click to upload. PNG, JPG, GIF up to ~5MB.</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={handleCloseModal}
                                        disabled={isSubmitting}
                                        className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                                    >
                                        {isSubmitting && (
                                            <span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                        )}
                                        {editingSubject ? (isSubmitting ? 'Updating...' : 'Update') : (isSubmitting ? 'Creating...' : 'Create')}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && subjectToDelete && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
                        <div className="p-6">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                                    <FiAlertTriangle className="text-red-600" size={24} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">Delete Subject</h3>
                                    <p className="text-sm text-gray-500">This action cannot be undone</p>
                                </div>
                            </div>

                            <div className="mb-6">
                                <p className="text-gray-700 mb-2">
                                    Are you sure you want to delete <span className="font-semibold">"{subjectToDelete.name}"</span>?
                                </p>
                                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                                    <p className="text-sm text-red-700">
                                        <strong>Warning:</strong> This will also delete all topics and lessons associated with this subject.
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={handleCancelDelete}
                                    disabled={isDeleting}
                                    className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleConfirmDelete}
                                    disabled={isDeleting}
                                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium inline-flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {isDeleting && (
                                        <span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                    )}
                                    {isDeleting ? 'Deleting...' : 'Delete Subject'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SubjectManagement;
