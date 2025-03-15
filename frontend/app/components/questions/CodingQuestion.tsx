'use client';

import React from 'react';
import { CodingQuestion as CodingQuestionType } from '@/types/exam';
import dynamic from 'next/dynamic';
import { EditorErrorBoundary } from '../editor/EditorErrorBoundary';

const MonacoEditor = dynamic(
  () => import('@/components/editor/MonacoEditor').then(mod => mod.MonacoEditor),
  { ssr: false }
);

interface CodingQuestionProps {
  questionNumber: number;
  question: CodingQuestionType;
  onAnswerChange: (questionIndex: number, code: string) => void;
}

export const CodingQuestion: React.FC<CodingQuestionProps> = ({
  questionNumber,
  question,
  onAnswerChange
}) => {
  return (
    <div className="bg-white rounded-lg shadow-lg flex flex-col h-full">
      {/* Question Header */}
      <div className="border-b p-4 bg-gray-50">
        <div className="flex items-center gap-4 mb-2">
          <h2 className="text-xl font-bold text-gray-800">{questionNumber}. {question.title}</h2>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            question.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
            question.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
            'bg-red-100 text-red-800'
          }`}>
            {question.difficulty}
          </span>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Question Description */}
        <div className="w-1/2 p-4 overflow-y-auto border-r bg-white">
          <div className="prose max-w-none text-gray-800">
            <pre className="whitespace-pre-wrap font-sans text-gray-800">{question.question}</pre>
          </div>
        </div>

        {/* Code Editor */}
        <div className="w-1/2 flex flex-col">
          <div className="bg-[#1e1e1e] text-white p-2 text-sm font-medium">
            JavaScript
          </div>
          <div className="flex-1">
            <EditorErrorBoundary>
              <MonacoEditor
                language="javascript"
                value={question.template}
                onChange={(value) => onAnswerChange(questionNumber - 1, value)}
                height="100%"
              />
            </EditorErrorBoundary>
          </div>
        </div>
      </div>

      {/* Test Cases */}
      <div className="border-t bg-gray-50 p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Example Test Cases:</h3>
        <div className="space-y-4">
          {question.testCases.map((testCase, index) => (
            <div key={index} className="bg-white p-3 rounded-md shadow-sm">
              <div className="text-gray-800">
                <strong className="font-medium">Input:</strong>{' '}
                <code className="bg-gray-100 px-1 py-0.5 rounded text-gray-800">
                  {JSON.stringify(testCase.input)}
                </code>
              </div>
              <div className="text-gray-800 mt-1">
                <strong className="font-medium">Expected:</strong>{' '}
                <code className="bg-gray-100 px-1 py-0.5 rounded text-gray-800">
                  {JSON.stringify(testCase.expected)}
                </code>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}; 