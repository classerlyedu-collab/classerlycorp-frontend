import React, { useEffect, useState } from 'react';
import { Navbar, SideDrawer } from '../../components';
import { Get } from '../../config/apiMethods';
import { useNavigate } from 'react-router-dom';

const DiscussionSubjects: React.FC = () => {
    const [subjects, setSubjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [role, setRole] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const ctxUser = JSON.parse(localStorage.getItem('user') || '{}');
        setRole(ctxUser?.userType || null);
    }, []);

    useEffect(() => {
        if (!role) return;
        setLoading(true);
        Get('/discussions/subjects')
            .then((d) => {
                if (d.success) setSubjects(d.data || []); else setSubjects([]);
            })
            .catch(() => setSubjects([]))
            .finally(() => setLoading(false));
    }, [role]);


    const toTitleCase = (str: string) => String(str || '')
        .toLowerCase()
        .split(' ')
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');

    const formatCreationDate = (iso?: string | null) => {
        if (!iso) return 'Created date unknown';
        try {
            const d = new Date(iso);
            return `Created on ${d.toLocaleDateString()}`;
        } catch {
            return 'Created date unknown';
        }
    };

    const SkeletonLoader = () => (
        <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-32"></div>
        </div>
    );

    const BreadcrumbSkeleton = () => (
        <div className="mb-4">
            <nav className="text-sm">
                <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                </div>
            </nav>
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
                    <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-2xl shadow-2xl p-8 mb-6 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10"></div>
                        <div className="relative z-10">
                            <h1 className="text-2xl font-bold text-white">Select a Subject</h1>
                            <p className="text-slate-300">Choose a subject to view its discussions</p>
                        </div>
                    </div>

                    {/* Breadcrumbs */}
                    {loading ? (
                        <BreadcrumbSkeleton />
                    ) : (
                        <div className="mb-4">
                            <nav className="text-sm text-slate-500">
                                <span className="text-slate-700 font-medium">Discussions</span>
                            </nav>
                        </div>
                    )}

                    <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6">
                        {loading ? (
                            <div className="space-y-4">
                                <div className="px-2 pb-3">
                                    <div className="animate-pulse">
                                        <div className="h-4 bg-gray-200 rounded w-8"></div>
                                    </div>
                                </div>
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <div key={i} className="py-3 border-b border-slate-200 last:border-b-0">
                                        <div className="animate-pulse">
                                            <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                                            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : subjects.length === 0 ? (
                            <div className="text-center py-16">
                                <div className="max-w-md mx-auto">
                                    {/* Icon */}
                                    <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
                                        <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                        </svg>
                                    </div>

                                    {/* Title */}
                                    <h3 className="text-xl font-semibold text-slate-800 mb-3">No Subjects Available</h3>

                                    {/* Description */}
                                    <p className="text-slate-600 mb-6 leading-relaxed">
                                        It looks like there are no subjects set up for discussions yet.
                                        Contact your administrator to get started with subject-based discussions.
                                    </p>

                                    {/* Action Button */}
                                    <button
                                        onClick={() => window.location.reload()}
                                        className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-sm hover:shadow-md"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                        </svg>
                                        Refresh Page
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div>
                                <div className="px-2 pb-3 text-slate-500 text-sm">All</div>
                                <ul className="divide-y divide-slate-200">
                                    {subjects.map((s: any) => (
                                        <li key={s._id} className="py-3">
                                            <button
                                                className="w-full text-left"
                                                onClick={() => navigate(`/Discussion/${s._id}`)}
                                            >
                                                <div className="flex items-start gap-3">
                                                    <div className="flex-1">
                                                        <div className="text-blue-600 hover:text-blue-700 hover:underline font-semibold text-base">
                                                            {toTitleCase(s.name)}
                                                        </div>
                                                        <div className="text-slate-500 text-sm mt-0.5">
                                                            {formatCreationDate(s.createdAt)}
                                                        </div>
                                                    </div>
                                                </div>
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DiscussionSubjects;
