import React, { useState, useEffect } from 'react';
import { Get, Post, Put, Delete } from '../../../config/apiMethods';
import { displayMessage } from '../../../config';
import { FiPlus, FiEdit2, FiTrash2, FiBookOpen, FiFileText, FiChevronRight, FiAlertTriangle } from 'react-icons/fi';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    rectSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface Subject {
    _id: string;
    name: string;
    image?: string;
    topics?: any[];
    createdBy?: any;
    createdAt: string;
}

interface Topic {
    _id: string;
    name: string;
    subject: Subject;
    difficulty: 'Beginner' | 'Medium' | 'Advanced';
    type: string;
    lessons?: any[];
    createdAt: string;
}

interface TopicManagementProps {
    selectedSubject?: Subject | null;
    onNavigateToLessons?: (topic: Topic) => void;
    onBackToSubjects?: () => void;
}

interface SortableTopicItemProps {
    topic: Topic;
    onEdit: (topic: Topic) => void;
    onDelete: (topic: Topic) => void;
    onNavigateToLessons?: (topic: Topic) => void;
    getDifficultyColor: (difficulty: string) => string;
}

const SortableTopicItem: React.FC<SortableTopicItemProps> = ({
    topic,
    onEdit,
    onDelete,
    onNavigateToLessons,
    getDifficultyColor
}) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: topic._id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`group relative bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 overflow-hidden ${isDragging ? 'shadow-lg' : ''}`}
        >
            {/* Drag Handle */}
            <div className="absolute top-2 left-2 z-10">
                <div
                    {...attributes}
                    {...listeners}
                    className="cursor-grab active:cursor-grabbing p-2 hover:bg-white hover:bg-opacity-20 rounded transition-colors"
                    style={{ touchAction: 'none' }}
                >
                    <div className="w-4 h-4 bg-white bg-opacity-80 rounded"></div>
                </div>
            </div>

            {/* Card Header */}
            <div
                className="relative h-24"
                style={{
                    background: 'linear-gradient(135deg, #10b981 0%, #0d9488 100%)'
                }}
            >
                <div className="w-full h-full flex items-center justify-center">
                    <FiBookOpen className="text-white" size={28} />
                </div>
                <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button
                        onClick={() => onEdit(topic)}
                        className="p-2 bg-emerald-600 text-white hover:bg-emerald-700 rounded-lg transition-colors"
                        title="Edit Topic"
                    >
                        <FiEdit2 size={16} />
                    </button>
                    <button
                        onClick={() => onDelete(topic)}
                        className="p-2 bg-red-600 text-white hover:bg-red-700 rounded-lg transition-colors"
                        title="Delete Topic"
                    >
                        <FiTrash2 size={16} />
                    </button>
                </div>
            </div>

            {/* Card Content */}
            <div className="p-6">
                <div className="mb-4">
                    <h3 className="text-xl font-bold text-gray-900 capitalize mb-2">{topic.name}</h3>
                    <p className="text-sm text-gray-600 mb-3">{topic.subject.name}</p>

                    <div className="flex items-center justify-between mb-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(topic.difficulty)}`}>
                            {topic.difficulty}
                        </span>
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                            <FiFileText size={16} className="text-emerald-500" />
                            <span>{topic.lessons?.length || 0} lessons</span>
                        </div>
                    </div>

                    <div className="text-xs text-gray-400 mb-4">
                        Created: {new Date(topic.createdAt).toLocaleDateString()}
                    </div>
                </div>

                {/* Action Button */}
                {onNavigateToLessons && (
                    <button
                        onClick={() => onNavigateToLessons(topic)}
                        className="w-full text-white py-3 px-4 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 group/btn"
                        style={{
                            background: 'linear-gradient(90deg, #059669 0%, #0f766e 100%)'
                        }}
                        onMouseEnter={(e) => {
                            (e.target as HTMLButtonElement).style.background = 'linear-gradient(90deg, #047857 0%, #0f766e 100%)';
                        }}
                        onMouseLeave={(e) => {
                            (e.target as HTMLButtonElement).style.background = 'linear-gradient(90deg, #059669 0%, #0f766e 100%)';
                        }}
                    >
                        <FiFileText size={18} />
                        <span>View Lessons</span>
                        <FiChevronRight size={18} className="group-hover/btn:translate-x-1 transition-transform duration-200" />
                    </button>
                )}
            </div>
        </div>
    );
};

