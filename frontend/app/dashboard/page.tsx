'use client';

import { useState, useEffect } from "react";

export default function Dashboard() {
  const [pentestingReport, setPentestingReport] = useState("");
  const [codeSimilarityReport, setCodeSimilarityReport] = useState("");

  // Function to fetch pentesting report
  const fetchPentestingReport = async () => {
    try {
      const response = await fetch('http://localhost:5050/api/pentesting', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      const reportResponse = await fetch(data.reportPath);
      const reportText = await reportResponse.text();
      setPentestingReport(reportText);
    } catch (error) {
      console.error('Error fetching pentesting report:', error);
    }
  };

  // Function to fetch code similarity report
  const fetchCodeSimilarityReport = async () => {
    try {
      const response = await fetch('http://localhost:8004/compare-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ payload: 'your-payload-data' }),
      });
      const data = await response.json();
      const reportResponse = await fetch(data.reportPath);
      const reportText = await reportResponse.text();
      setCodeSimilarityReport(reportText);
    } catch (error) {
      console.error('Error fetching code similarity report:', error);
    }
  };

  useEffect(() => {
    fetchPentestingReport();
    fetchCodeSimilarityReport();
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      <nav className="bg-gray-800 px-6 py-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <span className="text-xl font-bold text-indigo-400">Admin Dashboard</span>
          </div>
        </div>
      </nav>

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 text-center">
        <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent">
          Reports
        </h1>
        
        <div className="report-section">
          <h2 className="text-3xl font-bold mb-4">Pentesting Report</h2>
          <pre className="bg-gray-800 p-4 rounded-md text-left overflow-auto max-w-full max-h-96">
            {pentestingReport || "Loading..."}
          </pre>
        </div>

        <div className="report-section mt-8">
          <h2 className="text-3xl font-bold mb-4">Code Similarity Report</h2>
          <pre className="bg-gray-800 p-4 rounded-md text-left overflow-auto max-w-full max-h-96">
            {codeSimilarityReport || "Loading..."}
          </pre>
        </div>
      </div>

      <footer className="bg-gray-900 py-8 px-6 border-t border-gray-800">
        <div className="container mx-auto text-center text-gray-400">
          <p>© 2023 TGBH CheeseBurger. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}