import { useState } from 'react';

// Updated interface definitions
interface Option {
  text: string;
  isCorrect: boolean;
}

interface Question {
  id: number;
  question: string;
  type: 'mcq' | 'msq' | 'number' | 'text';
  options?: Option[];
  points: number;
  answer?: string | string[] | number;
  format?: string;
}

// Assignment types
type AssignmentType = 'practice' | 'graded';

export default function CourseAssignment() {
  const assignmentTitle = "BSCCS2001: Week 1 Assignment";
  
  // Hardcoded assignment type and deadline
  const assignmentType: AssignmentType = 'practice'; // Can be changed to 'practice'
  const deadline = new Date('2025-03-10T23:59:59'); // Example deadline
  const currentDate = new Date(); // Current date
  const isDeadlinePassed = currentDate > deadline;
  
  // Enhanced questions with different types
  const questions: Question[] = [
    {
      id: 1,
      question: "Which of the following is not a drawback of file systems when compared to DBMS?",
      type: "mcq",
      points: 2,
      options: [
        { text: "Inconsistent data", isCorrect: false },
        { text: "Ease of initial setup", isCorrect: true },
        { text: "Lack of data integrity", isCorrect: false },
        { text: "Difficult to support concurrency", isCorrect: false },
      ],
      answer: "Ease of initial setup"
    },
    {
      id: 2,
      question: "Which of the following creates and maintains the schema of a database?",
      type: "mcq",
      points: 1,
      options: [
        { text: "Data Manipulation Language", isCorrect: false },
        { text: "Data Definition Language", isCorrect: true },
        { text: "Data Control Language", isCorrect: false },
        { text: "None of the above", isCorrect: false },
      ],
      answer: "Data Definition Language"
    },
    {
      id: 3,
      question: "Select all programming paradigms that JavaScript supports:",
      type: "msq",
      points: 3,
      options: [
        { text: "Object-Oriented", isCorrect: true },
        { text: "Functional", isCorrect: true },
        { text: "Procedural", isCorrect: true },
        { text: "Logic Programming", isCorrect: false },
      ],
      answer: ["Object-Oriented", "Functional", "Procedural"]
    },
    {
      id: 4,
      question: "What is the default port number for MySQL database?",
      type: "number",
      points: 2,
      answer: 3306,
      format: "Enter port number only"
    },
    {
      id: 5,
      question: "Write a simple SQL query to select all records from a table named 'students'.",
      type: "text",
      points: 2,
      answer: "SELECT * FROM students",
      format: "Write SQL query"
    },
    {
      id: 6,
      question: "Why do we use try-except blocks in Python programming language?",
      type: "mcq",
      points: 2,
      options: [
        { text: "For committing data", isCorrect: false },
        { text: "For writing to files", isCorrect: false },
        { text: "For handling exceptions", isCorrect: true },
        { text: "None of the above", isCorrect: false },
      ],
      answer: "For handling exceptions"
    },
  ];

  const [answers, setAnswers] = useState<Record<number, any>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState({ earned: 0, total: 0 });

  const handleMCQAnswerChange = (questionId: number, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleMSQAnswerChange = (questionId: number, value: string, checked: boolean) => {
    setAnswers(prev => {
      const currentAnswers = prev[questionId] || [];
      if (checked) {
        return { ...prev, [questionId]: [...currentAnswers, value] };
      } else {
        return { ...prev, [questionId]: currentAnswers.filter((ans: string) => ans !== value) };
      }
    });
  };

  const handleTextOrNumberChange = (questionId: number, value: string | number) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const calculateScore = () => {
    let earnedPoints = 0;
    let totalPoints = 0;
    
    questions.forEach(question => {
      totalPoints += question.points;
      const userAnswer = answers[question.id];
      
      if (userAnswer !== undefined) {
        if (question.type === 'mcq' && userAnswer === question.answer) {
          earnedPoints += question.points;
        } else if (question.type === 'msq') {
          const correctAnswers = question.answer as string[];
          const userAnswers = userAnswer as string[] || [];
          
          // Check if arrays have same elements (order doesn't matter)
          if (correctAnswers.length === userAnswers.length && 
              correctAnswers.every(ans => userAnswers.includes(ans))) {
            earnedPoints += question.points;
          }
        } else if (question.type === 'number' && Number(userAnswer) === question.answer) {
          earnedPoints += question.points;
        } else if (question.type === 'text' && 
                  userAnswer.toString().toLowerCase().trim() === 
                  (question.answer as string).toLowerCase().trim()) {
          earnedPoints += question.points;
        }
      }
    });
    
    return { earned: earnedPoints, total: totalPoints };
  };

  const handleSubmit = () => {
    const calculatedScore = calculateScore();
    setScore(calculatedScore);
    setSubmitted(true);
  };

  const resetQuiz = () => {
    setAnswers({});
    setSubmitted(false);
    setScore({ earned: 0, total: 0 });
  };

  // Determine if we should show scores
  const shouldShowScore = assignmentType === 'practice' || (assignmentType === 'graded' && isDeadlinePassed);
  
  // Determine if the submit button should be shown
  const showSubmitButton = !(assignmentType === 'graded' && isDeadlinePassed);

  // Format deadline for display
  const formatDeadline = (date: Date) => {
    return date.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto p-6 bg-white rounded-2xl shadow-lg">
        {/* Header */}
        <div className="mb-8 border-b pb-4">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">{assignmentTitle}</h1>
              <p className="text-gray-600">Complete all questions below</p>
            </div>
            <div className="flex flex-col items-end">
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                assignmentType === 'practice' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
              }`}>
                {assignmentType === 'practice' ? 'Practice' : 'Graded'}
              </span>
              {assignmentType === 'graded' && (
                <span className={`mt-2 text-sm ${isDeadlinePassed ? 'text-red-600 font-medium' : 'text-gray-600'}`}>
                  {isDeadlinePassed ? 'Deadline Passed: ' : 'Due: '}
                  {formatDeadline(deadline)}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Instructions Banner for Graded Assignments */}
        {assignmentType === 'graded' && !isDeadlinePassed && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-800">
              <span className="font-bold">Note:</span> This is a graded assignment. Your score will be revealed after the deadline has passed.
            </p>
          </div>
        )}

        {/* Deadline Passed Notification */}
        {assignmentType === 'graded' && isDeadlinePassed && !submitted && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">
              <span className="font-bold">Deadline has passed.</span> Your answers have been automatically submitted.
            </p>
          </div>
        )}

        {/* Score Display */}
        {submitted && shouldShowScore && (
          <div className="mb-8 bg-blue-50 p-6 rounded-xl border border-blue-200">
            <h2 className="text-2xl font-bold text-blue-800 mb-2">Your Score: {score.earned}/{score.total}</h2>
            <p className="text-blue-700 mb-4">You scored {Math.round((score.earned / score.total) * 100)}%</p>
            {assignmentType === 'practice' && (
              <button 
                onClick={resetQuiz}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
            )}
          </div>
        )}

        {/* Submitted but hidden score for graded assignments */}
        {submitted && assignmentType === 'graded' && !isDeadlinePassed && (
          <div className="mb-8 bg-blue-50 p-6 rounded-xl border border-blue-200">
            <h2 className="text-2xl font-bold text-blue-800 mb-2">Assignment Submitted</h2>
            <p className="text-blue-700">Your answers have been recorded. Scores will be available after the deadline.</p>
          </div>
        )}

        {/* Questions */}
        <div className="space-y-8">
          {questions.map((question, index) => (
            <div
              key={question.id}
              className={`rounded-xl p-6 transition-all duration-300 ${
                submitted && shouldShowScore
                  ? isCorrectAnswer(question, answers[question.id])
                    ? 'bg-green-50 border border-green-200'
                    : 'bg-red-50 border border-red-200'
                  : 'bg-white border border-gray-200 hover:border-purple-200 hover:shadow-md'
              }`}
            >
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-medium text-gray-800">
                    <span className="inline-block bg-purple-100 text-purple-800 rounded-full px-3 py-1 text-sm font-semibold mr-2">
                      Q{index + 1}
                    </span>
                    {question.question}
                  </h3>
                  <span className="text-sm text-gray-500 whitespace-nowrap ml-2">
                    [{question.points} point{question.points !== 1 ? 's' : ''}]
                  </span>
                </div>

                {/* Question Type Rendering */}
                {question.type === 'mcq' && question.options && (
                  <div className="space-y-3 pl-4">
                    {question.options.map((option, optIndex) => (
                      <label
                        key={optIndex}
                        className={`flex items-center space-x-3 p-2 rounded-lg cursor-pointer ${
                          submitted && shouldShowScore && option.isCorrect ? 'bg-green-100' : ''
                        }`}
                      >
                        <input
                          type="radio"
                          name={`question-${question.id}`}
                          value={option.text}
                          checked={answers[question.id] === option.text}
                          onChange={(e) => handleMCQAnswerChange(question.id, e.target.value)}
                          disabled={submitted || (assignmentType === 'graded' && isDeadlinePassed)}
                          className="w-4 h-4 text-purple-600 focus:ring-purple-500 border-gray-300"
                        />
                        <span className="text-gray-700">{option.text}</span>
                      </label>
                    ))}
                  </div>
                )}

                {question.type === 'msq' && question.options && (
                  <div className="space-y-3 pl-4">
                    {question.options.map((option, optIndex) => (
                      <label
                        key={optIndex}
                        className={`flex items-center space-x-3 p-2 rounded-lg cursor-pointer ${
                          submitted && shouldShowScore && option.isCorrect ? 'bg-green-100' : ''
                        }`}
                      >
                        <input
                          type="checkbox"
                          value={option.text}
                          checked={(answers[question.id] || []).includes(option.text)}
                          onChange={(e) => handleMSQAnswerChange(
                            question.id, 
                            option.text, 
                            e.target.checked
                          )}
                          disabled={submitted || (assignmentType === 'graded' && isDeadlinePassed)}
                          className="w-4 h-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                        />
                        <span className="text-gray-700">{option.text}</span>
                      </label>
                    ))}
                  </div>
                )}

                {question.type === 'number' && (
                  <div className="space-y-2 pl-4">
                    <input
                      type="number"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none transition-all"
                      placeholder="Enter a number"
                      value={answers[question.id] || ''}
                      onChange={(e) => handleTextOrNumberChange(question.id, Number(e.target.value))}
                      disabled={submitted || (assignmentType === 'graded' && isDeadlinePassed)}
                    />
                    {question.format && (
                      <p className="text-sm text-gray-500">Format: {question.format}</p>
                    )}
                  </div>
                )}

                {question.type === 'text' && (
                  <div className="space-y-2 pl-4">
                    <input
                      type="text"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none transition-all"
                      placeholder="Enter your answer"
                      value={answers[question.id] || ''}
                      onChange={(e) => handleTextOrNumberChange(question.id, e.target.value)}
                      disabled={submitted || (assignmentType === 'graded' && isDeadlinePassed)}
                    />
                    {question.format && (
                      <p className="text-sm text-gray-500">Format: {question.format}</p>
                    )}
                  </div>
                )}

                {submitted && shouldShowScore && (
                  <div className={`mt-3 p-3 rounded-lg ${
                    isCorrectAnswer(question, answers[question.id])
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {isCorrectAnswer(question, answers[question.id])
                      ? '✓ Correct!'
                      : `✗ Incorrect. The correct answer is: ${formatCorrectAnswer(question)}`
                    }
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Submit Button - Only shown for practice or graded before deadline */}
        {showSubmitButton && !submitted && (
          <div className="mt-8 flex justify-end">
            <button
              onClick={handleSubmit}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200 shadow-sm hover:shadow-md font-medium"
            >
              Submit Assignment
            </button>
          </div>
        )}
        
        {/* Retry Button - Only shown for practice assignments after submission */}
        {assignmentType === 'practice' && submitted && (
          <div className="mt-8 flex justify-end">
            <button
              onClick={resetQuiz}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200 shadow-sm hover:shadow-md font-medium"
            >
              Retake Quiz
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Helper functions
function isCorrectAnswer(question: Question, userAnswer: any): boolean {
  if (!userAnswer) return false;

  if (question.type === 'mcq') {
    return userAnswer === question.answer;
  } else if (question.type === 'msq') {
    const correctAnswers = question.answer as string[];
    const userAnswers = userAnswer as string[] || [];
    return correctAnswers.length === userAnswers.length && 
           correctAnswers.every(ans => userAnswers.includes(ans));
  } else if (question.type === 'number') {
    return Number(userAnswer) === question.answer;
  } else if (question.type === 'text') {
    return userAnswer.toString().toLowerCase().trim() === 
           (question.answer as string).toLowerCase().trim();
  }
  
  return false;
}

function formatCorrectAnswer(question: Question): string {
  if (question.type === 'msq') {
    return (question.answer as string[]).join(', ');
  } else {
    return question.answer?.toString() || '';
  }
}