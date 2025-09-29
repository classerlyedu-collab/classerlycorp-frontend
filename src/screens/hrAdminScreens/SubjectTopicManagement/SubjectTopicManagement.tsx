import React, { useState, useEffect } from 'react';
import { Navbar, SideDrawer } from '../../../components';
import { SubjectManagement } from '../../../components/hrAdminComponents/Subjects';
import { TopicManagement } from '../../../components/hrAdminComponents/Topics';
import { LessonManagement } from '../../../components/hrAdminComponents/Lessons';
import { FiBookOpen, FiGrid, FiFileText } from 'react-icons/fi';
import { useSubscriptionStatus } from '../../../hooks/useSubscriptionStatus.hook';
import { useNavigate } from 'react-router-dom';
import { RouteName } from '../../../routes/RouteNames';

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

const SubjectTopicManagement: React.FC = () => {
    const navigate = useNavigate();
    const { loading, allowed } = useSubscriptionStatus();
    const [activeTab, setActiveTab] = useState<'subjects' | 'topics' | 'lessons'>('subjects');
    const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
    const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);

    useEffect(() => {
        // Only redirect if we've checked and user is not allowed (not while loading)
        if (!loading && !allowed) {
            navigate(RouteName.SUBSCRIPTION, { replace: true });
        }
    }, [loading, allowed, navigate]);

    // Don't render content if not allowed (will redirect silently)
    if (!loading && !allowed) return null;

    const handleNavigateToTopics = (subject: Subject) => {
        setSelectedSubject(subject);
        setActiveTab('topics');
    };

    const handleNavigateToLessons = (topic: Topic) => {
        setSelectedTopic(topic);
        setActiveTab('lessons');
    };

    const handleBackToSubjects = () => {
        setSelectedSubject(null);
        setSelectedTopic(null);
        setActiveTab('subjects');
    };

    const handleBackToTopics = () => {
        setSelectedTopic(null);
        setActiveTab('topics');
    };

    return (
        <div className="flex flex-row w-screen h-screen max-w-[2200px] justify-center items-center mx-auto bg-mainBg flex-wrap">
            {/* Left Sidebar */}
            <div className="lg:w-1/6 h-full bg-transparent">
                <SideDrawer />
            </div>

            {/* Right Content Area */}
            <div className="flex flex-col h-screen w-screen lg:w-10/12 px-2 py-2 md:px-4 md:py-6 md:pr-16 bg-mainBg">
                {/* Navbar */}
                <div className="w-full h-fit bg-mainBg mb-2 md:mb-6">
                    <Navbar title="Content Management" />
                </div>

                {/* Breadcrumb Navigation */}
                <div className="flex items-center gap-2 mb-6 text-sm text-gray-600">
                    <button
                        onClick={handleBackToSubjects}
                        className={`hover:text-blue-600 transition-colors ${activeTab === 'subjects' ? 'text-blue-600 font-medium' : ''}`}
                    >
                        Subjects
                    </button>
                    {selectedSubject && (
                        <>
                            <span>/</span>
                            <button
                                onClick={handleBackToTopics}
                                className={`hover:text-blue-600 transition-colors ${activeTab === 'topics' ? 'text-blue-600 font-medium' : ''}`}
                            >
                                {selectedSubject.name}
                            </button>
                        </>
                    )}
                    {selectedTopic && (
                        <>
                            <span>/</span>
                            <span className={`${activeTab === 'lessons' ? 'text-blue-600 font-medium' : ''}`}>
                                {selectedTopic.name}
                            </span>
                        </>
                    )}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto">
                    {activeTab === 'subjects' && (
                        <SubjectManagement onNavigateToTopics={handleNavigateToTopics} />
                    )}
                    {activeTab === 'topics' && (
                        <TopicManagement
                            selectedSubject={selectedSubject}
                            onNavigateToLessons={handleNavigateToLessons}
                            onBackToSubjects={handleBackToSubjects}
                        />
                    )}
                    {activeTab === 'lessons' && (
                        <LessonManagement
                            selectedTopic={selectedTopic}
                            onBackToTopics={handleBackToTopics}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default SubjectTopicManagement;