const TopicManagement: React.FC<TopicManagementProps> = ({ selectedSubject, onNavigateToLessons, onBackToSubjects }) => {
    const [topics, setTopics] = useState<Topic[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [showModal, setShowModal] = useState<boolean>(false);
    const [editingTopic, setEditingTopic] = useState<Topic | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
    const [topicToDelete, setTopicToDelete] = useState<Topic | null>(null);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [isDeleting, setIsDeleting] = useState<boolean>(false);
    const [isReordering, setIsReordering] = useState<boolean>(false);
    const [formData, setFormData] = useState({
        name: '',
        subject: '',
        difficulty: 'Beginner' as 'Beginner' | 'Medium' | 'Advanced',
        type: 'Standard'
    });

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 2,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    useEffect(() => {
        fetchTopics();
    }, []);

    useEffect(() => {
        if (selectedSubject) {
            fetchTopics();
        }
    }, [selectedSubject]);

    const fetchTopics = async () => {
        try {
            setLoading(true);
            const response = await Get('/topic/all');
            if (response.success) {
                // Filter topics by selected subject if provided
                if (selectedSubject) {
                    const filteredTopics = response.data.filter((topic: Topic) =>
                        topic.subject._id === selectedSubject._id
                    );
                    setTopics(filteredTopics);
                } else {
                    setTopics(response.data);
                }
            } else {
                displayMessage(response.message, 'error');
            }
        } catch (error: any) {
            displayMessage(error.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;

        if (!over || active.id === over.id) {
            return;
        }

        const oldIndex = topics.findIndex((topic) => topic._id === active.id);
        const newIndex = topics.findIndex((topic) => topic._id === over.id);

        if (oldIndex === -1 || newIndex === -1) {
            return;
        }

        // Optimistically update the UI
        const newTopics = arrayMove(topics, oldIndex, newIndex);
        setTopics(newTopics);

        try {
            setIsReordering(true);

            // Prepare the order data for the API
            const orderData = newTopics.map((topic, index) => ({
                id: topic._id,
                order: index
            }));

            const response = await Put('/topic/reorder', { topics: orderData });

            if (!response.success) {
                // Revert the UI change if the API call failed
                setTopics(topics);
                displayMessage(response.message || 'Failed to reorder topics', 'error');
            } else {
                displayMessage('Topics reordered successfully', 'success');
            }
        } catch (error: any) {
            // Revert the UI change if the API call failed
            setTopics(topics);
            displayMessage(error.message || 'Failed to reorder topics', 'error');
        } finally {
            setIsReordering(false);
        }
    };

    // Subject list not needed; subject comes from selectedSubject prop

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name.trim()) {
            displayMessage('Topic name is required', 'error');
            return;
        }
        if (!selectedSubject?._id && !formData.subject) {
            displayMessage('No subject context found', 'error');
            return;
        }

        setIsSubmitting(true);
        try {
            const payload = {
                name: formData.name.trim(),
                subject: selectedSubject?._id || formData.subject,
                difficulty: formData.difficulty,
                type: formData.type
            };

            let response;
            if (editingTopic) {
                response = await Put(`/topic/${editingTopic._id}`, payload);
            } else {
                response = await Post('/topic', payload);
            }

            if (response.success) {
                displayMessage(
                    editingTopic ? 'Topic updated successfully' : 'Topic created successfully',
                    'success'
                );
                setShowModal(false);
                setEditingTopic(null);
                setFormData({ name: '', subject: '', difficulty: 'Beginner', type: 'Standard' });

                // Update local state with response data
                if (editingTopic) {
                    setTopics(prev => prev.map(topic =>
                        topic._id === editingTopic._id
                            ? { ...topic, name: formData.name, difficulty: formData.difficulty, type: formData.type }
                            : topic
                    ));
                } else {
                    // For creating new topic, add the populated data from backend
                    if (Array.isArray(response.data)) {
                        setTopics(prev => [...response.data, ...prev]);
                    } else if (response.data) {
                        setTopics(prev => [response.data, ...prev]);
                    }
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

    const handleEdit = (topic: Topic) => {
        setEditingTopic(topic);
        setFormData({
            name: topic.name,
            subject: topic.subject._id,
            difficulty: topic.difficulty,
            type: topic.type
        });
        setShowModal(true);
    };

    const handleDeleteClick = (topic: Topic) => {
        setTopicToDelete(topic);
        setShowDeleteModal(true);
    };

    const handleConfirmDelete = async () => {
        if (!topicToDelete) return;

        setIsDeleting(true);
        try {
            const response = await Delete(`/topic/${topicToDelete._id}`);
            if (response.success) {
                displayMessage('Topic and all associated lessons deleted successfully', 'success');
                // Update local state instead of refetching
                setTopics(prev => prev.filter(topic => topic._id !== topicToDelete._id));
            } else {
                displayMessage(response.message, 'error');
            }
        } catch (error: any) {
            displayMessage(error.message, 'error');
        } finally {
            setIsDeleting(false);
            setShowDeleteModal(false);
            setTopicToDelete(null);
        }
    };

    const handleCancelDelete = () => {
        setShowDeleteModal(false);
        setTopicToDelete(null);
    };

    const handleOpenModal = () => {
        setFormData({ name: '', subject: selectedSubject?._id || '', difficulty: 'Beginner', type: 'Standard' });
        setEditingTopic(null);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingTopic(null);
        setFormData({ name: '', subject: selectedSubject?._id || '', difficulty: 'Beginner', type: 'Standard' });
    };


    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case 'Beginner': return 'bg-green-100 text-green-800';
            case 'Medium': return 'bg-yellow-100 text-yellow-800';
            case 'Advanced': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
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
            {/* Header with back button and subject name */}
            {selectedSubject && onBackToSubjects && (
                <div className="flex items-center gap-3 mb-4">
                    <button
                        onClick={onBackToSubjects}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
                    >
                        <FiChevronRight size={16} className="rotate-180" />
                        Back to Subjects
                    </button>
                    <div className="h-4 w-px bg-gray-300"></div>
                    <h3 className="text-lg font-medium text-gray-800">
                        Topics in {selectedSubject.name}
                    </h3>
                </div>
            )}

            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                    {selectedSubject ? `Topics in ${selectedSubject.name}` : 'Topic Management'}
                </h2>
                <button
                    onClick={handleOpenModal}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                    <FiPlus size={20} />
                    Add Topic
                </button>
            </div>

            {topics.length === 0 ? (
                <div className="text-center py-12">
                    <FiBookOpen size={48} className="mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No topics yet</h3>
                    <p className="text-gray-500 mb-4">Create your first topic to get started.</p>
                    <button
                        onClick={handleOpenModal}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Add Topic
                    </button>
                </div>
            ) : (
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext items={topics.map(topic => topic._id)} strategy={rectSortingStrategy}>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {topics.map((topic) => (
                                <SortableTopicItem
                                    key={topic._id}
                                    topic={topic}
                                    onEdit={handleEdit}
                                    onDelete={handleDeleteClick}
                                    onNavigateToLessons={onNavigateToLessons}
                                    getDifficultyColor={getDifficultyColor}
                                />
                            ))}
                        </div>
                    </SortableContext>
                </DndContext>
            )}

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl w-full max-w-2xl shadow-xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <h3 className="text-xl font-bold text-gray-900 mb-4">
                                {editingTopic ? 'Edit Topic' : 'Add New Topic'}
                            </h3>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Topic Name
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Enter topic name"
                                        disabled={isSubmitting}
                                        required
                                    />
                                </div>

                                {/* Subject dropdown removed - subject is derived from selectedSubject context */}

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Difficulty Level
                                    </label>
                                    <select
                                        value={formData.difficulty}
                                        onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as 'Beginner' | 'Medium' | 'Advanced' })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        disabled={isSubmitting}
                                    >
                                        <option value="Beginner">Beginner</option>
                                        <option value="Medium">Medium</option>
                                        <option value="Advanced">Advanced</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Type
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.type}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="e.g., Standard, Advanced, etc."
                                        disabled={isSubmitting}
                                    />
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
                                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {isSubmitting && (
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        )}
                                        {isSubmitting ? 'Processing...' : (editingTopic ? 'Update' : 'Create')}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && topicToDelete && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
                        <div className="p-6">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                                    <FiAlertTriangle className="text-red-600" size={24} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">Delete Topic</h3>
                                    <p className="text-sm text-gray-500">This action cannot be undone</p>
                                </div>
                            </div>

                            <div className="mb-6">
                                <p className="text-gray-700 mb-2">
                                    Are you sure you want to delete <span className="font-semibold">"{topicToDelete.name}"</span>?
                                </p>
                                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                                    <p className="text-sm text-red-700">
                                        <strong>Warning:</strong> This will also delete all lessons associated with this topic.
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
                                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {isDeleting && (
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    )}
                                    {isDeleting ? 'Deleting...' : 'Delete Topic'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TopicManagement;
