import React from 'react';

interface HeaderProps {
  currentUser: { name: string; email: string } | null;
  formatTime: () => string;
}

export const Header: React.FC<HeaderProps> = ({ currentUser, formatTime }) => {
  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
        <div className="flex items-center">
          <span id="timer" className="text-2xl font-bold text-red-600">{formatTime()}</span>
        </div>
        <div className="flex items-center">
          <span className="text-gray-700">{currentUser?.name}</span>
        </div>
      </div>
    </header>
  );
}; 