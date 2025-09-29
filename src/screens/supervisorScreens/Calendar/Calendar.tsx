import {
    Navbar,
    SideDrawer
} from "../../../components";
import { Calendar as BigCalendar, momentLocalizer, Views } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useEffect, useState } from "react";
import { Get, Post, Put, Delete } from "../../../config/apiMethods";
import { UseStateContext } from "../../../context/ContextProvider";
import { displayMessage } from "../../../config";

interface Event {
    title: string;
    startDate: Date;
    endDate: Date;
    id?: string;
    _id?: string;
    userType?: string;
    agenda?: string;
}

const localizer = momentLocalizer(moment);

// Custom event component to display title and agenda
const EventComponent = ({ event }: { event: Event }) => {
    return (
        <div className="w-full h-full p-1 border-0">
            <div className="flex flex-col h-full">
                <div className="font-semibold text-xs leading-tight truncate text-white">
                    {event.title}
                </div>
                {event.agenda && event.agenda.trim() && (
                    <div className="text-xs opacity-90 leading-tight mt-0.5 text-white">
                        {event.agenda.length > 35 ? `${event.agenda.substring(0, 35)}...` : event.agenda}
                    </div>
                )}
            </div>
        </div>
    );
};

// Helper function to get the correct event ID
const getEventId = (event: Event): string | undefined => {
    return event.id || event._id;
};

// Add event styling function
const getEventStyle = (event: Event) => {
    let backgroundColor = '#10B981'; // emerald green (same as edit modal)
    let borderColor = '#059669';

    switch (event.userType) {
        case 'HR-Admin':
            backgroundColor = '#10B981'; // emerald green
            borderColor = '#059669';
            break;
        case 'Supervisor':
            backgroundColor = '#10B981'; // emerald green
            borderColor = '#059669';
            break;
        case 'Employee':
            backgroundColor = '#10B981'; // emerald green
            borderColor = '#059669';
            break;
    }

    return {
        style: {
            backgroundColor,
            border: `1px solid ${borderColor}`,
            borderRadius: '4px',
            color: 'white',
            display: 'block',
            fontSize: '11px',
            padding: '0',
            margin: '1px',
            cursor: 'pointer',
            overflow: 'hidden'
        }
    };
};

