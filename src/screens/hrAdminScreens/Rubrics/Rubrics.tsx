import { useState, useCallback } from "react";
import {
    Navbar,
    SideDrawer,
    RubricList,
    AddRubric,
} from "../../../components";
import { UseStateContext } from "../../../context/ContextProvider";
import { useSubscriptionStatus } from "../../../hooks/useSubscriptionStatus.hook";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { RouteName } from "../../../routes/RouteNames";

const Rubrics = () => {
    const [refreshRubrics, setRefreshRubrics] = useState<number>(0);
    const [editingRubric, setEditingRubric] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { setDashboardRefreshTrigger } = UseStateContext();

    const triggerRubricsRefresh = useCallback(() => {
        setRefreshRubrics(prev => prev + 1);
        setDashboardRefreshTrigger(prev => prev + 1);
    }, [setDashboardRefreshTrigger]);

    const handleEdit = useCallback((rubric: any) => {
        setEditingRubric(rubric);
        setIsModalOpen(true);
    }, []);

    const handleCloseModal = useCallback(() => {
        setIsModalOpen(false);
        setEditingRubric(null);
    }, []);

    const handleOpenCreateModal = () => {
        setEditingRubric(null);
        setIsModalOpen(true);
    };

    const navigate = useNavigate();
    const { loading, allowed } = useSubscriptionStatus();

    useEffect(() => {
        if (!loading && !allowed) {
            navigate(RouteName.SUBSCRIPTION, { replace: true });
        }
    }, [loading, allowed, navigate]);

    if (!loading && !allowed) return null;

    return (
        <div className="flex flex-row w-screen h-screen max-w-[2200px] justify-center items-center mx-auto bg-mainBg flex-wrap">
            {/* Left side - Sidebar */}
            <div className="lg:w-1/6 h-full bg-transparent">
                <SideDrawer />
            </div>

            {/* Right side - Main content */}
            <div className="flex flex-col h-screen w-screen lg:w-10/12 px-2 py-2 md:px-4 md:py-6 md:pr-16 bg-mainBg">
                {/* Navbar */}
                <div className="w-full h-fit bg-mainBg mb-2 md:mb-6">
                    <Navbar title="Rubrics" hideSearchBar />
                </div>

                {/* Hero Section with Create Button */}
                <div className="w-full px-1 md:px-5 mb-6">
                    <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-2xl shadow-2xl p-6 md:p-8 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10"></div>
                        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg flex-shrink-0">
                                    <svg className="w-6 h-6 md:w-8 md:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                                    </svg>
                                </div>
                                <div>
                                    <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-white">Rubrics Management</h1>
                                    <p className="text-slate-300 text-sm md:text-base">Create and manage assessment rubrics for evaluating work</p>
                                </div>
                            </div>
                            <button
                                onClick={handleOpenCreateModal}
                                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 flex-shrink-0"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Create New Rubric
                            </button>
                        </div>
                    </div>
                </div>

                {/* Rubrics List */}
                <div className="w-full px-1 md:px-5 flex-1 overflow-y-auto">
                    <RubricList
                        refreshTrigger={refreshRubrics}
                        onEdit={handleEdit}
                        onRefresh={triggerRubricsRefresh}
                    />
                </div>
            </div>

            {/* Modal for Add/Edit Rubric */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <AddRubric
                            onRubricSaved={() => {
                                triggerRubricsRefresh();
                                handleCloseModal();
                            }}
                            editingRubric={editingRubric}
                            onCloseEdit={handleCloseModal}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default Rubrics;
