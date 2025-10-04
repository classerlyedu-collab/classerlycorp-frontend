import React, { useEffect, useMemo, useState } from 'react';
import { Navbar, SideDrawer } from '../../components';
import { Get, Post, Put, Delete } from '../../config/apiMethods';
import { displayMessage } from '../../config';
import { UseStateContext } from '../../context/ContextProvider';

interface FeedItem {
    _id: string;
    text: string;
    sender: any;
    createdAt: string;
    thread: { _id: string; title: string; subject?: any; topic?: any; lesson?: any };
    parent?: { _id: string };
    createdBy?: string; // For author checks
}

const Discussion: React.FC = () => {
    const { role } = UseStateContext();
    const token = useMemo(() => localStorage.getItem('token') || '', []);

    const [feed, setFeed] = useState<FeedItem[]>([]);
    const [loading, setLoading] = useState(false);

    // Composer state
    const [title, setTitle] = useState('');
    const [text, setText] = useState('');
    const [subject, setSubject] = useState<string | null>(null);
    const [topic, setTopic] = useState<string | null>(null);
    const [lesson, setLesson] = useState<string | null>(null);
    const [subjects, setSubjects] = useState<any[]>([]);
    const [topics, setTopics] = useState<any[]>([]);
    const [lessons, setLessons] = useState<any[]>([]);
    const [creating, setCreating] = useState(false);
    const [showComposer, setShowComposer] = useState(false);
    const [editing, setEditing] = useState(false);
    // Feed UX enhancements
    const [openReplies, setOpenReplies] = useState<Record<string, boolean>>({});

    // Edit/Delete state
    const [editingItem, setEditingItem] = useState<string | null>(null);
    const [editText, setEditText] = useState('');
    const [showDropdown, setShowDropdown] = useState<string | null>(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingThread, setEditingThread] = useState<any>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<FeedItem | null>(null);
    const [deleting, setDeleting] = useState(false);

    const canCreate = title.trim().length > 0 && text.trim().length > 0;
    const currentUserId = useMemo(() => {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        return user?._id || user?.id;
    }, []);

    const loadFeed = () => {
        setLoading(true);
        Get('/discussions/feed')
            .then((d) => {
                if (d.success) setFeed(Array.isArray(d.data) ? d.data : []);
                else displayMessage(d.message || 'Failed to load feed', 'error');
            })
            .catch(() => displayMessage('Failed to load feed', 'error'))
            .finally(() => setLoading(false));
    };

    useEffect(() => { loadFeed(); }, []);

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            if (!target.closest('.dropdown-container')) {
                setShowDropdown(null);
            }
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    // Lightweight polling to keep feed fresh without sockets
    useEffect(() => {
        const id = window.setInterval(() => {
            Get('/discussions/feed').then((d) => {
                if (d.success) setFeed(Array.isArray(d.data) ? d.data : []);
            }).catch(() => { });
        }, 15000);
        return () => window.clearInterval(id);
    }, []);

    // Load subject list for HR-Admin/Employee when needed
    useEffect(() => {
        if (role === 'HR-Admin') {
            Get('/hr-admin/mysubjects').then((d) => {
                if (d.success) setSubjects(d.data || []);
            }).catch(() => { });
        } else if (role === 'Employee') {
            Get('/employee/mysubjects').then((d) => {
                if (d.success) setSubjects(d.data || []);
            }).catch(() => { });
        }
    }, [role]);

    useEffect(() => {
        if (subject) {
            Get(`/topic/simple/subject/${subject}`).then((d) => {
                if (d.success) setTopics(d.data || []); else setTopics([]);
            }).catch(() => setTopics([]));
        } else {
            setTopics([]);
            setTopic(null);
            setLessons([]);
            setLesson(null);
        }
    }, [subject]);

    useEffect(() => {
        if (topic) {
            Get(`/topic/lesson/simple/${topic}`).then((d) => {
                if (d.success) setLessons(d.data || []); else setLessons([]);
            }).catch(() => setLessons([]));
        } else {
            setLessons([]);
            setLesson(null);
        }
    }, [topic]);

    const createPost = async () => {
        if (!canCreate) return;
        setCreating(true);

        // optimistic add at top
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        const optimisticId = `tmp-${Date.now()}`;
        const optimistic: FeedItem = {
            _id: optimisticId,
            text: text.trim(),
            sender: { fullName: currentUser?.fullName, image: currentUser?.image },
            createdAt: new Date().toISOString(),
            thread: {
                _id: '',
                title: title.trim(),
                subject: subjects.find(s => s._id === subject),
                topic: topics.find(t => t._id === topic),
                lesson: lessons.find(l => l._id === lesson)
            }
        } as any;
        setFeed(prev => [optimistic, ...prev]);

        try {
            const response = await Post('/discussions/threads', {
                title: title.trim(),
                text: text.trim(),
                subject: subject || undefined,
                topic: topic || undefined,
                lesson: lesson || undefined
            });

            if (response.success) {
                setTitle('');
                setText('');
                setSubject(null);
                setTopic(null);
                setLesson(null);
                setShowComposer(false);
                // Silent refresh to ensure data consistency
                Get('/discussions/feed').then((r) => {
                    if (r.success) setFeed(Array.isArray(r.data) ? r.data : []);
                }).catch(() => { });
            } else {
                displayMessage(response.message || 'Failed to post', 'error');
                // Rollback on error
                setFeed(prev => prev.filter(i => i._id !== optimisticId));
            }
        } catch (error) {
            displayMessage('Failed to post', 'error');
            // Rollback on error
            setFeed(prev => prev.filter(i => i._id !== optimisticId));
        } finally {
            setCreating(false);
        }
    };

    // Reply support
    const [replyText, setReplyText] = useState('');
    const [replyToId, setReplyToId] = useState<string | null>(null);

    const startReply = (postId: string) => {
        setReplyToId(postId);
        setReplyText('');

        // Auto-scroll to reply input after a short delay to ensure it's rendered
        setTimeout(() => {
            const replyInput = document.getElementById(`reply-input-${postId}`);
            if (replyInput) {
                // Get the element's position relative to the viewport
                const elementRect = replyInput.getBoundingClientRect();
                const absoluteElementTop = elementRect.top + window.pageYOffset;
                const middle = absoluteElementTop - (window.innerHeight / 2);

                // Smooth scroll to the element
                window.scrollTo({
                    top: middle,
                    behavior: 'smooth'
                });

                // Focus the input after scrolling completes
                setTimeout(() => {
                    const input = replyInput.querySelector('input');
                    if (input) {
                        input.focus();
                    }
                }, 500); // Wait for scroll animation to complete
            }
        }, 150);
    };

    const sendReply = (post: FeedItem) => {
        if (!replyText.trim() || !post?.thread?._id) return;
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        const body = { text: replyText.trim(), parent: post._id } as any;

        // optimistic insert after parent
        const optimistic: FeedItem = {
            _id: `tmp-r-${Date.now()}`,
            text: replyText.trim(),
            sender: { fullName: currentUser?.fullName, image: currentUser?.image },
            createdAt: new Date().toISOString(),
            thread: post.thread,
            parent: { _id: post._id }
        } as any;

        setReplyText('');
        setReplyToId(null);
        setFeed(prev => {
            // place reply right after last existing reply of this parent
            const copy = prev.slice();
            const parentIndex = copy.findIndex(i => i._id === post._id);
            if (parentIndex === -1) return prev;
            // find subsequent items that are replies to this parent
            let insertIndex = parentIndex + 1;
            while (insertIndex < copy.length && copy[insertIndex]?.parent?._id === post._id) {
                insertIndex++;
            }
            copy.splice(insertIndex, 0, optimistic);
            return copy;
        });

        Post(`/discussions/threads/${post.thread._id}/messages`, body)
            .then((d) => {
                if (!d.success) {
                    displayMessage(d.message || 'Failed to reply', 'error');
                    Get('/discussions/feed').then((r) => {
                        if (r.success) setFeed(Array.isArray(r.data) ? r.data : []);
                    }).catch(() => { });
                } else {
                    Get('/discussions/feed').then((r) => {
                        if (r.success) setFeed(Array.isArray(r.data) ? r.data : []);
                    }).catch(() => { });
                }
            })
            .catch(() => {
                displayMessage('Failed to reply', 'error');
                Get('/discussions/feed').then((r) => {
                    if (r.success) setFeed(Array.isArray(r.data) ? r.data : []);
                }).catch(() => { });
            });
    };

    // CRUD functions
    const isAuthor = (item: FeedItem) => {
        return item.createdBy === currentUserId || item.sender?._id === currentUserId;
    };

    const startEdit = (item: FeedItem) => {
        // Only allow inline editing for replies (items with parent)
        if (item.parent) {
            setEditingItem(item._id);
            setEditText(item.text);
            setShowDropdown(null);
        }
    };

    const cancelEdit = () => {
        setEditingItem(null);
        setEditText('');
    };

    const saveEdit = async (item: FeedItem) => {
        if (!editText.trim()) return;

        // Only handle replies here (items with parent)
        const endpoint = `/discussions/messages/${item._id}`;
        const body = { text: editText.trim() };

        // Optimistic update
        setFeed(prev => prev.map(f =>
            f._id === item._id
                ? { ...f, text: editText.trim() }
                : f
        ));

        try {
            const response = await Put(endpoint, body);
            if (!response.success) {
                displayMessage(response.message || 'Failed to update', 'error');
                // Rollback
                loadFeed();
            }
        } catch (error) {
            displayMessage('Failed to update', 'error');
            loadFeed();
        }

        setEditingItem(null);
        setEditText('');
    };

    const confirmDelete = (item: FeedItem) => {
        setItemToDelete(item);
        setShowDeleteModal(true);
        setShowDropdown(null);
    };

    const deleteItem = async () => {
        if (!itemToDelete) return;

        setDeleting(true);

        const isThread = !itemToDelete.parent;
        const endpoint = isThread
            ? `/discussions/threads/${itemToDelete.thread._id}`
            : `/discussions/messages/${itemToDelete._id}`;

        // Optimistic update
        setFeed(prev => prev.filter(f => f._id !== itemToDelete._id));

        try {
            const response = await Delete(endpoint);
            if (!response.success) {
                displayMessage(response.message || 'Failed to delete', 'error');
                // Rollback
                loadFeed();
            }
        } catch (error) {
            displayMessage('Failed to delete', 'error');
            loadFeed();
        } finally {
            setDeleting(false);
            setShowDeleteModal(false);
            setItemToDelete(null);
        }
    };

    const startEditThread = (thread: any) => {
        setEditingThread(thread);
        setTitle(thread.title);
        // Find the first post in this thread to get the text content
        const firstPost = feed.find(f => f.thread?._id === thread._id && !f.parent);
        setText(firstPost?.text || '');
        setSubject(thread.subject?._id || null);
        setTopic(thread.topic?._id || null);
        setLesson(thread.lesson?._id || null);
        setShowEditModal(true);
        setShowDropdown(null);
    };

    const saveEditThread = async () => {
        if (!editingThread || !title.trim() || !text.trim()) return;

        setEditing(true);

        // Optimistic update for thread title and subject/topic/lesson
        setFeed(prev => prev.map(f =>
            f.thread?._id === editingThread._id
                ? {
                    ...f,
                    thread: {
                        ...f.thread,
                        title: title.trim(),
                        subject: subjects.find(s => s._id === subject),
                        topic: topics.find(t => t._id === topic),
                        lesson: lessons.find(l => l._id === lesson)
                    }
                }
                : f
        ));

        // Optimistic update for the first post text
        setFeed(prev => prev.map(f =>
            f.thread?._id === editingThread._id && !f.parent
                ? { ...f, text: text.trim() }
                : f
        ));

        try {
            // Update thread
            const threadResponse = await Put(`/discussions/threads/${editingThread._id}`, {
                title: title.trim(),
                subject: subject || undefined,
                topic: topic || undefined,
                lesson: lesson || undefined
            });

            // Update the first post text
            const firstPost = feed.find(f => f.thread?._id === editingThread._id && !f.parent);
            if (firstPost) {
                await Put(`/discussions/messages/${firstPost._id}`, {
                    text: text.trim()
                });
            }

            if (threadResponse.success) {
                setShowEditModal(false);
                setEditingThread(null);
                setTitle('');
                setText('');
                setSubject(null);
                setTopic(null);
                setLesson(null);
                // Silent refresh to ensure data consistency
                Get('/discussions/feed').then((r) => {
                    if (r.success) setFeed(Array.isArray(r.data) ? r.data : []);
                }).catch(() => { });
            } else {
                displayMessage(threadResponse.message || 'Failed to update thread', 'error');
                // Rollback on error
                loadFeed();
            }
        } catch (error) {
            displayMessage('Failed to update thread', 'error');
            // Rollback on error
            loadFeed();
        } finally {
            setEditing(false);
        }
    };

    const renderAvatar = (sender: any) => {
        const img = sender?.image;
        const name: string = sender?.fullName || '';
        if (img) {
            return <img src={img} alt="avatar" className="w-full h-full object-cover" />
        }
        const initial = (name || '?').slice(0, 1).toUpperCase() || '?';
        return <span>{initial}</span>
    };

    // Build a grouped/nested view: for each thread, show top-level posts and their replies
    const grouped = useMemo(() => {
        // group by thread
        const threadIdToItems: Record<string, FeedItem[]> = {};
        for (const item of feed) {
            const tid = item.thread?._id || 'unknown';
            if (!threadIdToItems[tid]) threadIdToItems[tid] = [];
            threadIdToItems[tid].push(item);
        }
        // For each thread, build parent -> replies mapping
        let result = Object.entries(threadIdToItems).map(([threadId, items]) => {
            const parents = items.filter(i => !i.parent);
            const repliesMap: Record<string, FeedItem[]> = {};
            for (const i of items) {
                if (i.parent?._id) {
                    if (!repliesMap[i.parent._id]) repliesMap[i.parent._id] = [];
                    repliesMap[i.parent._id].push(i);
                }
            }
            return { threadId, thread: parents[0]?.thread, parents, repliesMap };
        });
        // sort threads by latest parent post time (desc)
        result.sort((a, b) => {
            const aTime = a.parents[0]?.createdAt ? new Date(a.parents[0].createdAt).getTime() : 0;
            const bTime = b.parents[0]?.createdAt ? new Date(b.parents[0].createdAt).getTime() : 0;
            return bTime - aTime;
        });
        return result;
    }, [feed]);

    const formatWhen = (iso: string) => {
        try {
            const d = new Date(iso);
            const diff = Date.now() - d.getTime();
            const sec = Math.floor(diff / 1000);
            if (sec < 60) return 'just now';
            const min = Math.floor(sec / 60);
            if (min < 60) return `${min}m ago`;
            const hr = Math.floor(min / 60);
            if (hr < 24) return `${hr}h ago`;
            const day = Math.floor(hr / 24);
            if (day < 7) return `${day}d ago`;
            return d.toLocaleDateString();
        } catch {
            return new Date(iso).toLocaleString();
        }
    };

    return (
        <>
            <div className="flex flex-row w-screen h-screen max-w-[2200px] justify-center items-center mx-auto bg-gradient-to-br from-slate-50 to-slate-100 flex-wrap">
                <div className="lg:w-1/6 h-full bg-transparent transition-all delay-100 flex">
                    <SideDrawer />
                </div>

                <div className="flex flex-col h-screen w-screen lg:w-10/12 px-4 py-6 xl:pr-16 bg-transparent">
                    <div className="w-full h-fit mb-8 flex">
                        <Navbar title="Discussion" hideSearchBar />
                    </div>

                    <div className="max-w-6xl mx-auto w-full">
                        {/* Premium Header Section */}
                        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-2xl shadow-2xl p-8 mb-8 relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10"></div>
                            <div className="relative z-10">
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-4 mb-4">
                                            <img
                                                src="/classerly.net.png"
                                                alt="Classerly Logo"
                                                className="h-12 w-auto"
                                            />
                                            <div>
                                                <h1 className="text-3xl font-bold text-white mb-2">Team Discussions</h1>
                                                <p className="text-slate-300 text-lg">Collaborate privately with your team on subjects, topics, and lessons</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 text-slate-400">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                                <span className="text-sm">Live discussions</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
                                                </svg>
                                                <span className="text-sm">Private & Secure</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex-shrink-0">
                                        <button
                                            className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center gap-3"
                                            onClick={() => setShowComposer(true)}
                                        >
                                            <svg className="w-5 h-5 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                            </svg>
                                            New Discussion
                                            <div className="absolute inset-0 bg-white/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Discussion Feed */}
                        <div className="space-y-8">
                            {loading ? (
                                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-12 text-center">
                                    <div className="inline-flex items-center gap-3 text-slate-600">
                                        <svg className="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        <span className="text-lg font-medium">Loading discussions...</span>
                                    </div>
                                </div>
                            ) : grouped.length === 0 ? (
                                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-12 text-center">
                                    <div className="w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-xl font-semibold text-slate-700 mb-2">No discussions yet</h3>
                                    <p className="text-slate-500 mb-6">Start the conversation by creating your first discussion</p>
                                    <button
                                        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                                        onClick={() => setShowComposer(true)}
                                    >
                                        Create First Discussion
                                    </button>
                                </div>
                            ) : (
                                grouped.map(group => (
                                    <div key={group.threadId} className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300 overflow-hidden">
                                        {/* Thread Header */}
                                        <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-8 py-6 border-b border-slate-200/50">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-4">
                                                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                                                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                                            </svg>
                                                        </div>
                                                        <div>
                                                            <h2 className="text-xl font-bold text-slate-800">{group.thread?.title || 'Discussion'}</h2>
                                                            <div className="flex items-center gap-2 text-sm text-slate-500">
                                                                <span>Thread</span>
                                                                <span>•</span>
                                                                <span>{group.parents.length} {group.parents.length === 1 ? 'post' : 'posts'}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-wrap gap-2">
                                                        {group.thread?.subject?.name && (
                                                            <span className="px-3 py-1.5 text-xs font-medium rounded-full bg-blue-100 text-blue-700 border border-blue-200">
                                                                {group.thread.subject.name}
                                                            </span>
                                                        )}
                                                        {group.thread?.topic?.name && (
                                                            <span className="px-3 py-1.5 text-xs font-medium rounded-full bg-indigo-100 text-indigo-700 border border-indigo-200">
                                                                {group.thread.topic.name}
                                                            </span>
                                                        )}
                                                        {group.thread?.lesson?.name && (
                                                            <span className="px-3 py-1.5 text-xs font-medium rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">
                                                                {group.thread.lesson.name}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                {/* Thread menu - only show for author */}
                                                {group.parents[0] && isAuthor(group.parents[0]) && (
                                                    <div className="relative dropdown-container">
                                                        <button
                                                            className="p-3 text-slate-500 hover:text-slate-700 hover:bg-white/50 rounded-xl transition-all duration-200"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setShowDropdown(showDropdown === group.threadId ? null : group.threadId);
                                                            }}
                                                        >
                                                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                                                            </svg>
                                                        </button>
                                                        {showDropdown === group.threadId && (
                                                            <div className="absolute right-0 top-12 bg-white border border-slate-200 rounded-xl shadow-2xl z-20 min-w-[160px] py-2 overflow-hidden">
                                                                <button
                                                                    className="w-full px-4 py-3 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-3 transition-colors"
                                                                    onClick={() => startEditThread(group.thread)}
                                                                >
                                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                                    </svg>
                                                                    Edit Thread
                                                                </button>
                                                                <button
                                                                    className="w-full px-4 py-3 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors"
                                                                    onClick={() => confirmDelete(group.parents[0])}
                                                                >
                                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                    </svg>
                                                                    Delete Thread
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Posts Section */}
                                        <div className="divide-y divide-slate-100">
                                            {group.parents.map(parent => (
                                                <div key={parent._id} className="p-8 hover:bg-slate-50/50 transition-colors">
                                                    <div className="flex items-start gap-4">
                                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-200 to-slate-300 overflow-hidden flex items-center justify-center text-sm font-bold text-slate-700 shadow-lg">
                                                            {renderAvatar(parent.sender)}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-3 mb-3">
                                                                <span className="font-bold text-slate-800 text-lg">{parent.sender?.fullName || 'User'}</span>
                                                                <span className="text-slate-500 text-sm">•</span>
                                                                <span className="text-slate-500 text-sm">{formatWhen(parent.createdAt)}</span>
                                                            </div>
                                                            <div className="text-slate-700 text-base leading-relaxed whitespace-pre-wrap mb-4">{parent.text}</div>

                                                            {/* Reply count */}
                                                            <div className="flex items-center gap-4 mb-6">
                                                                <div className="flex items-center gap-2 text-slate-500 text-sm">
                                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                                                    </svg>
                                                                    <span>{(group.repliesMap[parent._id]?.length || 0)} {(group.repliesMap[parent._id]?.length || 0) === 1 ? 'reply' : 'replies'}</span>
                                                                </div>
                                                                <button
                                                                    className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-1 transition-colors"
                                                                    onClick={() => startReply(parent._id)}
                                                                >
                                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                                                                    </svg>
                                                                    Reply
                                                                </button>
                                                            </div>

                                                            {/* Replies Section */}
                                                            {(() => {
                                                                const repliesRaw = group.repliesMap[parent._id] || [];
                                                                const replies = repliesRaw.slice().sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
                                                                const open = !!openReplies[parent._id];
                                                                const shown = open ? replies : replies.slice(0, 2);
                                                                if (replies.length === 0) return null;
                                                                return (
                                                                    <div className="ml-6 pl-6 border-l-2 border-slate-200 space-y-6">
                                                                        {shown.map((rep: FeedItem) => (
                                                                            <div key={rep._id} className="bg-slate-50/50 rounded-xl p-6 hover:bg-slate-100/50 transition-colors">
                                                                                <div className="flex items-start gap-3">
                                                                                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-slate-300 to-slate-400 overflow-hidden flex items-center justify-center text-xs font-bold text-slate-700">
                                                                                        {renderAvatar(rep.sender)}
                                                                                    </div>
                                                                                    <div className="flex-1 min-w-0">
                                                                                        <div className="flex items-center justify-between mb-2">
                                                                                            <div className="flex items-center gap-2">
                                                                                                <span className="font-semibold text-slate-800">{rep.sender?.fullName || 'User'}</span>
                                                                                                <span className="text-slate-500 text-xs">•</span>
                                                                                                <span className="text-slate-500 text-xs">{formatWhen(rep.createdAt)}</span>
                                                                                            </div>
                                                                                            {/* Reply menu - only show for author */}
                                                                                            {isAuthor(rep) && (
                                                                                                <div className="relative dropdown-container">
                                                                                                    <button
                                                                                                        className="p-2 text-slate-500 hover:text-slate-700 hover:bg-white/50 rounded-lg transition-all duration-200"
                                                                                                        onClick={(e) => {
                                                                                                            e.stopPropagation();
                                                                                                            setShowDropdown(showDropdown === rep._id ? null : rep._id);
                                                                                                        }}
                                                                                                    >
                                                                                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                                                                            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                                                                                                        </svg>
                                                                                                    </button>
                                                                                                    {showDropdown === rep._id && (
                                                                                                        <div className="absolute right-0 top-10 bg-white border border-slate-200 rounded-xl shadow-2xl z-20 min-w-[140px] py-2 overflow-hidden">
                                                                                                            <button
                                                                                                                className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors"
                                                                                                                onClick={() => startEdit(rep)}
                                                                                                            >
                                                                                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                                                                                </svg>
                                                                                                                Edit Reply
                                                                                                            </button>
                                                                                                            <button
                                                                                                                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                                                                                                                onClick={() => confirmDelete(rep)}
                                                                                                            >
                                                                                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                                                                </svg>
                                                                                                                Delete Reply
                                                                                                            </button>
                                                                                                        </div>
                                                                                                    )}
                                                                                                </div>
                                                                                            )}
                                                                                        </div>
                                                                                        {/* Inline editing for replies */}
                                                                                        {editingItem === rep._id ? (
                                                                                            <div className="space-y-3">
                                                                                                <textarea
                                                                                                    className="w-full border border-slate-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                                                                                    rows={3}
                                                                                                    value={editText}
                                                                                                    onChange={(e) => setEditText(e.target.value)}
                                                                                                />
                                                                                                <div className="flex gap-3">
                                                                                                    <button
                                                                                                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg font-medium transition-colors"
                                                                                                        onClick={() => saveEdit(rep)}
                                                                                                    >
                                                                                                        Save
                                                                                                    </button>
                                                                                                    <button
                                                                                                        className="px-4 py-2 border border-slate-300 text-slate-700 text-sm rounded-lg font-medium hover:bg-slate-50 transition-colors"
                                                                                                        onClick={cancelEdit}
                                                                                                    >
                                                                                                        Cancel
                                                                                                    </button>
                                                                                                </div>
                                                                                            </div>
                                                                                        ) : (
                                                                                            <div className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">{rep.text}</div>
                                                                                        )}
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        ))}
                                                                        {replies.length > 2 && (
                                                                            <button
                                                                                className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-2 transition-colors"
                                                                                onClick={() => setOpenReplies(prev => ({ ...prev, [parent._id]: !open }))}
                                                                            >
                                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={open ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
                                                                                </svg>
                                                                                {open ? 'Show less replies' : `View ${replies.length - shown.length} more replies`}
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                );
                                                            })()}

                                                            {/* Reply Input */}
                                                            {replyToId === parent._id && (
                                                                <div id={`reply-input-${parent._id}`} className="ml-6 pl-6 border-l-2 border-slate-200 mt-4">
                                                                    <div className="bg-slate-50/50 rounded-xl p-4">
                                                                        <div className="flex gap-3">
                                                                            <input
                                                                                className="flex-1 border border-slate-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                                                placeholder="Write a reply..."
                                                                                value={replyText}
                                                                                onChange={(e) => setReplyText(e.target.value)}
                                                                                onKeyDown={(e) => { if (e.key === 'Enter') sendReply(parent as any); }}
                                                                            />
                                                                            <button
                                                                                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg font-medium disabled:opacity-50 transition-colors"
                                                                                onClick={() => sendReply(parent as any)}
                                                                                disabled={!replyText.trim()}
                                                                            >
                                                                                Reply
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Create Post Modal */}
            {
                showComposer && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowComposer(false)} />
                        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl border border-slate-200 overflow-hidden">
                            <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-8 py-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h2 className="text-2xl font-bold text-white">Create New Discussion</h2>
                                        <p className="text-slate-300 mt-1">Start a conversation with your team</p>
                                    </div>
                                    <button
                                        className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                                        onClick={() => setShowComposer(false)}
                                    >
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                            <div className="p-8 space-y-6">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Discussion Title</label>
                                    <input
                                        className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                        placeholder="Enter a compelling title for your discussion..."
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Discussion Content</label>
                                    <textarea
                                        className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-colors"
                                        rows={5}
                                        placeholder="Share your thoughts, questions, or ideas with the team..."
                                        value={text}
                                        onChange={(e) => setText(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-3">Categorization (Optional)</label>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-xs font-medium text-slate-600 mb-1">Subject</label>
                                            <select
                                                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                                value={subject || ''}
                                                onChange={(e) => setSubject(e.target.value || null)}
                                            >
                                                <option value="">Select subject...</option>
                                                {subjects.map((s: any) => <option key={s._id} value={s._id}>{s.name}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-slate-600 mb-1">Topic</label>
                                            <select
                                                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors disabled:bg-slate-100"
                                                value={topic || ''}
                                                onChange={(e) => setTopic(e.target.value || null)}
                                                disabled={!subject}
                                            >
                                                <option value="">Select topic...</option>
                                                {topics.map((t: any) => <option key={t._id} value={t._id}>{t.name}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-slate-600 mb-1">Lesson</label>
                                            <select
                                                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors disabled:bg-slate-100"
                                                value={lesson || ''}
                                                onChange={(e) => setLesson(e.target.value || null)}
                                                disabled={!topic}
                                            >
                                                <option value="">Select lesson...</option>
                                                {lessons.map((l: any) => <option key={l._id} value={l._id}>{l.name}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="px-8 py-6 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-4">
                                <button
                                    className="px-6 py-3 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                                    onClick={() => setShowComposer(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center gap-3 disabled:opacity-50 disabled:transform-none"
                                    onClick={createPost}
                                    disabled={!canCreate || creating}
                                >
                                    {creating && (
                                        <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                    )}
                                    {creating ? 'Creating Discussion...' : 'Create Discussion'}
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Edit Thread Modal */}
            {showEditModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowEditModal(false)} />
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl border border-slate-200 overflow-hidden">
                        <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-8 py-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-2xl font-bold text-white">Edit Discussion</h2>
                                    <p className="text-slate-300 mt-1">Update your discussion details</p>
                                </div>
                                <button
                                    className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                                    onClick={() => setShowEditModal(false)}
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                        <div className="p-8 space-y-6">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Discussion Title</label>
                                <input
                                    className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                    placeholder="Enter a compelling title for your discussion..."
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Discussion Content</label>
                                <textarea
                                    className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-colors"
                                    rows={5}
                                    placeholder="Share your thoughts, questions, or ideas with the team..."
                                    value={text}
                                    onChange={(e) => setText(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-3">Categorization (Optional)</label>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-slate-600 mb-1">Subject</label>
                                        <select
                                            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                            value={subject || ''}
                                            onChange={(e) => setSubject(e.target.value || null)}
                                        >
                                            <option value="">Select subject...</option>
                                            {subjects.map((s: any) => <option key={s._id} value={s._id}>{s.name}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-600 mb-1">Topic</label>
                                        <select
                                            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors disabled:bg-slate-100"
                                            value={topic || ''}
                                            onChange={(e) => setTopic(e.target.value || null)}
                                            disabled={!subject}
                                        >
                                            <option value="">Select topic...</option>
                                            {topics.map((t: any) => <option key={t._id} value={t._id}>{t.name}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-600 mb-1">Lesson</label>
                                        <select
                                            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors disabled:bg-slate-100"
                                            value={lesson || ''}
                                            onChange={(e) => setLesson(e.target.value || null)}
                                            disabled={!topic}
                                        >
                                            <option value="">Select lesson...</option>
                                            {lessons.map((l: any) => <option key={l._id} value={l._id}>{l.name}</option>)}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="px-8 py-6 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-4">
                            <button
                                className="px-6 py-3 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                                onClick={() => setShowEditModal(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center gap-3 disabled:opacity-50 disabled:transform-none"
                                onClick={saveEditThread}
                                disabled={!title.trim() || !text.trim() || editing}
                            >
                                {editing && (
                                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                )}
                                {editing ? 'Saving Changes...' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && itemToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowDeleteModal(false)} />
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md border border-slate-200 overflow-hidden">
                        <div className="bg-gradient-to-r from-red-50 to-red-100 px-8 py-6 border-b border-red-200">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-red-500 flex items-center justify-center">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-slate-800">Delete {itemToDelete.parent ? 'Reply' : 'Thread'}</h3>
                                    <p className="text-slate-600 text-sm">This action cannot be undone</p>
                                </div>
                            </div>
                        </div>
                        <div className="p-8">
                            <p className="text-slate-700 leading-relaxed">
                                Are you sure you want to delete this {itemToDelete.parent ? 'reply' : 'thread'}?
                                {!itemToDelete.parent && ' This will also delete all replies in this thread.'}
                            </p>
                        </div>
                        <div className="px-8 py-6 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-4">
                            <button
                                className="px-6 py-3 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
                                onClick={() => setShowDeleteModal(false)}
                                disabled={deleting}
                            >
                                Cancel
                            </button>
                            <button
                                className="px-6 py-3 text-sm font-semibold bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:transform-none"
                                onClick={deleteItem}
                                disabled={deleting}
                            >
                                {deleting && (
                                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                )}
                                {deleting ? 'Deleting...' : 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Discussion;


