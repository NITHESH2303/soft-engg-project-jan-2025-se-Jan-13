import { useState, useEffect } from 'react';
import { Icon } from 'react-icons-kit';
import { home } from 'react-icons-kit/feather/home';
import { clipboard } from 'react-icons-kit/feather/clipboard';
import { users } from 'react-icons-kit/feather/users';
import { messageCircle } from 'react-icons-kit/feather/messageCircle';
import { x } from 'react-icons-kit/feather/x';
import { plus } from 'react-icons-kit/feather/plus';
import { minus } from 'react-icons-kit/feather/minus';
import { Link, useNavigate } from 'react-router-dom';
import Chat from './Chat';
import { fetchCourses, fetchAssignments } from '../../services/ta.ts';
import Sidebar from '../ui/Sidebar';


interface Course {
  id: number;
  title: string;
  category: string;
  icon: string;
  description: string;
}

interface Assignment {
  id: number;
  course_title: string;
  assignment_no: number;
  deadline: string;
  status: 'Not Graded' | 'Graded';
}

interface Question {
  question: string;
  correctAnswer: string;
}

export default function TADashboard() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [isAddingAssignment, setIsAddingAssignment] = useState(false);
  const [newAssignment, setNewAssignment] = useState({
    courseTitle: '',
    assignmentNo: '',
    deadline: '',
    questions: [{ question: '', correctAnswer: '' }]
  });
  const navigate = useNavigate();

  useEffect(() => {
    // const accessToken = localStorage.getItem('access_token');
    // if (!accessToken) {
    //   navigate('/ta/login');
    //   return;
    // }

    const fetchData = async () => {
      try {
        const coursesData = await fetchCourses();
        const assignmentsData = await fetchAssignments();
        setCourses(coursesData);
        setAssignments(assignmentsData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [navigate]);

  const handleAddAssignment = () => {
    setIsAddingAssignment(true);
  };

  const handleAddQuestion = () => {
    setNewAssignment(prev => ({
      ...prev,
      questions: [...prev.questions, { question: '', correctAnswer: '' }]
    }));
  };

  const handleRemoveQuestion = (index: number) => {
    setNewAssignment(prev => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index)
    }));
  };

  const handleQuestionChange = (index: number, field: 'question' | 'correctAnswer', value: string) => {
    setNewAssignment(prev => ({
      ...prev,
      questions: prev.questions.map((q, i) => 
        i === index ? { ...q, [field]: value } : q
      )
    }));
  };

  const handleSubmitAssignment = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log('New Assignment:', newAssignment);
    setIsAddingAssignment(false);
    setNewAssignment({
      courseTitle: '',
      assignmentNo: '',
      deadline: '',
      questions: [{ question: '', correctAnswer: '' }]
    });
  };

  const sidebarItems = [
    { icon: home, title: 'Home', href: '/ta-dashboard' },
    { icon: clipboard, title: 'Assignments', href: '/assignments' },
    { icon: users, title: 'Students', href: '/students' },
  ];


  return (
    <div className="min-h-screen bg-gray-100">
      <Sidebar
        profileImage="/ta_avatar.png"
        profileTitle="TA Dashboard"
        items={sidebarItems}
      />

      {/* Main Content */}
      <div className="ml-64 p-8">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">TA Dashboard</h1>
          <div className="flex items-center space-x-4">
            <button 
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              onClick={handleAddAssignment}
            >
              Add Assignment
            </button>
            <button 
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              onClick={() => setIsChatOpen(true)}
            >
              <Icon icon={messageCircle} size={24} />
            </button>
          </div>
        </header>

        {/* Courses Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Courses</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <Link 
                to={`/course/${course.id}`}
                key={course.id} 
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="p-6">
                  <span className="inline-block px-3 py-1 text-sm font-medium text-blue-600 bg-blue-100 rounded-full mb-4">
                    {course.category}
                  </span>
                  <div className="text-4xl mb-4">{course.icon}</div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">{course.title}</h3>
                  <p className="text-gray-600 mb-4">{course.description}</p>
                  <span className="text-blue-600 hover:text-blue-700 font-medium inline-flex items-center">
                    View Course
                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Assignments Section */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Assignments</h2>
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Deadline
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Course
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assignment No.
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {assignments.map((assignment) => (
                  <tr key={assignment.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {assignment.deadline}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {assignment.course_title}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {assignment.assignment_no}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        assignment.status === 'Graded'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {assignment.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* Add Assignment Modal */}
      {isAddingAssignment && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Add New Assignment</h3>
            <form onSubmit={handleSubmitAssignment}>
              <input
                type="text"
                placeholder="Course Title"
                value={newAssignment.courseTitle}
                onChange={(e) => setNewAssignment(prev => ({ ...prev, courseTitle: e.target.value }))}
                className="w-full p-2 mb-2 border rounded"
              />
              <input
                type="number"
                placeholder="Assignment Number"
                value={newAssignment.assignmentNo}
                onChange={(e) => setNewAssignment(prev => ({ ...prev, assignmentNo: e.target.value }))}
                className="w-full p-2 mb-2 border rounded"
              />
              <input
                type="date"
                placeholder="Deadline"
                value={newAssignment.deadline}
                onChange={(e) => setNewAssignment(prev => ({ ...prev, deadline: e.target.value }))}
                className="w-full p-2 mb-2 border rounded"
              />
              {newAssignment.questions.map((q, index) => (
                <div key={index} className="mb-2">
                  <input
                    type="text"
                    placeholder="Question"
                    value={q.question}
                    onChange={(e) => handleQuestionChange(index, 'question', e.target.value)}
                    className="w-full p-2 mb-1 border rounded"
                  />
                  <input
                    type="text"
                    placeholder="Correct Answer"
                    value={q.correctAnswer}
                    onChange={(e) => handleQuestionChange(index, 'correctAnswer', e.target.value)}
                    className="w-full p-2 mb-1 border rounded"
                  />
                  <button type="button" onClick={() => handleRemoveQuestion(index)} className="text-red-500">
                    <Icon icon={minus} size={16} />
                  </button>
                </div>
              ))}
              <button type="button" onClick={handleAddQuestion} className="mb-2 text-blue-500">
                <Icon icon={plus} size={16} /> Add Question
              </button>
              <button type="submit" className="mt-4 w-full bg-blue-500 text-white rounded-md px-4 py-2">
                Add Assignment
              </button>
            </form>
            <button onClick={() => setIsAddingAssignment(false)} className="mt-2 w-full bg-gray-300 text-gray-800 rounded-md px-4 py-2">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Chat Overlay */}
      {isChatOpen && (
        <div className="fixed bottom-4 right-4 w-96 h-[600px] bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden animate-slide-in-right">
          <div className="flex justify-between items-center p-4 border-b">
            <h3 className="text-lg font-semibold">Chat Assistant</h3>
            <button
              onClick={() => setIsChatOpen(false)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <Icon icon={x} size={20} />
            </button>
          </div>
          <div className="h-[calc(100%-64px)]">
            <Chat />
          </div>
        </div>
      )}
    </div>
  );
}
