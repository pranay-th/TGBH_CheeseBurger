'use client';
import axios from 'axios';
import { useState, useEffect } from "react";

export default function Dashboard() {
  const [pentestingReport, setPentestingReport] = useState("");
  const [codeSimilarityReport, setCodeSimilarityReport] = useState("");
  const [isLoading, setIsLoading] = useState({
    pentest: false,
    codeSimilarity: false
  });
  const [error, setError] = useState<{
    pentest: string | null;
    codeSimilarity: string | null;
  }>({
    pentest: null,
    codeSimilarity: null
  });

  const fetchPentestingReport = async () => {
    setIsLoading(prev => ({ ...prev, pentest: true }));
    setError(prev => ({ ...prev, pentest: null }));

    try {
      const response = await axios.post('http://localhost:5050/api/pentesting');
      const getResponse = await axios.get('http://localhost:5050/api/pentesting/report');

      if (getResponse.data.success) {
        setPentestingReport(getResponse.data.content);
      } else {
        throw new Error('Failed to fetch report content');
      }
    } catch (error) {
      console.error('Error fetching pentesting report:', error);
      setError(prev => ({
        ...prev,
        pentest: 'Failed to fetch pentesting report. Please try again later.'
      }));
    } finally {
      setIsLoading(prev => ({ ...prev, pentest: false }));
    }
  };

  const fetchCodeSimilarityReport = async () => {
    setIsLoading(prev => ({ ...prev, codeSimilarity: true }));
    setError(prev => ({ ...prev, codeSimilarity: null }));

    const payload = {
      question_text: "Write a function to calculate the nth Fibonacci number",
      candidate_code: "def fibonacci(n):\n    if n <= 0:\n        return 0\n    elif n == 1:\n        return 1\n    else:\n        return fibonacci(n-1) + fibonacci(n-2)",
      language: "Python",
      constraints: "Use recursive approach"
    };

    try {
      const response = await fetch('http://localhost:8004/compare-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ payload }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch code similarity report');
      }

      const data = await response.json();
      const reportResponse = await fetch(data.reportPath);
      const reportText = await reportResponse.text();
      setCodeSimilarityReport(reportText);
    } catch (error) {
      console.error('Error fetching code similarity report:', error);
      setError(prev => ({
        ...prev,
        codeSimilarity: 'Failed to fetch code similarity report. Please try again later.'
      }));
    } finally {
      setIsLoading(prev => ({ ...prev, codeSimilarity: false }));
    }
  };

  useEffect(() => {
    fetchPentestingReport();
    fetchCodeSimilarityReport();
  }, []);

  const ReportSection = ({ title, content, isLoading, error, onRetry }) => (
    <div className="w-full max-w-4xl mx-auto mb-8 p-6 bg-gray-800 rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-indigo-400">{title}</h2>
        {error && (
          <button
            onClick={onRetry}
            className="px-4 py-2 bg-indigo-600 rounded hover:bg-indigo-700 transition-colors"
          >
            Retry
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : error ? (
        <div className="text-red-400 p-4 bg-red-900/20 rounded">
          {error}
        </div>
      ) : (
        <pre className="bg-gray-900 p-4 rounded-md text-left overflow-auto max-h-[500px] whitespace-pre-wrap">
          {content || "No data available"}
        </pre>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      <nav className="bg-gray-800 px-6 py-4 shadow-md sticky top-0 z-10">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <span className="text-xl font-bold text-indigo-400">Admin Dashboard</span>
          </div>
        </div>
      </nav>

      <main className="flex-1 container mx-auto px-6 py-8">
        <h1 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent">
          Security Reports
        </h1>

        <ReportSection
          title="Pentesting Report"
          content={pentestingReport}
          isLoading={isLoading.pentest}
          error={error.pentest}
          onRetry={fetchPentestingReport}
        />

        <ReportSection
          title="Code Similarity Report"
          content={codeSimilarityReport}
          isLoading={isLoading.codeSimilarity}
          error={error.codeSimilarity}
          onRetry={fetchCodeSimilarityReport}
        />
      </main>

      <footer className="bg-gray-800 py-6 px-6 mt-auto">
        <div className="container mx-auto text-center text-gray-400">
          <p>© {new Date().getFullYear()} TGBH CheeseBurger. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
