'use client';

import { useState, useRef, useEffect } from 'react';

interface Message {
  text: string;
  sender: 'user' | 'bot';
}

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { text: 'Hi there! How can I help you with your coding problems today?', sender: 'bot' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;
    
    // Add user message
    const userMessage = { text: inputValue, sender: 'user' as const };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    
    try {
      // Send request to our API endpoint
      
      const response = await fetch('/api/hints', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          problem: userMessage.text,
          difficulty: 'Medium',
          current_progress: 'Getting started'
        }),
      });
      console.log(userMessage.text);
      
      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Add bot response
      if (data.hints) {
        setMessages(prev => [...prev, { text: data.hints, sender: 'bot' }]);
      } else if (data.error) {
        setMessages(prev => [...prev, { text: `Error: ${data.error}`, sender: 'bot' }]);
      }
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, { 
        text: `Sorry, I had trouble connecting to the server. Error: ${error.message}`, 
        sender: 'bot' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`fixed bottom-4 right-4 z-50 shadow-lg rounded-lg overflow-hidden transition-all duration-300 ${isOpen ? 'w-80 h-96' : 'w-16 h-16'}`}>
      {isOpen ? (
        <div className="flex flex-col h-full bg-white">
          {/* Header */}
          <div className="bg-blue-600 text-white p-3 flex justify-between items-center">
            <h3 className="font-medium">AI Coding Assistant</h3>
            <button onClick={() => setIsOpen(false)} className="text-white hover:text-gray-200">
              <span>×</span>
            </button>
          </div>
          
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {messages.map((message, index) => (
              <div 
                key={index} 
                className={`max-w-[80%] p-2 rounded-lg ${
                  message.sender === 'user' 
                    ? 'bg-blue-100 ml-auto rounded-br-none text-black' 
                    : 'bg-gray-100 mr-auto rounded-bl-none text-black'
                }`}
              >
                {message.text}
              </div>
            ))}
            {isLoading && (
              <div className="bg-gray-100 max-w-[80%] p-2 rounded-lg rounded-bl-none">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          
          {/* Input */}
          <div className="border-t p-3 flex">
            <input
              type="text"
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
              placeholder="Ask a coding question..."
              className="flex-1 border rounded-l-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <button 
              onClick={handleSendMessage}
              className="bg-blue-600 text-white px-4 py-2 rounded-r-lg hover:bg-blue-700"
            >
              Send
            </button>
          </div>
        </div>
      ) : (
        <button 
          onClick={() => setIsOpen(true)}
          className="w-full h-full bg-blue-600 rounded-full flex items-center justify-center text-white"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        </button>
      )}
    </div>
  );
}