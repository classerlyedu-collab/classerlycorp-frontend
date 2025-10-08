import React, { useEffect, useState, useMemo, useRef } from 'react';
import { Navbar, SideDrawer, RichTextEditor } from '../../components';
import { Get, Post, Put, Delete } from '../../config/apiMethods';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { RouteName } from '../../routes/RouteNames';
import { displayMessage } from '../../config';
import DOMPurify from 'dompurify';

interface Thread {
    _id: string;
    title: string;
    message: string;
    lesson: { _id: string; name: string };
    subject: { _id: string; name: string };
    topic: { _id: string; name: string };
    createdBy: { _id: string; fullName: string; image?: string };
    messages: Message[];
    createdAt: string;
}

interface Message {
    _id: string;
    text: string;
    sender: { _id: string; fullName: string; image?: string };
    parent?: Message;
    createdAt: string;
}

const Discussion: React.FC = () => {

    const [threads, setThreads] = useState<Thread[]>([]);
    const [loading, setLoading] = useState(false);

    const [role, setRole] = useState<string | null>(null);
    const [lesson, setLesson] = useState<any>(null);
    const [topic, setTopic] = useState<any>(null);
    const [subject, setSubject] = useState<any>(null);
    const [showComposer, setShowComposer] = useState(false);
    const [title, setTitle] = useState('');
    const [text, setText] = useState('');
    const [creating, setCreating] = useState(false);
    const [editingThread, setEditingThread] = useState<string | null>(null);
    const [editingMessage, setEditingMessage] = useState<string | null>(null);
    const [replyToMessage, setReplyToMessage] = useState<string | null>(null);
    const [replyText, setReplyText] = useState('');
    const [replying, setReplying] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<{ type: 'thread' | 'message', id: string, title?: string } | null>(null);



    const { subjectId, topicId, lessonId } = useParams<{ subjectId: string; topicId: string; lessonId: string }>();
    const navigate = useNavigate();

    // Helper function to strip HTML tags for validation
    const stripHtml = (html: string) => {
        const tmp = document.createElement('DIV');
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || '';
    };

    // Helper function to sanitize HTML content
    const sanitizeHtml = (html: string) => {
        return DOMPurify.sanitize(html, {
            ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 's', 'h1', 'h2', 'h3', 'ol', 'ul', 'li', 'a', 'img', 'iframe', 'video', 'source'],
            ALLOWED_ATTR: ['href', 'target', 'rel', 'class', 'style', 'src', 'alt', 'width', 'height', 'frameborder', 'allowfullscreen', 'allow', 'controls', 'type', 'poster', 'preload'],
            ALLOWED_STYLES: ['color', 'background-color', 'max-width'],
            ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|cid|xmpp|data):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i
        });
    };

    const canCreate = title.trim().length > 0 && stripHtml(text).trim().length > 0;
    const currentUserId = useMemo(() => {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        return user?._id || user?.id;
    }, []);


    useEffect(() => {
        const ctxUser = JSON.parse(localStorage.getItem('user') || '{}');
        setRole(ctxUser?.userType || null);
    }, []);

    useEffect(() => {
        if (!role || !lessonId) return;
        // Always load threads on initial load (when lessonId changes)
        loadThreads();
        loadLessonDetails();
    }, [role, lessonId]);

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            if (!target.closest('.dropdown-container')) {
                const dropdowns = document.querySelectorAll('.dropdown-container .absolute');
                dropdowns.forEach(dropdown => {
                    if (!dropdown.classList.contains('hidden')) {
                        dropdown.classList.add('hidden');
                    }
                });
            }
        };

        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    const loadThreads = () => {
        if (!lessonId) return;
        setLoading(true);

        Get(`/discussions/lessons/${lessonId}/threads`)
            .then((d) => {
                if (d.success) {
                    const threadData = Array.isArray(d.data) ? d.data : [];
                    // Ensure each thread has a messages array
                    const threadsWithMessages = threadData.map((thread: any) => ({
                        ...thread,
                        messages: thread.messages || []
                    }));
                    setThreads(threadsWithMessages);
                } else {
                    displayMessage(d.message || 'Failed to load discussions', 'error');
                }
            })
            .catch(() => displayMessage('Failed to load discussions', 'error'))
            .finally(() => setLoading(false));
    };

    const loadLessonDetails = async () => {
        if (!subjectId || !topicId || !lessonId) return;

        try {
            // Load subject
            const subjectRes = await Get('/discussions/subjects');
            if (subjectRes.success) {
                const subjectData = subjectRes.data?.find((s: any) => s._id === subjectId);
                setSubject(subjectData || null);
            }

            // Load topic
            const topicRes = await Get(`/discussions/subjects/${subjectId}/topics`);
            if (topicRes.success) {
                const topicData = topicRes.data?.find((t: any) => t._id === topicId);
                setTopic(topicData || null);
            }

            // Load lesson
            const lessonRes = await Get(`/discussions/topics/${topicId}/lessons`);
            if (lessonRes.success) {
                const lessonData = lessonRes.data?.find((l: any) => l._id === lessonId);
                setLesson(lessonData || null);
            }
        } catch (error) {
            console.error('Failed to load lesson details:', error);
        }
    };

    const createThread = async () => {
        if (!canCreate || !lessonId) return;
        setCreating(true);

        const newThread = {
            _id: `temp-${Date.now()}`,
            title: title.trim(),
            message: text.trim(),
            lesson: { _id: lessonId, name: lesson?.name || 'Lesson' },
            subject: { _id: subjectId || '', name: subject?.name || 'Subject' },
            topic: { _id: topicId || '', name: topic?.name || 'Topic' },
            createdBy: { _id: currentUserId, fullName: JSON.parse(localStorage.getItem('user') || '{}')?.fullName || 'You' },
            messages: [],
            createdAt: new Date().toISOString()
        };

        // Add optimistically
        setThreads(prev => [newThread, ...prev]);
        setTitle('');
        setText('');
        setShowComposer(false);

        try {
            const res = await Post(`/discussions/lessons/${lessonId}/threads`, {
                title: newThread.title,
                text: newThread.message
            });

            if (res.success) {
                // Replace temp thread with real one, ensuring messages array exists
                const realThread = {
                    ...res.data,
                    messages: res.data.messages || []
                };
                setThreads(prev => prev.map(thread =>
                    thread._id === newThread._id ? realThread : thread
                ));
                displayMessage('Discussion created successfully', 'success');
            } else {
                // Remove on error
                setThreads(prev => prev.filter(thread => thread._id !== newThread._id));
                displayMessage(res.message || 'Failed to create discussion', 'error');
            }
        } catch (error) {
            // Remove on error
            setThreads(prev => prev.filter(thread => thread._id !== newThread._id));
            displayMessage('Failed to create discussion', 'error');
        } finally {
            setCreating(false);
        }
    };

    const createMessage = async (threadId: string, parentId?: string) => {
        if (!replyText.trim()) return;
        setReplying(true);

        const newMessage = {
            _id: `temp-msg-${Date.now()}`,
            text: replyText.trim(),
            sender: { _id: currentUserId, fullName: JSON.parse(localStorage.getItem('user') || '{}')?.fullName || 'You' },
            parent: parentId ? { _id: parentId } as any : undefined,
            createdAt: new Date().toISOString()
        };

        // Add optimistically
        setThreads(prev => prev.map(thread =>
            thread._id === threadId
                ? { ...thread, messages: [...thread.messages, newMessage] }
                : thread
        ));
        setReplyText('');
        setReplyToMessage(null);

        try {
            const res = await Post(`/discussions/threads/${threadId}/messages`, {
                text: newMessage.text,
                parentId: parentId || null
            });

            if (res.success) {
                // Replace temp message with real one
                setThreads(prev => prev.map(thread =>
                    thread._id === threadId
                        ? {
                            ...thread, messages: thread.messages.map(msg =>
                                msg._id === newMessage._id ? res.data : msg
                            )
                        }
                        : thread
                ));
                displayMessage('Reply posted successfully', 'success');
            } else {
                // Remove on error
                setThreads(prev => prev.map(thread =>
                    thread._id === threadId
                        ? { ...thread, messages: thread.messages.filter(msg => msg._id !== newMessage._id) }
                        : thread
                ));
                displayMessage(res.message || 'Failed to post reply', 'error');
            }
        } catch (error) {
            // Remove on error
            setThreads(prev => prev.map(thread =>
                thread._id === threadId
                    ? { ...thread, messages: thread.messages.filter(msg => msg._id !== newMessage._id) }
                    : thread
            ));
            displayMessage('Failed to post reply', 'error');
        } finally {
            setReplying(false);
        }
    };

    const updateThread = async (threadId: string) => {
        if (!title.trim()) return;
        setCreating(true);

        // Update optimistically
        setThreads(prev => prev.map(thread =>
            thread._id === threadId
                ? { ...thread, title: title.trim(), message: text.trim() }
                : thread
        ));
        setTitle('');
        setText('');
        setEditingThread(null);
        setShowComposer(false);

        try {
            const res = await Put(`/discussions/threads/${threadId}`, {
                title: title.trim(),
                message: text.trim()
            });

            if (res.success) {
                // Update with real data, ensuring messages array exists
                const updatedThread = {
                    ...res.data,
                    messages: res.data.messages || []
                };
                setThreads(prev => prev.map(thread =>
                    thread._id === threadId ? updatedThread : thread
                ));
                displayMessage('Discussion updated successfully', 'success');
            } else {
                // Revert on error
                loadThreads();
                displayMessage(res.message || 'Failed to update discussion', 'error');
            }
        } catch (error) {
            // Revert on error
            loadThreads();
            displayMessage('Failed to update discussion', 'error');
        } finally {
            setCreating(false);
        }
    };

    const updateMessage = async (messageId: string) => {
        if (!replyText.trim()) return;
        setReplying(true);

        // Check if this is a thread message (editing the initial post)
        const thread = threads.find(t => t._id === messageId);
        if (thread) {
            // Update thread message optimistically
            setThreads(prev => prev.map(t =>
                t._id === messageId
                    ? { ...t, message: replyText.trim() }
                    : t
            ));
        } else {
            // Update regular message optimistically
            setThreads(prev => prev.map(t => ({
                ...t,
                messages: t.messages.map(msg =>
                    msg._id === messageId
                        ? { ...msg, text: replyText.trim() }
                        : msg
                )
            })));
        }

        setReplyText('');
        setEditingMessage(null);

        try {
            if (thread) {
                // Update thread message
                const res = await Put(`/discussions/threads/${messageId}`, {
                    message: replyText.trim()
                });

                if (res.success) {
                    // Update with real data, ensuring messages array exists
                    const updatedThread = {
                        ...res.data,
                        messages: res.data.messages || []
                    };
                    setThreads(prev => prev.map(t =>
                        t._id === messageId ? updatedThread : t
                    ));
                    displayMessage('Thread updated successfully', 'success');
                } else {
                    // Revert on error
                    loadThreads();
                    displayMessage(res.message || 'Failed to update thread message', 'error');
                }
            } else {
                // Update regular message
                const res = await Put(`/discussions/messages/${messageId}`, {
                    text: replyText.trim()
                });

                if (res.success) {
                    // Update with real data
                    setThreads(prev => prev.map(t => ({
                        ...t,
                        messages: t.messages.map(msg =>
                            msg._id === messageId ? res.data : msg
                        )
                    })));
                    displayMessage('Message updated successfully', 'success');
                } else {
                    // Revert on error
                    loadThreads();
                    displayMessage(res.message || 'Failed to update message', 'error');
                }
            }
        } catch (error) {
            // Revert on error
            loadThreads();
            displayMessage('Failed to update message', 'error');
        } finally {
            setReplying(false);
        }
    };

    const deleteThread = async (threadId: string) => {
        setDeleting(true);

        // Remove optimistically
        setThreads(prev => prev.filter(thread => thread._id !== threadId));

        try {
            const res = await Delete(`/discussions/threads/${threadId}`);

            if (res.success) {
                displayMessage('Discussion deleted successfully', 'success');
            } else {
                // Revert on error
                loadThreads();
                displayMessage(res.message || 'Failed to delete discussion', 'error');
            }
        } catch (error) {
            // Revert on error
            loadThreads();
            displayMessage('Failed to delete discussion', 'error');
        } finally {
            setDeleting(false);
        }
    };

    const deleteMessage = async (messageId: string) => {
        setDeleting(true);

        // Remove optimistically
        setThreads(prev => prev.map(thread => ({
            ...thread,
            messages: thread.messages.filter(msg => msg._id !== messageId)
        })));

        try {
            const res = await Delete(`/discussions/messages/${messageId}`);

            if (res.success) {
                displayMessage('Message deleted successfully', 'success');
            } else {
                // Revert on error
                loadThreads();
                displayMessage(res.message || 'Failed to delete message', 'error');
            }
        } catch (error) {
            // Revert on error
            loadThreads();
            displayMessage('Failed to delete message', 'error');
        } finally {
            setDeleting(false);
        }
    };

    const handleReplyClick = (messageId: string) => {
        setReplyToMessage(messageId);
        setReplyText('');
        setEditingMessage(null);

        // Smooth scroll to reply input after a short delay
        setTimeout(() => {
            const replyContainer = document.querySelector(`[data-reply-to="${messageId}"]`);
            if (replyContainer) {
                replyContainer.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                });
                // Auto-focus the rich text editor
                const quillEditor = replyContainer.querySelector('.ql-editor');
                if (quillEditor) {
                    (quillEditor as HTMLElement).focus();
                }
            }
        }, 100);
    };

    const handleDeleteClick = (type: 'thread' | 'message', id: string, title?: string) => {
        setDeleteTarget({ type, id, title });
        setShowDeleteDialog(true);
    };

    const confirmDelete = async () => {
        if (!deleteTarget) return;

        if (deleteTarget.type === 'thread') {
            await deleteThread(deleteTarget.id);
        } else {
            await deleteMessage(deleteTarget.id);
        }

        setShowDeleteDialog(false);
        setDeleteTarget(null);
    };

    const cancelDelete = () => {
        setShowDeleteDialog(false);
        setDeleteTarget(null);
    };

    const isAuthor = (item: any) => {
        return item.createdBy?._id === currentUserId || item.sender?._id === currentUserId;
    };

    const toTitleCase = (str: string) => String(str || '')
        .toLowerCase()
        .split(' ')
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');

    const formatWhen = (iso: string) => {
        try {
            const d = new Date(iso);
            return d.toLocaleString();
        } catch {
            return 'Unknown time';
        }
    };

    const BreadcrumbSkeleton = () => (
        <div className="mb-4">
            <nav className="text-sm">
                <div className="animate-pulse flex items-center gap-2">
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                    <span className="text-slate-300">/</span>
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                    <span className="text-slate-300">/</span>
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                    <span className="text-slate-300">/</span>
                    <div className="h-4 bg-gray-200 rounded w-16"></div>
                </div>
            </nav>
        </div>
    );

    const DiscussionSkeleton = () => (
        <div className="space-y-6">
            {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6">
                    {/* Thread Post Skeleton */}
                    <div className="border border-slate-200 rounded-xl p-6 bg-white shadow-sm">
                        <div className="flex items-start gap-4">
                            <div className="flex-shrink-0">
                                <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex-1">
                                        <div className="animate-pulse">
                                            <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                                            <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                                        </div>
                                    </div>
                                    <div className="w-8 h-8 bg-gray-200 rounded-lg animate-pulse"></div>
                                </div>
                                <div className="animate-pulse">
                                    <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                                    <div className="h-4 bg-gray-200 rounded w-5/6 mb-2"></div>
                                    <div className="h-4 bg-gray-200 rounded w-4/6 mb-4"></div>
                                </div>
                                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                                    <div className="h-8 bg-gray-200 rounded-lg w-40 animate-pulse"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Reply Messages Skeleton */}
                    <div className="ml-6 mt-4 border-l-2 border-slate-200 pl-4 space-y-4">
                        {[1, 2].map((j) => (
                            <div key={j} className="bg-slate-50 rounded-lg p-4">
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <div className="w-5 h-5 bg-gray-200 rounded-full animate-pulse"></div>
                                        <div className="animate-pulse">
                                            <div className="h-4 bg-gray-200 rounded w-24 mb-1"></div>
                                            <div className="h-3 bg-gray-200 rounded w-16"></div>
                                        </div>
                                    </div>
                                    <div className="w-6 h-6 bg-gray-200 rounded animate-pulse"></div>
                                </div>
                                <div className="animate-pulse">
                                    <div className="h-4 bg-gray-200 rounded w-full mb-1"></div>
                                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );

    return (
        <div className="flex flex-row w-screen h-screen max-w-[2200px] justify-center items-center mx-auto bg-gradient-to-br from-slate-50 to-slate-100 flex-wrap">
            <div className="lg:w-1/6 h-full bg-transparent transition-all delay-100 flex">
                <SideDrawer />
            </div>
            <div className="flex flex-col h-screen w-screen lg:w-10/12 px-4 py-6 xl:pr-16 bg-transparent">
                <div className="w-full h-fit mb-8 flex">
                    <Navbar title="Discussion" hideSearchBar />
                </div>

                <div className="max-w-6xl mx-auto w-full">


                    {/* Header */}
                    <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-2xl shadow-2xl p-8 mb-6 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10"></div>
                        <div className="relative z-10 flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-bold text-white">Discussions</h1>
                                <p className="text-slate-300">Discuss {toTitleCase(lesson?.name || 'this lesson')} with your team</p>
                            </div>
                            <button
                                onClick={() => setShowComposer(true)}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-lg hover:shadow-xl"
                            >
                                Create New Discussion
                            </button>
                        </div>
                    </div>

                    {/* Breadcrumbs */}
                    {loading ? (
                        <BreadcrumbSkeleton />
                    ) : (
                        <div className="mb-4">
                            <nav className="text-sm text-slate-500">
                                <Link to={RouteName.DISCUSSION} className="hover:underline">Discussions</Link>
                                <span className="mx-2">/</span>
                                <Link to={`/Discussion/${subjectId}`} className="hover:underline">
                                    {toTitleCase(subject?.name || 'Subject')}
                                </Link>
                                <span className="mx-2">/</span>
                                <Link to={`/Discussion/${subjectId}/${topicId}`} className="hover:underline">
                                    {toTitleCase(topic?.name || 'Topic')}
                                </Link>
                                <span className="mx-2">/</span>
                                <span className="text-slate-700 font-medium">
                                    {toTitleCase(lesson?.name || 'Lesson')}
                                </span>
                            </nav>
                        </div>
                    )}

                    {/* Discussion Feed */}
                    <div className="space-y-6">
                        {loading ? (
                            <DiscussionSkeleton />
                        ) : threads.length === 0 ? (
                            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-16 text-center">
                                <div className="max-w-lg mx-auto">
                                    {/* Icon */}
                                    <div className="w-24 h-24 mx-auto mb-8 bg-gradient-to-br from-orange-100 to-red-100 rounded-full flex items-center justify-center">
                                        <svg className="w-12 h-12 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                        </svg>
                                    </div>

                                    {/* Title */}
                                    <h3 className="text-2xl font-bold text-slate-800 mb-4">No Discussions Yet</h3>

                                    {/* Description */}
                                    <p className="text-slate-600 mb-8 leading-relaxed text-lg">
                                        Be the first to start a discussion about this lesson!
                                        Share your thoughts, ask questions, or engage with your team.
                                    </p>

                                    {/* Action Button */}
                                    <button
                                        onClick={() => setShowComposer(true)}
                                        className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                        </svg>
                                        Start First Discussion
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {threads.map((thread) => (
                                    <div key={thread._id} className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6">
                                        {/* Thread Post (Title + Message Combined) */}
                                        <div className="border border-slate-200 rounded-xl p-6 bg-white shadow-sm">
                                            <div className="flex items-start gap-4">
                                                <div className="flex-shrink-0">
                                                    {thread.createdBy.image ? (
                                                        <img
                                                            src={thread.createdBy.image}
                                                            alt={thread.createdBy.fullName}
                                                            className="w-10 h-10 rounded-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-sm font-semibold">
                                                            {thread.createdBy.fullName?.charAt(0)?.toUpperCase() || 'U'}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between mb-3">
                                                        <div className="flex-1">
                                                            <h3 className="text-xl font-bold text-slate-900 mb-2 leading-tight">
                                                                {thread.title}
                                                            </h3>
                                                            <div className="flex items-center gap-2 text-sm text-slate-500 mb-4">
                                                                <span className="font-medium text-slate-700">{thread.createdBy.fullName}</span>
                                                                <span>•</span>
                                                                <span>{formatWhen(thread.createdAt)}</span>
                                                            </div>
                                                        </div>
                                                        {isAuthor(thread) && (
                                                            <div className="relative dropdown-container">
                                                                <button
                                                                    className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        const dropdown = e.currentTarget.nextElementSibling as HTMLElement;
                                                                        if (dropdown.classList.contains('hidden')) {
                                                                            dropdown.classList.remove('hidden');
                                                                        } else {
                                                                            dropdown.classList.add('hidden');
                                                                        }
                                                                    }}
                                                                >
                                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                                                                    </svg>
                                                                </button>
                                                                <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-10 hidden">
                                                                    <button
                                                                        onClick={(e) => {
                                                                            setTitle(thread.title);
                                                                            setText(thread.message);
                                                                            setEditingThread(thread._id);
                                                                            setShowComposer(true);
                                                                            // Hide dropdown
                                                                            const dropdown = e.currentTarget.closest('.dropdown-container')?.querySelector('.absolute') as HTMLElement;
                                                                            if (dropdown) dropdown.classList.add('hidden');
                                                                        }}
                                                                        className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                                                                    >
                                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                                        </svg>
                                                                        Edit Thread
                                                                    </button>
                                                                    <button
                                                                        onClick={(e) => {
                                                                            handleDeleteClick('thread', thread._id, thread.title);
                                                                            // Hide dropdown
                                                                            const dropdown = e.currentTarget.closest('.dropdown-container')?.querySelector('.absolute') as HTMLElement;
                                                                            if (dropdown) dropdown.classList.add('hidden');
                                                                        }}
                                                                        disabled={deleting}
                                                                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 disabled:opacity-50"
                                                                    >
                                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                        </svg>
                                                                        Delete Thread
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="prose prose-slate max-w-none">
                                                        <div
                                                            className="text-slate-700 leading-relaxed text-base mb-4"
                                                            dangerouslySetInnerHTML={{ __html: sanitizeHtml(thread.message) }}
                                                        />
                                                    </div>
                                                    <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                                                        <button
                                                            onClick={() => handleReplyClick(thread._id)}
                                                            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                                                            </svg>
                                                            Reply to this discussion
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Reply Messages - Indented under the thread */}
                                        <div className="ml-6 mt-4 border-l-2 border-slate-200 pl-4 space-y-4">
                                            {(thread.messages || []).map((message) => (
                                                <div key={message._id} className={`${message.parent ? 'ml-8 border-l-2 border-slate-200 pl-4' : ''}`}>
                                                    <div className="bg-slate-50 rounded-lg p-4">
                                                        <div className="flex items-start justify-between mb-2">
                                                            <div className="flex items-center gap-2">
                                                                {message.sender.image ? (
                                                                    <img
                                                                        src={message.sender.image}
                                                                        alt={message.sender.fullName}
                                                                        className="w-5 h-5 rounded-full object-cover"
                                                                    />
                                                                ) : (
                                                                    <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-semibold">
                                                                        {message.sender.fullName?.charAt(0)?.toUpperCase() || 'U'}
                                                                    </div>
                                                                )}
                                                                <span className="font-medium text-slate-800">
                                                                    {message.sender.fullName}
                                                                </span>
                                                                <span className="text-slate-500 text-sm">
                                                                    {formatWhen(message.createdAt)}
                                                                </span>
                                                            </div>
                                                            {isAuthor(message) && (
                                                                <div className="relative dropdown-container">
                                                                    <button
                                                                        className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition-colors"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            const dropdown = e.currentTarget.nextElementSibling as HTMLElement;
                                                                            if (dropdown.classList.contains('hidden')) {
                                                                                dropdown.classList.remove('hidden');
                                                                            } else {
                                                                                dropdown.classList.add('hidden');
                                                                            }
                                                                        }}
                                                                    >
                                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                                                                        </svg>
                                                                    </button>
                                                                    <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-10 hidden">
                                                                        <button
                                                                            onClick={(e) => {
                                                                                setReplyText(message.text);
                                                                                setEditingMessage(message._id);
                                                                                // Hide dropdown
                                                                                const dropdown = e.currentTarget.closest('.dropdown-container')?.querySelector('.absolute') as HTMLElement;
                                                                                if (dropdown) dropdown.classList.add('hidden');
                                                                            }}
                                                                            className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                                                                        >
                                                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                                            </svg>
                                                                            Edit
                                                                        </button>
                                                                        <button
                                                                            onClick={(e) => {
                                                                                handleDeleteClick('message', message._id);
                                                                                // Hide dropdown
                                                                                const dropdown = e.currentTarget.closest('.dropdown-container')?.querySelector('.absolute') as HTMLElement;
                                                                                if (dropdown) dropdown.classList.add('hidden');
                                                                            }}
                                                                            disabled={deleting}
                                                                            className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 disabled:opacity-50"
                                                                        >
                                                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                            </svg>
                                                                            Delete
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div
                                                            className="text-slate-700"
                                                            dangerouslySetInnerHTML={{ __html: sanitizeHtml(message.text) }}
                                                        />
                                                    </div>

                                                    {/* Reply to message input */}
                                                    {replyToMessage === message._id && (
                                                        <div className="mt-4 bg-slate-50 rounded-lg p-4">
                                                            <RichTextEditor
                                                                value={replyText}
                                                                onChange={setReplyText}
                                                                placeholder="Write your reply..."
                                                                className="border border-slate-300 rounded-lg"
                                                            />
                                                            <div className="flex items-center justify-end gap-2 mt-3">
                                                                <button
                                                                    onClick={() => {
                                                                        setReplyToMessage(null);
                                                                        setReplyText('');
                                                                    }}
                                                                    className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-700"
                                                                >
                                                                    Cancel
                                                                </button>
                                                                <button
                                                                    onClick={() => createMessage(thread._id, message._id)}
                                                                    disabled={!stripHtml(replyText).trim() || replying}
                                                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white text-sm font-medium rounded-lg transition-colors"
                                                                >
                                                                    {replying ? 'Posting...' : 'Post Reply'}
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>

                                        {/* Reply to thread input */}
                                        {replyToMessage === thread._id && (
                                            <div className="mt-4 bg-slate-50 rounded-lg p-4" data-reply-to={thread._id}>
                                                <RichTextEditor
                                                    value={replyText}
                                                    onChange={setReplyText}
                                                    placeholder="Write a reply to this discussion..."
                                                    className="border border-slate-300 rounded-lg"
                                                />
                                                <div className="flex items-center justify-end gap-2 mt-3">
                                                    <button
                                                        onClick={() => {
                                                            setReplyText('');
                                                            setReplyToMessage(null);
                                                        }}
                                                        className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-700"
                                                    >
                                                        Cancel
                                                    </button>
                                                    <button
                                                        onClick={() => createMessage(thread._id)}
                                                        disabled={!stripHtml(replyText).trim() || replying}
                                                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white text-sm font-medium rounded-lg transition-colors"
                                                    >
                                                        {replying ? 'Posting...' : 'Post Reply'}
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Create/Edit Discussion Modal */}
            {showComposer && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-slate-200">
                            <h2 className="text-xl font-bold text-slate-800">
                                {editingThread ? 'Edit Discussion' : 'Create New Discussion'}
                            </h2>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Title</label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Enter discussion title..."
                                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Message</label>
                                <RichTextEditor
                                    value={text}
                                    onChange={setText}
                                    placeholder="Write your message..."
                                    className="border border-slate-300 rounded-lg"
                                />
                            </div>
                        </div>
                        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-4">
                            <button
                                onClick={() => {
                                    setShowComposer(false);
                                    setEditingThread(null);
                                    setTitle('');
                                    setText('');
                                }}
                                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-700"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    if (editingThread) {
                                        updateThread(editingThread);
                                    } else {
                                        createThread();
                                    }
                                }}
                                disabled={!canCreate || creating}
                                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white text-sm font-medium rounded-lg transition-colors"
                            >
                                {creating ? 'Creating...' : editingThread ? 'Update Discussion' : 'Create Discussion'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Message Modal */}
            {editingMessage && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl">
                        <div className="p-6 border-b border-slate-200">
                            <h2 className="text-xl font-bold text-slate-800">Edit Message</h2>
                        </div>
                        <div className="p-6">
                            <RichTextEditor
                                value={replyText}
                                onChange={setReplyText}
                                placeholder="Write your message..."
                                className="border border-slate-300 rounded-lg"
                            />
                        </div>
                        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-4">
                            <button
                                onClick={() => {
                                    setEditingMessage(null);
                                    setReplyText('');
                                }}
                                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-700"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => updateMessage(editingMessage)}
                                disabled={!stripHtml(replyText).trim() || replying}
                                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white text-sm font-medium rounded-lg transition-colors"
                            >
                                {replying ? 'Updating...' : 'Update Message'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Dialog */}
            {showDeleteDialog && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
                        <div className="p-6">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-slate-900">
                                        Delete {deleteTarget?.type === 'thread' ? 'Discussion' : 'Message'}
                                    </h3>
                                    <p className="text-sm text-slate-500">
                                        This action cannot be undone
                                    </p>
                                </div>
                            </div>

                            <div className="mb-6">
                                <p className="text-slate-700">
                                    {deleteTarget?.type === 'thread'
                                        ? `Are you sure you want to delete the discussion "${deleteTarget.title}"? This will also delete all replies.`
                                        : 'Are you sure you want to delete this message?'
                                    }
                                </p>
                            </div>

                            <div className="flex items-center justify-end gap-3">
                                <button
                                    onClick={cancelDelete}
                                    disabled={deleting}
                                    className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    disabled={deleting}
                                    className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
                                >
                                    {deleting ? (
                                        <>
                                            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Deleting...
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                            Delete
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Discussion;