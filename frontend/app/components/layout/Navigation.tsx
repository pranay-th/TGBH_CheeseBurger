import React from 'react';

interface NavigationProps {
  currentQuestion: number;
  totalQuestions: number;
  onQuestionSelect: (index: number) => void;
  onSubmit: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentQuestion,
  totalQuestions,
  onQuestionSelect,
  onSubmit,
}) => {
  const handlePrevious = () => {
    if (currentQuestion > 0) {
      onQuestionSelect(currentQuestion - 1);
    }
  };

  const handleNext = () => {
    if (currentQuestion < totalQuestions - 1) {
      onQuestionSelect(currentQuestion + 1);
    }
  };

  return (
    <div className="w-64 bg-white border-l p-4 flex flex-col h-full">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Questions</h3>
      <div className="grid grid-cols-4 gap-2 mb-4">
        {Array.from({ length: totalQuestions }, (_, i) => (
          <button
            key={i}
            onClick={() => onQuestionSelect(i)}
            className={`p-2 text-center rounded ${
              i === currentQuestion ? 'bg-indigo-600 text-white' : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            {i + 1}
          </button>
        ))}
      </div>
      
      {/* Navigation Buttons */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={handlePrevious}
          disabled={currentQuestion === 0}
          className={`flex-1 py-2 px-4 rounded-md text-white font-medium ${
            currentQuestion === 0
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-700'
          }`}
        >
          Previous
        </button>
        <button
          onClick={handleNext}
          disabled={currentQuestion === totalQuestions - 1}
          className={`flex-1 py-2 px-4 rounded-md text-white font-medium ${
            currentQuestion === totalQuestions - 1
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-700'
          }`}
        >
          Next
        </button>
      </div>

      {/* Submit button pushed to bottom */}
      <div className="mt-auto">
        <button 
          onClick={onSubmit} 
          className="w-full py-3 rounded-md bg-green-600 text-white hover:bg-green-700 font-medium"
        >
          Submit Exam
        </button>
      </div>
    </div>
  );
}; 