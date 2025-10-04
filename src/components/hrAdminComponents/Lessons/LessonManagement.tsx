import React, { useState, useEffect } from 'react';
import { Get, Post, Put, Delete } from '../../../config/apiMethods';
import { displayMessage } from '../../../config';
import { FiPlus, FiEdit2, FiTrash2, FiFileText, FiChevronRight, FiExternalLink, FiEye, FiX, FiAlertTriangle } from 'react-icons/fi';

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

interface Lesson {
    _id: string;
    name: string;
    content: string; // Google Docs URL or YouTube URL
    contentType: 'google_docs' | 'youtube';
    pages: number;
    words: number;
    lang: string;
    topic: Topic;
    createdAt: string;
}

interface LessonManagementProps {
    selectedTopic?: Topic | null;
    onBackToTopics?: () => void;
}

const LessonManagement: React.FC<LessonManagementProps> = ({ selectedTopic, onBackToTopics }) => {
    const [lessons, setLessons] = useState<Lesson[]>([]);
    const [topics, setTopics] = useState<Topic[]>([]); // For dropdown in modal
    const [loading, setLoading] = useState<boolean>(true);
    const [showModal, setShowModal] = useState<boolean>(false);
    const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
    const [showIframeModal, setShowIframeModal] = useState<boolean>(false);
    const [selectedLessonForView, setSelectedLessonForView] = useState<Lesson | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
    const [lessonToDelete, setLessonToDelete] = useState<Lesson | null>(null);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [isDeleting, setIsDeleting] = useState<boolean>(false);
    const [formData, setFormData] = useState({
        name: '',
        content: '', // Google Docs URL or YouTube URL
        contentType: 'google_docs' as 'google_docs' | 'youtube',
        lang: 'Eng'
    });

    useEffect(() => {
        if (selectedTopic) {
            fetchLessons();
        }
    }, [selectedTopic]);

    const fetchLessons = async () => {
        if (!selectedTopic) return;

        try {
            setLoading(true);
            const response = await Get(`/topic/lesson/${selectedTopic._id}`);
            if (response.success) {
                // Ensure we have an array of lessons
                const lessonsData = Array.isArray(response.data) ? response.data : [];
                setLessons(lessonsData);
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

        if (!formData.name.trim() || !formData.content.trim() || !selectedTopic) {
            displayMessage('Please provide lesson name and content URL', 'error');
            return;
        }

        // Validate URL based on content type
        if (formData.contentType === 'google_docs' && !formData.content.includes('docs.google.com')) {
            displayMessage('Please provide a valid Google Docs URL', 'error');
            return;
        }

        if (formData.contentType === 'youtube' && !formData.content.includes('youtube.com') && !formData.content.includes('youtu.be')) {
            displayMessage('Please provide a valid YouTube URL', 'error');
            return;
        }

        setIsSubmitting(true);
        try {
            const payload = {
                name: formData.name.trim(),
                content: formData.content.trim(),
                contentType: formData.contentType,
                lang: formData.lang,
                topic: selectedTopic._id
            };

            let response;
            if (editingLesson) {
                response = await Put(`/topic/lesson/${editingLesson._id}`, payload);
            } else {
                response = await Post('/topic/lesson', payload);
            }

            if (response.success) {
                displayMessage(
                    editingLesson ? 'Lesson updated successfully' : 'Lesson created successfully',
                    'success'
                );
                setShowModal(false);
                setEditingLesson(null);
                setFormData({ name: '', content: '', contentType: 'google_docs', lang: 'Eng' });

                // Update local state with response data
                if (editingLesson) {
                    const updated = response.data ?? null;
                    if (updated) {
                        setLessons(prev => prev.map(lesson =>
                            lesson._id === editingLesson._id ? { ...lesson, ...updated } : lesson
                        ));
                    } else {
                        setLessons(prev => prev);
                    }
                } else {
                    // For creating new lesson, add the populated data from backend
                    if (Array.isArray(response.data)) {
                        setLessons(prev => [...response.data, ...prev]);
                    } else if (response.data) {
                        setLessons(prev => [response.data, ...prev]);
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

    const handleEdit = (lesson: Lesson) => {
        setEditingLesson(lesson);
        setFormData({
            name: lesson.name,
            content: lesson.content,
            contentType: lesson.contentType || 'google_docs',
            lang: lesson.lang
        });
        setShowModal(true);
    };

    const handleOpenModal = () => {
        setFormData({ name: '', content: '', contentType: 'google_docs', lang: 'Eng' });
        setEditingLesson(null);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingLesson(null);
        setFormData({ name: '', content: '', contentType: 'google_docs', lang: 'Eng' });
    };

    const handleDeleteClick = (lesson: Lesson) => {
        setLessonToDelete(lesson);
        setShowDeleteModal(true);
    };

    const handleConfirmDelete = async () => {
        if (!lessonToDelete) return;

        setIsDeleting(true);
        try {
            const response = await Delete(`/topic/lesson/${lessonToDelete._id}`);
            if (response.success) {
                displayMessage('Lesson deleted successfully', 'success');
                // Update local state instead of refetching
                setLessons(prev => prev.filter(lesson => lesson._id !== lessonToDelete._id));
            } else {
                displayMessage(response.message, 'error');
            }
        } catch (error: any) {
            displayMessage(error.message, 'error');
        } finally {
            setIsDeleting(false);
            setShowDeleteModal(false);
            setLessonToDelete(null);
        }
    };

    const handleCancelDelete = () => {
        setShowDeleteModal(false);
        setLessonToDelete(null);
    };

    const openGoogleDoc = (url: string) => {
        window.open(url, '_blank');
    };

    const openLessonInIframe = (lesson: Lesson) => {
        setSelectedLessonForView(lesson);
        setShowIframeModal(true);
    };

    const closeIframeModal = () => {
        setShowIframeModal(false);
        setSelectedLessonForView(null);
    };

    const convertToEmbedUrl = (url: string, contentType?: string) => {
        // Handle YouTube URLs
        if (contentType === 'youtube' || url.includes('youtube.com') || url.includes('youtu.be')) {
            let videoId = '';

            if (url.includes('youtube.com/watch?v=')) {
                videoId = url.split('v=')[1].split('&')[0];
            } else if (url.includes('youtu.be/')) {
                videoId = url.split('youtu.be/')[1].split('?')[0];
            } else if (url.includes('youtube.com/embed/')) {
                return url; // Already in embed format
            }

            if (videoId) {
                return `https://www.youtube.com/embed/${videoId}`;
            }
        }

        // Convert Google Docs URL to embeddable format
        if (url.includes('/document/d/')) {
            const match = url.match(/\/document\/d\/([a-zA-Z0-9-_]+)/);
            if (match) {
                return `https://docs.google.com/document/d/${match[1]}/preview`;
            }
        }

        return url;
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
            {/* Header with back button and topic name */}
            {selectedTopic && onBackToTopics && (
                <div className="flex items-center gap-3 mb-4">
                    <button
                        onClick={onBackToTopics}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
                    >
                        <FiChevronRight size={16} className="rotate-180" />
                        Back to Topics
                    </button>
                    <div className="h-4 w-px bg-gray-300"></div>
                    <h3 className="text-lg font-medium text-gray-800">
                        Lessons in {selectedTopic.name}
                    </h3>
                </div>
            )}

            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                    {selectedTopic ? `Lessons in ${selectedTopic.name}` : 'Lesson Management'}
                </h2>
                <button
                    onClick={handleOpenModal}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                    <FiPlus size={20} />
                    Add Lesson
                </button>
            </div>

            {lessons.length === 0 ? (
                <div className="text-center py-12">
                    <FiFileText size={48} className="mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No lessons yet</h3>
                    <p className="text-gray-500 mb-4">Create your first lesson to get started.</p>
                    <button
                        onClick={handleOpenModal}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Add Lesson
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {lessons.filter(lesson => lesson && lesson._id).map((lesson) => (
                        <div key={lesson._id} className="group bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 overflow-hidden">
                            {/* Card Header */}
                            <div
                                className="relative h-32"
                                style={{
                                    background: 'linear-gradient(135deg, #8b5cf6 0%, #a855f7 50%, #c084fc 100%)'
                                }}
                            >
                                <div className="w-full h-full flex items-center justify-center">
                                    <FiFileText className="text-white" size={32} />
                                </div>
                                <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                    <button
                                        onClick={() => handleEdit(lesson)}
                                        className="p-2 bg-violet-600 text-white hover:bg-violet-700 rounded-lg transition-colors"
                                        title="Edit Lesson"
                                    >
                                        <FiEdit2 size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteClick(lesson)}
                                        className="p-2 bg-red-600 text-white hover:bg-red-700 rounded-lg transition-colors"
                                        title="Delete Lesson"
                                    >
                                        <FiTrash2 size={16} />
                                    </button>
                                </div>
                            </div>

                            {/* Card Content */}
                            <div className="p-6">
                                <div className="mb-4">
                                    <h3 className="text-xl font-bold text-gray-900 capitalize mb-2">{lesson.name || 'Untitled Lesson'}</h3>
                                    <p className="text-sm text-gray-600 mb-3">
                                        {selectedTopic?.subject?.name || 'Unknown Subject'} • {selectedTopic?.name || 'Unknown Topic'}
                                    </p>

                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                                            <div className="text-lg font-bold text-gray-900">{lesson.pages || 0}</div>
                                            <div className="text-xs text-gray-500">Pages</div>
                                        </div>
                                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                                            <div className="text-lg font-bold text-gray-900">{lesson.words || 0}</div>
                                            <div className="text-xs text-gray-500">Words</div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                                        <span className="px-2 py-1 bg-violet-100 text-violet-700 rounded-full text-xs font-medium">
                                            {lesson.lang || 'Eng'}
                                        </span>
                                        <span className="text-xs text-gray-400">
                                            {lesson.createdAt ? new Date(lesson.createdAt).toLocaleDateString() : 'Unknown'}
                                        </span>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => lesson.content && openLessonInIframe(lesson)}
                                        className="flex-1 text-white py-2 px-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-1 text-sm"
                                        style={{
                                            background: 'linear-gradient(90deg, #8b5cf6 0%, #a855f7 50%, #c084fc 100%)'
                                        }}
                                        onMouseEnter={(e) => {
                                            (e.target as HTMLButtonElement).style.background = 'linear-gradient(90deg, #7c3aed 0%, #9333ea 50%, #a855f7 100%)';
                                        }}
                                        onMouseLeave={(e) => {
                                            (e.target as HTMLButtonElement).style.background = 'linear-gradient(90deg, #8b5cf6 0%, #a855f7 50%, #c084fc 100%)';
                                        }}
                                        disabled={!lesson.content}
                                    >
                                        <FiEye size={16} />
                                        <span>View</span>
                                    </button>
                                    <button
                                        onClick={() => lesson.content && openGoogleDoc(lesson.content)}
                                        className="flex-1 bg-gray-600 text-white py-2 px-3 rounded-lg font-medium hover:bg-gray-700 transition-all duration-200 flex items-center justify-center gap-1 text-sm"
                                        disabled={!lesson.content}
                                    >
                                        <FiExternalLink size={16} />
                                        <span>Open</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl w-full max-w-2xl shadow-xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <h3 className="text-xl font-bold text-gray-900 mb-4">
                                {editingLesson ? 'Edit Lesson' : 'Add New Lesson'}
                            </h3>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Lesson Name
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Enter lesson name"
                                        disabled={isSubmitting}
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Content Type
                                    </label>
                                    <select
                                        value={formData.contentType}
                                        onChange={(e) => setFormData({ ...formData, contentType: e.target.value as 'google_docs' | 'youtube' })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        disabled={isSubmitting}
                                    >
                                        <option value="google_docs">Google Docs</option>
                                        <option value="youtube">YouTube Video</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        {formData.contentType === 'google_docs' ? 'Google Docs URL' :
                                            formData.contentType === 'youtube' ? 'YouTube URL' : 'Content URL'}
                                    </label>
                                    <input
                                        type="url"
                                        value={formData.content}
                                        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder={
                                            formData.contentType === 'google_docs' ? 'https://docs.google.com/document/d/...' :
                                                'https://www.youtube.com/watch?v=... or https://youtu.be/...'
                                        }
                                        disabled={isSubmitting}
                                        required
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        {formData.contentType === 'google_docs' ? 'Paste the Google Docs URL here. Make sure the document is publicly accessible.' :
                                            'Paste the YouTube video URL here. Supports youtube.com and youtu.be formats.'}
                                    </p>
                                </div>

                                <div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Language
                                        </label>
                                        <select
                                            value={formData.lang}
                                            onChange={(e) => setFormData({ ...formData, lang: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            disabled={isSubmitting}
                                            required
                                        >
                                            <option value="Eng">English</option>
                                            <option value="Fr">French</option>
                                            <option value="Es">Spanish</option>
                                        </select>
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
                                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {isSubmitting && (
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        )}
                                        {isSubmitting ? 'Processing...' : (editingLesson ? 'Update' : 'Create')}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Iframe Modal for Viewing Lessons */}
            {showIframeModal && selectedLessonForView && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl w-full max-w-6xl h-[90vh] shadow-xl flex flex-col">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-200">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">
                                    {selectedLessonForView.name || 'Untitled Lesson'}
                                </h3>
                                <p className="text-sm text-gray-500 mt-1">
                                    {selectedTopic?.subject?.name || 'Unknown Subject'} • {selectedTopic?.name || 'Unknown Topic'}
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => selectedLessonForView.content && openGoogleDoc(selectedLessonForView.content)}
                                    className="flex items-center gap-2 px-3 py-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                    title="Open in New Tab"
                                >
                                    <FiExternalLink size={16} />
                                    Open in New Tab
                                </button>
                                <button
                                    onClick={closeIframeModal}
                                    className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <FiX size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Iframe Content */}
                        <div className="flex-1 p-6">
                            {selectedLessonForView.content ? (
                                <iframe
                                    src={convertToEmbedUrl(selectedLessonForView.content, selectedLessonForView.contentType)}
                                    className="w-full h-full border-0 rounded-lg"
                                    title={selectedLessonForView.name || 'Lesson Content'}
                                    allowFullScreen
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                />
                            ) : (
                                <div className="flex items-center justify-center h-full text-gray-500">
                                    <div className="text-center">
                                        <FiFileText size={48} className="mx-auto mb-4 text-gray-400" />
                                        <p>No content available for this lesson</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
                            <div className="text-sm text-gray-600">
                                <span className="font-medium">Pages:</span> {selectedLessonForView.pages || 0} •
                                <span className="font-medium ml-2">Words:</span> {selectedLessonForView.words || 0} •
                                <span className="font-medium ml-2">Language:</span> {selectedLessonForView.lang || 'Eng'}
                            </div>
                            <button
                                onClick={closeIframeModal}
                                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && lessonToDelete && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
                        <div className="p-6">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                                    <FiAlertTriangle className="text-red-600" size={24} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">Delete Lesson</h3>
                                    <p className="text-sm text-gray-500">This action cannot be undone</p>
                                </div>
                            </div>

                            <div className="mb-6">
                                <p className="text-gray-700 mb-2">
                                    Are you sure you want to delete <span className="font-semibold">"{lessonToDelete.name || 'Untitled Lesson'}"</span>?
                                </p>
                                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                                    <p className="text-sm text-red-700">
                                        <strong>Warning:</strong> This lesson will be permanently removed.
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
                                    {isDeleting ? 'Deleting...' : 'Delete Lesson'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LessonManagement;