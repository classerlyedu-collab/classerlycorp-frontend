import { useEffect, useCallback } from 'react';
import { Socket } from 'socket.io-client';

interface JoinCommentRoomData {
    hrAdminId: string;
    employeeId: string;
}

interface NewCommentData {
    hrAdminId: string;
    employeeId: string;
    comment: any;
}

interface UseCommentSocketProps {
    socket: Socket | null;
    hrAdminId?: string;
    employeeId?: string;
    onCommentReceived?: (comment: any) => void;
}

export const useCommentSocket = ({
    socket,
    hrAdminId,
    employeeId,
    onCommentReceived
}: UseCommentSocketProps) => {

    // Join comment room for real-time updates
    const joinCommentRoom = useCallback(() => {
        if (socket && hrAdminId && employeeId) {
            socket.emit('join-comment-room', { hrAdminId, employeeId });
        }
    }, [socket, hrAdminId, employeeId]);

    // Leave comment room
    const leaveCommentRoom = useCallback(() => {
        if (socket && hrAdminId && employeeId) {
            socket.emit('leave-comment-room', { hrAdminId, employeeId });
        }
    }, [socket, hrAdminId, employeeId]);

    // Send new comment via socket (as backup/redundancy)
    const sendCommentViaSocket = useCallback((commentData: NewCommentData) => {
        if (socket) {
            socket.emit('new-comment', commentData);
        }
    }, [socket]);

    // Set up event listeners
    useEffect(() => {
        if (!socket) return;

        const handleCommentReceived = (data: { comment: any; timestamp: Date }) => {
            if (onCommentReceived) {
                onCommentReceived(data.comment);
            }
        };

        // Listen for new comments
        socket.on('comment-received', handleCommentReceived);

        // Cleanup
        return () => {
            socket.off('comment-received', handleCommentReceived);
        };
    }, [socket, onCommentReceived]);

    // Auto-join/leave comment room when IDs change
    useEffect(() => {
        if (hrAdminId && employeeId && socket) {
            joinCommentRoom();
        }

        return () => {
            if (hrAdminId && employeeId && socket) {
                leaveCommentRoom();
            }
        };
    }, [joinCommentRoom, leaveCommentRoom, hrAdminId, employeeId, socket]);

    return {
        joinCommentRoom,
        leaveCommentRoom,
        sendCommentViaSocket
    };
};
