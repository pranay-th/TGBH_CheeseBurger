'use client';

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function Home() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");

  // Check if user is logged in
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/me');
        const data = await response.json();
        
        if (data.success && data.username) {
          setIsLoggedIn(true);
          setUsername(data.username);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      }
    };
    
    checkAuth();
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      {/* Navbar */}
      <nav className="bg-gray-800 px-6 py-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Image
              src="/favicon.ico"
              alt="Logo"
              width={32}
              height={32}
              className="rounded-md"
            />
            <span className="text-xl font-bold text-indigo-400">The CheeseBurger</span>
          </div>
          
          <div className="flex items-center space-x-6">
            <Link href="/" className="hover:text-indigo-400 transition-colors">
              Home
            </Link>
            {isLoggedIn ? (
              <>
                <Link href="/stream" className="hover:text-indigo-400 transition-colors">
                  Take Exam
                </Link>
                <div className="text-green-400">
                  Welcome, {username}
                </div>
                <button 
                  onClick={async () => {
                    try {
                      await fetch('/api/logout', { method: 'POST' });
                      setIsLoggedIn(false);
                      setUsername("");
                      router.refresh();
                    } catch (error) {
                      console.error('Logout failed:', error);
                    }
                  }}
                  className="text-red-400 hover:text-red-300 transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="hover:text-indigo-400 transition-colors">
                  Login
                </Link>
                <Link 
                  href="/signup" 
                  className="bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-md transition-colors"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 text-center">
        <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent">
          Welcome to The CheeseBurger
        </h1>
        <p className="text-xl text-gray-300 max-w-2xl mb-8">
          Advanced coding assessment platform for educational environments. 
          Test your programming skills with challenging problems from beginner to expert level.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          {isLoggedIn ? (
            <button
              onClick={() => router.push('/stream')}
              className="bg-indigo-600 hover:bg-indigo-700 px-8 py-3 rounded-md text-lg font-medium transition-colors"
            >
              Take Exam
            </button>
          ) : (
            <>
              <button
                onClick={() => router.push('/login')}
                className="bg-gray-700 hover:bg-gray-600 px-8 py-3 rounded-md text-lg font-medium transition-colors"
              >
                Login
              </button>
              <button
                onClick={() => router.push('/signup')}
                className="bg-indigo-600 hover:bg-indigo-700 px-8 py-3 rounded-md text-lg font-medium transition-colors"
              >
                Sign Up
              </button>
            </>
          )}
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-gray-800 py-16 px-6">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-700 p-6 rounded-lg">
              <div className="text-indigo-400 text-2xl mb-4">📝</div>
              <h3 className="text-xl font-semibold mb-2">Coding Challenges</h3>
              <p className="text-gray-300">Practice with a variety of coding questions ranging from easy to hard difficulty levels.</p>
            </div>
            
            <div className="bg-gray-700 p-6 rounded-lg">
              <div className="text-indigo-400 text-2xl mb-4">📊</div>
              <h3 className="text-xl font-semibold mb-2">Performance Analytics</h3>
              <p className="text-gray-300">Track your progress and improvement through detailed performance metrics.</p>
            </div>
            
            <div className="bg-gray-700 p-6 rounded-lg">
              <div className="text-indigo-400 text-2xl mb-4">🔒</div>
              <h3 className="text-xl font-semibold mb-2">Secure Platform</h3>
              <p className="text-gray-300">Robust authentication and encrypted submissions for all your coding solutions.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 py-8 px-6 border-t border-gray-800">
        <div className="container mx-auto text-center text-gray-400">
          <p>© 2023 TGBH CheeseBurger. All rights reserved.</p>
          <p className="mt-2 text-sm">A coding assessment platform for educational environments.</p>
        </div>
      </footer>
    </div>
  );
}
