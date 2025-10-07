import React, { useEffect, useState } from 'react';
import { Navbar, SideDrawer } from '../../components';
import { Get } from '../../config/apiMethods';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { RouteName } from '../../routes/RouteNames';

const DiscussionTopics: React.FC = () => {
    const [topics, setTopics] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [role, setRole] = useState<string | null>(null);
    const [subject, setSubject] = useState<any>(null);
    const { subjectId } = useParams<{ subjectId: string }>();
    const navigate = useNavigate();

    useEffect(() => {
        const ctxUser = JSON.parse(localStorage.getItem('user') || '{}');
        setRole(ctxUser?.userType || null);
    }, []);

    useEffect(() => {
        if (!role || !subjectId) return;
        setLoading(true);
        Get(`/discussions/subjects/${subjectId}/topics`)
            .then((d) => {
                if (d.success) setTopics(d.data || []); else setTopics([]);
            })
            .catch(() => setTopics([]))
            .finally(() => setLoading(false));
    }, [role, subjectId]);

    // Load subject details
    useEffect(() => {
        if (!subjectId) return;
        Get('/discussions/subjects')
            .then((d) => {
                if (d.success) {
                    const subjectData = d.data?.find((s: any) => s._id === subjectId);
                    setSubject(subjectData || null);
                }
            })
            .catch(() => setSubject(null));
    }, [subjectId]);

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
                <div className="animate-pulse flex items-center gap-2">
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                    <span className="text-slate-300">/</span>
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
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
                            <h1 className="text-2xl font-bold text-white">Select a Topic</h1>
                            <p className="text-slate-300">Choose a topic under {toTitleCase(subject?.name || 'Subject')} to view its discussions</p>
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
                                <span className="text-slate-700 font-medium">{toTitleCase(subject?.name || 'Subject')}</span>
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
                        ) : topics.length === 0 ? (
                            <div className="text-center py-16">
                                <div className="max-w-md mx-auto">
                                    {/* Icon */}
                                    <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center">
                                        <svg className="w-10 h-10 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                        </svg>
                                    </div>

                                    {/* Title */}
                                    <h3 className="text-xl font-semibold text-slate-800 mb-3">No Topics Available</h3>

                                    {/* Description */}
                                    <p className="text-slate-600 mb-6 leading-relaxed">
                                        There are no topics available under this subject yet.
                                        Topics will appear here once they are created by your administrator.
                                    </p>

                                    {/* Action Button */}
                                    <button
                                        onClick={() => window.location.reload()}
                                        className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors shadow-sm hover:shadow-md"
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
                                    {topics.map((t: any) => (
                                        <li key={t._id} className="py-3">
                                            <button
                                                className="w-full text-left"
                                                onClick={() => navigate(`/Discussion/${subjectId}/${t._id}`)}
                                            >
                                                <div className="flex items-start gap-3">
                                                    <div className="flex-1">
                                                        <div className="text-blue-600 hover:text-blue-700 hover:underline font-semibold text-base">
                                                            {toTitleCase(t.name)}
                                                        </div>
                                                        <div className="text-slate-500 text-sm mt-0.5">
                                                            {formatCreationDate(t.createdAt)}
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

export default DiscussionTopics;
