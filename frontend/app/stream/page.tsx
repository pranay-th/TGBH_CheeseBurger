// app/stream/page.tsx
'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

// Define question type
interface Question {
    id: number;
    title: string;
    description: string;
    difficulty: 'Easy' | 'Medium' | 'Hard' | 'Very Hard';
    examples: {
        input: string;
        output: string;
        explanation?: string;
    }[];
    constraints: string[];
}

export default function ExamPage() {
    const [userId, setUserId] = useState<number | null>(null);
    const [username, setUsername] = useState<string | null>(null);
    const [currentQuestion, setCurrentQuestion] = useState<number>(0);
    const [answers, setAnswers] = useState<{ [key: number]: string }>({});
    const [timeLeft, setTimeLeft] = useState<number>(60 * 60); // 60 minutes
    const [submitted, setSubmitted] = useState<boolean>(false);
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const [connected, setConnected] = useState<boolean>(false);
    const lastMousePos = useRef({ x: 0, y: 0 });
    const throttleTimeout = useRef<NodeJS.Timeout | null>(null);
    const router = useRouter();

    // Sample coding questions
    const questions: Question[] = [
        {
            id: 1,
            title: "Two Sum",
            difficulty: "Easy",
            description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice.",
            examples: [
                {
                    input: "nums = [2,7,11,15], target = 9",
                    output: "[0,1]",
                    explanation: "Because nums[0] + nums[1] == 9, we return [0, 1]."
                },
                {
                    input: "nums = [3,2,4], target = 6",
                    output: "[1,2]"
                }
            ],
            constraints: [
                "2 <= nums.length <= 104",
                "-109 <= nums[i] <= 109",
                "-109 <= target <= 109",
                "Only one valid answer exists."
            ]
        },
        {
            id: 2,
            title: "Valid Sudoku",
            difficulty: "Medium",
            description: "Determine if a 9 x 9 Sudoku board is valid. Only the filled cells need to be validated according to the following rules:\n\n1. Each row must contain the digits 1-9 without repetition.\n2. Each column must contain the digits 1-9 without repetition.\n3. Each of the nine 3 x 3 sub-boxes of the grid must contain the digits 1-9 without repetition.",
            examples: [
                {
                    input: 'board = [\n["5","3",".",".","7",".",".",".","."],\n["6",".",".","1","9","5",".",".","."],\n[".","9","8",".",".",".",".","6","."],\n["8",".",".",".","6",".",".",".","3"],\n["4",".",".","8",".","3",".",".","1"],\n["7",".",".",".","2",".",".",".","6"],\n[".","6",".",".",".",".","2","8","."],\n[".",".",".","4","1","9",".",".","5"],\n[".",".",".",".","8",".",".","7","9"]\n]',
                    output: "true",
                    explanation: "The board is valid according to the rules."
                }
            ],
            constraints: [
                "board.length == 9",
                "board[i].length == 9",
                "board[i][j] is a digit 1-9 or '.'"
            ]
        },
        {
            id: 3,
            title: "Merge k Sorted Lists",
            difficulty: "Hard",
            description: "You are given an array of k linked-lists lists, each linked-list is sorted in ascending order. Merge all the linked-lists into one sorted linked-list and return it.",
            examples: [
                {
                    input: "lists = [[1,4,5],[1,3,4],[2,6]]",
                    output: "[1,1,2,3,4,4,5,6]",
                    explanation: "The linked-lists are: [1->4->5, 1->3->4, 2->6]. Merging them into one sorted list: 1->1->2->3->4->4->5->6"
                }
            ],
            constraints: [
                "k == lists.length",
                "0 <= k <= 10^4",
                "0 <= lists[i].length <= 500",
                "-10^4 <= lists[i][j] <= 10^4",
                "lists[i] is sorted in ascending order",
                "The sum of lists[i].length will not exceed 10^4"
            ]
        },
        {
            id: 4,
            title: "Median of Two Sorted Arrays",
            difficulty: "Very Hard",
            description: "Given two sorted arrays nums1 and nums2 of size m and n respectively, return the median of the two sorted arrays. The overall run time complexity should be O(log (m+n)).",
            examples: [
                {
                    input: "nums1 = [1,3], nums2 = [2]",
                    output: "2.00000",
                    explanation: "Merged array = [1,2,3] and median is 2."
                },
                {
                    input: "nums1 = [1,2], nums2 = [3,4]",
                    output: "2.50000",
                    explanation: "Merged array = [1,2,3,4] and median is (2 + 3) / 2 = 2.5."
                }
            ],
            constraints: [
                "nums1.length == m",
                "nums2.length == n",
                "0 <= m <= 1000",
                "0 <= n <= 1000",
                "1 <= m + n <= 2000",
                "-10^6 <= nums1[i], nums2[i] <= 10^6"
            ]
        }
    ];

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

                // Handle other WebSocket messages if needed
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

    // Timer countdown
    useEffect(() => {
        if (timeLeft <= 0 || submitted) return;

        const timer = setInterval(() => {
            setTimeLeft(prev => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft, submitted]);

    // Format time as MM:SS
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleAnswerChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setAnswers({
            ...answers,
            [currentQuestion]: e.target.value
        });
    };

    const handleNextQuestion = () => {
        if (currentQuestion < questions.length - 1) {
            setCurrentQuestion(currentQuestion + 1);
        }
    };

    const handlePrevQuestion = () => {
        if (currentQuestion > 0) {
            setCurrentQuestion(currentQuestion - 1);
        }
    };

    const handleSubmit = async () => {
        // Here you would normally submit to an API
        setSubmitted(true);

        // For demo purposes, we're just logging
        console.log('Exam submitted with answers:', answers);

        // Track the submission as an event
        try {
            await fetch('/api/event', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    type: 'EXAM_SUBMIT',
                    details: `Exam completed with ${Object.keys(answers).length} questions answered`
                }),
            });
        } catch (error) {
            console.error('Error logging event:', error);
        }
    };

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

    if (!userId) {
        return <div className="flex justify-center items-center h-screen">Loading...</div>;
    }

    const question = questions[currentQuestion];

    return (
        <main className="flex flex-col min-h-screen bg-gray-900 text-white">
            {/* Header with timer and navigation */}
            <header className="bg-gray-800 p-4 shadow-md">
                <div className="container mx-auto flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-indigo-400">Coding Exam</h1>
                    <div className="flex items-center gap-4">
                        {!submitted && (
                            <div className={`font-mono text-xl ${timeLeft < 300 ? 'text-red-500' : 'text-white'}`}>
                                Time Remaining: {formatTime(timeLeft)}
                            </div>
                        )}
                        <div className="text-gray-300">
                            Logged in as <span className="font-semibold text-white">{username}</span>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            {submitted ? (
                <div className="flex-1 flex flex-col items-center justify-center p-8">
                    <div className="bg-green-600 p-8 rounded-lg shadow-lg text-center max-w-md">
                        <h2 className="text-3xl font-bold mb-4">Exam Submitted!</h2>
                        <p className="mb-6">Thank you for completing the coding exam. Your answers have been recorded.</p>
                        <button
                            onClick={() => router.push('/')}
                            className="px-6 py-3 bg-white text-green-700 rounded-md font-semibold hover:bg-gray-100 transition-colors"
                        >
                            Return to Home
                        </button>
                    </div>
                </div>
            ) : (
                <div className="flex-1 container mx-auto p-6">
                    {/* Question navigation */}
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex space-x-2">
                            {questions.map((q, idx) => (
                                <button
                                    key={q.id}
                                    onClick={() => setCurrentQuestion(idx)}
                                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold
                                        ${currentQuestion === idx
                                            ? 'bg-indigo-600 text-white'
                                            : answers[idx]
                                                ? 'bg-green-700 text-white'
                                                : 'bg-gray-700 text-gray-300'
                                        }`}
                                >
                                    {idx + 1}
                                </button>
                            ))}
                        </div>
                        <div>
                            Question {currentQuestion + 1} of {questions.length}
                        </div>
                    </div>

                    {/* Question content */}
                    <div className="bg-gray-800 rounded-lg p-6 shadow-lg mb-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold">{question.title}</h2>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium
                                ${question.difficulty === 'Easy' ? 'bg-green-800 text-green-200' :
                                    question.difficulty === 'Medium' ? 'bg-yellow-800 text-yellow-200' :
                                        question.difficulty === 'Hard' ? 'bg-red-800 text-red-200' :
                                            'bg-purple-800 text-purple-200'}`}>
                                {question.difficulty}
                            </span>
                        </div>

                        <div className="mb-6 whitespace-pre-line text-gray-300">
                            {question.description}
                        </div>

                        <div className="mb-6">
                            <h3 className="text-lg font-semibold mb-2">Examples:</h3>
                            <div className="space-y-4">
                                {question.examples.map((example, idx) => (
                                    <div key={idx} className="bg-gray-900 p-4 rounded-md">
                                        <div className="mb-2">
                                            <span className="font-semibold text-gray-400">Input:</span>
                                            <pre className="text-white mt-1 p-2 bg-gray-800 rounded whitespace-pre-wrap">{example.input}</pre>
                                        </div>
                                        <div className="mb-2">
                                            <span className="font-semibold text-gray-400">Output:</span>
                                            <pre className="text-white mt-1 p-2 bg-gray-800 rounded whitespace-pre-wrap">{example.output}</pre>
                                        </div>
                                        {example.explanation && (
                                            <div>
                                                <span className="font-semibold text-gray-400">Explanation:</span>
                                                <div className="text-gray-300 mt-1">{example.explanation}</div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="mb-6">
                            <h3 className="text-lg font-semibold mb-2">Constraints:</h3>
                            <ul className="list-disc pl-5 text-gray-300">
                                {question.constraints.map((constraint, idx) => (
                                    <li key={idx}>{constraint}</li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Answer area */}
                    <div className="bg-gray-800 rounded-lg p-6 shadow-lg mb-6">
                        <h3 className="text-lg font-semibold mb-4">Your Solution:</h3>
                        <textarea
                            value={answers[currentQuestion] || ''}
                            onChange={handleAnswerChange}
                            placeholder="Write your code solution here..."
                            className="w-full h-64 p-4 bg-gray-900 text-white border border-gray-700 rounded-md font-mono resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>

                    {/* Navigation buttons */}
                    <div className="flex justify-between">
                        <button
                            onClick={handlePrevQuestion}
                            disabled={currentQuestion === 0}
                            className={`px-5 py-2 rounded-md ${currentQuestion === 0
                                ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                                : 'bg-gray-700 text-white hover:bg-gray-600'
                                }`}
                        >
                            Previous
                        </button>

                        <div className="flex space-x-4">
                            {currentQuestion < questions.length - 1 ? (
                                <button
                                    onClick={handleNextQuestion}
                                    className="px-5 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                                >
                                    Next
                                </button>
                            ) : (
                                <button
                                    onClick={handleSubmit}
                                    className="px-5 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                                >
                                    Submit Exam
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}