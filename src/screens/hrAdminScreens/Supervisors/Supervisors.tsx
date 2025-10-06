import React, { useState, useEffect } from "react";
import { Navbar, SideDrawer } from "../../../components";
import { UseStateContext } from "../../../context/ContextProvider";
import { Get, Put, Delete } from "../../../config/apiMethods";
import { displayMessage } from "../../../config";

interface Supervisor {
    _id: string;
    auth: {
        fullName: string;
        email: string;
        image?: string;
        userName: string;
        isBlocked: boolean;
    };
    employeeIds: Array<{
        _id: string;
        auth: {
            fullName: string;
            email: string;
            image?: string;
        };
        code: string;
        subjects: Array<{
            _id: string;
            name: string;
            image?: string;
        }>;
    }>;
    employeeCount: number;
    code: string;
}

const Supervisors: React.FC = () => {
    const { role } = UseStateContext();
    const [supervisors, setSupervisors] = useState<Supervisor[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedSupervisor, setSelectedSupervisor] = useState<Supervisor | null>(null);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [confirmAction, setConfirmAction] = useState<{
        type: 'activate' | 'deactivate' | 'unlink';
        supervisorId: string;
        employeeId?: string;
        supervisorName: string;
        employeeName?: string;
    } | null>(null);

    useEffect(() => {
        fetchSupervisors();
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (selectedSupervisor && !(event.target as Element).closest('.relative')) {
                setSelectedSupervisor(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [selectedSupervisor]);

    const fetchSupervisors = async () => {
        try {
            setLoading(true);
            const response = await Get("/hr-admin/mysupervisors");
            if (response.success) {
                setSupervisors(response.data || []);
            } else {
                displayMessage(response.message || "Failed to fetch supervisors", "error");
            }
        } catch (error: any) {
            displayMessage(error.message || "Something went wrong", "error");
        } finally {
            setLoading(false);
        }
    };

    const filteredSupervisors = supervisors.filter(supervisor =>
        supervisor.auth.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        supervisor.auth.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        supervisor.code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const showConfirmation = (type: 'activate' | 'deactivate' | 'unlink', supervisorId: string, supervisorName: string, employeeId?: string, employeeName?: string) => {
        setConfirmAction({
            type,
            supervisorId,
            employeeId,
            supervisorName,
            employeeName
        });
        setShowConfirmModal(true);
    };

    const handleConfirmAction = async () => {
        if (!confirmAction) return;

        try {
            if (confirmAction.type === 'unlink' && confirmAction.employeeId) {
                setActionLoading(`${confirmAction.supervisorId}-${confirmAction.employeeId}`);
                const response = await Delete(`/hr-admin/supervisor/${confirmAction.supervisorId}/employee/${confirmAction.employeeId}/unlink`);

                if (response.success) {
                    displayMessage(response.message, 'success');
                    await fetchSupervisors();
                } else {
                    displayMessage(response.message || 'Failed to unlink employee', 'error');
                }
            } else {
                setActionLoading(confirmAction.supervisorId);
                const isBlocked = confirmAction.type === 'deactivate';
                const response = await Put(`/hr-admin/supervisor/${confirmAction.supervisorId}/status`, { isBlocked });

                if (response.success) {
                    displayMessage(response.message, 'success');
                    setSupervisors(prev => prev.map(supervisor =>
                        supervisor._id === confirmAction.supervisorId
                            ? { ...supervisor, auth: { ...supervisor.auth, isBlocked } }
                            : supervisor
                    ));
                } else {
                    displayMessage(response.message || 'Failed to update supervisor status', 'error');
                }
            }
        } catch (error: any) {
            displayMessage(error.message || 'Something went wrong', 'error');
        } finally {
            setActionLoading(null);
            setShowConfirmModal(false);
            setConfirmAction(null);
        }
    };

    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase();
    };

    const getRandomColor = (str: string) => {
        const colors = [
            'bg-gradient-to-br from-blue-500 to-purple-600',
            'bg-gradient-to-br from-green-500 to-teal-600',
            'bg-gradient-to-br from-pink-500 to-rose-600',
            'bg-gradient-to-br from-orange-500 to-red-600',
            'bg-gradient-to-br from-indigo-500 to-blue-600',
            'bg-gradient-to-br from-emerald-500 to-green-600',
            'bg-gradient-to-br from-violet-500 to-purple-600',
            'bg-gradient-to-br from-amber-500 to-orange-600'
        ];
        const index = str.charCodeAt(0) % colors.length;
        return colors[index];
    };

    if (loading) {
        return (
            <div className="flex flex-row w-screen h-screen max-w-[2200px] justify-center items-center mx-auto bg-gray-50">
                <div className="lg:w-1/6 h-full bg-transparent">
                    <SideDrawer />
                </div>
                <div className="flex flex-col h-screen w-screen lg:w-10/12 px-2 py-2 md:px-4 md:py-6 md:pr-16 bg-gray-50">
                    <div className="w-full h-fit bg-gray-50 mb-2 md:mb-6">
                        <Navbar title="Supervisors" />
                    </div>
                    <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                            <p className="text-gray-600">Loading supervisors...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-row w-screen h-screen max-w-[2200px] justify-center items-center mx-auto bg-gray-50">
            {/* Left Sidebar */}
            <div className="lg:w-1/6 h-full bg-transparent">
                <SideDrawer />
            </div>

            {/* Main Content */}
            <div className="flex flex-col h-screen w-screen lg:w-10/12 px-2 py-2 md:px-4 md:py-6 md:pr-16 bg-gray-50">
                {/* Header */}
                <div className="w-full h-fit bg-gray-50 mb-6">
                    <Navbar title="Supervisors" />
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center">
                            <div className="p-3 bg-blue-100 rounded-lg">
                                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Total Supervisors</p>
                                <p className="text-2xl font-bold text-gray-900">{supervisors.length}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center">
                            <div className="p-3 bg-green-100 rounded-lg">
                                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Active Supervisors</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {supervisors.filter(s => !s.auth.isBlocked).length}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center">
                            <div className="p-3 bg-purple-100 rounded-lg">
                                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Total Employees</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {supervisors.reduce((sum, s) => sum + s.employeeCount, 0)}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Search and Controls */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="relative flex-1 max-w-md">
                            <input
                                type="text"
                                placeholder="Search supervisors..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                        </div>

                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-2 rounded-lg ${viewMode === 'grid'
                                    ? 'bg-blue-100 text-blue-600'
                                    : 'text-gray-400 hover:text-gray-600'
                                    }`}
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                </svg>
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-2 rounded-lg ${viewMode === 'list'
                                    ? 'bg-blue-100 text-blue-600'
                                    : 'text-gray-400 hover:text-gray-600'
                                    }`}
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Supervisors Content */}
                {filteredSupervisors.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12">
                        <div className="text-center">
                            <div className="text-gray-400 mb-4">
                                <svg className="mx-auto h-16 w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No supervisors found</h3>
                            <p className="text-gray-500">
                                {searchTerm ? "Try adjusting your search criteria" : "Supervisors will appear here when they are linked to your employees"}
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className={`${viewMode === 'grid'
                        ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                        : 'space-y-4'
                        }`}>
                        {filteredSupervisors.map((supervisor) => (
                            <div key={supervisor._id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                                {/* Supervisor Header */}
                                <div className="p-6 border-b border-gray-200">
                                    <div className="flex items-center space-x-4">
                                        <div className={`w-16 h-16 rounded-xl flex items-center justify-center text-white font-bold text-lg ${getRandomColor(supervisor.auth.fullName)}`}>
                                            {supervisor.auth.image ? (
                                                <img
                                                    src={supervisor.auth.image}
                                                    alt={supervisor.auth.fullName}
                                                    className="w-full h-full rounded-xl object-cover"
                                                />
                                            ) : (
                                                getInitials(supervisor.auth.fullName)
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center space-x-2 mb-1">
                                                <h3 className="font-semibold text-gray-900 truncate">
                                                    {supervisor.auth.fullName}
                                                </h3>
                                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${supervisor.auth.isBlocked
                                                    ? 'bg-red-100 text-red-800'
                                                    : 'bg-green-100 text-green-800'
                                                    }`}>
                                                    {supervisor.auth.isBlocked ? 'Blocked' : 'Active'}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-600 truncate">{supervisor.auth.email}</p>
                                            <p className="text-xs text-gray-500">@{supervisor.auth.userName}</p>
                                        </div>

                                        {/* Action Menu */}
                                        <div className="relative">
                                            <button
                                                disabled={actionLoading === supervisor._id}
                                                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedSupervisor(selectedSupervisor?._id === supervisor._id ? null : supervisor);
                                                }}
                                            >
                                                {actionLoading === supervisor._id ? (
                                                    <div className="animate-spin rounded-full h-4 w-4 border-b border-gray-400"></div>
                                                ) : (
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                                                    </svg>
                                                )}
                                            </button>

                                            {/* Dropdown Menu */}
                                            {selectedSupervisor?._id === supervisor._id && (
                                                <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                                                    <div className="py-1">
                                                        <button
                                                            onClick={() => showConfirmation(
                                                                supervisor.auth.isBlocked ? 'activate' : 'deactivate',
                                                                supervisor._id,
                                                                supervisor.auth.fullName
                                                            )}
                                                            className="w-full px-4 py-2 text-sm text-left hover:bg-gray-50 transition-colors"
                                                        >
                                                            <div className="flex items-center space-x-2">
                                                                {supervisor.auth.isBlocked ? (
                                                                    <>
                                                                        <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                        </svg>
                                                                        <span className="text-green-700">Activate Supervisor</span>
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                        </svg>
                                                                        <span className="text-red-700">Deactivate Supervisor</span>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Employee Count */}
                                <div className="px-6 py-4 bg-gray-50">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-gray-600">Linked Employees</span>
                                        <span className="text-2xl font-bold text-blue-600">{supervisor.employeeCount}</span>
                                    </div>
                                </div>

                                {/* Employees List */}
                                {supervisor.employeeIds.length > 0 && (
                                    <div className="p-6">
                                        <h4 className="text-sm font-medium text-gray-900 mb-3">Employees</h4>
                                        <div className={`${viewMode === 'grid' ? 'space-y-2' : 'space-y-3'}`}>
                                            {supervisor.employeeIds.slice(0, viewMode === 'grid' ? 3 : 5).map((employee) => (
                                                <div key={employee._id} className={`flex items-center space-x-3 ${viewMode === 'list' ? 'p-2 rounded-lg hover:bg-gray-50' : ''}`}>
                                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-medium ${getRandomColor(employee.auth.fullName)}`}>
                                                        {employee.auth.image ? (
                                                            <img
                                                                src={employee.auth.image}
                                                                alt={employee.auth.fullName}
                                                                className="w-full h-full rounded-lg object-cover"
                                                            />
                                                        ) : (
                                                            getInitials(employee.auth.fullName)
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium text-gray-900 truncate">
                                                            {employee.auth.fullName}
                                                        </p>
                                                        <p className="text-xs text-gray-500">#{employee.code}</p>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        {employee.subjects.length > 0 && (
                                                            <div className="text-xs text-gray-500">
                                                                {employee.subjects.length} subject{employee.subjects.length !== 1 ? 's' : ''}
                                                            </div>
                                                        )}
                                                        <button
                                                            onClick={() => showConfirmation(
                                                                'unlink',
                                                                supervisor._id,
                                                                supervisor.auth.fullName,
                                                                employee._id,
                                                                employee.auth.fullName
                                                            )}
                                                            disabled={actionLoading === `${supervisor._id}-${employee._id}`}
                                                            className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                            title="Unlink employee"
                                                        >
                                                            {actionLoading === `${supervisor._id}-${employee._id}` ? (
                                                                <div className="animate-spin rounded-full h-3 w-3 border-b border-red-500"></div>
                                                            ) : (
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                                </svg>
                                                            )}
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                            {supervisor.employeeIds.length > (viewMode === 'grid' ? 3 : 5) && (
                                                <p className="text-xs text-gray-500 text-center pt-2">
                                                    +{supervisor.employeeIds.length - (viewMode === 'grid' ? 3 : 5)} more employees
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Confirmation Modal */}
            {showConfirmModal && confirmAction && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
                        <div className="p-6">
                            <div className="flex items-center space-x-3 mb-4">
                                {confirmAction.type === 'unlink' ? (
                                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                                        <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                        </svg>
                                    </div>
                                ) : confirmAction.type === 'activate' ? (
                                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                ) : (
                                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                                        <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                )}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        {confirmAction.type === 'unlink' && 'Unlink Employee'}
                                        {confirmAction.type === 'activate' && 'Activate Supervisor'}
                                        {confirmAction.type === 'deactivate' && 'Deactivate Supervisor'}
                                    </h3>
                                </div>
                            </div>

                            <div className="mb-6">
                                {confirmAction.type === 'unlink' ? (
                                    <p className="text-gray-600">
                                        Are you sure you want to unlink <span className="font-semibold text-gray-900">{confirmAction.employeeName}</span> from supervisor <span className="font-semibold text-gray-900">{confirmAction.supervisorName}</span>?
                                    </p>
                                ) : confirmAction.type === 'activate' ? (
                                    <p className="text-gray-600">
                                        Are you sure you want to activate supervisor <span className="font-semibold text-gray-900">{confirmAction.supervisorName}</span>?
                                    </p>
                                ) : (
                                    <p className="text-gray-600">
                                        Are you sure you want to deactivate supervisor <span className="font-semibold text-gray-900">{confirmAction.supervisorName}</span>? This will prevent them from accessing the system.
                                    </p>
                                )}
                            </div>

                            <div className="flex space-x-3">
                                <button
                                    onClick={() => {
                                        setShowConfirmModal(false);
                                        setConfirmAction(null);
                                    }}
                                    className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleConfirmAction}
                                    className={`flex-1 px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors ${confirmAction.type === 'unlink' || confirmAction.type === 'deactivate'
                                        ? 'bg-red-600 hover:bg-red-700'
                                        : 'bg-green-600 hover:bg-green-700'
                                        }`}
                                >
                                    {confirmAction.type === 'unlink' && 'Unlink Employee'}
                                    {confirmAction.type === 'activate' && 'Activate'}
                                    {confirmAction.type === 'deactivate' && 'Deactivate'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Supervisors;