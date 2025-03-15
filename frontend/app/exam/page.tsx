'use client';

import { useState, useEffect } from 'react';
import { MonacoEditor } from '../components/editor/MonacoEditor';
import { useRouter } from 'next/navigation';

interface CodingQuestion {
  id: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  question: string;
  language: string;
  initialCode: string;
  testCases?: string;
}

export default function ExamPage() {
  const [questions, setQuestions] = useState<CodingQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(7200); // 2 hours in seconds
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetchExamQuestions();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const fetchExamQuestions = async () => {
    try {
      const response = await fetch('/api/exam');
      const data = await response.json();
      
      if (data.success) {
        setQuestions(data.data.questions);
        setTimeLeft(data.data.timeLimit);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to load exam questions');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = () => {
    const hours = Math.floor(timeLeft / 3600);
    const minutes = Math.floor((timeLeft % 3600) / 60);
    const seconds = timeLeft % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleCodeChange = async (questionId: string, code: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: code }));
    
    // Auto-save after 1 second of no typing
    const saveTimeout = setTimeout(async () => {
      try {
        await fetch('/api/exam', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ questionId, code })
        });
      } catch (err) {
        console.error('Failed to auto-save:', err);
      }
    }, 1000);

    return () => clearTimeout(saveTimeout);
  };

  const handleSubmitExam = async () => {
    try {
      const response = await fetch('/api/exam', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          answers,
          timeSpent: 7200 - timeLeft 
        })
      });

      const data = await response.json();
      
      if (data.success) {
        router.push('/exam/results');
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to submit exam');
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
      Loading exam...
    </div>;
  }

  if (error) {
    return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
      Error: {error}
    </div>;
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Coding Exam</h1>
          <div className="text-xl font-mono bg-gray-800 px-4 py-2 rounded">
            Time Left: {formatTime()}
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <div className="mb-4 flex justify-between items-center">
            <span className="text-gray-400">
              Question {currentQuestionIndex + 1} of {questions.length}
            </span>
            <span className={`px-3 py-1 rounded text-sm ${
              currentQuestion?.difficulty === 'Easy' ? 'bg-green-600' :
              currentQuestion?.difficulty === 'Medium' ? 'bg-yellow-600' :
              'bg-red-600'
            }`}>
              {currentQuestion?.difficulty}
            </span>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-bold mb-2">{currentQuestion?.title}</h2>
            <div className="prose prose-invert max-w-none">
              <pre className="whitespace-pre-wrap font-normal text-gray-300">
                {currentQuestion?.question}
              </pre>
            </div>
          </div>

          {currentQuestion?.testCases && (
            <div className="bg-gray-700/50 p-4 rounded mb-6">
              <h3 className="text-sm font-semibold mb-2 text-gray-300">Test Cases:</h3>
              <pre className="text-sm text-gray-300 whitespace-pre-wrap">
                {currentQuestion.testCases}
              </pre>
            </div>
          )}

          <div className="h-[500px] border border-gray-700 rounded">
            <MonacoEditor
              language={currentQuestion?.language || 'javascript'}
              value={answers[currentQuestion?.id] || currentQuestion?.initialCode || ''}
              onChange={(value) => handleCodeChange(currentQuestion?.id, value)}
              height="500px"
            />
          </div>
        </div>

        <div className="flex justify-between">
          <button
            onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
            disabled={currentQuestionIndex === 0}
            className="px-4 py-2 bg-gray-700 rounded disabled:opacity-50 hover:bg-gray-600"
          >
            Previous
          </button>
          
          {currentQuestionIndex === questions.length - 1 ? (
            <button
              onClick={handleSubmitExam}
              className="px-4 py-2 bg-indigo-600 rounded hover:bg-indigo-500"
            >
              Submit Exam
            </button>
          ) : (
            <button
              onClick={() => setCurrentQuestionIndex((prev) => Math.min(questions.length - 1, prev + 1))}
              className="px-4 py-2 bg-indigo-600 rounded hover:bg-indigo-500"
            >
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  );
}