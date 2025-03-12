import { useState } from 'react';

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
  hint?: string;
  comment?: string;
}

interface Assignment {
  title: string;
  deadline: string;
  is_coding_assignment: boolean;
  description: string;
  assignment_content: Question[];
}

interface CourseAssignmentProps {
  assignment: Assignment;
  isEditing?: boolean;
  onUpdate?: (content: Question[]) => void;
  isAdmin?: boolean;
}

export default function CourseAssignment({ 
  assignment,
  isEditing = false,
  onUpdate,
  isAdmin = false
}: CourseAssignmentProps) {
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
    
    assignment.assignment_content.forEach(question => {
      totalPoints += question.points;
      const userAnswer = answers[question.id];
      
      if (userAnswer !== undefined) {
        if (question.type === 'mcq' && userAnswer === question.answer) {
          earnedPoints += question.points;
        } else if (question.type === 'msq') {
          const correctAnswers = question.answer as string[];
          const userAnswers = userAnswer as string[] || [];
          
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
  const shouldShowScore = !assignment.is_coding_assignment && submitted;
  
  // Determine if the submit button should be shown
  const showSubmitButton = !submitted;

  // Format deadline for display
  const formatDeadline = (date: string) => {
    return new Date(date).toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isDeadlinePassed = new Date() > new Date(assignment.deadline);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto p-6 bg-white rounded-2xl shadow-lg">
        {/* Header */}
        <div className="mb-8 border-b pb-4">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">{assignment.title}</h1>
              <p className="text-gray-600">{assignment.description}</p>
            </div>
            <div className="flex flex-col items-end">
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                assignment.is_coding_assignment ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
              }`}>
                {assignment.is_coding_assignment ? 'Coding Assignment' : 'Written Assignment'}
              </span>
              <span className={`mt-2 text-sm ${isDeadlinePassed ? 'text-red-600 font-medium' : 'text-gray-600'}`}>
                {isDeadlinePassed ? 'Deadline Passed: ' : 'Due: '}
                {formatDeadline(assignment.deadline)}
              </span>
            </div>
          </div>
        </div>

        {/* Score Display */}
        {submitted && shouldShowScore && (
          <div className="mb-8 bg-blue-50 p-6 rounded-xl border border-blue-200">
            <h2 className="text-2xl font-bold text-blue-800 mb-2">Your Score: {score.earned}/{score.total}</h2>
            <p className="text-blue-700 mb-4">You scored {Math.round((score.earned / score.total) * 100)}%</p>
            <button 
              onClick={resetQuiz}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Questions */}
        <div className="space-y-8">
          {assignment.assignment_content.map((question, index) => (
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
                          disabled={submitted || isDeadlinePassed}
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
                          disabled={submitted || isDeadlinePassed}
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
                      disabled={submitted || isDeadlinePassed}
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
                      disabled={submitted || isDeadlinePassed}
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

                {/* Display hint and comment */}
                {(question.hint || question.comment) && (
                  <div className="mt-3 border-t pt-2">
                    {question.hint && (
                      <div className="text-sm mb-1">
                        <span className="font-medium">Hint:</span> {question.hint}
                      </div>
                    )}
                    {question.comment && (
                      <div className="text-sm">
                        <span className="font-medium">Comment:</span> {question.comment}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Submit Button */}
        {showSubmitButton && !isDeadlinePassed && (
          <div className="mt-8 flex justify-end">
            <button
              onClick={handleSubmit}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200 shadow-sm hover:shadow-md font-medium"
            >
              Submit Assignment
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