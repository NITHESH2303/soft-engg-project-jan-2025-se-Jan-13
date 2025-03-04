import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Icon } from 'react-icons-kit';
import { home } from 'react-icons-kit/feather/home';
import { activity } from 'react-icons-kit/feather/activity';
import { messageCircle } from 'react-icons-kit/feather/messageCircle';
import ChatOverlay from '../ui/ChatOverlay';

interface Question {
  id: number;
  text: string;
  type: 'number' | 'text';
  format?: string;
  answer?: string;
}

export default function CourseAssignment() {
  const { courseId, weekId } = useParams();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [answers, setAnswers] = useState<Record<number, string>>({});

  const questions: Question[] = [
    {
      id: 1,
      text: "What is the lower bound on the cost of the tour as per the TSP BnB algorithm discussed in class?",
      type: "number",
      format: "NO SPACES, TABS, DOTS, BRACKETS, PARENTHESIS OR UNWANTED CHARACTERS."
    },
    {
      id: 2,
      text: "The number of tours represented by B2 is _________.",
      type: "number",
      format: "NO SPACES, TABS, DOTS, BRACKETS, PARENTHESIS OR UNWANTED CHARACTERS."
    }
  ];

  const handleSubmit = () => {
    console.log('Submitted answers:', answers);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-64 bg-white shadow-lg p-6">
        <div className="flex flex-col items-center mb-8 animate-fade-in">
          <img
            src="/iitm_avatar.png"
            alt="Profile"
            className="w-24 h-24 rounded-full mb-4"
          />
          <h2 className="text-xl font-bold">21f3001255</h2>
          <Link 
            to="/profile" 
            className="mt-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
          >
            View Profile
          </Link>
        </div>

        <nav className="space-y-2">
          <Link 
            to="/dashboard" 
            className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 text-gray-700 transition-colors"
          >
            <Icon icon={home} size={20} />
            <span className="font-medium">Home</span>
          </Link>
          <Link 
            to="/performance" 
            className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 text-gray-700 transition-colors"
          >
            <Icon icon={activity} size={20} />
            <span className="font-medium">Performance</span>
          </Link>
        </nav>
      </div>

      {/* Main Content */}
      <div className="ml-64 p-8">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 animate-fade-in">Week {weekId} Assignment</h1>
            <p className="text-gray-600 mt-2">Complete all questions to submit the assignment</p>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-lg font-medium text-gray-600">21f3001255</span>
            <button 
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              onClick={() => setIsChatOpen(true)}
            >
              <Icon icon={messageCircle} size={24} />
            </button>
          </div>
        </header>

        <div className="space-y-8">
          {questions.map((question, index) => (
            <div 
              key={question.id} 
              className="bg-white rounded-xl shadow-md p-6 animate-scale-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-800">
                  {index + 1}) {question.text}
                </h3>
                <div className="space-y-2">
                  <input
                    type={question.type}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter your answer"
                    value={answers[question.id] || ''}
                    onChange={(e) => setAnswers({ ...answers, [question.id]: e.target.value })}
                  />
                  {question.format && (
                    <p className="text-sm text-gray-500">Format: {question.format}</p>
                  )}
                </div>
              </div>
            </div>
          ))}

          <div className="flex justify-end">
            <button
              onClick={handleSubmit}
              className="px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors animate-scale-in"
            >
              Submit Assignment
            </button>
          </div>
        </div>
      </div>

      {/* Chat Overlay */}
      <ChatOverlay isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </div>
  );
}