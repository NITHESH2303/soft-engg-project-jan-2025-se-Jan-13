import React, { useState } from 'react';
import { Icon } from 'react-icons-kit';
import { plus } from 'react-icons-kit/feather/plus';
import { trash2 } from 'react-icons-kit/feather/trash2';
import { edit2 } from 'react-icons-kit/feather/edit2';

// Question type definitions
export interface QuestionOption {
  text: string;
  isCorrect: boolean;
}

export interface Question {
  id: number;
  question: string;
  type: 'mcq' | 'msq' | 'number' | 'text';
  options?: QuestionOption[];
  points: number;
  answer?: string | string[] | number;
  format?: string;
  hint?: string;
  comment?: string;
}

interface QuestionEditorProps {
  question: Question;
  onUpdate: (updatedQuestion: Question) => void;
  onDelete: () => void;
}

export const QuestionEditor: React.FC<QuestionEditorProps> = ({ question, onUpdate, onDelete }) => {
  const [editing, setEditing] = useState<boolean>(false);
  const [currentQuestion, setCurrentQuestion] = useState<Question>(question);

  // Handle field changes
  const handleChange = (field: keyof Question, value: any) => {
    setCurrentQuestion(prev => ({ ...prev, [field]: value }));
  };

  // Handle option text change
  const handleOptionTextChange = (index: number, text: string) => {
    if (!currentQuestion.options) return;
    
    const newOptions = [...currentQuestion.options];
    newOptions[index] = { ...newOptions[index], text };
    handleChange('options', newOptions);
  };

  // Handle option correctness toggle
  const handleOptionCorrectChange = (index: number, isCorrect: boolean) => {
    if (!currentQuestion.options) return;
    
    const newOptions = [...currentQuestion.options];
    
    // For MCQ, uncheck all other options when one is selected
    if (currentQuestion.type === 'mcq' && isCorrect) {
      newOptions.forEach((option, i) => {
        newOptions[i] = { ...option, isCorrect: i === index };
      });
    } else {
      newOptions[index] = { ...newOptions[index], isCorrect };
    }
    
    handleChange('options', newOptions);
    
    // Update the answer field based on the correct options
    if (currentQuestion.type === 'mcq') {
      const correctOption = newOptions.find(opt => opt.isCorrect);
      handleChange('answer', correctOption?.text || '');
    } else if (currentQuestion.type === 'msq') {
      const correctOptions = newOptions.filter(opt => opt.isCorrect).map(opt => opt.text);
      handleChange('answer', correctOptions);
    }
  };

  // Add a new option
  const addOption = () => {
    if (!currentQuestion.options) {
      handleChange('options', [{ text: '', isCorrect: false }]);
    } else {
      handleChange('options', [...currentQuestion.options, { text: '', isCorrect: false }]);
    }
  };

  // Remove an option
  const removeOption = (index: number) => {
    if (!currentQuestion.options) return;
    
    const newOptions = currentQuestion.options.filter((_, i) => i !== index);
    handleChange('options', newOptions);
    
    // Update answer field if needed
    if (currentQuestion.type === 'msq') {
      const correctOptions = newOptions.filter(opt => opt.isCorrect).map(opt => opt.text);
      handleChange('answer', correctOptions);
    } else if (currentQuestion.type === 'mcq') {
      const correctOption = newOptions.find(opt => opt.isCorrect);
      if (!correctOption) {
        handleChange('answer', '');
      }
    }
  };

  // Handle type change and reset options/answer accordingly
  const handleTypeChange = (type: 'mcq' | 'msq' | 'number' | 'text') => {
    const updatedQuestion = { ...currentQuestion, type };
    
    // Reset options and answer based on new type
    if (type === 'mcq' || type === 'msq') {
      if (!updatedQuestion.options || updatedQuestion.options.length === 0) {
        updatedQuestion.options = [
          { text: '', isCorrect: false },
          { text: '', isCorrect: false }
        ];
      }
      
      // For MCQ, ensure only one option is selected
      if (type === 'mcq') {
        const hasCorrect = updatedQuestion.options.some(opt => opt.isCorrect);
        if (!hasCorrect && updatedQuestion.options.length > 0) {
          updatedQuestion.options[0].isCorrect = true;
        } else if (hasCorrect) {
          const correctIndex = updatedQuestion.options.findIndex(opt => opt.isCorrect);
          updatedQuestion.options.forEach((opt, i) => {
            updatedQuestion.options![i].isCorrect = i === correctIndex;
          });
        }
        updatedQuestion.answer = updatedQuestion.options.find(opt => opt.isCorrect)?.text || '';
      } else {
        // For MSQ, answer becomes an array
        updatedQuestion.answer = updatedQuestion.options
          .filter(opt => opt.isCorrect)
          .map(opt => opt.text);
      }
    } else if (type === 'number') {
      updatedQuestion.options = undefined;
      updatedQuestion.answer = 0;
      updatedQuestion.format = "Enter number only";
    } else if (type === 'text') {
      updatedQuestion.options = undefined;
      updatedQuestion.answer = '';
      updatedQuestion.format = "Write your answer";
    }
    
    setCurrentQuestion(updatedQuestion);
  };

  // Save changes
  const saveChanges = () => {
    onUpdate(currentQuestion);
    setEditing(false);
  };

  return (
    <div className="border rounded-lg p-4 mb-4 bg-white shadow-sm">
      {!editing ? (
        /* View Mode */
        <div>
          <div className="flex justify-between items-start mb-3">
            <div>
              <h4 className="font-medium text-lg">
                <span className="inline-block bg-purple-100 text-purple-800 rounded-full px-2 py-1 text-sm font-semibold mr-2">
                  Q{question.id}
                </span>
                {question.question}
              </h4>
              <div className="text-sm text-gray-500 mt-1">
                Type: {question.type.toUpperCase()} | Points: {question.points}
              </div>
            </div>
            <div className="flex">
              <button 
                onClick={() => setEditing(true)}
                className="p-1 text-blue-500 hover:text-blue-700 mr-2"
              >
                <Icon icon={edit2} size={16} />
              </button>
              <button 
                onClick={onDelete}
                className="p-1 text-red-500 hover:text-red-700"
              >
                <Icon icon={trash2} size={16} />
              </button>
            </div>
          </div>
          
          {/* Display options */}
          {question.options && (
            <div className="ml-6 mt-2">
              {question.options.map((option, idx) => (
                <div key={idx} className="flex items-center mb-1">
                  <span className={`mr-2 ${option.isCorrect ? 'text-green-600 font-semibold' : 'text-gray-600'}`}>
                    {option.isCorrect ? '✓' : '○'} {option.text}
                  </span>
                </div>
              ))}
            </div>
          )}
          
          {/* Display other answer types */}
          {(question.type === 'number' || question.type === 'text') && (
            <div className="ml-6 mt-2">
              <span className="text-gray-600">
                Answer: <span className="text-green-600 font-semibold">{question.answer}</span>
              </span>
              {question.format && (
                <div className="text-sm text-gray-500 mt-1">Format: {question.format}</div>
              )}
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
      ) : (
        /* Edit Mode */
        <div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Question</label>
            <textarea
              value={currentQuestion.question}
              onChange={(e) => handleChange('question', e.target.value)}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={2}
            />
          </div>
          
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                value={currentQuestion.type}
                onChange={(e) => handleTypeChange(e.target.value as any)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="mcq">Multiple Choice (Single)</option>
                <option value="msq">Multiple Choice (Multiple)</option>
                <option value="number">Numeric Answer</option>
                <option value="text">Text Answer</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Points</label>
              <input
                type="number"
                min={1}
                value={currentQuestion.points}
                onChange={(e) => handleChange('points', parseInt(e.target.value) || 1)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            {(currentQuestion.type === 'number' || currentQuestion.type === 'text') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Format</label>
                <input
                  type="text"
                  value={currentQuestion.format || ''}
                  onChange={(e) => handleChange('format', e.target.value)}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., 'Enter full sentence'"
                />
              </div>
            )}
          </div>
          
          {/* Options for MCQ/MSQ */}
          {(currentQuestion.type === 'mcq' || currentQuestion.type === 'msq') && (
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">Options</label>
                <button 
                  onClick={addOption}
                  className="text-blue-500 hover:text-blue-700 flex items-center text-sm"
                >
                  <Icon icon={plus} size={14} /> <span className="ml-1">Add Option</span>
                </button>
              </div>
              
              {currentQuestion.options && currentQuestion.options.map((option, idx) => (
                <div key={idx} className="flex items-center mb-2">
                  <div className="mr-2">
                    <input
                      type={currentQuestion.type === 'mcq' ? 'radio' : 'checkbox'}
                      checked={option.isCorrect}
                      onChange={(e) => handleOptionCorrectChange(idx, e.target.checked)}
                      name={`question-${currentQuestion.id}-option`}
                      className="h-4 w-4"
                    />
                  </div>
                  <input
                    type="text"
                    value={option.text}
                    onChange={(e) => handleOptionTextChange(idx, e.target.value)}
                    className="flex-1 p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Option text"
                  />
                  <button 
                    onClick={() => removeOption(idx)}
                    className="ml-2 text-red-500 hover:text-red-700"
                    disabled={currentQuestion.options!.length <= 2}
                  >
                    <Icon icon={trash2} size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
          
          {/* Answer for number/text types */}
          {currentQuestion.type === 'number' && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Correct Answer</label>
              <input
                type="number"
                value={currentQuestion.answer as number}
                onChange={(e) => handleChange('answer', parseInt(e.target.value) || 0)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          )}
          
          {currentQuestion.type === 'text' && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Correct Answer</label>
              <input
                type="text"
                value={currentQuestion.answer as string}
                onChange={(e) => handleChange('answer', e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          )}
          
          {/* Hint and Comment fields */}
          <div className="grid grid-cols-1 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hint (optional)</label>
              <textarea
                value={currentQuestion.hint || ''}
                onChange={(e) => handleChange('hint', e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={2}
                placeholder="Add a hint to help students"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Comment (optional)</label>
              <textarea
                value={currentQuestion.comment || ''}
                onChange={(e) => handleChange('comment', e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={2}
                placeholder="Add feedback or explanation"
              />
            </div>
          </div>
          
          <div className="flex justify-end">
            <button
              onClick={() => setEditing(false)}
              className="px-4 py-2 mr-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              onClick={saveChanges}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Save
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Enhanced Assignment Editor Component
interface AssignmentContentEditorProps {
  assignment: any;
  index: number;
  assignments: any[];
  setAssignments: React.Dispatch<React.SetStateAction<any[]>>;
  type: 'Practice' | 'Graded';
}

export const AssignmentContentEditor: React.FC<AssignmentContentEditorProps> = ({
  assignment,
  index,
  assignments,
  setAssignments,
  type
}) => {
  const [questions, setQuestions] = useState<Question[]>(
    assignment.assignment_content || []
  );

  // Update assignment content when questions change
  React.useEffect(() => {
    const updatedAssignments = [...assignments];
    updatedAssignments[index] = {
      ...updatedAssignments[index],
      assignment_content: questions
    };
    setAssignments(updatedAssignments);
  }, [questions]);

  // Add a new question
  const addQuestion = () => {
    const newQuestion: Question = {
      id: questions.length + 1,
      question: '',
      type: 'mcq',
      options: [
        { text: '', isCorrect: true },
        { text: '', isCorrect: false }
      ],
      points: 1,
      answer: '',
      hint: '',
      comment: ''
    };
    setQuestions([...questions, newQuestion]);
  };

  // Update a question
  const updateQuestion = (updatedQuestion: Question) => {
    setQuestions(
      questions.map(q => (q.id === updatedQuestion.id ? updatedQuestion : q))
    );
  };

  // Delete a question
  const deleteQuestion = (id: number) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  // Update basic assignment fields
  const updateField = (field: string, value: any) => {
    const updatedAssignments = [...assignments];
    updatedAssignments[index] = {
      ...updatedAssignments[index],
      [field]: value
    };
    setAssignments(updatedAssignments);
  };

  return (
    <div className="bg-gray-50 p-4 rounded-lg mt-4">
      <div className="flex justify-between mb-4">
        <h4 className="font-medium text-lg">{type} Assignment {index + 1}</h4>
        <button
          onClick={() => setAssignments(assignments.filter((_, i) => i !== index))}
          className="text-red-500 flex items-center"
        >
          <Icon icon={trash2} size={16} /> <span className="ml-1">Remove</span>
        </button>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Assignment Title</label>
          <input
            type="text"
            value={assignment.title || ''}
            onChange={(e) => updateField('title', e.target.value)}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="e.g., Week 1: Database Fundamentals"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Deadline</label>
          <input
            type="datetime-local"
            value={assignment.deadline || ''}
            onChange={(e) => updateField('deadline', e.target.value)}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>
      
      <div className="flex items-center mb-4">
        <input
          type="checkbox"
          checked={assignment.is_coding_assignment}
          onChange={(e) => updateField('is_coding_assignment', e.target.checked)}
          className="h-5 w-5 text-blue-600 focus:ring-blue-500 mr-2"
        />
        <label className="text-sm font-medium text-gray-700">Coding Assignment</label>
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          value={assignment.description || ''}
          onChange={(e) => updateField('description', e.target.value)}
          className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          rows={3}
          placeholder="Add assignment instructions or description"
        />
      </div>
      
      <div className="border-t border-gray-200 my-4 pt-4">
        <div className="flex justify-between items-center mb-4">
          <h5 className="font-medium">Questions</h5>
          <button
            onClick={addQuestion}
            className="px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center"
          >
            <Icon icon={plus} size={16} /> <span className="ml-1">Add Question</span>
          </button>
        </div>
        
        {questions.length === 0 ? (
          <p className="text-gray-500 italic text-center py-4">No questions added yet.</p>
        ) : (
          <div className="space-y-4">
            {questions.map(question => (
              <QuestionEditor
                key={question.id}
                question={question}
                onUpdate={updateQuestion}
                onDelete={() => deleteQuestion(question.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};