const Calendar = () => {
    const { role } = UseStateContext();

    const [showModal, setShowModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showActionModal, setShowActionModal] = useState(false);
    const [events, setEvents] = useState<Event[]>([]);
    const [newEvent, setNewEvent] = useState<Event>({
        title: '',
        startDate: new Date(),
        endDate: new Date(),
        agenda: ''
    });
    const [editingEvent, setEditingEvent] = useState<Event | null>(null);
    const [deletingEventId, setDeletingEventId] = useState<string | null>(null);
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
    const [loading, setLoading] = useState(false);
    const [currentView, setCurrentView] = useState<any>(Views.MONTH);

    useEffect(() => {
        Get('/hr-admin/calendar/events').then((d) => {
            if (d.success) {
                // Ensure dates are proper Date objects for react-big-calendar
                const formattedEvents = d.data.map((event: any) => ({
                    ...event,
                    startDate: new Date(event.startDate),
                    endDate: new Date(event.endDate)
                }));
                setEvents(formattedEvents)
            }
        }).catch(error => {
            console.error('Error fetching events:', error);
        })
    }, [])

    const handleAddEvent = () => {
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setNewEvent({
            title: '',
            startDate: new Date(),
            endDate: new Date(),
            agenda: ''
        });
    };

    const handleCloseEditModal = () => {
        setShowEditModal(false);
        setEditingEvent(null);
    };

    const handleCloseDeleteModal = () => {
        setShowDeleteModal(false);
        setDeletingEventId(null);
    };

    const handleCloseActionModal = () => {
        setShowActionModal(false);
        setSelectedEvent(null);
    };

    const handleSaveEvent = async () => {
        setLoading(true);
        try {
            const response = await Post('/hr-admin/calendar/events', newEvent);
            if (response.success) {
                // Refresh events list to show the new event immediately
                const updatedEvents = await Get('/hr-admin/calendar/events');
                if (updatedEvents.success) {
                    const formattedEvents = updatedEvents.data.map((event: any) => ({
                        ...event,
                        startDate: new Date(event.startDate),
                        endDate: new Date(event.endDate)
                    }));
                    setEvents(formattedEvents);
                }
                handleCloseModal();
                displayMessage('Event added successfully!', 'success');
            } else {
                displayMessage(response.message || 'Failed to add event', 'error');
            }
        } catch (error) {
            console.error('Error saving event:', error);
            displayMessage('Failed to add event. Please try again.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleEditEvent = (event: Event) => {
        setEditingEvent(event);
        setShowEditModal(true);
    };

    const handleUpdateEvent = async () => {
        const eventId = getEventId(editingEvent!);
        if (!eventId) {
            return;
        }

        setLoading(true);
        try {
            const response = await Put(`/hr-admin/calendar/events/${eventId}`, editingEvent);
            if (response.success) {
                // Refresh events list to show updated event immediately
                const updatedEvents = await Get('/hr-admin/calendar/events');
                if (updatedEvents.success) {
                    const formattedEvents = updatedEvents.data.map((event: any) => ({
                        ...event,
                        startDate: new Date(event.startDate),
                        endDate: new Date(event.endDate)
                    }));
                    setEvents(formattedEvents);
                }
                handleCloseEditModal();
                displayMessage('Event updated successfully!', 'success');
            } else {
                displayMessage(response.message || 'Failed to update event', 'error');
            }
        } catch (error) {
            console.error('Error updating event:', error);
            displayMessage('Failed to update event. Please try again.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteEvent = (eventId: string) => {
        setDeletingEventId(eventId);
        setShowDeleteModal(true);
    };

    const handleConfirmDelete = async () => {
        if (!deletingEventId) {
            return;
        }

        setLoading(true);
        try {
            const response = await Delete(`/hr-admin/calendar/events/${deletingEventId}`);
            if (response.success || response.status === 200) {
                // Refresh events list to show updated list immediately
                const updatedEvents = await Get('/hr-admin/calendar/events');
                if (updatedEvents.success) {
                    const formattedEvents = updatedEvents.data.map((event: any) => ({
                        ...event,
                        startDate: new Date(event.startDate),
                        endDate: new Date(event.endDate)
                    }));
                    setEvents(formattedEvents);
                }
                handleCloseDeleteModal();
                displayMessage('Event deleted successfully!', 'success');
            } else {
                displayMessage(response.message || 'Failed to delete event', 'error');
            }
        } catch (error) {
            console.error('Error deleting event:', error);
            displayMessage('Failed to delete event. Please try again.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleEventClick = (event: Event) => {
        setSelectedEvent(event);
        setShowActionModal(true);
    };

    const handleActionEdit = () => {
        if (selectedEvent) {
            handleEditEvent(selectedEvent);
            handleCloseActionModal();
        }
    };

    const handleActionDelete = () => {
        const eventId = getEventId(selectedEvent!);
        if (eventId) {
            handleDeleteEvent(eventId);
            handleCloseActionModal();
        }
    };

    return (
        <div className="flex flex-row w-screen h-screen max-w-[2200px] justify-center items-center mx-auto bg-mainBg flex-wrap" >

            {/* for left side  */}
            <div className="lg:w-1/6 h-full bg-transparent">
                <SideDrawer />
            </div>

            {/* for right side */}
            <div className="flex flex-col h-screen w-screen lg:w-10/12 px-2 py-2 md:px-4 md:py-6  md:pr-16 bg-mainBg" >

                {/* 1st Navbar*/}
                <div className="w-full h-fit bg-mainBg mb-2 md:mb-6" >
                    <Navbar title="Calendar" />
                </div>

                {/* center */}
                <div className="w-full mb-2 md:mb-6 flex-1 min-h-0">
                    <div className="flex flex-col bg-white border border-gray-200 rounded-lg shadow-sm h-full min-h-0">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-3 md:px-4 py-2 border-b border-gray-200">
                            <div className="inline-flex items-center rounded-md border border-gray-200 bg-white p-1 overflow-x-auto">
                                <button
                                    type="button"
                                    onClick={() => setCurrentView(Views.MONTH)}
                                    className={`px-2 sm:px-3 py-1.5 text-xs sm:text-sm rounded-md whitespace-nowrap ${currentView === Views.MONTH ? 'bg-gray-100 text-gray-900' : 'text-gray-700 hover:bg-gray-50'}`}
                                >
                                    Month
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setCurrentView(Views.WEEK)}
                                    className={`px-2 sm:px-3 py-1.5 text-xs sm:text-sm rounded-md whitespace-nowrap ${currentView === Views.WEEK ? 'bg-gray-100 text-gray-900' : 'text-gray-700 hover:bg-gray-50'}`}
                                >
                                    Week
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setCurrentView(Views.DAY)}
                                    className={`px-2 sm:px-3 py-1.5 text-xs sm:text-sm rounded-md whitespace-nowrap ${currentView === Views.DAY ? 'bg-gray-100 text-gray-900' : 'text-gray-700 hover:bg-gray-50'}`}
                                >
                                    Day
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setCurrentView(Views.AGENDA)}
                                    className={`px-2 sm:px-3 py-1.5 text-xs sm:text-sm rounded-md whitespace-nowrap ${currentView === Views.AGENDA ? 'bg-gray-100 text-gray-900' : 'text-gray-700 hover:bg-gray-50'}`}
                                >
                                    Agenda
                                </button>
                            </div>
                            {(role === "HR-Admin" || role === "Supervisor" || role === "Employee") && (
                                <button
                                    onClick={handleAddEvent}
                                    className="inline-flex items-center justify-center bg-gradient-to-r from-blue-600 to-blue-700 text-white px-3 sm:px-6 py-2 sm:py-2.5 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl font-semibold text-xs sm:text-sm w-full sm:w-auto"
                                >
                                    <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                    <span className="hidden sm:inline">Add Event</span>
                                    <span className="sm:hidden">Add</span>
                                </button>
                            )}
                        </div>
                        <div className="flex-1 min-h-0 overflow-auto">
                            <style dangerouslySetInnerHTML={{
                                __html: `
                                    .rbc-event {
                                        border: none !important;
                                        border-top: none !important;
                                        border-bottom: none !important;
                                        border-left: none !important;
                                        border-right: none !important;
                                        box-shadow: none !important;
                                        outline: none !important;
                                    }
                                    .rbc-event-content {
                                        border: none !important;
                                    }
                                    .rbc-events-container {
                                        margin-right: 0 !important;
                                    }
                                `
                            }} />
                            <BigCalendar
                                localizer={localizer}
                                events={events}
                                startAccessor="startDate"
                                endAccessor="endDate"
                                view={currentView}
                                onView={(v) => setCurrentView(v)}
                                popup
                                eventPropGetter={getEventStyle}
                                onSelectEvent={handleEventClick}
                                components={{
                                    event: EventComponent
                                }}
                                style={{ height: '100%' }}
                                className="p-2 [&_.rbc-today]:bg-blue-50 [&_.rbc-header]:bg-gray-50 [&_.rbc-header]:border-b-2 [&_.rbc-header]:border-gray-200 [&_.rbc-time-view]:border-gray-200 [&_.rbc-event]:border-0 [&_.rbc-event]:outline-none [&_.rbc-event-content]:border-0 [&_.rbc-event]:!border-0 [&_.rbc-event]:!border-none [&_.rbc-event]:!box-shadow-none [&_.rbc-event]:!border-top-0 [&_.rbc-event]:!border-bottom-0 [&_.rbc-event]:!border-left-0 [&_.rbc-event]:!border-right-0"
                            />
                        </div>
                    </div>
                </div>

                {/* Add Event Modal */}
                {showModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl transform transition-all">
                            {/* Header */}
                            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-3 rounded-t-2xl">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                                            <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                            </svg>
                                        </div>
                                    </div>
                                    <div className="ml-4">
                                        <h2 className="text-xl font-bold text-white">Create New Event</h2>
                                    </div>
                                </div>
                            </div>

                            {/* Form */}
                            <div className="px-6 py-6 space-y-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-800 mb-2">Event Title</label>
                                    <input
                                        type="text"
                                        value={newEvent.title}
                                        onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                                        placeholder="Enter event title..."
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-800 mb-2">Start Date & Time</label>
                                        <input
                                            type="datetime-local"
                                            value={moment(newEvent.startDate).format('YYYY-MM-DDTHH:mm')}
                                            onChange={(e) => setNewEvent({ ...newEvent, startDate: new Date(e.target.value) })}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-800 mb-2">End Date & Time</label>
                                        <input
                                            type="datetime-local"
                                            value={moment(newEvent.endDate).format('YYYY-MM-DDTHH:mm')}
                                            onChange={(e) => setNewEvent({ ...newEvent, endDate: new Date(e.target.value) })}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-800 mb-2">Agenda & Notes</label>
                                    <textarea
                                        value={newEvent.agenda || ''}
                                        onChange={(e) => setNewEvent({ ...newEvent, agenda: e.target.value })}
                                        rows={4}
                                        placeholder="Add agenda items, notes, or description for this event..."
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white resize-none"
                                    />
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="px-6 py-4 bg-gray-50 rounded-b-2xl flex justify-end space-x-3">
                                <button
                                    onClick={handleCloseModal}
                                    disabled={loading}
                                    className="px-6 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSaveEvent}
                                    disabled={loading}
                                    className="px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center shadow-lg"
                                >
                                    {loading ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Creating...
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            Create Event
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Edit Event Modal */}
                {showEditModal && editingEvent && (
                    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl transform transition-all">
                            {/* Header */}
                            <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 px-6 py-3 rounded-t-2xl">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                                            <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                        </div>
                                    </div>
                                    <div className="ml-4">
                                        <h2 className="text-xl font-bold text-white">Edit Event</h2>
                                    </div>
                                </div>
                            </div>

                            {/* Form */}
                            <div className="px-6 py-6 space-y-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-800 mb-2">Event Title</label>
                                    <input
                                        type="text"
                                        value={editingEvent.title}
                                        onChange={(e) => setEditingEvent({ ...editingEvent, title: e.target.value })}
                                        placeholder="Enter event title..."
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-800 mb-2">Start Date & Time</label>
                                        <input
                                            type="datetime-local"
                                            value={moment(editingEvent.startDate).format('YYYY-MM-DDTHH:mm')}
                                            onChange={(e) => setEditingEvent({ ...editingEvent, startDate: new Date(e.target.value) })}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-800 mb-2">End Date & Time</label>
                                        <input
                                            type="datetime-local"
                                            value={moment(editingEvent.endDate).format('YYYY-MM-DDTHH:mm')}
                                            onChange={(e) => setEditingEvent({ ...editingEvent, endDate: new Date(e.target.value) })}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-800 mb-2">Agenda & Notes</label>
                                    <textarea
                                        value={editingEvent.agenda || ''}
                                        onChange={(e) => setEditingEvent({ ...editingEvent, agenda: e.target.value })}
                                        rows={4}
                                        placeholder="Add agenda items, notes, or description for this event..."
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white resize-none"
                                    />
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="px-6 py-4 bg-gray-50 rounded-b-2xl flex justify-end space-x-3">
                                <button
                                    onClick={handleCloseEditModal}
                                    disabled={loading}
                                    className="px-6 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleUpdateEvent}
                                    disabled={loading}
                                    className="px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-xl hover:from-emerald-700 hover:to-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center shadow-lg"
                                >
                                    {loading ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Updating...
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                            </svg>
                                            Update Event
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Delete Confirmation Modal */}
                {showDeleteModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white p-6 rounded-lg w-96 shadow-xl">
                            <div className="flex items-center mb-4">
                                <div className="flex-shrink-0">
                                    <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <h2 className="text-xl font-semibold text-gray-900">Delete Event</h2>
                                </div>
                            </div>
                            <p className="text-gray-600 mb-6">
                                Are you sure you want to delete this event? This action cannot be undone.
                            </p>
                            <div className="flex justify-end space-x-3">
                                <button
                                    onClick={handleCloseDeleteModal}
                                    disabled={loading}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleConfirmDelete}
                                    disabled={loading}
                                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                                >
                                    {loading ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Deleting...
                                        </>
                                    ) : (
                                        'Delete'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Event Action Modal */}
                {showActionModal && selectedEvent && (
                    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl transform transition-all">
                            {/* Header */}
                            <div
                                className="px-6 py-3 rounded-t-2xl"
                                style={{
                                    background: 'linear-gradient(to right, #9333ea, #7c3aed)',
                                    color: 'white'
                                }}
                            >
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <div
                                            className="w-10 h-10 rounded-full flex items-center justify-center"
                                            style={{ backgroundColor: 'rgba(255, 255, 255, 0.3)' }}
                                        >
                                            <svg
                                                className="h-6 w-6"
                                                fill="none"
                                                stroke="white"
                                                viewBox="0 0 24 24"
                                                strokeWidth={2.5}
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                    </div>
                                    <div className="ml-4">
                                        <h2
                                            className="text-xl font-bold"
                                            style={{ color: 'white' }}
                                        >
                                            Event Details
                                        </h2>
                                        <p
                                            className="text-sm font-medium mt-1"
                                            style={{ color: 'rgba(255, 255, 255, 0.8)' }}
                                        >
                                            View and manage your event
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="px-6 py-6">
                                <div className="mb-6">
                                    <h3 className="text-xl font-bold text-gray-900 mb-4">{selectedEvent.title}</h3>

                                    <div className="space-y-4">
                                        <div className="flex items-start">
                                            <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                                                <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-gray-700">Start Time</p>
                                                <p className="text-gray-600">{moment(selectedEvent.startDate).format('MMM DD, YYYY h:mm A')}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-start">
                                            <div className="flex-shrink-0 w-6 h-6 bg-red-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                                                <svg className="w-3 h-3 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-gray-700">End Time</p>
                                                <p className="text-gray-600">{moment(selectedEvent.endDate).format('MMM DD, YYYY h:mm A')}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-start">
                                            <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                                                <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                                </svg>
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm font-semibold text-gray-700 mb-2">Agenda & Notes</p>
                                                {selectedEvent.agenda && selectedEvent.agenda.trim() ? (
                                                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                                                        <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{selectedEvent.agenda}</p>
                                                    </div>
                                                ) : (
                                                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                                                        <p className="text-gray-400 italic">No agenda notes available</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="px-4 sm:px-6 py-4 bg-gray-50 rounded-b-2xl">
                                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 sm:justify-end">
                                    <button
                                        onClick={handleCloseActionModal}
                                        className="px-4 sm:px-6 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-200 order-3 sm:order-1"
                                    >
                                        Close
                                    </button>
                                    <button
                                        onClick={handleActionEdit}
                                        className="px-4 sm:px-6 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-xl hover:from-emerald-700 hover:to-emerald-800 transition-all duration-200 flex items-center justify-center shadow-lg order-1 sm:order-2"
                                    >
                                        <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                        <span className="hidden sm:inline">Edit Event</span>
                                        <span className="sm:hidden">Edit</span>
                                    </button>
                                    <button
                                        onClick={handleActionDelete}
                                        className="px-4 sm:px-6 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-red-600 to-red-700 rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-200 flex items-center justify-center shadow-lg order-2 sm:order-3"
                                    >
                                        <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                        <span className="hidden sm:inline">Delete Event</span>
                                        <span className="sm:hidden">Delete</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
};

export default Calendar;
