import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface UseSocketReturn {
    socket: Socket | null;
    isConnected: boolean;
}

export const useSocket = (token?: string): UseSocketReturn => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        if (!token) return;

        // Initialize socket connection
        const socketInstance = io('http://localhost:8082', {
            auth: {
                token: token
            },
            transports: ['polling', 'websocket'], // Try polling first, then websocket
            timeout: 20000,
            forceNew: true,
            autoConnect: true,
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionAttempts: 5
        });

        // Connection events
        socketInstance.on('connect', () => {
            setIsConnected(true);
        });

        socketInstance.on('connect_error', (error) => {
            setIsConnected(false);
        });

        socketInstance.on('disconnect', (reason) => {
            setIsConnected(false);
        });

        socketInstance.on('error', (error) => {
            // Silent error handling
        });

        setSocket(socketInstance);

        // Cleanup
        return () => {
            socketInstance.disconnect();
        };
    }, [token]);

    return { socket, isConnected };
};
