'use client';

import React from 'react';
import { MCQOption } from '@/types/exam';

interface MCQQuestionProps {
  questionNumber: number;
  question: string;
  options: MCQOption[];
  onAnswerSelect: (optionId: string) => void;
  selectedAnswer?: string;
}

export const MCQQuestion: React.FC<MCQQuestionProps> = ({
  questionNumber,
  question,
  options,
  onAnswerSelect,
  selectedAnswer
}) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Question {questionNumber}</h2>
        <p className="text-gray-800 text-lg whitespace-pre-wrap">{question}</p>
      </div>
      <div className="space-y-4">
        {options.map((option) => (
          <button
            key={option.id}
            onClick={() => onAnswerSelect(option.id)}
            className={`w-full text-left p-4 rounded-lg border transition-colors ${
              selectedAnswer === option.id
                ? 'border-indigo-500 bg-indigo-50 text-gray-900'
                : 'border-gray-200 hover:border-indigo-500 hover:bg-indigo-50 text-gray-800'
            }`}
          >
            <span className="font-medium text-gray-900">{option.id.toUpperCase()}.</span>{' '}
            <span className="text-gray-800">{option.text}</span>
          </button>
        ))}
      </div>
    </div>
  );
}; 