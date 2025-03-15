// app/stream/page.tsx
'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

export default function Stream() {
    const [connected, setConnected] = useState(false);
    const [events, setEvents] = useState<string[]>([]);
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const [userId, setUserId] = useState<number | null>(null);
    const [username, setUsername] = useState<string | null>(null);
    const lastMousePos = useRef({ x: 0, y: 0 });
    const throttleTimeout = useRef<NodeJS.Timeout | null>(null);
    const router = useRouter();

    // Fetch user info
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await fetch('/api/me');
                const data = await response.json();

                if (data.id && data.username) {
                    console.log('User authenticated:', data);
                    setUserId(data.id);
                    setUsername(data.username);
                } else {
                    console.error('Authentication failed');
                    router.push('/login');
                }
            } catch (error) {
                console.error('Error fetching user:', error);
                router.push('/login');
            }
        };

        fetchUser();
    }, [router]);

    // Setup WebSocket connection
    useEffect(() => {
        if (!userId) return;

        console.log('Setting up WebSocket with userId:', userId);

        // Create WebSocket connection
        const ws = new WebSocket('ws://localhost:8080');

        ws.onopen = () => {
            console.log('Connected to WebSocket server');
            setConnected(true);

            // Send initial tab information
            ws.send(JSON.stringify({
                type: 'tabSwitch',
                userId: userId,
                tabUrl: window.location.href,
                action: 'initial'
            }));
        };

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                console.log('Received:', data);

                // Skip heartbeat acknowledgements
                if (data.type === 'heartbeat_ack') return;

                let eventText = '';
                switch (data.type) {
                    case 'keystroke':
                        eventText = `Keystroke: ${data.keyPressed}`;
                        break;
                    case 'mouseMovement':
                        eventText = `Mouse Movement: (${data.xPos}, ${data.yPos})`;
                        break;
                    case 'tabSwitch':
                        eventText = `Tab Switch: ${data.tabUrl}`;
                        if (data.action) {
                            eventText += ` (${data.action})`;
                        }
                        break;
                    case 'info':
                        eventText = `Server: ${data.message}`;
                        break;
                    case 'error':
                        eventText = `Error: ${data.message}`;
                        break;
                    default:
                        eventText = `Unknown: ${JSON.stringify(data)}`;
                }

                setEvents(prev => [eventText, ...prev].slice(0, 50));
            } catch (error) {
                console.error('Error parsing message:', error);
            }
        };

        ws.onclose = () => {
            console.log('Disconnected from WebSocket server');
            setConnected(false);
        };

        ws.onerror = (error) => {
            console.error('WebSocket error:', error);
        };

        setSocket(ws);

        // Setup keystroke tracking
        const handleKeyDown = (e: KeyboardEvent) => {
            if (ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({
                    type: 'keystroke',
                    userId: userId,
                    keyPressed: e.key
                }));
            }
        };

        // Setup mouse movement tracking
        const handleMouseMove = (e: MouseEvent) => {
            const currentX = Math.round(e.clientX);
            const currentY = Math.round(e.clientY);

            // Calculate distance moved
            const deltaX = Math.abs(currentX - lastMousePos.current.x);
            const deltaY = Math.abs(currentY - lastMousePos.current.y);

            // Only track significant movements
            if (deltaX > 5 || deltaY > 5) {
                // Throttle events
                if (!throttleTimeout.current) {
                    throttleTimeout.current = setTimeout(() => {
                        if (ws.readyState === WebSocket.OPEN) {
                            ws.send(JSON.stringify({
                                type: 'mouseMovement',
                                userId: userId,
                                xPos: currentX,
                                yPos: currentY
                            }));
                        }

                        // Update last position
                        lastMousePos.current = { x: currentX, y: currentY };
                        throttleTimeout.current = null;
                    }, 50);
                }
            }
        };

        // Setup tab switch tracking
        const handleVisibilityChange = () => {
            if (ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({
                    type: 'tabSwitch',
                    userId: userId,
                    tabUrl: window.location.href,
                    isVisible: document.visibilityState === 'visible'
                }));
            }
        };

        // Add event listeners
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('visibilitychange', handleVisibilityChange);

        // Setup heartbeat
        const heartbeatInterval = setInterval(() => {
            if (ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({
                    type: 'heartbeat',
                    userId: userId
                }));
            }
        }, 30000);

        // Clean up
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            clearInterval(heartbeatInterval);

            if (ws) {
                ws.close();
            }
        };
    }, [userId]);

    const handleLogout = async () => {
        try {
            await fetch('/api/logout', { method: 'POST' });
            if (socket) {
                socket.close();
            }
            router.push('/login');
        } catch (error) {
            console.error('Error logging out:', error);
        }
    };

    const sendTestEvents = () => {
        if (socket && socket.readyState === WebSocket.OPEN && userId) {
            // Send test keystroke
            socket.send(JSON.stringify({
                type: 'keystroke',
                userId: userId,
                keyPressed: 'Test'
            }));

            // Send test mouse movement
            socket.send(JSON.stringify({
                type: 'mouseMovement',
                userId: userId,
                xPos: 100,
                yPos: 100
            }));

            // Send test tab switch
            socket.send(JSON.stringify({
                type: 'tabSwitch',
                userId: userId,
                tabUrl: 'https://example.com',
                action: 'test'
            }));
        }
    };

    return (
        <main className="flex flex-col items-center p-8 max-w-4xl mx-auto min-h-screen bg-gray-900 text-white">
            <div className="w-full flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-white">Event Streaming</h1>

                {username && (
                    <div className="flex items-center gap-4">
                        <p className="text-gray-400">
                            Logged in as <span className="font-semibold text-white">{username}</span>
                        </p>
                        <button
                            onClick={handleLogout}
                            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                        >
                            Logout
                        </button>
                    </div>
                )}
            </div>

            <div className="mb-4 text-lg">
                Connection Status:
                <span className={`ml-2 font-semibold ${connected ? 'text-green-500' : 'text-red-500'}`}>
                    {connected ? 'Connected' : 'Disconnected'}
                </span>
            </div>

            <button
                onClick={sendTestEvents}
                disabled={!connected || !userId}
                className={`px-4 py-2 rounded-md text-white font-medium mb-6 ${
                    connected && userId
                        ? 'bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:outline-none'
                        : 'bg-gray-700 cursor-not-allowed'
                }`}
            >
                Send Test Events
            </button>

            <div className="w-full mb-8 p-6 border border-gray-700 rounded-lg shadow-md bg-gray-800">
                <h2 className="text-xl font-semibold mb-4 text-white">Instructions:</h2>
                <ul className="list-disc pl-6 space-y-2 text-gray-300">
                    <li>Move your mouse to trigger mouse movement events</li>
                    <li>Press any key to trigger keystroke events</li>
                    <li>Switch tabs or minimize the window to trigger tab switch events</li>
                </ul>
            </div>

            <div className="w-full">
                <div className="flex justify-between items-center mb-3">
                    <h2 className="text-xl font-semibold text-white">Event Log:</h2>
                    <button
                        onClick={() => setEvents([])}
                        className="px-3 py-1 text-sm bg-gray-700 hover:bg-gray-600 rounded-md text-white"
                    >
                        Clear Log
                    </button>
                </div>
                <div className="h-96 overflow-y-auto border border-gray-700 rounded-lg p-4 bg-gray-800">
                    {events.length === 0 ? (
                        <p className="text-gray-400 italic">No events yet. Interact with the page to generate events.</p>
                    ) : (
                        <div className="space-y-1">
                            {events.map((event, index) => (
                                <div
                                    key={index}
                                    className="p-2 border-b border-gray-700 last:border-0 hover:bg-gray-700 transition-colors"
                                >
                                    {event}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="mt-8 text-sm text-gray-500">
                WebSocket server running at ws://localhost:8080
            </div>
        </main>
    );
}
