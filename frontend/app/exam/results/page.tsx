'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface ExamResult {
  score: number;
  timeSpent: number;
  submittedAt: string;
}

export default function ResultsPage() {
  const [result, setResult] = useState<ExamResult | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Fetch results from local storage or API
    const examResult = localStorage.getItem('examResult');
    if (examResult) {
      setResult(JSON.parse(examResult));
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Exam Results</h1>
        
        {result ? (
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="text-center mb-6">
              <div className="text-6xl font-bold text-indigo-400 mb-2">
                {result.score}%
              </div>
              <div className="text-gray-400">Final Score</div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="bg-gray-700/50 p-4 rounded">
                <div className="text-lg font-semibold">{Math.floor(result.timeSpent / 60)} minutes</div>
                <div className="text-sm text-gray-400">Time Spent</div>
              </div>
              <div className="bg-gray-700/50 p-4 rounded">
                <div className="text-lg font-semibold">
                  {new Date(result.submittedAt).toLocaleDateString()}
                </div>
                <div className="text-sm text-gray-400">Submission Date</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-400">Loading results...</div>
        )}

        <div className="mt-8 flex justify-center">
          <button
            onClick={() => router.push('/exam')}
            className="px-6 py-2 bg-indigo-600 rounded hover:bg-indigo-500"
          >
            Take Another Exam
          </button>
        </div>
      </div>
    </div>
  );
} 